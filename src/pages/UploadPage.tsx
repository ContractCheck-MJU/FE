import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/index.ts";
import type { ContractType } from "../api/types.ts";
import { ErrorNote, Field } from "../components/Feedback.tsx";

function localFileError(file: File | null) {
  if (!file) return "파일을 선택해 주세요.";
  const name = file.name.toLowerCase();
  const ok =
    file.type === "application/pdf" ||
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    name.endsWith(".pdf") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png");
  if (!ok) return "PDF, JPG, PNG 파일만 올릴 수 있습니다.";
  if (file.size > 20 * 1024 * 1024) return "파일은 20MB 이하만 올릴 수 있습니다.";
  return null;
}

export function UploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const credits = useQuery({ queryKey: ["credits"], queryFn: () => api.credits() });
  const [title, setTitle] = useState("");
  const [contractType, setContractType] = useState<ContractType>("MONTHLY");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const remaining = (credits.data?.freeRemaining ?? 0) + (credits.data?.paidRemaining ?? 0);

  const upload = useMutation({
    mutationFn: () =>
      api.createContract({ file: file as File, title, contractType }, (ratio) => setProgress(ratio)),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["contracts"] });
      navigate(`/contracts/${result.contractId}`);
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const message = localFileError(file);
    if (!title.trim()) {
      setLocalError("제목을 입력해 주세요.");
      return;
    }
    if (message) {
      setLocalError(message);
      return;
    }
    setLocalError(null);
    upload.mutate();
  }

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">업로드</p>
        <h1>계약서 올리기</h1>
        <p className="lede">
          남은 {credits.isLoading ? "…" : `${remaining}회`}. 지금은 계약서를 보관하고, 위험 분석은 모델 연결 후에 엽니다.
        </p>
      </div>
      {remaining === 0 && !credits.isLoading ? (
        <p className="note">
          남은 횟수가 없습니다. <Link to="/billing">이용권을 먼저 확인해 주세요.</Link>
        </p>
      ) : null}
      {localError ? <p className="error">{localError}</p> : null}
      <ErrorNote error={upload.error} />
      <form className="card stack" onSubmit={onSubmit}>
        <Field label="제목">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="신촌 원룸 월세" />
        </Field>
        <Field label="계약 유형">
          <select value={contractType} onChange={(event) => setContractType(event.target.value as ContractType)}>
            <option value="MONTHLY">월세</option>
            <option value="JEONSE">전세</option>
          </select>
        </Field>
        <Field label="파일 (PDF, JPG, PNG, 20MB 이하)">
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </Field>
        {progress != null ? (
          <div className="bar" aria-label="업로드 진행률">
            <i style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}
        <button className="btn btn-primary" type="submit" disabled={upload.isPending || remaining === 0}>
          {upload.isPending ? "올리는 중…" : "업로드"}
        </button>
      </form>
    </div>
  );
}

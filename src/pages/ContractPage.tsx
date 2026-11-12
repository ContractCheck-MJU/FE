import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/index.ts";
import type { ContractStatus } from "../api/types.ts";
import { ErrorNote } from "../components/Feedback.tsx";
import { contractStatusLabel, contractTypeLabel } from "../labels.ts";

const steps: ContractStatus[] = ["UPLOADED", "OCR", "SPLIT", "ANALYZING", "ANALYZED"];

function busy(status?: ContractStatus) {
  return status === "UPLOADED" || status === "OCR" || status === "ANALYZING";
}

export function ContractPage() {
  const params = useParams();
  const contractId = Number(params.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const contract = useQuery({
    queryKey: ["contract", contractId],
    queryFn: () => api.getContract(contractId),
    enabled: Number.isFinite(contractId),
  });
  const status = useQuery({
    queryKey: ["contract-status", contractId],
    queryFn: () => api.contractStatus(contractId),
    enabled: Number.isFinite(contractId),
    refetchInterval: (query) => (busy(query.state.data?.status) ? 600 : false),
  });
  const current = status.data?.status ?? contract.data?.status;
  const clauses = useQuery({
    queryKey: ["clauses", contractId],
    queryFn: () => api.clauses(contractId),
    enabled: Number.isFinite(contractId),
  });

  useEffect(() => {
    if (!current) return;
    void queryClient.invalidateQueries({ queryKey: ["contract", contractId] });
    void queryClient.invalidateQueries({ queryKey: ["clauses", contractId] });
  }, [current, contractId, queryClient]);

  const remove = useMutation({
    mutationFn: () => api.deleteContract(contractId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contracts"] });
      navigate("/contracts");
    },
  });
  const openFile = useMutation({
    mutationFn: () => api.fileUrl(contractId),
    onSuccess: (file) => window.open(file.url, "_blank", "noopener"),
  });

  const detail = contract.data;
  const items = clauses.data?.items ?? [];

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">{detail ? contractTypeLabel[detail.contractType] : "계약서"}</p>
        <h1>{detail?.title ?? "계약서"}</h1>
        <p className="lede">{current ? contractStatusLabel[current] : "상태를 확인하고 있습니다."}</p>
      </div>
      <ErrorNote error={contract.error ?? status.error ?? remove.error ?? openFile.error ?? clauses.error} />
      <div className="stepper" aria-label="처리 단계">
        {steps.map((step) => (
          <span key={step} className={step === current ? "on" : undefined}>
            {contractStatusLabel[step]}
          </span>
        ))}
        {current === "FAILED" ? <span className="bad">실패</span> : null}
      </div>
      {status.data ? (
        <div className="bar" aria-label="처리율">
          <i style={{ width: `${status.data.progress}%` }} />
        </div>
      ) : null}
      {current === "FAILED" ? <p className="error">{status.data?.errorMessage ?? detail?.errorMessage ?? "처리에 실패했습니다."}</p> : null}
      <p className="note">위험 등급과 쉬운말 설명은 모델이 연결된 뒤에 엽니다. 지금은 올린 계약서와 조항 문장만 봅니다.</p>
      <div className="actions">
        <button className="btn" type="button" onClick={() => openFile.mutate()}>
          원본 보기
        </button>
        <button
          className="btn btn-danger"
          type="button"
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm("이 계약서를 삭제할까요?")) remove.mutate();
          }}
        >
          삭제
        </button>
      </div>
      <div className="stack">
        {items.length === 0 ? <p className="muted">아직 나뉜 조항이 없습니다.</p> : null}
        {items.map((clause) => (
          <article key={clause.clauseId} className="card clause">
            <h2>{clause.title}</h2>
            <p className="quote">{clause.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

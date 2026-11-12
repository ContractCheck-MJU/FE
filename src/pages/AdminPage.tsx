import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/index.ts";
import { ErrorNote, Field } from "../components/Feedback.tsx";

export function AdminPage() {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const job = useQuery({
    queryKey: ["ingest-job", jobId],
    queryFn: () => api.ingestJob(jobId as number),
    enabled: jobId != null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "RUNNING" ? 600 : false;
    },
  });
  const laws = useMutation({
    mutationFn: () => api.ingestLaws(),
    onSuccess: (created) => {
      setJobId(created.jobId);
      void queryClient.invalidateQueries({ queryKey: ["ingest-job", created.jobId] });
    },
  });
  const kftc = useMutation({
    mutationFn: () => api.ingestKftc(file as File),
    onSuccess: (created) => setJobId(created.jobId),
  });

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">관리자</p>
        <h1>법령·사례 적재</h1>
        <p className="lede">작업 목록 API는 없습니다. 방금 실행한 작업만 이 화면에서 따라갑니다.</p>
      </div>
      <ErrorNote error={laws.error ?? kftc.error ?? job.error} />
      <div className="actions">
        <button className="btn btn-primary" type="button" disabled={laws.isPending} onClick={() => laws.mutate()}>
          법령·판례 수집
        </button>
      </div>
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          if (file) kftc.mutate();
        }}
      >
        <Field label="공정위 시정 사례 CSV">
          <input type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </Field>
        <button className="btn" type="submit" disabled={!file || kftc.isPending}>
          CSV 적재
        </button>
      </form>
      {job.data ? (
        <article className="card">
          <h2>
            작업 {job.data.jobId} · {job.data.type}
          </h2>
          <p>
            {job.data.status} · 처리 {job.data.processed} · 실패 {job.data.failed}
          </p>
          {job.data.errors.map((item) => (
            <p key={`${item.row}-${item.reason}`} className="note">
              {item.row}행: {item.reason}
            </p>
          ))}
        </article>
      ) : null}
    </div>
  );
}

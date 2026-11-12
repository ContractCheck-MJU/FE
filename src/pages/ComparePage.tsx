import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { api } from "../api/index.ts";
import type { ChangeType } from "../api/types.ts";
import { ErrorNote, Field } from "../components/Feedback.tsx";
import { changeLabel, riskDeltaLabel } from "../labels.ts";

export function ComparePage() {
  const contracts = useQuery({ queryKey: ["contracts"], queryFn: () => api.listContracts() });
  const analyzed = (contracts.data?.items ?? []).filter((item) => item.status === "ANALYZED");
  const [beforeId, setBeforeId] = useState(0);
  const [afterId, setAfterId] = useState(0);
  const [filter, setFilter] = useState<ChangeType | "ALL">("ALL");
  const compare = useMutation({
    mutationFn: () => api.compare(beforeId || analyzed[0]?.contractId, afterId || analyzed[1]?.contractId),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    compare.mutate();
  }

  const pairs = (compare.data?.pairs ?? []).filter((pair) => filter === "ALL" || pair.changeType === filter);

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">수정 전후</p>
        <h1>두 계약서 비교</h1>
        <p className="lede">분석이 끝난 계약서만 비교할 수 있습니다. 이용권은 빠지지 않습니다.</p>
      </div>
      <form className="card grid-2" onSubmit={onSubmit}>
        <Field label="수정 전">
          <select value={beforeId} onChange={(event) => setBeforeId(Number(event.target.value))}>
            <option value={0}>선택</option>
            {analyzed.map((item) => (
              <option key={item.contractId} value={item.contractId}>
                {item.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="수정 후">
          <select value={afterId} onChange={(event) => setAfterId(Number(event.target.value))}>
            <option value={0}>선택</option>
            {analyzed.map((item) => (
              <option key={item.contractId} value={item.contractId}>
                {item.title}
              </option>
            ))}
          </select>
        </Field>
        <button className="btn btn-primary" type="submit" disabled={compare.isPending || analyzed.length < 2}>
          비교하기
        </button>
      </form>
      <ErrorNote error={compare.error} />
      {compare.data ? (
        <div className="filters">
          {(["ALL", "ADDED", "DELETED", "MODIFIED", "SAME"] as const).map((type) => (
            <button key={type} className="btn" type="button" aria-pressed={filter === type} onClick={() => setFilter(type)}>
              {type === "ALL" ? "전체" : changeLabel[type]}
            </button>
          ))}
        </div>
      ) : null}
      <div className="stack">
        {pairs.map((pair, index) => (
          <article key={`${pair.beforeClauseId}-${pair.afterClauseId}-${index}`} className="card between">
            <strong>{changeLabel[pair.changeType]}</strong>
            <span className={`delta-${pair.riskDelta}`}>{riskDeltaLabel(pair.riskDelta)}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

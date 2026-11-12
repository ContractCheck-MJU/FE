import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../api/index.ts";
import type { ExplanationTone } from "../api/types.ts";
import { Disclaimer } from "../components/Disclaimer.tsx";
import { ErrorNote } from "../components/Feedback.tsx";
import { RiskBadge } from "../components/RiskBadge.tsx";
import { formatPercent } from "../format.ts";
import { citationLabel } from "../labels.ts";

export function ClausePage() {
  const params = useParams();
  const contractId = Number(params.contractId);
  const clauseId = Number(params.clauseId);
  const clauses = useQuery({
    queryKey: ["clauses", contractId],
    queryFn: () => api.clauses(contractId),
  });
  const create = useMutation({
    mutationFn: (tone: ExplanationTone) => api.createExplanation(clauseId, tone),
  });

  const clause = clauses.data?.items.find((item) => item.clauseId === clauseId);
  const explanation = create.data;
  const usedUp = create.error instanceof ApiError && create.error.code === "REGENERATE_LIMIT";

  return (
    <div className="page">
      <Link to={`/contracts/${contractId}`}>계약서로 돌아가기</Link>
      <div className="page-head">
        <p className="eyebrow">조항</p>
        <h1>{clause?.title ?? "조항"}</h1>
      </div>
      <ErrorNote error={clauses.error} />
      <article className="card stack">
        <RiskBadge level={clause?.riskLevel ?? null} />
        <p className="quote">{clause?.text}</p>
      </article>
      <section className="card stack">
        <div className="between">
          <h2>쉬운말 설명</h2>
          <div className="actions">
            <button className="btn btn-primary" type="button" disabled={create.isPending || Boolean(usedUp)} onClick={() => create.mutate("기본")}>
              {explanation ? "다시 설명" : "설명 만들기"}
            </button>
            <button className="btn" type="button" disabled={create.isPending || Boolean(usedUp)} onClick={() => create.mutate("아주쉽게")}>
              아주 쉽게
            </button>
          </div>
        </div>
        <ErrorNote error={create.error} />
        {explanation ? (
          <>
            <p>{explanation.text}</p>
            <p className="note">{explanation.suggestion}</p>
            <Disclaimer text={explanation.disclaimer} />
          </>
        ) : (
          <p className="muted">분석을 끝낸 조항만 설명할 수 있고, 한 조항은 3번까지 다시 만들 수 있습니다.</p>
        )}
      </section>
      {explanation && explanation.citations.length > 0 ? (
        <section className="stack">
          <h2>근거</h2>
          {explanation.citations.map((citation) => (
            <article key={`${citation.type}-${citation.ref}`} className="card">
              <p>
                <span className="pill">{citationLabel[citation.type]}</span>{" "}
                {citation.score != null ? <span className="muted">유사도 {formatPercent(citation.score)}</span> : null}
              </p>
              <h3>{citation.title}</h3>
              <p className="meta">{citation.ref}</p>
              <div className="actions">
                <a className="btn" href={citation.url} target="_blank" rel="noreferrer">
                  원문 링크
                </a>
                {citation.type === "KFTC_CASE" ? (
                  <Link className="btn" to="/search?tab=cases" state={{ q: citation.title }}>
                    시정 전후 보기
                  </Link>
                ) : (
                  <Link className="btn" to="/search?tab=law" state={{ q: citation.title }}>
                    법령·판례 검색
                  </Link>
                )}
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

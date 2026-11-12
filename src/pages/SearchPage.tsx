import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { api } from "../api/index.ts";
import { ErrorNote, Field } from "../components/Feedback.tsx";
import { formatPercent } from "../format.ts";
import { citationLabel } from "../labels.ts";

export function SearchPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const initial = (location.state as { q?: string } | null)?.q ?? "";
  const [tab, setTab] = useState(params.get("tab") === "cases" ? "cases" : "law");
  const [q, setQ] = useState(initial);
  const [type, setType] = useState<"" | "LAW" | "PRECEDENT">("");
  const precedents = useMutation({
    mutationFn: () => api.searchPrecedents(q, type || undefined),
  });
  const cases = useMutation({
    mutationFn: () => api.searchCases(q),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (tab === "cases") cases.mutate();
    else precedents.mutate();
  }

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">근거 검색</p>
        <h1>법령, 판례, 시정 사례</h1>
      </div>
      <div className="filters">
        <button className="btn" type="button" aria-pressed={tab === "law"} onClick={() => setTab("law")}>
          법령·판례
        </button>
        <button className="btn" type="button" aria-pressed={tab === "cases"} onClick={() => setTab("cases")}>
          시정 사례
        </button>
      </div>
      <form className="card stack" onSubmit={onSubmit}>
        <Field label="검색어">
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="갱신요구권" />
        </Field>
        {tab === "law" ? (
          <Field label="종류">
            <select value={type} onChange={(event) => setType(event.target.value as "" | "LAW" | "PRECEDENT")}>
              <option value="">전체</option>
              <option value="LAW">법령</option>
              <option value="PRECEDENT">판례</option>
            </select>
          </Field>
        ) : null}
        <button className="btn btn-primary" type="submit">
          검색
        </button>
      </form>
      <ErrorNote error={precedents.error ?? cases.error} />
      <div className="stack">
        {tab === "law"
          ? precedents.data?.items.map((item) => (
              <article key={item.id} className="card">
                <span className="pill">{citationLabel[item.type]}</span>
                <h2>{item.title}</h2>
                <p className="meta">
                  {item.ref} · 유사도 {formatPercent(item.score)}
                </p>
                <p>{item.snippet}</p>
                <a href={item.url} target="_blank" rel="noreferrer">
                  원문
                </a>
              </article>
            ))
          : cases.data?.items.map((item) => (
              <article key={item.id} className="card">
                <h2>{item.title}</h2>
                <p className="meta">
                  {item.pressDate} · {item.afterIsDeletion ? "삭제" : "수정"} · {formatPercent(item.score)}
                </p>
                <p>{item.before}</p>
              </article>
            ))}
      </div>
    </div>
  );
}

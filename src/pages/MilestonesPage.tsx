import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { api } from "../api/index.ts";
import type { MilestoneDates, MilestoneType } from "../api/types.ts";
import { ErrorNote, Field } from "../components/Feedback.tsx";
import { downloadText } from "../download.ts";
import { dday, formatDate } from "../format.ts";
import { milestoneLabel } from "../labels.ts";

const emptyDates: MilestoneDates = { contractDate: "", balanceDate: "", moveInDate: "", endDate: "" };

export function MilestonesPage() {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const list = useQuery({ queryKey: ["milestones"], queryFn: () => api.milestones() });
  const contracts = useQuery({ queryKey: ["contracts"], queryFn: () => api.listContracts() });
  const [contractId, setContractId] = useState(0);
  const [dates, setDates] = useState<MilestoneDates>(emptyDates);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [remindDays, setRemindDays] = useState("30,7,1");

  const generate = useMutation({
    mutationFn: () => api.generateMilestones(contractId, dates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["milestones"] }),
  });
  const create = useMutation({
    mutationFn: () =>
      api.createMilestone({
        contractId: contractId || undefined,
        type: "CUSTOM" satisfies MilestoneType,
        title,
        dueDate,
        remindDays: remindDays.split(",").map((item) => Number(item.trim())).filter((item) => Number.isFinite(item)),
      }),
    onSuccess: async () => {
      setTitle("");
      await queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
  });
  const toggle = useMutation({
    mutationFn: (input: { id: number; done: boolean }) => api.updateMilestone(input.id, { done: input.done }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["milestones"] }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => api.deleteMilestone(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["milestones"] }),
  });
  const ics = useMutation({
    mutationFn: () => api.ics(contractId),
    onSuccess: (text) => downloadText("milestones.ics", text),
  });

  const marks = useMemo(() => new Set((list.data?.items ?? []).map((item) => item.dueDate)), [list.data]);
  const first = new Date(cursor.year, cursor.month, 1);
  const days = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const cells = [...Array.from({ length: first.getDay() }, () => ""), ...Array.from({ length: days }, (_, index) => String(index + 1))];

  function onGenerate(event: FormEvent) {
    event.preventDefault();
    generate.mutate();
  }

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">마일스톤</p>
        <h1>계약 일정</h1>
      </div>
      <ErrorNote error={list.error ?? generate.error ?? create.error ?? ics.error} />
      <section className="card stack">
        <div className="between">
          <h2>
            {cursor.year}년 {cursor.month + 1}월
          </h2>
          <div className="actions">
            <button className="btn" type="button" onClick={() => setCursor((value) => ({ year: value.month === 0 ? value.year - 1 : value.year, month: value.month === 0 ? 11 : value.month - 1 }))}>
              이전
            </button>
            <button className="btn" type="button" onClick={() => setCursor((value) => ({ year: value.month === 11 ? value.year + 1 : value.year, month: value.month === 11 ? 0 : value.month + 1 }))}>
              다음
            </button>
          </div>
        </div>
        <div className="cal">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <b key={day}>{day}</b>
          ))}
          {cells.map((day, index) => {
            const iso = day
              ? `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${day.padStart(2, "0")}`
              : "";
            return (
              <i key={`${day}-${index}`} className={iso && marks.has(iso) ? "mark" : undefined}>
                {day}
              </i>
            );
          })}
        </div>
      </section>
      <div className="stack">
        {(list.data?.items ?? []).map((item) => (
          <article key={item.milestoneId} className="card between">
            <div>
              <h2>
                {item.title} <span className="pill">{milestoneLabel[item.type] ?? item.type}</span>
              </h2>
              <p className="meta">
                {formatDate(item.dueDate)} · {dday(item.dueDate)} · 알림 {item.remindDays.join(", ")}일 전
              </p>
            </div>
            <div className="actions">
              <button className="btn" type="button" onClick={() => toggle.mutate({ id: item.milestoneId, done: !item.done })}>
                {item.done ? "완료 취소" : "완료"}
              </button>
              <button className="btn btn-danger" type="button" onClick={() => remove.mutate(item.milestoneId)}>
                삭제
              </button>
            </div>
          </article>
        ))}
      </div>
      <form className="card stack" onSubmit={onGenerate}>
        <h2>계약서에서 일정 만들기</h2>
        <Field label="계약서">
          <select value={contractId} onChange={(event) => setContractId(Number(event.target.value))}>
            <option value={0}>선택</option>
            {contracts.data?.items.map((item) => (
              <option key={item.contractId} value={item.contractId}>
                {item.title}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid-2">
          <Field label="계약일">
            <input type="date" value={dates.contractDate} onChange={(event) => setDates({ ...dates, contractDate: event.target.value })} />
          </Field>
          <Field label="잔금일">
            <input type="date" value={dates.balanceDate} onChange={(event) => setDates({ ...dates, balanceDate: event.target.value })} />
          </Field>
          <Field label="입주일">
            <input type="date" value={dates.moveInDate} onChange={(event) => setDates({ ...dates, moveInDate: event.target.value })} />
          </Field>
          <Field label="만기일">
            <input type="date" value={dates.endDate} onChange={(event) => setDates({ ...dates, endDate: event.target.value })} />
          </Field>
        </div>
        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={!contractId || generate.isPending}>
            일정 생성
          </button>
          <button className="btn" type="button" disabled={!contractId || ics.isPending} onClick={() => ics.mutate()}>
            .ics 받기
          </button>
        </div>
      </form>
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <h2>일정 직접 추가</h2>
        <Field label="제목">
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="날짜">
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </Field>
        <Field label="알림 시점(일 전, 쉼표로 구분)">
          <input value={remindDays} onChange={(event) => setRemindDays(event.target.value)} />
        </Field>
        <button className="btn" type="submit" disabled={create.isPending}>
          추가
        </button>
      </form>
    </div>
  );
}

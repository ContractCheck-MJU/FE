import type {
  Analysis,
  AnalysisClause,
  AnalysisStatus,
  Clause,
  ContractDetail,
  ContractStatus,
  ContractSummary,
  ContractType,
  Milestone,
  RiskLevel,
  SimilarCase,
} from "./types.ts";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function text(value: unknown, fallback = "") {
  return value == null ? fallback : String(value);
}

function num(value: unknown, fallback: number | null = null) {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function upper(value: unknown) {
  return text(value).trim().toUpperCase();
}

const contractStatuses = new Set<ContractStatus>([
  "UPLOADED",
  "OCR",
  "SPLIT",
  "ANALYZING",
  "ANALYZED",
  "FAILED",
]);

export function normalizeStatus(value: unknown): ContractStatus {
  const status = upper(value);
  if (status === "PARSING") return "OCR";
  if (status === "CLASSIFYING" || status === "RUNNING" || status === "PENDING") return "ANALYZING";
  if (status === "READY" || status === "DONE") return "ANALYZED";
  if (contractStatuses.has(status as ContractStatus)) return status as ContractStatus;
  return "UPLOADED";
}

export function normalizeAnalysisStatus(value: unknown): AnalysisStatus {
  const status = upper(value);
  if (status === "FAILED") return "FAILED";
  if (status === "DONE" || status === "ANALYZED" || status === "READY") return "DONE";
  return "ANALYZING";
}

function risk(value: unknown): RiskLevel | null {
  const level = upper(value);
  if (level === "HIGH" || level === "MEDIUM") return level === "MEDIUM" ? "CAUTION" : "HIGH";
  if (level === "CAUTION" || level === "LOW" || level === "SAFE") {
    return level === "LOW" ? "SAFE" : (level as RiskLevel);
  }
  return null;
}

function contractType(value: unknown): ContractType {
  return upper(value) === "JEONSE" ? "JEONSE" : "MONTHLY";
}

export function normalizeContractSummary(value: unknown): ContractSummary {
  const raw = record(value);
  const score = num(raw.overallScore ?? raw.riskScore);
  return {
    contractId: Number(raw.contractId ?? raw.id),
    title: text(raw.title, "제목 없는 계약서"),
    contractType: contractType(raw.contractType ?? raw.type),
    status: normalizeStatus(raw.status),
    overallScore: score,
    createdAt: text(raw.createdAt),
  };
}

export function normalizeContractDetail(value: unknown): ContractDetail {
  const raw = record(value);
  return {
    ...normalizeContractSummary(raw),
    clauseCount: Number(raw.clauseCount ?? 0),
    maskedText: text(raw.maskedText),
    errorMessage: raw.errorMessage == null ? null : text(raw.errorMessage),
  };
}

function normalizeCase(value: unknown): SimilarCase {
  const raw = record(value);
  const deletion = raw.afterIsDeletion;
  return {
    id: Number(raw.id),
    pressDate: text(raw.pressDate),
    title: text(raw.title ?? raw.pressTitle),
    before: text(raw.before ?? raw.beforeText),
    after: raw.after == null && raw.afterText == null ? null : text(raw.after ?? raw.afterText),
    afterIsDeletion: deletion == null ? null : Boolean(deletion),
    url: text(raw.url ?? raw.sourceUrl),
    score: Number(num(raw.score, 0)),
  };
}

export function normalizeClause(value: unknown): Clause {
  const raw = record(value);
  return {
    clauseId: Number(raw.clauseId ?? raw.id),
    no: Number(raw.no ?? raw.clauseNo ?? 0),
    title: text(raw.title),
    text: text(raw.text),
    riskLevel: risk(raw.riskLevel),
    needsReanalysis: Boolean(raw.needsReanalysis),
  };
}

export function normalizeAnalysis(value: unknown): Analysis {
  const raw = record(value);
  const clauses = Array.isArray(raw.clauses)
    ? raw.clauses
    : Array.isArray(raw.results)
      ? raw.results
      : [];
  return {
    analysisId: Number(raw.analysisId ?? raw.id),
    contractId: Number(raw.contractId ?? 0),
    status: normalizeAnalysisStatus(raw.status),
    overallScore: num(raw.overallScore),
    summary: raw.summary == null ? null : text(raw.summary),
    clauses: clauses.map((item) => {
      const clause = record(item);
      const level = risk(clause.riskLevel) ?? "CAUTION";
      const cases = Array.isArray(clause.similarCases) ? clause.similarCases : [];
      return {
        clauseId: Number(clause.clauseId ?? clause.id),
        riskLevel: level,
        riskType: text(clause.riskType, "미분류"),
        score: Number(num(clause.score ?? clause.prob ?? clause.probability, 0)),
        lowConfidence: Boolean(clause.lowConfidence),
        evidence: text(clause.evidence),
        similarCases: cases.map(normalizeCase),
      } satisfies AnalysisClause;
    }),
  };
}

export function normalizeMilestone(value: unknown): Milestone {
  const raw = record(value);
  const days = Array.isArray(raw.remindDays) ? raw.remindDays.map((day) => Number(day)) : [30, 7, 1];
  return {
    milestoneId: Number(raw.milestoneId ?? raw.id),
    contractId: raw.contractId == null ? null : Number(raw.contractId),
    type: (upper(raw.type) || "CUSTOM") as Milestone["type"],
    title: text(raw.title),
    dueDate: text(raw.dueDate ?? raw.date).slice(0, 10),
    remindDays: days,
    done: Boolean(raw.done),
  };
}

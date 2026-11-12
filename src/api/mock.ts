import { DISCLAIMER } from "../labels.ts";
import { ApiError } from "./errors.ts";
import type {
  Analysis,
  AnalysisClause,
  AuthMe,
  Clause,
  Comparison,
  ComparisonPair,
  ContractDetail,
  ContractType,
  Credits,
  Explanation,
  ExplanationTone,
  IngestJob,
  LedgerEntry,
  Member,
  Milestone,
  MilestoneDates,
  MilestoneType,
  NotificationItem,
  NotificationSettings,
  Order,
  Page,
  Payment,
  PrecedentHit,
  Product,
  RiskLevel,
  SimilarCase,
} from "./types.ts";

const STORAGE_KEY = "contract-web-mock-v1";

type Draft = {
  title: string;
  text: string;
  riskLevel: RiskLevel;
  riskType: string;
  score: number;
  lowConfidence: boolean;
  evidence: string;
  similarCases: SimilarCase[];
};

type StoredClause = Clause & Omit<Draft, "title" | "text">;

type OrderRow = Order & { productId: number; paymentId?: number };

type PaymentRow = Payment & { creditsAdded: number; orderId: string };

type Account = {
  email: string;
  password: string;
  nickname: string;
};

type DB = {
  seq: number;
  user: AuthMe | null;
  member: Member | null;
  accounts: Account[];
  credits: Credits;
  ledger: LedgerEntry[];
  contracts: ContractDetail[];
  progress: Record<number, number>;
  clauses: Record<number, StoredClause[]>;
  analyses: Record<number, Analysis>;
  analysisByContract: Record<number, number>;
  explanations: Record<number, Explanation>;
  explainCounts: Record<number, number>;
  comparisons: Comparison[];
  milestones: Milestone[];
  notifications: NotificationItem[];
  settings: NotificationSettings;
  payments: PaymentRow[];
  orders: OrderRow[];
  jobs: IngestJob[];
  cases: SimilarCase[];
  precedents: PrecedentHit[];
};

const renewalCase: SimilarCase = {
  id: 101,
  pressDate: "2024-05-14",
  title: "주택 임대차 갱신요구권 포기 약정 시정",
  before: "임차인은 계약 만료 시 계약갱신요구권을 행사하지 않기로 한다.",
  after: null,
  afterIsDeletion: true,
  url: "https://www.ftc.go.kr",
  score: 0.86,
};

const penaltyCase: SimilarCase = {
  id: 102,
  pressDate: "2023-11-02",
  title: "보증금 전액 몰수 약정 시정",
  before: "계약 위반 시 보증금 전액을 위약금으로 몰수한다.",
  after: "실제 손해의 범위에서 위약금을 정산한다.",
  afterIsDeletion: false,
  url: "https://www.ftc.go.kr",
  score: 0.81,
};

const riskyDraft: Draft[] = [
  {
    title: "제1조(계약기간)",
    text: "임대차 기간은 2026.03.01부터 2027.02.28까지(1년)로 한다.",
    riskLevel: "CAUTION",
    riskType: "계약기간",
    score: 0.61,
    lowConfidence: false,
    evidence: "1년으로 적혀 있어도 임차인은 2년 거주를 주장할 수 있습니다.",
    similarCases: [],
  },
  {
    title: "제2조(갱신요구권)",
    text: "임차인은 계약 만료 시 계약갱신요구권을 행사하지 않기로 하며, 이의를 제기하지 않는다.",
    riskLevel: "HIGH",
    riskType: "임차인 권리 제한",
    score: 0.93,
    lowConfidence: false,
    evidence: "주택임대차보호법상 갱신요구권을 미리 포기하는 약정은 임차인에게 불리합니다.",
    similarCases: [renewalCase],
  },
  {
    title: "제3조(위약금)",
    text: "임차인이 계약을 위반하면 임대인은 보증금 전액을 위약금으로 몰수하고, 임차인은 반환을 청구할 수 없다.",
    riskLevel: "HIGH",
    riskType: "환불·위약금",
    score: 0.9,
    lowConfidence: false,
    evidence: "손해배상 예정액이 실제 손해에 비해 과다하면 감액을 다툴 수 있습니다.",
    similarCases: [penaltyCase],
  },
  {
    title: "제4조(원상복구)",
    text: "퇴거 시 통상적인 사용에 따른 손모를 포함하여 도배·장판 비용은 임차인이 전부 부담한다.",
    riskLevel: "HIGH",
    riskType: "면책",
    score: 0.84,
    lowConfidence: false,
    evidence: "시간이 지나 생기는 통상 손모까지 임차인에게 지우면 불공정할 수 있습니다.",
    similarCases: [],
  },
  {
    title: "제5조(차임 연체)",
    text: "임차인이 월세를 1회라도 연체하면 임대인은 최고 없이 즉시 계약을 해지할 수 있다.",
    riskLevel: "HIGH",
    riskType: "계약해지",
    score: 0.88,
    lowConfidence: false,
    evidence: "차임 연체를 이유로 한 해지는 원칙적으로 2기 연체가 기준입니다.",
    similarCases: [],
  },
  {
    title: "제6조(수선)",
    text: "난방, 누수 등 주택의 주요 설비 수선은 임대인이 부담한다.",
    riskLevel: "SAFE",
    riskType: "수선 의무",
    score: 0.18,
    lowConfidence: false,
    evidence: "주요 설비의 수선 의무를 임대인에게 둔 조항입니다.",
    similarCases: [],
  },
];

const saferDraft: Draft[] = [
  {
    title: "제1조(계약기간)",
    text: "임대차 기간은 2026.03.01부터 2028.02.29까지(2년)로 한다.",
    riskLevel: "SAFE",
    riskType: "계약기간",
    score: 0.12,
    lowConfidence: false,
    evidence: "2년으로 정한 계약기간입니다.",
    similarCases: [],
  },
  {
    title: "제3조(위약금)",
    text: "계약을 중도 해지할 때의 손해는 실제 손해를 넘는 범위에서 청구하지 않는다.",
    riskLevel: "SAFE",
    riskType: "환불·위약금",
    score: 0.2,
    lowConfidence: true,
    evidence: "실제 손해 범위를 넘지 않는다고 적혀 있습니다. 문구만으로 금액이 확정되지는 않습니다.",
    similarCases: [penaltyCase],
  },
  {
    title: "제4조(원상복구)",
    text: "퇴거 시 임차인의 고의·과실로 생긴 훼손만 원상복구한다. 통상 손모는 제외한다.",
    riskLevel: "SAFE",
    riskType: "면책",
    score: 0.16,
    lowConfidence: false,
    evidence: "통상 손모를 임차인 부담에서 빼 두었습니다.",
    similarCases: [],
  },
  {
    title: "제6조(수선)",
    text: "난방, 누수 등 주택의 주요 설비 수선은 임대인이 부담한다.",
    riskLevel: "SAFE",
    riskType: "수선 의무",
    score: 0.18,
    lowConfidence: false,
    evidence: "주요 설비의 수선 의무를 임대인에게 둔 조항입니다.",
    similarCases: [],
  },
  {
    title: "제7조(반려동물)",
    text: "임차인은 소형 반려동물 1마리를 키울 수 있다. 훼손이 생기면 원상복구한다.",
    riskLevel: "CAUTION",
    riskType: "사용 제한",
    score: 0.44,
    lowConfidence: true,
    evidence: "반려동물 허용 자체보다 훼손 범위가 넓게 읽힐 수 있어 주의 등급입니다.",
    similarCases: [],
  },
];

const products: Product[] = [
  { id: 1, name: "분석 3회", credits: 3, price: 9900 },
  { id: 2, name: "분석 10회", credits: 10, price: 29000 },
];

function now() {
  return new Date().toISOString();
}

function copy<T>(value: T): T {
  return structuredClone(value);
}

function fail(status: number, code: string, message: string): never {
  throw new ApiError(status, code, message, { traceId: "mock-trace" });
}

function weight(level: RiskLevel) {
  if (level === "HIGH") return 90;
  if (level === "CAUTION") return 55;
  return 15;
}

function overall(clauses: StoredClause[]) {
  if (!clauses.length) return 0;
  return Math.round(clauses.reduce((sum, clause) => sum + weight(clause.riskLevel ?? "SAFE"), 0) / clauses.length);
}

function summaryOf(clauses: StoredClause[]) {
  const high = clauses.filter((clause) => clause.riskLevel === "HIGH").length;
  const caution = clauses.filter((clause) => clause.riskLevel === "CAUTION").length;
  return `위험 ${high}개, 주의 ${caution}개입니다. 위험 조항은 쉬운말 설명에서 근거와 수정 제안을 확인하세요.`;
}

function toPublicClause(clause: StoredClause, revealed: boolean): Clause {
  return {
    clauseId: clause.clauseId,
    no: clause.no,
    title: clause.title,
    text: clause.text,
    riskLevel: revealed ? clause.riskLevel : null,
    needsReanalysis: clause.needsReanalysis,
  };
}

function makeClauses(draft: Draft[], startId: number): StoredClause[] {
  return draft.map((item, index) => ({
    clauseId: startId + index,
    no: index + 1,
    title: item.title,
    text: item.text,
    riskLevel: item.riskLevel,
    needsReanalysis: false,
    riskType: item.riskType,
    score: item.score,
    lowConfidence: item.lowConfidence,
    evidence: item.evidence,
    similarCases: item.similarCases,
  }));
}

function analysisFrom(contractId: number, analysisId: number, clauses: StoredClause[], status: Analysis["status"]): Analysis {
  return {
    analysisId,
    contractId,
    status,
    overallScore: status === "DONE" ? overall(clauses) : null,
    summary: status === "DONE" ? summaryOf(clauses) : null,
    clauses:
      status === "DONE"
        ? clauses.map(
            (clause): AnalysisClause => ({
              clauseId: clause.clauseId,
              riskLevel: clause.riskLevel ?? "SAFE",
              riskType: clause.riskType,
              score: clause.score,
              lowConfidence: clause.lowConfidence,
              evidence: clause.evidence,
              similarCases: clause.similarCases,
            }),
          )
        : [],
  };
}

function fresh(): DB {
  const clauses1 = makeClauses(riskyDraft, 101);
  const clauses2 = makeClauses(saferDraft, 201);
  const created = "2026-11-08T09:00:00.000Z";
  return {
    seq: 500,
    user: null,
    member: null,
    accounts: [],
    credits: { freeRemaining: 2, paidRemaining: 0 },
    ledger: [{ type: "GRANT", amount: 2, refId: null, createdAt: created }],
    contracts: [
      {
        contractId: 1,
        title: "신촌 원룸 월세",
        contractType: "MONTHLY",
        status: "ANALYZED",
        overallScore: overall(clauses1),
        createdAt: created,
        clauseCount: clauses1.length,
        maskedText: clauses1.map((clause) => clause.text.replaceAll("임차인", "[이름]")).join("\n"),
        errorMessage: null,
      },
      {
        contractId: 2,
        title: "수정본 전세 계약",
        contractType: "JEONSE",
        status: "ANALYZED",
        overallScore: overall(clauses2),
        createdAt: "2026-11-09T09:00:00.000Z",
        clauseCount: clauses2.length,
        maskedText: clauses2.map((clause) => clause.text).join("\n"),
        errorMessage: null,
      },
    ],
    progress: { 1: 100, 2: 100 },
    clauses: { 1: clauses1, 2: clauses2 },
    analyses: {
      11: analysisFrom(1, 11, clauses1, "DONE"),
      12: analysisFrom(2, 12, clauses2, "DONE"),
    },
    analysisByContract: { 1: 11, 2: 12 },
    explanations: {
      102: {
        explanationId: 701,
        clauseId: 102,
        text: "계약이 끝나갈 때 임차인이 ‘한 번 더 살겠다’고 말할 권리를 미리 포기하라는 내용입니다. 법으로 보장된 권리를 계약서에서 빼면 나중에 불리해질 수 있습니다.",
        suggestion: "이 조항은 삭제하는 편이 안전합니다.",
        citations: [
          {
            type: "LAW",
            title: "주택임대차보호법",
            ref: "제6조의3",
            url: "https://www.law.go.kr",
            score: 0.84,
          },
          {
            type: "KFTC_CASE",
            title: renewalCase.title,
            ref: renewalCase.pressDate,
            url: renewalCase.url,
            score: renewalCase.score,
          },
        ],
        disclaimer: DISCLAIMER,
      },
    },
    explainCounts: { 102: 1 },
    comparisons: [],
    milestones: [
      {
        milestoneId: 301,
        contractId: 1,
        type: "BALANCE",
        title: "잔금",
        dueDate: "2026-11-17",
        remindDays: [7, 1],
        done: false,
      },
      {
        milestoneId: 302,
        contractId: 1,
        type: "MOVE_IN",
        title: "입주",
        dueDate: "2026-11-21",
        remindDays: [7, 1],
        done: false,
      },
      {
        milestoneId: 303,
        contractId: 1,
        type: "RENEWAL_NOTICE",
        title: "갱신 거절 통지 마감",
        dueDate: "2028-09-20",
        remindDays: [30, 7, 1],
        done: false,
      },
      {
        milestoneId: 304,
        contractId: 1,
        type: "END",
        title: "계약 만기",
        dueDate: "2028-11-20",
        remindDays: [30, 7, 1],
        done: false,
      },
    ],
    notifications: [
      {
        notificationId: 401,
        type: "EMAIL",
        title: "잔금일까지 7일 남았습니다.",
        sentAt: "2026-11-10T00:00:00.000Z",
        readAt: null,
      },
      {
        notificationId: 402,
        type: "EMAIL",
        title: "입주일 일정을 캘린더에 넣어 두세요.",
        sentAt: "2026-11-09T00:00:00.000Z",
        readAt: "2026-11-09T01:00:00.000Z",
      },
    ],
    settings: { emailEnabled: true, pushEnabled: false, remindDays: [30, 7, 1] },
    payments: [],
    orders: [],
    jobs: [],
    cases: [renewalCase, penaltyCase],
    precedents: [
      {
        type: "LAW",
        id: 1,
        title: "주택임대차보호법",
        ref: "제6조의3",
        snippet: "임차인은 계약갱신을 요구할 수 있다. 임차인에게 불리한 약정은 효력이 없다.",
        score: 0.84,
        url: "https://www.law.go.kr",
      },
      {
        type: "LAW",
        id: 2,
        title: "주택임대차보호법",
        ref: "제4조",
        snippet: "기간을 2년 미만으로 정한 임대차는 그 기간을 2년으로 본다. 임차인은 2년 미만으로 주장할 수 있다.",
        score: 0.79,
        url: "https://www.law.go.kr",
      },
      {
        type: "PRECEDENT",
        id: 3,
        title: "보증금 반환과 위약금 감액",
        ref: "2022다12345",
        snippet: "손해배상 예정액이 부당히 과다하면 법원이 적당히 감액할 수 있다.",
        score: 0.73,
        url: "https://www.law.go.kr",
      },
    ],
  };
}

function load(): DB {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return fresh();
  try {
    const parsed = JSON.parse(raw) as DB;
    if (!parsed.accounts) parsed.accounts = [];
    return parsed;
  } catch {
    return fresh();
  }
}

let db = load();
const files = new Map<number, File>();

function save() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function requireUser() {
  if (!db.user) fail(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  return db.user;
}

function enter(email: string, nickname: string) {
  const createdAt = db.member?.email === email ? db.member.createdAt : now();
  db.user = {
    id: db.member?.email === email ? db.member.id : 1,
    nickname,
    role: "USER",
    provider: "local",
  };
  db.member = {
    id: db.user.id,
    nickname,
    email,
    role: "USER",
    createdAt,
  };
  save();
  return copy(db.user);
}

function contractOrThrow(contractId: number) {
  requireUser();
  const contract = db.contracts.find((item) => item.contractId === contractId);
  if (!contract) fail(404, "CONTRACT_NOT_FOUND", "계약서를 찾지 못했습니다.");
  return contract;
}

function pageOf<T>(list: T[], page = 0, size = 20): Page<T> {
  return { items: list.slice(page * size, page * size + size), page, size, total: list.length };
}

function allowedFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    file.type === "application/pdf" ||
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    name.endsWith(".pdf") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png")
  );
}

function hasCredit() {
  return db.credits.freeRemaining + db.credits.paidRemaining > 0;
}

function spend(refId: number) {
  if (db.credits.freeRemaining > 0) db.credits.freeRemaining -= 1;
  else if (db.credits.paidRemaining > 0) db.credits.paidRemaining -= 1;
  else fail(402, "CREDIT_INSUFFICIENT", "남은 분석 횟수가 없습니다.");
  db.ledger.unshift({ type: "USE", amount: -1, refId, createdAt: now() });
}

function reveal(contract: ContractDetail) {
  return contract.status === "ANALYZED" || contract.status === "ANALYZING";
}

function refreshScore(contract: ContractDetail) {
  const clauses = db.clauses[contract.contractId] ?? [];
  contract.clauseCount = clauses.length;
  contract.maskedText = clauses.map((clause) => clause.text).join("\n");
  if (contract.status === "ANALYZED") {
    contract.overallScore = overall(clauses);
    const analysisId = db.analysisByContract[contract.contractId];
    if (analysisId) db.analyses[analysisId] = analysisFrom(contract.contractId, analysisId, clauses, "DONE");
  }
}

function schedulePipeline(contractId: number) {
  window.setTimeout(() => {
    const contract = db.contracts.find((item) => item.contractId === contractId);
    if (!contract || contract.status === "FAILED") return;
    contract.status = "OCR";
    db.progress[contractId] = 45;
    save();
  }, 700);
  window.setTimeout(() => {
    const contract = db.contracts.find((item) => item.contractId === contractId);
    if (!contract || contract.status === "FAILED") return;
    contract.status = "SPLIT";
    db.progress[contractId] = 100;
    if (!db.clauses[contractId]) {
      db.seq += 1;
      db.clauses[contractId] = makeClauses(riskyDraft, db.seq);
      db.seq += riskyDraft.length;
    }
    refreshScore(contract);
    save();
  }, 1500);
}

function scheduleAnalysis(contractId: number) {
  window.setTimeout(() => {
    const contract = db.contracts.find((item) => item.contractId === contractId);
    const analysisId = db.analysisByContract[contractId];
    if (!contract || !analysisId) return;
    const clauses = db.clauses[contractId] ?? [];
    clauses.forEach((clause) => {
      clause.needsReanalysis = false;
    });
    contract.status = "ANALYZED";
    db.progress[contractId] = 100;
    db.analyses[analysisId] = analysisFrom(contractId, analysisId, clauses, "DONE");
    refreshScore(contract);
    save();
  }, 1200);
}

function riskRank(level: RiskLevel | null) {
  if (level === "HIGH") return 2;
  if (level === "CAUTION") return 1;
  return 0;
}

function clampDelta(value: number): -1 | 0 | 1 {
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
}

function buildPairs(before: StoredClause[], after: StoredClause[]): ComparisonPair[] {
  const used = new Set<number>();
  const pairs: ComparisonPair[] = [];
  for (const left of before) {
    const right = after.find((item) => !used.has(item.clauseId) && item.title === left.title);
    if (!right) {
      pairs.push({
        beforeClauseId: left.clauseId,
        afterClauseId: null,
        similarity: 0,
        changeType: "DELETED",
        riskDelta: clampDelta(-riskRank(left.riskLevel)),
      });
      continue;
    }
    used.add(right.clauseId);
    const same = left.text === right.text;
    pairs.push({
      beforeClauseId: left.clauseId,
      afterClauseId: right.clauseId,
      similarity: same ? 1 : 0.74,
      changeType: same ? "SAME" : "MODIFIED",
      riskDelta: clampDelta(riskRank(right.riskLevel) - riskRank(left.riskLevel)),
    });
  }
  for (const right of after) {
    if (used.has(right.clauseId)) continue;
    pairs.push({
      beforeClauseId: null,
      afterClauseId: right.clauseId,
      similarity: 0,
      changeType: "ADDED",
      riskDelta: clampDelta(riskRank(right.riskLevel)),
    });
  }
  return pairs;
}

function generatedMilestones(contractId: number, dates: MilestoneDates): Milestone[] {
  const end = new Date(`${dates.endDate}T00:00:00`);
  end.setMonth(end.getMonth() - 2);
  const renewal = end.toISOString().slice(0, 10);
  const rows: Array<[MilestoneType, string, string]> = [
    ["CONTRACT", "계약일", dates.contractDate],
    ["BALANCE", "잔금", dates.balanceDate],
    ["MOVE_IN", "입주", dates.moveInDate],
    ["RENEWAL_NOTICE", "갱신 거절 통지 마감", renewal],
    ["END", "계약 만기", dates.endDate],
  ];
  return rows.map(([type, title, dueDate]) => {
    db.seq += 1;
    return {
      milestoneId: db.seq,
      contractId,
      type,
      title,
      dueDate,
      remindDays: [30, 7, 1],
      done: false,
    };
  });
}

db.contracts
  .filter((contract) => contract.status === "UPLOADED" || contract.status === "OCR")
  .forEach((contract) => schedulePipeline(contract.contractId));
db.contracts
  .filter((contract) => contract.status === "ANALYZING")
  .forEach((contract) => scheduleAnalysis(contract.contractId));

export const mockApi = {
  async ensureCsrf() {
    return undefined;
  },

  async signup(input: { email: string; password: string; nickname: string }) {
    const email = input.email.trim().toLowerCase();
    const nickname = input.nickname.trim();
    if (!email.includes("@")) fail(400, "VALIDATION_ERROR", "이메일 형식이 아닙니다.");
    if (input.password.length < 8) fail(400, "VALIDATION_ERROR", "비밀번호는 8자 이상이어야 합니다.");
    if (!nickname || nickname.length > 50) {
      fail(400, "VALIDATION_ERROR", "닉네임은 1자 이상 50자 이하로 입력해 주세요.");
    }
    if (db.accounts.some((account) => account.email === email)) {
      fail(409, "EMAIL_EXISTS", "이미 가입한 이메일입니다.");
    }
    db.accounts.push({ email, password: input.password, nickname });
    return enter(email, nickname);
  },

  async login(input: { email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const account = db.accounts.find((item) => item.email === email);
    if (!account || account.password !== input.password) {
      fail(401, "INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다.");
    }
    return enter(email, account.nickname);
  },

  async me() {
    if (!db.user) fail(401, "UNAUTHORIZED", "로그인이 필요합니다.");
    return copy(db.user);
  },

  async logout() {
    db.user = null;
    save();
  },

  async member() {
    requireUser();
    if (!db.member) fail(401, "UNAUTHORIZED", "로그인이 필요합니다.");
    return copy(db.member);
  },

  async updateMember(nickname: string) {
    const member = await this.member();
    if (!nickname.trim() || nickname.trim().length > 50) {
      fail(400, "VALIDATION_ERROR", "닉네임은 1자 이상 50자 이하로 입력해 주세요.");
    }
    member.nickname = nickname.trim();
    if (db.user) db.user.nickname = member.nickname;
    save();
    return copy(member);
  },

  async withdraw() {
    requireUser();
    if (db.user?.role === "ADMIN") fail(409, "LAST_ADMIN", "마지막 관리자 계정은 탈퇴할 수 없습니다.");
    db = fresh();
    save();
  },

  async listContracts(page = 0) {
    requireUser();
    const items = [...db.contracts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return copy(pageOf(items, page));
  },

  async getContract(contractId: number) {
    return copy(contractOrThrow(contractId));
  },

  async contractStatus(contractId: number) {
    const contract = contractOrThrow(contractId);
    return {
      status: contract.status,
      progress: db.progress[contractId] ?? 0,
      errorMessage: contract.errorMessage,
    };
  },

  async fileUrl(contractId: number) {
    contractOrThrow(contractId);
    const file = files.get(contractId);
    if (!file) fail(404, "CONTRACT_NOT_FOUND", "이 브라우저 세션에는 원본 파일이 없습니다. 다시 업로드해 주세요.");
    return { url: URL.createObjectURL(file), expiresAt: new Date(Date.now() + 5 * 60_000).toISOString() };
  },

  async deleteContract(contractId: number) {
    const contract = contractOrThrow(contractId);
    if (contract.status === "ANALYZING") fail(409, "ANALYSIS_IN_PROGRESS", "분석이 끝난 뒤에 삭제할 수 있습니다.");
    db.contracts = db.contracts.filter((item) => item.contractId !== contractId);
    delete db.clauses[contractId];
    files.delete(contractId);
    save();
  },

  async createContract(
    input: { file: File; title: string; contractType: ContractType },
    onProgress?: (ratio: number) => void,
  ) {
    requireUser();
    if (!input.title.trim()) fail(400, "VALIDATION_ERROR", "제목을 입력해 주세요.");
    if (!allowedFile(input.file)) fail(415, "UNSUPPORTED_FILE_TYPE", "PDF, JPG, PNG 파일만 올릴 수 있습니다.");
    if (input.file.size > 20 * 1024 * 1024) fail(413, "FILE_TOO_LARGE", "파일은 20MB 이하만 올릴 수 있습니다.");
    if (!hasCredit()) fail(402, "CREDIT_INSUFFICIENT", "남은 분석 횟수가 없습니다. 이용권을 구매해 주세요.");
    onProgress?.(0.45);
    db.seq += 1;
    const contractId = db.seq;
    const contract: ContractDetail = {
      contractId,
      title: input.title.trim(),
      contractType: input.contractType,
      status: "UPLOADED",
      overallScore: null,
      createdAt: now(),
      clauseCount: 0,
      maskedText: "",
      errorMessage: null,
    };
    db.contracts.unshift(contract);
    db.progress[contractId] = 15;
    files.set(contractId, input.file);
    save();
    onProgress?.(1);
    schedulePipeline(contractId);
    return { contractId, status: "UPLOADED" as const };
  },

  async clauses(contractId: number) {
    const contract = contractOrThrow(contractId);
    const list = db.clauses[contractId] ?? [];
    return { items: list.map((clause) => toPublicClause(clause, reveal(contract))) };
  },

  async updateClause(clauseId: number, body: { text: string; title?: string; no?: number }) {
    requireUser();
    if (!body.text.trim()) fail(400, "VALIDATION_ERROR", "조항 내용을 입력해 주세요.");
    for (const [contractId, list] of Object.entries(db.clauses)) {
      const clause = list.find((item) => item.clauseId === clauseId);
      if (!clause) continue;
      const contract = contractOrThrow(Number(contractId));
      if (contract.status === "ANALYZING") fail(409, "ANALYSIS_IN_PROGRESS", "분석 중에는 조항을 수정할 수 없습니다.");
      clause.text = body.text.trim();
      if (body.title) clause.title = body.title.trim();
      if (body.no) clause.no = body.no;
      if (contract.status === "ANALYZED") clause.needsReanalysis = true;
      refreshScore(contract);
      save();
      return toPublicClause(clause, reveal(contract));
    }
    fail(404, "CLAUSE_NOT_FOUND", "조항을 찾지 못했습니다.");
  },

  async startAnalysis(contractId: number) {
    const contract = contractOrThrow(contractId);
    if (contract.status === "ANALYZING") fail(409, "ANALYSIS_IN_PROGRESS", "이미 분석이 진행 중입니다.");
    if (contract.status !== "SPLIT" && contract.status !== "ANALYZED") {
      fail(409, "CONTRACT_NOT_READY", "조항 분할이 끝난 뒤에 분석을 시작할 수 있습니다.");
    }
    const dirty = (db.clauses[contractId] ?? []).some((clause) => clause.needsReanalysis);
    if (contract.status === "ANALYZED" && !dirty) {
      const analysisId = db.analysisByContract[contractId];
      return { analysisId, status: "DONE" as const };
    }
    if (!hasCredit()) fail(402, "CREDIT_INSUFFICIENT", "남은 분석 횟수가 없습니다. 이용권을 구매해 주세요.");
    db.seq += 1;
    const analysisId = db.seq;
    spend(analysisId);
    contract.status = "ANALYZING";
    contract.overallScore = null;
    db.progress[contractId] = 70;
    db.analysisByContract[contractId] = analysisId;
    db.analyses[analysisId] = analysisFrom(contractId, analysisId, db.clauses[contractId] ?? [], "ANALYZING");
    save();
    scheduleAnalysis(contractId);
    return { analysisId, status: "ANALYZING" as const };
  },

  async getAnalysis(analysisId: number) {
    requireUser();
    const analysis = db.analyses[analysisId];
    if (!analysis) fail(404, "ANALYSIS_NOT_FOUND", "분석 결과를 찾지 못했습니다.");
    return copy(analysis);
  },

  async createExplanation(clauseId: number, tone: ExplanationTone) {
    requireUser();
    let found: StoredClause | undefined;
    let owner: ContractDetail | undefined;
    for (const [contractId, list] of Object.entries(db.clauses)) {
      const clause = list.find((item) => item.clauseId === clauseId);
      if (clause) {
        found = clause;
        owner = contractOrThrow(Number(contractId));
      }
    }
    if (!found || !owner) fail(404, "CLAUSE_NOT_FOUND", "조항을 찾지 못했습니다.");
    if (owner.status !== "ANALYZED") fail(409, "ANALYSIS_REQUIRED", "분석을 끝낸 조항만 설명할 수 있습니다.");
    const used = db.explainCounts[clauseId] ?? 0;
    if (used >= 3) fail(429, "REGENERATE_LIMIT", "이 조항의 설명은 3번까지 다시 만들 수 있습니다.");
    db.seq += 1;
    const easy = tone === "아주쉽게";
    const explanation: Explanation = {
      explanationId: db.seq,
      clauseId,
      text: easy
        ? `아주 짧게 말하면, 이 문장은 ${found.riskType}과 관련됩니다. ${found.evidence}`
        : `${found.title}은 ${found.riskType} 조항입니다. ${found.evidence}`,
      suggestion:
        found.riskLevel === "HIGH"
          ? found.similarCases.some((item) => item.afterIsDeletion)
            ? "비슷한 시정 사례는 이 문장을 삭제했습니다. 삭제 권고입니다."
            : "시정 사례의 수정 방향을 참고해 범위를 좁히는 문장으로 바꾸는 편이 낫습니다."
          : "당장 고치지 않아도 되는 조항으로 보입니다. 날짜와 금액만 다시 확인하세요.",
      citations: [
        {
          type: "LAW",
          title: "주택임대차보호법",
          ref: found.riskType === "계약기간" ? "제4조" : "제6조의3",
          url: "https://www.law.go.kr",
          score: 0.8,
        },
        ...found.similarCases.map((item) => ({
          type: "KFTC_CASE" as const,
          title: item.title,
          ref: item.pressDate,
          url: item.url,
          score: item.score,
        })),
      ],
      disclaimer: DISCLAIMER,
    };
    if (!explanation.citations.length) {
      explanation.text += " 근거 부족";
    }
    db.explanations[clauseId] = explanation;
    db.explainCounts[clauseId] = used + 1;
    save();
    return explanation;
  },

  async compare(beforeContractId: number, afterContractId: number) {
    const before = contractOrThrow(beforeContractId);
    const after = contractOrThrow(afterContractId);
    if (beforeContractId === afterContractId) fail(400, "SAME_CONTRACT", "서로 다른 계약서를 선택해 주세요.");
    if (before.status !== "ANALYZED" || after.status !== "ANALYZED") {
      fail(409, "ANALYSIS_REQUIRED", "두 계약서 모두 분석이 끝나야 비교할 수 있습니다.");
    }
    db.seq += 1;
    const comparison: Comparison = {
      comparisonId: db.seq,
      beforeContractId,
      afterContractId,
      pairs: buildPairs(db.clauses[beforeContractId] ?? [], db.clauses[afterContractId] ?? []),
      createdAt: now(),
    };
    db.comparisons.unshift(comparison);
    save();
    return comparison;
  },

  async generateMilestones(contractId: number, dates: MilestoneDates) {
    contractOrThrow(contractId);
    if (!dates.contractDate || !dates.balanceDate || !dates.moveInDate || !dates.endDate) {
      fail(400, "VALIDATION_ERROR", "계약일, 잔금일, 입주일, 만기일을 모두 입력해 주세요.");
    }
    if (dates.endDate < dates.contractDate) fail(400, "INVALID_DATE_RANGE", "만기일은 계약일 이후여야 합니다.");
    const custom = db.milestones.filter((item) => item.contractId === contractId && item.type === "CUSTOM");
    const generated = generatedMilestones(contractId, dates);
    db.milestones = [...db.milestones.filter((item) => item.contractId !== contractId), ...custom, ...generated];
    save();
    return { items: generated };
  },

  async milestones(from?: string, to?: string) {
    requireUser();
    const items = db.milestones.filter((item) => {
      if (from && item.dueDate < from) return false;
      if (to && item.dueDate > to) return false;
      return true;
    });
    return { items: items.sort((a, b) => a.dueDate.localeCompare(b.dueDate)) };
  },

  async createMilestone(body: {
    contractId?: number;
    type: MilestoneType;
    title: string;
    dueDate: string;
    remindDays: number[];
  }) {
    requireUser();
    if (!body.title.trim() || !body.dueDate) fail(400, "VALIDATION_ERROR", "제목과 날짜를 입력해 주세요.");
    if (body.contractId) contractOrThrow(body.contractId);
    db.seq += 1;
    const milestone: Milestone = {
      milestoneId: db.seq,
      contractId: body.contractId ?? null,
      type: body.type,
      title: body.title.trim(),
      dueDate: body.dueDate,
      remindDays: body.remindDays,
      done: false,
    };
    db.milestones.push(milestone);
    save();
    return milestone;
  },

  async updateMilestone(
    milestoneId: number,
    body: Partial<Pick<Milestone, "title" | "dueDate" | "remindDays" | "done">>,
  ) {
    requireUser();
    const milestone = db.milestones.find((item) => item.milestoneId === milestoneId);
    if (!milestone) fail(404, "MILESTONE_NOT_FOUND", "일정을 찾지 못했습니다.");
    Object.assign(milestone, body);
    save();
    return milestone;
  },

  async deleteMilestone(milestoneId: number) {
    requireUser();
    const before = db.milestones.length;
    db.milestones = db.milestones.filter((item) => item.milestoneId !== milestoneId);
    if (before === db.milestones.length) fail(404, "MILESTONE_NOT_FOUND", "일정을 찾지 못했습니다.");
    save();
  },

  async ics(contractId: number) {
    contractOrThrow(contractId);
    const events = db.milestones
      .filter((item) => item.contractId === contractId)
      .map((item) => {
        const stamp = item.dueDate.replaceAll("-", "");
        return `BEGIN:VEVENT\nDTSTART;VALUE=DATE:${stamp}\nSUMMARY:${item.title}\nEND:VEVENT`;
      })
      .join("\n");
    return `BEGIN:VCALENDAR\nVERSION:2.0\n${events}\nEND:VCALENDAR`;
  },

  async notifications(page = 0) {
    requireUser();
    return pageOf(db.notifications, page);
  },

  async markNotificationRead(notificationId: number) {
    requireUser();
    const item = db.notifications.find((notification) => notification.notificationId === notificationId);
    if (!item) fail(404, "NOTIFICATION_NOT_FOUND", "알림을 찾지 못했습니다.");
    item.readAt = item.readAt ?? now();
    save();
  },

  async saveNotificationSettings(body: NotificationSettings) {
    requireUser();
    if (body.remindDays.some((day) => day < 0 || day > 365)) {
      fail(400, "VALIDATION_ERROR", "알림 시점은 0일에서 365일 사이로 입력해 주세요.");
    }
    db.settings = { ...body, remindDays: [...new Set(body.remindDays)].sort((a, b) => b - a) };
    save();
    return db.settings;
  },

  async savePushSubscription(body: { endpoint: string; p256dh: string; auth: string }) {
    requireUser();
    if (!body.endpoint || !body.p256dh || !body.auth) {
      fail(400, "VALIDATION_ERROR", "푸시 구독 정보가 부족합니다.");
    }
    db.settings.pushEnabled = true;
    save();
  },

  async products() {
    return { items: products };
  },

  async createOrder(productId: number) {
    requireUser();
    const product = products.find((item) => item.id === productId);
    if (!product) fail(404, "PRODUCT_NOT_FOUND", "판매 중인 이용권이 아닙니다.");
    const order: OrderRow = {
      orderId: `order_${Date.now()}`,
      amount: product.price,
      orderName: product.name,
      customerKey: `user_${db.user?.id ?? 0}`,
      productId,
    };
    db.orders.unshift(order);
    save();
    return order;
  },

  async confirmPayment(body: { paymentKey: string; orderId: string; amount: number }) {
    requireUser();
    const order = db.orders.find((item) => item.orderId === body.orderId);
    if (!order) fail(404, "ORDER_NOT_FOUND", "주문을 찾지 못했습니다.");
    if (order.amount !== body.amount) fail(400, "AMOUNT_MISMATCH", "결제 금액이 주문 금액과 다릅니다.");
    const done = db.payments.find((item) => item.orderId === body.orderId && item.status === "DONE");
    if (done) {
      return { paymentId: done.paymentId, status: "DONE" as const, creditsAdded: done.creditsAdded };
    }
    if (!body.paymentKey) fail(400, "VALIDATION_ERROR", "결제 키가 없습니다.");
    const product = products.find((item) => item.id === order.productId);
    if (!product) fail(404, "PRODUCT_NOT_FOUND", "판매 중인 이용권이 아닙니다.");
    db.seq += 1;
    const payment: PaymentRow = {
      paymentId: db.seq,
      orderName: order.orderName,
      amount: order.amount,
      status: "DONE",
      approvedAt: now(),
      creditsAdded: product.credits,
      orderId: order.orderId,
    };
    db.payments.unshift(payment);
    order.paymentId = payment.paymentId;
    db.credits.paidRemaining += product.credits;
    db.ledger.unshift({ type: "GRANT", amount: product.credits, refId: payment.paymentId, createdAt: now() });
    save();
    return { paymentId: payment.paymentId, status: "DONE" as const, creditsAdded: product.credits };
  },

  async payments(page = 0) {
    requireUser();
    return copy(pageOf(db.payments, page));
  },

  async cancelPayment(paymentId: number, reason: string) {
    requireUser();
    if (!reason.trim()) fail(400, "VALIDATION_ERROR", "취소 사유를 입력해 주세요.");
    const payment = db.payments.find((item) => item.paymentId === paymentId);
    if (!payment) fail(404, "PAYMENT_NOT_FOUND", "결제 내역을 찾지 못했습니다.");
    if (payment.status === "CANCELED") fail(409, "ALREADY_CANCELED", "이미 취소된 결제입니다.");
    if (db.credits.paidRemaining < payment.creditsAdded) {
      fail(409, "CREDIT_ALREADY_USED", "이미 사용한 이용권은 취소할 수 없습니다.");
    }
    payment.status = "CANCELED";
    db.credits.paidRemaining -= payment.creditsAdded;
    db.ledger.unshift({ type: "REFUND", amount: -payment.creditsAdded, refId: payment.paymentId, createdAt: now() });
    save();
    return { paymentId, status: "CANCELED" as const, creditsRevoked: payment.creditsAdded };
  },

  async credits() {
    requireUser();
    return copy(db.credits);
  },

  async ledger(page = 0) {
    requireUser();
    return copy(pageOf(db.ledger, page));
  },

  async searchPrecedents(q: string, type?: "LAW" | "PRECEDENT") {
    requireUser();
    const query = q.trim();
    if (!query) fail(400, "VALIDATION_ERROR", "검색어를 입력해 주세요.");
    const items = db.precedents.filter((item) => {
      if (type && item.type !== type) return false;
      return `${item.title} ${item.ref} ${item.snippet}`.includes(query);
    });
    return { items };
  },

  async searchCases(q: string) {
    requireUser();
    const query = q.trim();
    if (!query) fail(400, "VALIDATION_ERROR", "검색어를 입력해 주세요.");
    return {
      items: db.cases.filter((item) => `${item.title} ${item.before} ${item.after ?? ""}`.includes(query)),
    };
  },

  async ingestLaws() {
    if (requireUser().role !== "ADMIN") fail(403, "FORBIDDEN", "관리자만 실행할 수 있습니다.");
    db.seq += 1;
    const job: IngestJob = {
      jobId: db.seq,
      type: "LAW",
      status: "PENDING",
      processed: 0,
      failed: 0,
      errors: [],
    };
    db.jobs.unshift(job);
    save();
    window.setTimeout(() => {
      job.status = "RUNNING";
      job.processed = 12;
      save();
    }, 500);
    window.setTimeout(() => {
      job.status = "DONE";
      job.processed = 36;
      save();
    }, 1200);
    return { jobId: job.jobId, status: job.status };
  },

  async ingestKftc(file: File) {
    if (requireUser().role !== "ADMIN") fail(403, "FORBIDDEN", "관리자만 실행할 수 있습니다.");
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      fail(415, "UNSUPPORTED_FILE_TYPE", "CSV 파일만 올릴 수 있습니다.");
    }
    if (file.size > 20 * 1024 * 1024) fail(413, "FILE_TOO_LARGE", "CSV는 20MB 이하만 올릴 수 있습니다.");
    db.seq += 1;
    const job: IngestJob = {
      jobId: db.seq,
      type: "KFTC",
      status: "PENDING",
      processed: 0,
      failed: 0,
      errors: [],
    };
    db.jobs.unshift(job);
    save();
    window.setTimeout(() => {
      job.status = "DONE";
      job.processed = 18;
      job.failed = 1;
      job.errors = [{ row: 4, reason: "after_is_deletion 값이 비어 있습니다." }];
      save();
    }, 900);
    return { jobId: job.jobId, status: job.status };
  },

  async ingestJob(jobId: number) {
    if (requireUser().role !== "ADMIN") fail(403, "FORBIDDEN", "관리자만 실행할 수 있습니다.");
    const job = db.jobs.find((item) => item.jobId === jobId);
    if (!job) fail(404, "JOB_NOT_FOUND", "적재 작업을 찾지 못했습니다.");
    return job;
  },

};

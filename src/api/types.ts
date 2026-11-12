export type Provider = "local" | "kakao" | "naver" | "google";
export type Role = "USER" | "ADMIN";
export type ContractType = "MONTHLY" | "JEONSE";
export type ContractStatus =
  | "UPLOADED"
  | "OCR"
  | "SPLIT"
  | "ANALYZING"
  | "ANALYZED"
  | "FAILED";
export type AnalysisStatus = "ANALYZING" | "DONE" | "FAILED";
export type RiskLevel = "HIGH" | "CAUTION" | "SAFE";
export type ChangeType = "ADDED" | "DELETED" | "MODIFIED" | "SAME";
export type CitationType = "LAW" | "PRECEDENT" | "KFTC_CASE";
export type MilestoneType =
  | "CONTRACT"
  | "BALANCE"
  | "MOVE_IN"
  | "RENEWAL_NOTICE"
  | "END"
  | "CUSTOM";
export type LedgerType = "GRANT" | "USE" | "REFUND" | "RESTORE";
export type PaymentStatus = "READY" | "DONE" | "CANCELED" | "FAILED";
export type ExplanationTone = "기본" | "아주쉽게";

export type Page<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
};

export type AuthMe = {
  id: number;
  nickname: string;
  role: Role;
  provider: Provider;
};

export type Member = {
  id: number;
  nickname: string;
  email: string | null;
  role: Role;
  createdAt: string;
};

export type ContractSummary = {
  contractId: number;
  title: string;
  contractType: ContractType;
  status: ContractStatus;
  overallScore: number | null;
  createdAt: string;
};

export type ContractDetail = ContractSummary & {
  clauseCount: number;
  maskedText: string;
  errorMessage: string | null;
};

export type ContractStatusBody = {
  status: ContractStatus;
  progress: number;
  errorMessage: string | null;
};

export type Clause = {
  clauseId: number;
  no: number;
  title: string;
  text: string;
  riskLevel: RiskLevel | null;
  needsReanalysis: boolean;
};

export type SimilarCase = {
  id: number;
  pressDate: string;
  title: string;
  before: string;
  after: string | null;
  afterIsDeletion: boolean | null;
  url: string;
  score: number;
};

export type AnalysisClause = {
  clauseId: number;
  riskLevel: RiskLevel;
  riskType: string;
  score: number;
  lowConfidence: boolean;
  evidence: string;
  similarCases: SimilarCase[];
};

export type Analysis = {
  analysisId: number;
  contractId: number;
  status: AnalysisStatus;
  overallScore: number | null;
  summary: string | null;
  clauses: AnalysisClause[];
};

export type Citation = {
  type: CitationType;
  title: string;
  ref: string;
  url: string;
  score?: number;
};

export type Explanation = {
  explanationId: number;
  clauseId: number;
  text: string;
  suggestion: string;
  citations: Citation[];
  disclaimer: string;
};

export type ComparisonPair = {
  beforeClauseId: number | null;
  afterClauseId: number | null;
  similarity: number;
  changeType: ChangeType;
  riskDelta: -1 | 0 | 1;
};

export type Comparison = {
  comparisonId: number;
  beforeContractId: number;
  afterContractId: number;
  pairs: ComparisonPair[];
  createdAt: string;
};

export type Milestone = {
  milestoneId: number;
  contractId: number | null;
  type: MilestoneType;
  title: string;
  dueDate: string;
  remindDays: number[];
  done: boolean;
};

export type MilestoneDates = {
  contractDate: string;
  balanceDate: string;
  moveInDate: string;
  endDate: string;
};

export type NotificationItem = {
  notificationId: number;
  type: string;
  title: string;
  sentAt: string;
  readAt: string | null;
};

export type NotificationSettings = {
  emailEnabled: boolean;
  pushEnabled: boolean;
  remindDays: number[];
};

export type Product = {
  id: number;
  name: string;
  credits: number;
  price: number;
};

export type Order = {
  orderId: string;
  amount: number;
  orderName: string;
  customerKey: string;
};

export type Payment = {
  paymentId: number;
  orderName: string;
  amount: number;
  status: PaymentStatus;
  approvedAt: string | null;
};

export type PaymentConfirm = {
  paymentId: number;
  status: "DONE";
  creditsAdded: number;
};

export type PaymentCancel = {
  paymentId: number;
  status: "CANCELED";
  creditsRevoked: number;
};

export type Credits = {
  freeRemaining: number;
  paidRemaining: number;
};

export type LedgerEntry = {
  type: LedgerType;
  amount: number;
  refId: number | null;
  createdAt: string;
};

export type PrecedentHit = {
  type: "LAW" | "PRECEDENT";
  id: number;
  title: string;
  ref: string;
  snippet: string;
  score: number;
  url: string;
};

export type IngestJob = {
  jobId: number;
  type: string;
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  processed: number;
  failed: number;
  errors: { row: number; reason: string }[];
};

export type CreateContractResult = {
  contractId: number;
  status: ContractStatus;
};

export type StartAnalysisResult = {
  analysisId: number;
  status: AnalysisStatus;
};

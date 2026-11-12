import type {
  ChangeType,
  CitationType,
  ContractStatus,
  ContractType,
  LedgerType,
  MilestoneType,
  PaymentStatus,
  Provider,
  RiskLevel,
  Role,
} from "./api/types.ts";

export const DISCLAIMER =
  "이 서비스는 법률 자문이 아닙니다. 조항 해석과 수정 제안은 참고용이며, 계약을 맺기 전에 전문가 확인이 필요합니다.";

export const contractTypeLabel: Record<ContractType, string> = {
  MONTHLY: "월세",
  JEONSE: "전세",
};

export const contractStatusLabel: Record<ContractStatus, string> = {
  UPLOADED: "업로드됨",
  OCR: "텍스트 추출",
  SPLIT: "조항 분할됨",
  ANALYZING: "분석 중",
  ANALYZED: "분석 완료",
  FAILED: "실패",
};

export const riskLabel: Record<RiskLevel, string> = {
  HIGH: "위험",
  CAUTION: "주의",
  SAFE: "안전",
};

export const changeLabel: Record<ChangeType, string> = {
  ADDED: "추가",
  DELETED: "삭제",
  MODIFIED: "변경",
  SAME: "동일",
};

export const citationLabel: Record<CitationType, string> = {
  LAW: "법령",
  PRECEDENT: "판례",
  KFTC_CASE: "시정 사례",
};

export const milestoneLabel: Record<MilestoneType, string> = {
  CONTRACT: "계약일",
  BALANCE: "잔금",
  MOVE_IN: "입주",
  RENEWAL_NOTICE: "갱신 거절 통지",
  END: "만기",
  CUSTOM: "직접 추가",
};

export const ledgerLabel: Record<LedgerType, string> = {
  GRANT: "지급",
  USE: "차감",
  REFUND: "환불",
  RESTORE: "복구",
};

export const paymentLabel: Record<PaymentStatus, string> = {
  READY: "대기",
  DONE: "결제 완료",
  CANCELED: "취소",
  FAILED: "실패",
};

export const providerLabel: Record<Provider, string> = {
  local: "이메일",
  kakao: "카카오",
  naver: "네이버",
  google: "구글",
};

export const roleLabel: Record<Role, string> = {
  USER: "회원",
  ADMIN: "관리자",
};

export const riskDeltaLabel = (delta: -1 | 0 | 1) => {
  if (delta < 0) return "개선";
  if (delta > 0) return "악화";
  return "유지";
};

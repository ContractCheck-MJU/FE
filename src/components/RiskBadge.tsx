import type { RiskLevel } from "../api/types.ts";
import { riskLabel } from "../labels.ts";

export function RiskBadge({ level }: { level: RiskLevel | null }) {
  if (!level) return <span className="badge badge-muted">분석 전</span>;
  return <span className={`badge badge-${level}`}>{riskLabel[level]}</span>;
}

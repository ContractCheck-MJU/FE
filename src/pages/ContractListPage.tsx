import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/index.ts";
import { Empty, ErrorNote } from "../components/Feedback.tsx";
import { formatDate } from "../format.ts";
import { contractStatusLabel, contractTypeLabel } from "../labels.ts";

export function ContractListPage() {
  const contracts = useQuery({ queryKey: ["contracts"], queryFn: () => api.listContracts() });

  return (
    <div className="page">
      <div className="page-head between">
        <div>
          <p className="eyebrow">내 계약서</p>
          <h1>올린 계약서</h1>
        </div>
        <Link className="btn btn-primary" to="/contracts/new">
          계약서 올리기
        </Link>
      </div>
      <ErrorNote error={contracts.error} />
      {contracts.isLoading ? <p className="muted">목록을 불러오는 중입니다.</p> : null}
      {contracts.data?.items.length === 0 ? (
        <Empty title="아직 계약서가 없습니다.">PDF나 사진으로 첫 계약서를 올려 보세요.</Empty>
      ) : null}
      <div className="stack">
        {contracts.data?.items.map((contract) => (
          <Link key={contract.contractId} className="card card-link" to={`/contracts/${contract.contractId}`}>
            <div className="between">
              <h2>{contract.title}</h2>
              <span className="pill">{contractStatusLabel[contract.status]}</span>
            </div>
            <p className="meta">
              {contractTypeLabel[contract.contractType]} · {formatDate(contract.createdAt)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

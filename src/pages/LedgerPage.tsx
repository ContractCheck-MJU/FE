import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/index.ts";
import { ErrorNote } from "../components/Feedback.tsx";
import { formatDate } from "../format.ts";
import { ledgerLabel } from "../labels.ts";

export function LedgerPage() {
  const ledger = useQuery({ queryKey: ["ledger"], queryFn: () => api.ledger() });
  return (
    <div className="page">
      <Link to="/billing">이용권</Link>
      <div className="page-head">
        <p className="eyebrow">원장</p>
        <h1>지급·차감·환불·복구</h1>
      </div>
      <ErrorNote error={ledger.error} />
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>구분</th>
              <th>횟수</th>
              <th>시각</th>
            </tr>
          </thead>
          <tbody>
            {ledger.data?.items.map((item, index) => (
              <tr key={`${item.createdAt}-${index}`}>
                <td>{ledgerLabel[item.type]}</td>
                <td>{item.amount > 0 ? `+${item.amount}` : item.amount}</td>
                <td>{formatDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

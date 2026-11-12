import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../api/index.ts";
import { ErrorNote } from "../components/Feedback.tsx";
import { formatDate, formatWon } from "../format.ts";
import { paymentLabel } from "../labels.ts";
import { canUseToss, requestTossPayment } from "../payments/toss.ts";

export function BillingPage() {
  const queryClient = useQueryClient();
  const credits = useQuery({ queryKey: ["credits"], queryFn: () => api.credits() });
  const products = useQuery({ queryKey: ["products"], queryFn: () => api.products() });
  const payments = useQuery({ queryKey: ["payments"], queryFn: () => api.payments() });
  const [reason, setReason] = useState("단순 변심");
  const order = useMutation({
    mutationFn: (productId: number) => api.createOrder(productId),
    onSuccess: async (created) => {
      if (!canUseToss()) return;
      await requestTossPayment(created);
    },
  });
  const cancel = useMutation({
    mutationFn: (paymentId: number) => api.cancelPayment(paymentId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      await queryClient.invalidateQueries({ queryKey: ["credits"] });
      await queryClient.invalidateQueries({ queryKey: ["ledger"] });
    },
  });

  return (
    <div className="page">
      <div className="page-head between">
        <div>
          <p className="eyebrow">이용권</p>
          <h1>분석 횟수</h1>
          <p className="lede">
            무료 {credits.data?.freeRemaining ?? "…"}회 · 유료 {credits.data?.paidRemaining ?? "…"}회. 분석 시작 때 무료부터 사용합니다.
          </p>
        </div>
        <Link className="btn" to="/credits">
          사용 내역
        </Link>
      </div>
      <ErrorNote error={products.error ?? order.error ?? payments.error ?? cancel.error} />
      <div className="grid-2">
        {products.data?.items.map((product) => (
          <article key={product.id} className="card stack">
            <h2>{product.name}</h2>
            <p>{formatWon(product.price)}</p>
            {canUseToss() ? (
              <button className="btn btn-primary" type="button" disabled={order.isPending} onClick={() => order.mutate(product.id)}>
                결제하기
              </button>
            ) : null}
          </article>
        ))}
      </div>
      <section className="stack">
        <h2>결제 내역</h2>
        <Fieldless reason={reason} onReason={setReason} />
        {payments.data?.items.map((payment) => (
          <article key={payment.paymentId} className="card between">
            <div>
              <h3>{payment.orderName}</h3>
              <p className="meta">
                {formatWon(payment.amount)} · {paymentLabel[payment.status]} ·{" "}
                {payment.approvedAt ? formatDate(payment.approvedAt) : "승인 전"}
              </p>
            </div>
            {payment.status === "DONE" ? (
              <button className="btn" type="button" onClick={() => cancel.mutate(payment.paymentId)}>
                미사용분 취소
              </button>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}

function Fieldless({ reason, onReason }: { reason: string; onReason: (value: string) => void }) {
  return (
    <label className="field">
      <span>취소 사유</span>
      <input value={reason} onChange={(event) => onReason(event.target.value)} />
    </label>
  );
}

export function BillingSuccessPage() {
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("결제를 확인하고 있습니다.");
  const paymentKey = params.get("paymentKey") ?? "";
  const orderId = params.get("orderId") ?? "";
  const amount = Number(params.get("amount") ?? 0);

  useEffect(() => {
    let ignore = false;
    void api
      .confirmPayment({ paymentKey, orderId, amount })
      .then(async (result) => {
        if (ignore) return;
        setMessage(`결제가 완료되었습니다. 분석 ${result.creditsAdded}회가 추가되었습니다.`);
        await queryClient.invalidateQueries({ queryKey: ["credits"] });
        await queryClient.invalidateQueries({ queryKey: ["payments"] });
      })
      .catch((error: unknown) => {
        if (ignore) return;
        if (error instanceof ApiError && error.code === "ALREADY_CONFIRMED") {
          setMessage("이미 처리된 결제입니다.");
          return;
        }
        setMessage(error instanceof ApiError ? error.message : "결제 승인에 실패했습니다.");
      });
    return () => {
      ignore = true;
    };
  }, [amount, orderId, paymentKey, queryClient]);

  return (
    <div className="page">
      <h1>결제 결과</h1>
      <p className="card">{message}</p>
      <Link className="btn" to="/billing">
        이용권으로
      </Link>
    </div>
  );
}

export function BillingFailPage() {
  const [params] = useSearchParams();
  return (
    <div className="page">
      <h1>결제가 취소되었습니다.</h1>
      <p className="error">{params.get("message") ?? params.get("code") ?? "결제창에서 완료되지 않았습니다."}</p>
      <Link className="btn" to="/billing">
        다시 선택
      </Link>
    </div>
  );
}

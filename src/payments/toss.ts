import { tossClientKey } from "../api/config.ts";
import type { Order } from "../api/types.ts";

export function canUseToss() {
  return Boolean(tossClientKey);
}

export async function requestTossPayment(order: Order) {
  if (!tossClientKey) return;
  const sdk = (await import(
    /* @vite-ignore */
    "@tosspayments/tosspayments-sdk"
  )) as {
    loadTossPayments: (clientKey: string) => Promise<{
      payment: (options: { customerKey: string }) => {
        requestPayment: (options: {
          method: "CARD";
          amount: { currency: "KRW"; value: number };
          orderId: string;
          orderName: string;
          successUrl: string;
          failUrl: string;
        }) => Promise<void>;
      };
    }>;
  };
  const tossPayments = await sdk.loadTossPayments(tossClientKey);
  const payment = tossPayments.payment({ customerKey: order.customerKey });
  const origin = window.location.origin;
  await payment.requestPayment({
    method: "CARD",
    amount: { currency: "KRW", value: order.amount },
    orderId: order.orderId,
    orderName: order.orderName,
    successUrl: `${origin}/billing/success`,
    failUrl: `${origin}/billing/fail`,
  });
}

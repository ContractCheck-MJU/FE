import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { apiBaseUrl } from "./config.ts";
import { ApiError } from "./errors.ts";
import {
  normalizeAnalysis,
  normalizeClause,
  normalizeContractDetail,
  normalizeContractSummary,
  normalizeMilestone,
  normalizeStatus,
} from "./normalize.ts";
import type {
  AuthMe,
  Comparison,
  ContractStatus,
  ContractStatusBody,
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
  PaymentCancel,
  PaymentConfirm,
  PrecedentHit,
  Product,
  SimilarCase,
} from "./types.ts";

type RetryConfig = InternalAxiosRequestConfig & { retried?: boolean };

const client = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  withXSRFToken: true,
});

let csrfHeader = "X-XSRF-TOKEN";
let csrfToken: string | null = null;

function applyCsrf(config: InternalAxiosRequestConfig) {
  const method = (config.method ?? "get").toLowerCase();
  if (csrfToken && ["post", "put", "patch", "delete"].includes(method)) {
    config.headers.set(csrfHeader, csrfToken);
  }
  return config;
}

client.interceptors.request.use(applyCsrf);

function asApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data;
  if (data && typeof data === "object" && "code" in data) {
    const body = data as {
      code?: string;
      message?: string;
      traceId?: string;
      errors?: { field: string; reason: string }[];
    };
    return new ApiError(status, body.code || "REQUEST_FAILED", body.message || "요청에 실패했습니다.", {
      traceId: body.traceId,
      fieldErrors: body.errors,
    });
  }
  return new ApiError(status, "REQUEST_FAILED", "서버에 연결하지 못했습니다.");
}

client.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetryConfig | undefined;
  const code =
    error.response?.data && typeof error.response.data === "object"
      ? (error.response.data as { code?: string }).code
      : undefined;
  if (config && code === "CSRF_INVALID" && !config.retried) {
    config.retried = true;
    await ensureCsrf();
    return client.request(config);
  }
  return Promise.reject(asApiError(error));
});

export async function ensureCsrf() {
  const { data } = await client.get<{ token?: string; headerName?: string }>("/api/v1/auth/csrf");
  if (data.headerName) csrfHeader = data.headerName;
  if (data.token) csrfToken = data.token;
}

function items<T>(data: { items?: T[] } | T[] | null | undefined): T[] {
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
}

export const httpApi = {
  ensureCsrf,

  async signup(input: { email: string; password: string; nickname: string }) {
    await ensureCsrf();
    const { data } = await client.post<AuthMe>("/api/v1/auth/signup", input);
    return data;
  },

  async login(input: { email: string; password: string }) {
    await ensureCsrf();
    const { data } = await client.post<AuthMe>("/api/v1/auth/login", input);
    return data;
  },

  async me() {
    const { data } = await client.get<AuthMe>("/api/v1/auth/me");
    return data;
  },

  async logout() {
    await client.post("/api/v1/auth/logout");
  },

  async member() {
    const { data } = await client.get<Member>("/api/v1/members/me");
    return data;
  },

  async updateMember(nickname: string) {
    const { data } = await client.patch<Member>("/api/v1/members/me", { nickname });
    return data;
  },

  async withdraw() {
    await client.delete("/api/v1/members/me");
  },

  async listContracts(page = 0) {
    const { data } = await client.get("/api/v1/contracts", { params: { page, size: 20 } });
    const body = data as { items?: unknown[]; page?: number; size?: number; total?: number };
    const list = items<unknown>(body).map(normalizeContractSummary);
    return { items: list, page: body.page ?? page, size: body.size ?? 20, total: body.total ?? list.length };
  },

  async getContract(contractId: number) {
    const { data } = await client.get(`/api/v1/contracts/${contractId}`);
    return normalizeContractDetail(data);
  },

  async contractStatus(contractId: number) {
    const { data } = await client.get<ContractStatusBody>(`/api/v1/contracts/${contractId}/status`);
    return { ...data, status: normalizeStatus(data.status) };
  },

  async fileUrl(contractId: number) {
    const { data } = await client.get<{ url: string; expiresAt: string }>(
      `/api/v1/contracts/${contractId}/file-url`,
    );
    return data;
  },

  async deleteContract(contractId: number) {
    await client.delete(`/api/v1/contracts/${contractId}`);
  },

  async createContract(
    input: { file: File; title: string; contractType: ContractType },
    onProgress?: (ratio: number) => void,
  ) {
    const body = new FormData();
    body.set("file", input.file);
    body.set("title", input.title);
    body.set("contractType", input.contractType);
    const { data } = await client.post<{ contractId: number; status: ContractStatus }>(
      "/api/v1/contracts",
      body,
      { onUploadProgress: (event) => onProgress?.(event.total ? event.loaded / event.total : 0) },
    );
    return data;
  },

  async clauses(contractId: number) {
    const { data } = await client.get(`/api/v1/contracts/${contractId}/clauses`);
    return { items: items<unknown>(data).map(normalizeClause) };
  },

  async updateClause(clauseId: number, body: { text: string; title?: string; no?: number }) {
    const { data } = await client.patch(`/api/v1/clauses/${clauseId}`, body);
    return normalizeClause(data);
  },

  async startAnalysis(contractId: number) {
    const { data } = await client.post<{ analysisId: number; status: string }>(
      `/api/v1/contracts/${contractId}/analyses`,
    );
    return { analysisId: data.analysisId, status: normalizeAnalysis({ status: data.status }).status };
  },

  async getAnalysis(analysisId: number) {
    const { data } = await client.get(`/api/v1/analyses/${analysisId}`);
    return normalizeAnalysis(data);
  },

  async createExplanation(clauseId: number, tone: ExplanationTone) {
    const { data } = await client.post<Explanation>(`/api/v1/clauses/${clauseId}/explanations`, { tone });
    return data;
  },

  async compare(beforeContractId: number, afterContractId: number) {
    const { data } = await client.post<Comparison>("/api/v1/comparisons", {
      beforeContractId,
      afterContractId,
    });
    return data;
  },

  async generateMilestones(contractId: number, dates: MilestoneDates) {
    const { data } = await client.post(`/api/v1/contracts/${contractId}/milestones/generate`, dates);
    return { items: items<unknown>(data).map(normalizeMilestone) };
  },

  async milestones(from?: string, to?: string) {
    const { data } = await client.get("/api/v1/milestones", { params: { from, to } });
    return { items: items<unknown>(data).map(normalizeMilestone) };
  },

  async createMilestone(body: {
    contractId?: number;
    type: MilestoneType;
    title: string;
    dueDate: string;
    remindDays: number[];
  }) {
    const { data } = await client.post("/api/v1/milestones", body);
    return normalizeMilestone(data);
  },

  async updateMilestone(
    milestoneId: number,
    body: Partial<Pick<Milestone, "title" | "dueDate" | "remindDays" | "done">>,
  ) {
    const { data } = await client.patch(`/api/v1/milestones/${milestoneId}`, body);
    return normalizeMilestone(data);
  },

  async deleteMilestone(milestoneId: number) {
    await client.delete(`/api/v1/milestones/${milestoneId}`);
  },

  async ics(contractId: number) {
    const { data } = await client.get<string>(`/api/v1/contracts/${contractId}/milestones.ics`, {
      responseType: "text",
    });
    return data;
  },

  async notifications(page = 0) {
    const { data } = await client.get<Page<NotificationItem>>("/api/v1/notifications", {
      params: { page, size: 20 },
    });
    return data;
  },

  async markNotificationRead(notificationId: number) {
    await client.patch(`/api/v1/notifications/${notificationId}/read`);
  },

  async saveNotificationSettings(body: NotificationSettings) {
    const { data } = await client.put<NotificationSettings>("/api/v1/notifications/settings", body);
    return data;
  },

  async savePushSubscription(body: { endpoint: string; p256dh: string; auth: string }) {
    await client.post("/api/v1/notifications/push-subscriptions", body);
  },

  async products() {
    const { data } = await client.get<{ items: Product[] }>("/api/v1/products");
    return data;
  },

  async createOrder(productId: number) {
    const { data } = await client.post<Order>("/api/v1/payments/orders", { productId });
    return data;
  },

  async confirmPayment(body: { paymentKey: string; orderId: string; amount: number }) {
    const { data } = await client.post<PaymentConfirm>("/api/v1/payments/confirm", body);
    return data;
  },

  async payments(page = 0) {
    const { data } = await client.get<Page<Payment>>("/api/v1/payments", { params: { page, size: 20 } });
    return data;
  },

  async cancelPayment(paymentId: number, reason: string) {
    const { data } = await client.post<PaymentCancel>(`/api/v1/payments/${paymentId}/cancel`, {
      reason,
      cancelReason: reason,
    });
    return data;
  },

  async credits() {
    const { data } = await client.get<Credits>("/api/v1/credits/me");
    return data;
  },

  async ledger(page = 0) {
    const { data } = await client.get<Page<LedgerEntry>>("/api/v1/credits/me/ledger", {
      params: { page, size: 20 },
    });
    return data;
  },

  async searchPrecedents(q: string, type?: "LAW" | "PRECEDENT") {
    const { data } = await client.get<{ items: PrecedentHit[] }>("/api/v1/precedents/search", {
      params: { q, type, k: 8 },
    });
    return data;
  },

  async searchCases(q: string) {
    const { data } = await client.get<{ items: SimilarCase[] }>("/api/v1/cases/search", {
      params: { q, k: 8 },
    });
    return data;
  },

  async ingestLaws() {
    const { data } = await client.post<{ jobId: number; status: string }>("/api/v1/admin/ingest/laws", {
      target: "LAW",
    });
    return data;
  },

  async ingestKftc(file: File) {
    const body = new FormData();
    body.set("file", file);
    const { data } = await client.post<{ jobId: number; status: string }>(
      "/api/v1/admin/ingest/kftc-cases",
      body,
    );
    return data;
  },

  async ingestJob(jobId: number) {
    const { data } = await client.get<IngestJob>(`/api/v1/admin/ingest/jobs/${jobId}`);
    return data;
  },

};

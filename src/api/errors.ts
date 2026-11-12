export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly traceId?: string;
  readonly fieldErrors?: { field: string; reason: string }[];

  constructor(
    status: number,
    code: string,
    message: string,
    extras?: {
      traceId?: string;
      fieldErrors?: { field: string; reason: string }[];
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.traceId = extras?.traceId;
    this.fieldErrors = extras?.fieldErrors;
  }
}

export function errorText(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "요청을 처리하지 못했습니다.";
}

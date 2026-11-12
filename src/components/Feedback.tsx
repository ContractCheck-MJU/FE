import type { ReactNode } from "react";
import { ApiError, errorText } from "../api/index.ts";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  if (!error) return null;
  const trace = error instanceof ApiError ? error.traceId : undefined;
  return (
    <p className="error" role="alert">
      {errorText(error)}
      {trace ? <span className="muted"> · {trace}</span> : null}
    </p>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children ? <p className="muted">{children}</p> : null}
    </div>
  );
}

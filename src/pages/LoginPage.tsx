import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/index.ts";
import { useAuth } from "../auth/AuthProvider.tsx";
import { Disclaimer } from "../components/Disclaimer.tsx";
import { ErrorNote, Field } from "../components/Feedback.tsx";

type Mode = "login" | "signup";

export function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);

  if (!loading && user) return <Navigate to="/contracts" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "signup") {
        await api.signup({ email, password, nickname });
      } else {
        await api.login({ email, password });
      }
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/contracts");
    } catch (caught) {
      setError(caught);
      setPending(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">{mode === "signup" ? "회원가입" : "로그인"}</p>
        <h1>{mode === "signup" ? "이메일로 계정을 만듭니다." : "이메일로 들어옵니다."}</h1>
        <p className="lede">가입하면 무료 2회가 생깁니다. 위험 분석과 쉬운말 설명은 모델 연결 전에 열지 않습니다.</p>
      </div>
      <div className="actions">
        <button className="btn" type="button" aria-pressed={mode === "login"} onClick={() => setMode("login")}>
          로그인
        </button>
        <button className="btn" type="button" aria-pressed={mode === "signup"} onClick={() => setMode("signup")}>
          회원가입
        </button>
      </div>
      <form className="card stack" onSubmit={(event) => void submit(event)}>
        <Field label="이메일">
          <input
            type="email"
            autoComplete="email"
            value={email}
            required
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        {mode === "signup" ? (
          <Field label="닉네임">
            <input
              autoComplete="nickname"
              value={nickname}
              required
              maxLength={50}
              onChange={(event) => setNickname(event.target.value)}
            />
          </Field>
        ) : null}
        <Field label="비밀번호">
          <input
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            required
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <ErrorNote error={error} />
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "처리 중…" : mode === "signup" ? "가입하고 들어가기" : "로그인"}
        </button>
      </form>
      <Disclaimer />
      <Link to="/">소개로 돌아가기</Link>
    </div>
  );
}

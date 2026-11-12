import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/index.ts";
import { useAuth } from "../auth/AuthProvider.tsx";
import { ErrorNote, Field } from "../components/Feedback.tsx";
import { formatDate } from "../format.ts";
import { providerLabel, roleLabel } from "../labels.ts";

export function MyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const member = useQuery({ queryKey: ["member"], queryFn: () => api.member() });
  const [nickname, setNickname] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const save = useMutation({
    mutationFn: () => api.updateMember(nickname || member.data?.nickname || ""),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["member"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
  const logout = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: async () => {
      queryClient.clear();
      navigate("/");
    },
  });
  const withdraw = useMutation({
    mutationFn: () => api.withdraw(),
    onSuccess: async () => {
      queryClient.clear();
      navigate("/");
    },
  });
  function onSave(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">마이페이지</p>
        <h1>{member.data?.nickname ?? user?.nickname}</h1>
        <p className="lede">
          {user ? providerLabel[user.provider] : ""} · {user ? roleLabel[user.role] : ""}
          {member.data ? ` · 가입 ${formatDate(member.data.createdAt)}` : ""}
        </p>
      </div>
      <ErrorNote error={member.error ?? save.error ?? logout.error ?? withdraw.error} />
      <form className="card stack" onSubmit={onSave}>
        <Field label="닉네임">
          <input
            value={nickname || member.data?.nickname || ""}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={50}
          />
        </Field>
        <p className="meta">이메일 {member.data?.email ?? "없음"}. 역할은 이 화면에서 바꿀 수 없습니다.</p>
        <button className="btn btn-primary" type="submit" disabled={save.isPending}>
          저장
        </button>
      </form>
      <div className="actions">
        <button className="btn" type="button" onClick={() => logout.mutate()}>
          로그아웃
        </button>
      </div>
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          if (confirmText === "탈퇴") withdraw.mutate();
        }}
      >
        <h2>회원 탈퇴</h2>
        <p className="muted">계약서 원본과 분석 결과, 모든 로그인 세션이 삭제됩니다. 남은 유료 횟수는 소멸합니다.</p>
        <Field label="확인을 위해 탈퇴 라고 입력">
          <input value={confirmText} onChange={(event) => setConfirmText(event.target.value)} />
        </Field>
        <button className="btn btn-danger" type="submit" disabled={confirmText !== "탈퇴" || withdraw.isPending}>
          탈퇴
        </button>
      </form>
    </div>
  );
}

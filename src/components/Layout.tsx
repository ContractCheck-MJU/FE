import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "../api/index.ts";
import { useAuth } from "../auth/AuthProvider.tsx";
import { Disclaimer } from "./Disclaimer.tsx";

const links = [
  ["/contracts", "계약서"],
  ["/contracts/new", "업로드"],
  ["/milestones", "일정"],
  ["/notifications", "알림"],
  ["/billing", "이용권"],
  ["/me", "내 정보"],
] as const;

export function Layout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const onLanding = pathname === "/";
  const credits = useQuery({
    queryKey: ["credits"],
    queryFn: () => api.credits(),
    enabled: Boolean(user),
  });

  const remaining = credits.data
    ? credits.data.freeRemaining + credits.data.paidRemaining
    : null;

  return (
    <div className={onLanding ? "shell shell-landing" : "shell"}>
      <header className="topbar">
        <div className="brand">
          <NavLink to="/">자취방 계약서</NavLink>
        </div>
        {user ? (
          <nav className={open ? "nav open" : "nav"} aria-label="주요 메뉴" onClick={() => setOpen(false)}>
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : undefined)}>
                {label}
              </NavLink>
            ))}
          </nav>
        ) : onLanding ? (
          <nav className={open ? "nav open" : "nav"} aria-label="소개 메뉴" onClick={() => setOpen(false)}>
            <a href="#how">이용 흐름</a>
            <a href="#price">이용권</a>
          </nav>
        ) : null}
        <div className="top-actions">
          {user ? (
            <NavLink className="credit-chip" to="/billing">
              {remaining == null ? "이용권" : `남은 ${remaining}회`}
            </NavLink>
          ) : (
            <NavLink className="login-link" to="/login">
              로그인
            </NavLink>
          )}
          <NavLink className="btn btn-primary header-cta" to={user ? "/contracts/new" : "/login"}>
            <span className="cta-long">{user ? "계약서 올리기" : "시작하기"}</span>
            <span className="cta-short">{user ? "올리기" : "시작"}</span>
          </NavLink>
          {user || onLanding ? (
            <button className="menu-btn" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
              메뉴
            </button>
          ) : null}
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="foot">
        <Disclaimer />
      </footer>
    </div>
  );
}

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="main muted">로그인 상태를 확인하고 있습니다.</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted">권한을 확인하고 있습니다.</p>;
  if (user?.role !== "ADMIN") return <Navigate to="/contracts" replace />;
  return <Outlet />;
}

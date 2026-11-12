import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.tsx";

const worries = ["갱신요구권 포기", "위약금", "원상복구", "연체이자"];
const scopes = ["계약서 보관", "조항 목록", "일정", "이용권"];
const steps = ["회원가입", "업로드", "조항 확인", "일정 정리"];
const prices = [
  ["무료 2회", "0원"],
  ["분석 3회", "9,900원"],
  ["분석 10회", "29,000원"],
];

export function LandingPage() {
  const { user } = useAuth();
  const start = user ? "/contracts/new" : "/login";

  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-wrap landing-hero-grid">
          <div className="landing-copy">
            <p className="landing-kicker">예시 화면</p>
            <h1>
              이 특약,
              <br />
              <span className="landing-accent">그냥 서명해도 될까?</span>
            </h1>
            <p className="landing-lead">월세·전세 계약서를 올리고 조항과 일정을 확인합니다.</p>
            <Link className="hero-search" to={start}>
              <span>PDF · 사진 계약서</span>
              <span className="hero-search-btn">시작하기</span>
            </Link>
          </div>
          <article className="sample-card" id="sample">
            <p className="sample-label">예시 리포트</p>
            <h2>갱신요구권 포기</h2>
            <p className="sample-quote">계약 만료 시 갱신요구권을 행사하지 않기로 한다.</p>
            <div className="sample-score">
              <div className="score-ring" aria-hidden="true">
                <span>72</span>
              </div>
              <div>
                <p className="badge badge-HIGH">위험</p>
                <p className="sample-score-text">종합 위험 72점</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="landing-band">
        <div className="landing-wrap landing-split">
          <div>
            <p className="landing-kicker dark">확인할 문장</p>
            <h2>
              계약서에서
              <br />
              <span className="ink-mark">자주 보는 조항</span>
            </h2>
          </div>
          <div className="worry-grid">
            {worries.map((title) => (
              <article key={title} className="worry-card">
                <h3>{title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-dark" id="scope">
        <div className="landing-wrap">
          <p className="landing-kicker">분석에 담기는 것</p>
          <h2>
            조항과
            <br />
            <span className="landing-accent">근거</span>
          </h2>
          <div className="scope-grid">
            {scopes.map((title) => (
              <article key={title}>
                <h3>{title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-band" id="how">
        <div className="landing-wrap">
          <p className="landing-kicker dark">이용 흐름</p>
          <h2>네 단계</h2>
          <div className="step-grid">
            {steps.map((title, index) => (
              <article key={title} className="step-card">
                <p className="step-index">{index + 1}</p>
                <h3>{title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-price" id="price">
        <div className="landing-wrap">
          <p className="landing-kicker dark">이용권</p>
          <h2>분석 1회에 1회</h2>
          <div className="price-grid">
            {prices.map(([name, price]) => (
              <article key={name} className="price-card">
                <h3>{name}</h3>
                <p className="price">{price}</p>
              </article>
            ))}
          </div>
          <Link className="btn btn-primary" to={user ? "/billing" : "/login"}>
            이용권 보기
          </Link>
        </div>
      </section>

      <section className="landing-final">
        <div className="landing-wrap">
          <h2>조항부터 확인해 보세요</h2>
          <Link className="btn btn-yellow" to={start}>
            회원가입하고 올리기
          </Link>
        </div>
      </section>
    </div>
  );
}

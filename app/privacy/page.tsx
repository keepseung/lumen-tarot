import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 — LUMEN 타로",
  description: "LUMEN 타로 앱의 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "3rem 1.5rem",
        color: "#e0dce8",
        lineHeight: 1.8,
        fontFamily: "'Pretendard', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
          background: "linear-gradient(135deg, #c9a0ff, #f7c97e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        개인정보처리방침
      </h1>
      <p style={{ color: "#8a8494", marginBottom: "2rem", fontSize: "0.875rem" }}>
        시행일: 2026년 9월 14일 | 최종 수정일: 2026년 10월 9일
      </p>

      <Section title="1. 개인정보의 수집 및 이용 목적">
        <p>
          LUMEN 타로(이하 &quot;서비스&quot;)는 사용자의 개인정보를 수집하지 않습니다.
          회원가입이나 로그인 없이 이용할 수 있습니다. 사주 계산에는 생년월일·출생 시간·성별·달력 구분을, 타로에는 선택한 질문을 사용하며 브라우저에서 처리합니다.
        </p>
      </Section>

      <Section title="2. 수집하는 개인정보 항목">
        <p>본 서비스는 다음의 개인정보를 수집하지 않습니다:</p>
        <ul style={{ paddingLeft: "1.25rem", marginTop: "0.5rem" }}>
          <li>이름, 이메일, 전화번호 등 개인 식별 정보</li>
          <li>위치 정보</li>
          <li>기기 고유 식별자</li>
          <li>결제 정보</li>
        </ul>
      </Section>

      <Section title="3. 쿠키 및 자동 수집 정보">
        <p>
          본 서비스는 쿠키를 사용하지 않으며, 사용자의 브라우저 정보나 접속 로그를
          별도로 수집하거나 저장하지 않습니다. 단, 호스팅 서비스(Vercel)에서
          서비스 안정성을 위해 기본적인 서버 로그를 수집할 수 있으며, 이는 Vercel의
          개인정보처리방침에 따릅니다.
        </p>
      </Section>

      <Section title="4. 개인정보의 제3자 제공">
        <p>
          본 서비스는 사용자의 개인정보를 제3자에게 제공하지 않습니다.
        </p>
      </Section>

      <Section title="5. 개인정보의 보유 및 파기">
        <p>
          본 서비스는 개인정보를 수집하지 않으므로, 별도의 보유 및 파기 절차가
          없습니다. 다만 사용자가 내 리딩함에 저장을 선택하면 출생 정보·선택한 고민·사주 결과 또는 질문·타로 결과와 저장 날짜가 이 브라우저의 로컬 저장 공간에 보관됩니다. 서버에 저장되거나 다른 기기와 동기화되지 않습니다. 리딩함에서 개별 삭제 또는 전체 삭제할 수 있으며 브라우저 데이터를 지우면 삭제됩니다.
        </p>
      </Section>

      <Section title="6. 광고 및 분석 도구">
        <p>
          본 서비스는 광고를 게재하지 않으며, 별도의 분석 도구(Google Analytics 등)를
          사용하지 않습니다.
        </p>
      </Section>

      <Section title="7. 아동의 개인정보 보호">
        <p>
          본 서비스는 만 14세 미만 아동의 개인정보를 수집하지 않습니다.
          만 14세 미만의 이용자는 법정대리인의 동의 하에 서비스를 이용해 주시기
          바랍니다.
        </p>
      </Section>

      <Section title="8. 개인정보처리방침의 변경">
        <p>
          본 방침은 법령, 정책 또는 서비스 변경 사항을 반영하기 위해 수정될 수
          있습니다. 변경 시 본 페이지를 통해 공지합니다.
        </p>
      </Section>

      <Section title="9. 문의처">
        <p>
          개인정보 관련 문의사항이 있으시면 아래로 연락해 주세요.
        </p>
        <ul style={{ paddingLeft: "1.25rem", marginTop: "0.5rem" }}>
          <li>서비스명: LUMEN 타로</li>
          <li>운영: Clausoft</li>
          <li>이메일: clausoft.dev@gmail.com</li>
        </ul>
      </Section>

      <div
        style={{
          marginTop: "3rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
          color: "#5a5468",
          fontSize: "0.8rem",
        }}
      >
        © 2026 Clausoft. All rights reserved.
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2
        style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "#c9a0ff",
          marginBottom: "0.75rem",
        }}
      >
        {title}
      </h2>
      <div style={{ color: "#b0aab8" }}>{children}</div>
    </section>
  );
}

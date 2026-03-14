"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, fontFamily: "system-ui", padding: 24, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: 16 }}>应用出错</p>
          <button type="button" onClick={() => reset()} style={{ padding: "8px 16px", cursor: "pointer" }}>
            重试
          </button>
        </div>
      </body>
    </html>
  );
}

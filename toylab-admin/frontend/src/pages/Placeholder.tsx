type PlaceholderProps = { title: string };

export default function Placeholder({ title }: PlaceholderProps) {
  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>{title}</h1>
        <p style={{ color: "#64748b", marginBottom: "1rem" }}>
          该功能暂未在本前端开放。
        </p>
        <p style={{ fontSize: "14px", color: "#475569" }}>
          请使用 Python 管理端（toylab-admin）：在 <code>toylab-admin</code> 目录执行{" "}
          <code>uvicorn app.main:app --port 8002</code>，然后访问{" "}
          <a href="http://localhost:8002/admin" target="_blank" rel="noreferrer">
            http://localhost:8002/admin
          </a>
          。
        </p>
      </div>
    </div>
  );
}

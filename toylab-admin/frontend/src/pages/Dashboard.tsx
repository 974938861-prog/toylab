import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>工作台</h1>
        <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
          欢迎使用 ToyLab 管理后台。从左侧菜单进入各功能。
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ gridColumn: "1 / -1", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>用户管理</div>
          <Link to="/users" className="btn" style={{ textAlign: "center" }}>用户账号管理</Link>
          <Link to="/favorites" className="btn" style={{ textAlign: "center" }}>收藏记录</Link>
          <Link to="/comments" className="btn" style={{ textAlign: "center" }}>用户评论</Link>
          <Link to="/orders" className="btn" style={{ textAlign: "center" }}>购买记录</Link>
          <div style={{ gridColumn: "1 / -1", fontWeight: 600, color: "#475569", marginBottom: "0.25rem", marginTop: "0.5rem" }}>发现管理</div>
          <Link to="/cases" className="btn btn-primary" style={{ textAlign: "center" }}>案例管理</Link>
          <div style={{ gridColumn: "1 / -1", fontWeight: 600, color: "#475569", marginBottom: "0.25rem", marginTop: "0.5rem" }}>零件商城管理</div>
          <Link to="/parts" className="btn" style={{ textAlign: "center" }}>零件管理</Link>
          <div style={{ gridColumn: "1 / -1", fontWeight: 600, color: "#475569", marginBottom: "0.25rem", marginTop: "0.5rem" }}>工作室管理</div>
          <Link to="/studio" className="btn" style={{ textAlign: "center" }}>工作室</Link>
        </div>
        <p style={{ marginTop: "1.5rem", fontSize: "13px", color: "#64748b" }}>
          本前端已开放 <strong>发现管理 → 案例管理</strong>（列表、编辑、封面上传）；其余功能请使用左侧二级菜单进入，或使用 Python 管理端（toylab-admin，端口 8002）。
        </p>
      </div>
    </div>
  );
}

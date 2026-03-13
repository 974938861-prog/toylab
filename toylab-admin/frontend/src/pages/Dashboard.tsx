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
          <Link to="/cases" className="btn btn-primary" style={{ textAlign: "center" }}>
            案例管理
          </Link>
          <Link to="/users" className="btn" style={{ textAlign: "center" }}>用户管理</Link>
          <Link to="/products" className="btn" style={{ textAlign: "center" }}>商品管理</Link>
          <Link to="/product-categories" className="btn" style={{ textAlign: "center" }}>商品分类</Link>
          <Link to="/cart" className="btn" style={{ textAlign: "center" }}>购物车</Link>
          <Link to="/comments" className="btn" style={{ textAlign: "center" }}>评论管理</Link>
          <Link to="/favorites" className="btn" style={{ textAlign: "center" }}>收藏记录</Link>
          <Link to="/projects" className="btn" style={{ textAlign: "center" }}>用户项目</Link>
          <Link to="/user-parts" className="btn" style={{ textAlign: "center" }}>用户零件库</Link>
          <Link to="/case-bom" className="btn" style={{ textAlign: "center" }}>物料清单</Link>
          <Link to="/case-steps" className="btn" style={{ textAlign: "center" }}>制作步骤</Link>
          <Link to="/case-resources" className="btn" style={{ textAlign: "center" }}>数字资源包</Link>
          <Link to="/case-devlogs" className="btn" style={{ textAlign: "center" }}>开发日志</Link>
        </div>
        <p style={{ marginTop: "1.5rem", fontSize: "13px", color: "#64748b" }}>
          本前端已开放 <strong>案例管理</strong>（列表、编辑、封面上传）；其余功能请使用左侧菜单进入查看，或使用 Python 管理端（toylab-admin，端口 8002）。
        </p>
      </div>
    </div>
  );
}

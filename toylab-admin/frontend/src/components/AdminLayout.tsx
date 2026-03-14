import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearToken } from "../lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">ToyLab 管理</div>
        <nav className="admin-sidebar-nav">
          <Link to="/" className={isActive("/") && location.pathname === "/" ? "active" : ""}>
            工作台
          </Link>

          <span className="admin-sidebar-group">用户管理</span>
          <div className="admin-sidebar-section">
            <Link to="/users" className={isActive("/users") ? "active" : ""}>用户账号管理</Link>
            <Link to="/favorites" className={isActive("/favorites") ? "active" : ""}>收藏记录</Link>
            <Link to="/comments" className={isActive("/comments") ? "active" : ""}>用户评论</Link>
            <Link to="/orders" className={isActive("/orders") ? "active" : ""}>购买记录</Link>
          </div>

          <span className="admin-sidebar-group">发现管理</span>
          <div className="admin-sidebar-section">
            <Link to="/cases" className={isActive("/cases") ? "active" : ""}>案例管理</Link>
          </div>

          <span className="admin-sidebar-group">零件商城管理</span>
          <div className="admin-sidebar-section">
            <Link to="/parts" className={isActive("/parts") ? "active" : ""}>零件管理</Link>
          </div>

          <span className="admin-sidebar-group">工作室管理</span>
          <div className="admin-sidebar-section">
            <Link to="/studio" className={isActive("/studio") ? "active" : ""}>工作室</Link>
          </div>
        </nav>
        <div className="admin-sidebar-footer">
          <button type="button" className="admin-sidebar-logout" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

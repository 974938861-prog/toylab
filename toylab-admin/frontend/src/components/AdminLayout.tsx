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
          <Link to="/" className={isActive("/") ? "active" : ""}>
            工作台
          </Link>
          <span className="admin-sidebar-group">用户与社区</span>
          <Link to="/users" className={isActive("/users") ? "active" : ""}>
            用户管理
          </Link>
          <Link to="/comments" className={isActive("/comments") ? "active" : ""}>
            评论管理
          </Link>
          <Link to="/favorites" className={isActive("/favorites") ? "active" : ""}>
            收藏记录
          </Link>
          <span className="admin-sidebar-group">商城管理</span>
          <Link to="/product-categories" className={isActive("/product-categories") ? "active" : ""}>
            商品分类
          </Link>
          <Link to="/products" className={isActive("/products") ? "active" : ""}>
            商品管理
          </Link>
          <Link to="/cart" className={isActive("/cart") ? "active" : ""}>
            购物车
          </Link>
          <span className="admin-sidebar-group">灵感案例</span>
          <Link to="/cases" className={isActive("/cases") ? "active" : ""}>
            案例管理
          </Link>
          <Link to="/case-bom" className={isActive("/case-bom") ? "active" : ""}>
            物料清单
          </Link>
          <Link to="/case-steps" className={isActive("/case-steps") ? "active" : ""}>
            制作步骤
          </Link>
          <Link to="/case-resources" className={isActive("/case-resources") ? "active" : ""}>
            数字资源包
          </Link>
          <Link to="/case-devlogs" className={isActive("/case-devlogs") ? "active" : ""}>
            开发日志
          </Link>
          <span className="admin-sidebar-group">工作室</span>
          <Link to="/projects" className={isActive("/projects") ? "active" : ""}>
            用户项目
          </Link>
          <Link to="/user-parts" className={isActive("/user-parts") ? "active" : ""}>
            用户零件库
          </Link>
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

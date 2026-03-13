import { Routes, Route, Navigate } from "react-router-dom";
import { getToken } from "./lib/api";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CaseList from "./pages/CaseList";
import CaseEdit from "./pages/CaseEdit";
import Placeholder from "./pages/Placeholder";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><AdminLayout><Dashboard /></AdminLayout></RequireAuth>} />
      <Route path="/cases" element={<RequireAuth><AdminLayout><CaseList /></AdminLayout></RequireAuth>} />
      <Route path="/cases/:id/edit" element={<RequireAuth><AdminLayout><CaseEdit /></AdminLayout></RequireAuth>} />
      <Route path="/users" element={<RequireAuth><AdminLayout><Placeholder title="用户管理" /></AdminLayout></RequireAuth>} />
      <Route path="/comments" element={<RequireAuth><AdminLayout><Placeholder title="评论管理" /></AdminLayout></RequireAuth>} />
      <Route path="/favorites" element={<RequireAuth><AdminLayout><Placeholder title="收藏记录" /></AdminLayout></RequireAuth>} />
      <Route path="/product-categories" element={<RequireAuth><AdminLayout><Placeholder title="商品分类" /></AdminLayout></RequireAuth>} />
      <Route path="/products" element={<RequireAuth><AdminLayout><Placeholder title="商品管理" /></AdminLayout></RequireAuth>} />
      <Route path="/cart" element={<RequireAuth><AdminLayout><Placeholder title="购物车" /></AdminLayout></RequireAuth>} />
      <Route path="/case-bom" element={<RequireAuth><AdminLayout><Placeholder title="物料清单" /></AdminLayout></RequireAuth>} />
      <Route path="/case-steps" element={<RequireAuth><AdminLayout><Placeholder title="制作步骤" /></AdminLayout></RequireAuth>} />
      <Route path="/case-resources" element={<RequireAuth><AdminLayout><Placeholder title="数字资源包" /></AdminLayout></RequireAuth>} />
      <Route path="/case-devlogs" element={<RequireAuth><AdminLayout><Placeholder title="开发日志" /></AdminLayout></RequireAuth>} />
      <Route path="/projects" element={<RequireAuth><AdminLayout><Placeholder title="用户项目" /></AdminLayout></RequireAuth>} />
      <Route path="/user-parts" element={<RequireAuth><AdminLayout><Placeholder title="用户零件库" /></AdminLayout></RequireAuth>} />
    </Routes>
  );
}

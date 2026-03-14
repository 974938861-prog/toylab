import { Routes, Route, Navigate } from "react-router-dom";
import { getToken } from "./lib/api";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CaseList from "./pages/CaseList";
import CaseEdit from "./pages/CaseEdit";
import ProductList from "./pages/ProductList";
import ProductEdit from "./pages/ProductEdit";
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
      <Route path="/users" element={<RequireAuth><AdminLayout><Placeholder title="用户账号管理" /></AdminLayout></RequireAuth>} />
      <Route path="/favorites" element={<RequireAuth><AdminLayout><Placeholder title="收藏记录" /></AdminLayout></RequireAuth>} />
      <Route path="/comments" element={<RequireAuth><AdminLayout><Placeholder title="用户评论" /></AdminLayout></RequireAuth>} />
      <Route path="/orders" element={<RequireAuth><AdminLayout><Placeholder title="购买记录" /></AdminLayout></RequireAuth>} />
      <Route path="/parts" element={<RequireAuth><AdminLayout><ProductList /></AdminLayout></RequireAuth>} />
      <Route path="/parts/:id/edit" element={<RequireAuth><AdminLayout><ProductEdit /></AdminLayout></RequireAuth>} />
      <Route path="/studio" element={<RequireAuth><AdminLayout><Placeholder title="工作室管理" /></AdminLayout></RequireAuth>} />
    </Routes>
  );
}

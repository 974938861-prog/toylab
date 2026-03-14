import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, apiJson } from "../lib/api";

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  category_id: number | null;
  category?: { id: number; name: string; slug: string };
  price: number;
  stock_status: string;
  is_published: boolean;
  cover_url: string | null;
  sales_count: number;
  view_count: number;
};

type CategoryItem = { id: number; name: string; slug: string };

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function handleCreate() {
    if (!newName.trim()) { setCreateError("请填写零件名称"); return; }
    setCreating(true);
    setCreateError("");
    try {
      const res = await api("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((body as { detail?: string }).detail || `创建失败（${res.status}）`);
      }
      const created = body as ProductItem;
      setShowCreate(false);
      setNewName("");
      navigate(`/parts/${created.id}/edit`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    setListError("");
    Promise.all([
      apiJson<ProductItem[]>("/api/admin/products"),
      apiJson<CategoryItem[]>("/api/admin/product-categories"),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      })
      .catch(() => {
        setProducts([]);
        setCategories([]);
        setListError("拉取零件列表失败，请确认 toylab-service 已启动。");
      })
      .finally(() => setLoading(false));
  }, []);

  const categoryName = (categoryId: number | null) => {
    if (categoryId == null) return "—";
    const c = categories.find((x) => x.id === categoryId);
    return c?.name ?? "—";
  };

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`确定要删除零件「${name}」吗？此操作不可撤销。`)) return;
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await api(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { detail?: string }).detail || `删除失败（${res.status}）`);
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <h1 style={{ margin: 0 }}>零件列表</h1>
          <button className="btn btn-primary" onClick={() => { setShowCreate(true); setCreateError(""); setNewName(""); }}>
            + 新建零件
          </button>
        </div>
        <p style={{ color: "#64748b", marginBottom: "1rem", fontSize: 14 }}>
          此处编辑的零件与 web 端「零件商城」为同一数据源，保存后即同步展示。
        </p>

        {showCreate && (
          <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <p style={{ margin: "0 0 0.75rem", fontWeight: 500 }}>新建零件</p>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <input
                style={{ flex: 1, minWidth: 200 }}
                placeholder="零件名称（必填）"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <button className="btn btn-primary" disabled={creating} onClick={handleCreate}>
                {creating ? "创建中..." : "确认创建"}
              </button>
              <button className="btn" onClick={() => setShowCreate(false)}>取消</button>
            </div>
            {createError && <p style={{ color: "#dc2626", margin: "0.5rem 0 0", fontSize: 13 }}>{createError}</p>}
            <p style={{ color: "#6b7280", fontSize: 12, margin: "0.5rem 0 0" }}>创建后将自动跳转到编辑页完善内容</p>
          </div>
        )}

        {deleteError && (
          <p style={{ color: "#dc2626", marginBottom: "0.75rem", padding: "0.5rem 0.75rem", background: "#fef2f2", borderRadius: 6 }}>
            {deleteError}
          </p>
        )}
        {loading ? (
          <p>加载中...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>封面</th>
                <th>名称</th>
                <th>分类</th>
                <th>价格</th>
                <th>发布状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.cover_url ? (
                      <img src={p.cover_url} alt="" className="cover-preview" />
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{categoryName(p.category_id)}</td>
                  <td>¥ {p.price.toFixed(2)}</td>
                  <td>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: p.is_published ? "#dcfce7" : "#f3f4f6",
                      color: p.is_published ? "#16a34a" : "#6b7280",
                    }}>
                      {p.is_published ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <Link to={"/parts/" + p.id + "/edit"} className="btn">
                      编辑
                    </Link>
                    <button
                      className="btn"
                      style={{ color: "#dc2626", borderColor: "#dc2626" }}
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id, p.name)}
                    >
                      {deletingId === p.id ? "删除中..." : "删除"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {listError && <p style={{ color: "#dc2626", marginTop: "0.5rem" }}>{listError}</p>}
        {!loading && products.length === 0 && !listError && (
          <p style={{ color: "#64748b" }}>暂无零件，请先在数据库或 Python 管理端添加。</p>
        )}
      </div>
    </div>
  );
}

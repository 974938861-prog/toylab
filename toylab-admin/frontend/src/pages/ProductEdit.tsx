import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, apiJson } from "../lib/api";

type ProductData = {
  id: string;
  name: string;
  slug: string;
  category_id: number | null;
  category?: { id: number; name: string; slug: string };
  description: string | null;
  spec: string | null;
  price: number;
  cover_url: string | null;
  model_3d_url: string | null;
  stock_status: string;
};

type CategoryOption = { id: number; name: string; slug: string; parent_id: number | null; sort_order: number };

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProductData | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiJson<ProductData>(`/api/admin/products/${id}`),
      apiJson<CategoryOption[]>("/api/admin/product-categories"),
    ])
      .then(([product, cats]) => {
        setData(product);
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => setData(null));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data || !id) return;
    setSaving(true);
    setError("");
    try {
      await api(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          category_id: data.category_id,
          description: data.description,
          spec: data.spec,
          price: data.price,
          cover_url: data.cover_url,
          model_3d_url: data.model_3d_url,
          stock_status: data.stock_status,
        }),
      });
      navigate("/parts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <div className="container">加载中...</div>;

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>编辑零件</h1>
        <p style={{ color: "#64748b", marginBottom: "1rem", fontSize: 14 }}>
          修改后保存，web 端「零件商城」将同步显示。
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>名称</label>
            <input
              value={data.name}
              onChange={(e) => setData((d) => (d ? { ...d, name: e.target.value } : null))}
              required
            />
          </div>
          <div className="form-row">
            <label>标识符 (slug)</label>
            <input
              value={data.slug}
              onChange={(e) => setData((d) => (d ? { ...d, slug: e.target.value } : null))}
              required
            />
          </div>
          <div className="form-row">
            <label>分类</label>
            <select
              value={data.category_id ?? ""}
              onChange={(e) =>
                setData((d) =>
                  d ? { ...d, category_id: e.target.value ? Number(e.target.value) : null } : null
                )
              }
            >
              <option value="">— 未分类 —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>规格参数</label>
            <input
              value={data.spec ?? ""}
              onChange={(e) => setData((d) => (d ? { ...d, spec: e.target.value } : null))}
            />
          </div>
          <div className="form-row">
            <label>价格</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.price}
              onChange={(e) => setData((d) => (d ? { ...d, price: Number(e.target.value) } : null))}
            />
          </div>
          <div className="form-row">
            <label>库存状态</label>
            <select
              value={data.stock_status}
              onChange={(e) => setData((d) => (d ? { ...d, stock_status: e.target.value } : null))}
            >
              <option value="in_stock">有货</option>
              <option value="out_of_stock">缺货</option>
              <option value="pre_order">预订</option>
            </select>
          </div>
          <div className="form-row">
            <label>封面图 URL</label>
            <input
              value={data.cover_url ?? ""}
              onChange={(e) => setData((d) => (d ? { ...d, cover_url: e.target.value || null } : null))}
              placeholder="/uploads/... 或完整 URL"
            />
            {data.cover_url && (
              <div style={{ marginTop: "0.5rem" }}>
                <img src={data.cover_url} alt="封面" className="cover-preview" />
              </div>
            )}
          </div>
          <div className="form-row">
            <label>3D 模型 URL</label>
            <input
              value={data.model_3d_url ?? ""}
              onChange={(e) =>
                setData((d) => (d ? { ...d, model_3d_url: e.target.value || null } : null))
              }
            />
          </div>
          <div className="form-row">
            <label>描述</label>
            <textarea
              value={data.description ?? ""}
              onChange={(e) => setData((d) => (d ? { ...d, description: e.target.value } : null))}
              rows={3}
            />
          </div>
          {error && <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </button>
          <button type="button" className="btn" style={{ marginLeft: "0.5rem" }} onClick={() => navigate("/parts")}>
            取消
          </button>
        </form>
      </div>
    </div>
  );
}

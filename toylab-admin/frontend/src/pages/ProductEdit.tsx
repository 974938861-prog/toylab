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
  is_published: boolean;
};

type CategoryOption = { id: number; name: string; slug: string; parent_id: number | null; sort_order: number };

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProductData | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    const form = new FormData();
    form.append("file", file);
    setCoverUploading(true);
    setError("");
    try {
      const res = await api("/api/admin/upload/product-cover", { method: "POST", body: form });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = (body as { detail?: string }).detail;
        throw new Error(detail || `上传失败（${res.status}）`);
      }
      const url = (body as { url?: string }).url;
      if (url) {
        setData((d) => (d ? { ...d, cover_url: url } : null));
      } else {
        setError("上传成功但未返回地址");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "封面上传失败");
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  }

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
          is_published: data.is_published,
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
            <label>发布状态</label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!data.is_published}
                onChange={(e) => setData((d) => (d ? { ...d, is_published: e.target.checked } : null))}
              />
              <span>{data.is_published ? "已发布（web 商城可见）" : "草稿（仅管理端可见）"}</span>
            </label>
            <span className="form-hint">勾选后保存，零件将出现在 web 零件商城；取消勾选则隐藏。</span>
          </div>
          <div className="form-row">
            <label>封面图</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <label
                  style={{
                    display: "inline-block",
                    padding: "0.4rem 0.9rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    cursor: coverUploading ? "not-allowed" : "pointer",
                    fontSize: 14,
                    background: "#f9fafb",
                    color: "#374151",
                    whiteSpace: "nowrap",
                  }}
                >
                  {coverUploading ? "上传中..." : "上传图片"}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    style={{ display: "none" }}
                    disabled={coverUploading}
                    onChange={handleCoverUpload}
                  />
                </label>
                <span style={{ fontSize: 13, color: "#6b7280" }}>支持 jpg / png / gif / webp</span>
              </div>
              <input
                value={data.cover_url ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, cover_url: e.target.value || null } : null))}
                placeholder="或直接填写 /uploads/... 路径"
                style={{ fontSize: 13, color: "#6b7280" }}
              />
              {data.cover_url && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <img
                    src={data.cover_url}
                    alt="封面预览"
                    style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }}
                  />
                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: 13 }}
                    onClick={() => setData((d) => (d ? { ...d, cover_url: null } : null))}
                  >
                    清除
                  </button>
                </div>
              )}
            </div>
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

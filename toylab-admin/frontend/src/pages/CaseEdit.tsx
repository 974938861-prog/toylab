import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, apiJson } from "../lib/api";

type CaseData = {
  id: string;
  title: string;
  slug: string;
  creator_id: string;
  cover_url: string | null;
  description: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  price: number;
  is_free: boolean;
  is_published: boolean;
};

export default function CaseEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<CaseData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    apiJson<CaseData>(`/api/admin/cases/${id}`)
      .then(setData)
      .catch(() => setData(null));
  }, [id]);

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await api("/api/admin/upload/cover", { method: "POST", body: form });
      if (!res.ok) throw new Error("上传失败");
      const { url } = await res.json();
      setData((d) => (d ? { ...d, cover_url: url } : null));
    } catch {
      setError("封面上传失败");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      await api(`/api/admin/cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          slug: data.slug,
          creator_id: data.creator_id,
          cover_url: data.cover_url,
          description: data.description,
          difficulty: data.difficulty,
          estimated_time: data.estimated_time,
          price: data.price,
          is_free: data.is_free,
          is_published: data.is_published,
        }),
      });
      navigate("/cases");
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
          <h1 style={{ marginTop: 0 }}>编辑案例</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>案例名称</label>
              <input
                value={data.title}
                onChange={(e) => setData((d) => (d ? { ...d, title: e.target.value } : null))}
                required
              />
            </div>
            <div className="form-row">
              <label>标识符</label>
              <input
                value={data.slug}
                onChange={(e) => setData((d) => (d ? { ...d, slug: e.target.value } : null))}
                required
              />
            </div>
            <div className="form-row">
              <label>创作者 ID</label>
              <input
                value={data.creator_id}
                onChange={(e) => setData((d) => (d ? { ...d, creator_id: e.target.value } : null))}
              />
            </div>
            <div className="form-row">
              <label>上传封面图</label>
              <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={handleCoverChange} />
              <span className="form-hint">选择图片后会自动上传并设为封面，留空则保留当前封面。</span>
            </div>
            {data.cover_url && (
              <div className="form-row">
                <label>当前封面</label>
                <img src={data.cover_url} alt="封面" className="cover-preview" />
              </div>
            )}
            <div className="form-row">
              <label>简介</label>
              <textarea
                value={data.description ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, description: e.target.value } : null))}
                rows={3}
              />
            </div>
            <div className="form-row">
              <label>难度</label>
              <input
                value={data.difficulty ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, difficulty: e.target.value } : null))}
              />
            </div>
            <div className="form-row">
              <label>预计完成时间</label>
              <input
                value={data.estimated_time ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, estimated_time: e.target.value } : null))}
              />
            </div>
            <div className="form-row">
              <label>价格</label>
              <input
                type="number"
                step="0.01"
                value={data.price}
                onChange={(e) => setData((d) => (d ? { ...d, price: Number(e.target.value) } : null))}
              />
            </div>
            <div className="form-row">
              <label>
                <input
                  type="checkbox"
                  checked={data.is_free}
                  onChange={(e) => setData((d) => (d ? { ...d, is_free: e.target.checked } : null))}
                />{" "}
                免费
              </label>
            </div>
            <div className="form-row">
              <label>
                <input
                  type="checkbox"
                  checked={data.is_published}
                  onChange={(e) => setData((d) => (d ? { ...d, is_published: e.target.checked } : null))}
                />{" "}
                已发布
              </label>
            </div>
            {error && <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </button>
            <Link to="/cases" className="btn" style={{ marginLeft: "0.5rem" }}>
              取消
            </Link>
          </form>
        </div>
      </div>
  );
}

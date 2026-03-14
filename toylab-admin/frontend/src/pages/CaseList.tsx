import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, apiJson } from "../lib/api";

/** 与编辑页案例分类一致：slug -> 显示名称 */
const CASE_CATEGORY_LABELS: Record<string, string> = {
  car: "玩具车",
  game: "游戏机",
  boardgame: "桌游",
  pet: "宠物玩具",
  tool: "工具",
  peripheral: "电脑周边",
  appliance: "家电",
  lamp: "灯具",
  instrument: "乐器",
};

function slugToCategoryLabels(slug: string | undefined): string {
  if (!slug || !slug.trim()) return "—";
  const parts = slug.split(",").map((s) => s.trim()).filter(Boolean);
  const labels = parts.map((p) => CASE_CATEGORY_LABELS[p] || p);
  return labels.length ? labels.join("、") : "—";
}

type CaseItem = {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  is_published: boolean;
  creator_display_name?: string | null;
  creator?: { nickname?: string; username?: string };
};

export default function CaseList() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    apiJson<CaseItem[]>("/api/admin/cases")
      .then(setCases)
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!newTitle.trim()) { setCreateError("请填写案例名称"); return; }
    setCreating(true);
    setCreateError("");
    try {
      const res = await api("/api/admin/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((body as { detail?: string }).detail || `创建失败（${res.status}）`);
      }
      const created = body as CaseItem;
      setShowCreate(false);
      setNewTitle("");
      navigate(`/cases/${created.id}/edit`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`确定要删除案例「${title}」吗？此操作不可撤销。`)) return;
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await api(`/api/admin/cases/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { detail?: string }).detail || `删除失败（${res.status}）`);
      }
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h1 style={{ margin: 0 }}>案例列表</h1>
          <button className="btn btn-primary" onClick={() => { setShowCreate(true); setCreateError(""); setNewTitle(""); }}>
            + 新建案例
          </button>
        </div>

        {showCreate && (
          <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <p style={{ margin: "0 0 0.75rem", fontWeight: 500 }}>新建案例</p>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <input
                style={{ flex: 1, minWidth: 200 }}
                placeholder="案例名称（必填）"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
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
        {loading ? <p>加载中...</p> : (
          <table>
            <thead>
              <tr>
                <th>封面</th>
                <th>名称</th>
                <th>案例分类</th>
                <th>创作者</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.cover_url ? <img src={c.cover_url} alt="" className="cover-preview" /> : <span>—</span>}
                  </td>
                  <td>{c.title}</td>
                  <td>{slugToCategoryLabels(c.slug)}</td>
                  <td>{c.creator_display_name || c.creator?.nickname || c.creator?.username || "—"}</td>
                  <td>{c.is_published ? "已发布" : "草稿"}</td>
                  <td style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <Link to={"/cases/" + c.id + "/edit"} className="btn">编辑</Link>
                    <button
                      className="btn"
                      style={{ color: "#dc2626", borderColor: "#dc2626" }}
                      disabled={deletingId === c.id}
                      onClick={() => handleDelete(c.id, c.title)}
                    >
                      {deletingId === c.id ? "删除中..." : "删除"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiJson } from "../lib/api";

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
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson<CaseItem[]>("/api/admin/cases")
      .then(setCases)
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
        <div className="card">
          <h1 style={{ marginTop: 0 }}>案例列表</h1>
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
                    <td><Link to={"/cases/" + c.id + "/edit"} className="btn">编辑</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
  );
}

"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import type { Case } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import CaseCard from "@/components/CaseCard";
import CategoryFilter from "@/components/CategoryFilter";

const CATEGORIES = [
  { slug: "all", label: "全部玩具", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { slug: "car", label: "玩具车", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="10" width="20" height="7" rx="2"/><path d="M5 10V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg> },
  { slug: "game", label: "游戏机", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="3"/><path d="M6 12h4M8 10v4"/><circle cx="15" cy="11" r="1"/><circle cx="18" cy="13" r="1"/></svg> },
  { slug: "boardgame", label: "桌游", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M2 9h20M9 2v20"/></svg> },
  { slug: "pet", label: "宠物玩具", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309"/></svg> },
  { slug: "tool", label: "工具", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
  { slug: "peripheral", label: "电脑周边", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
  { slug: "appliance", label: "家电", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 3H8l-2 4h12l-2-4z"/><circle cx="12" cy="14" r="2"/></svg> },
];

type SortOption = "latest" | "popular" | "most_favorited" | "most_viewed";

export default function DiscoverPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("latest");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => { loadCases(); loadUser(); }, []);

  async function loadUser() {
    try {
      const res = await apiFetch("/auth/me");
      if (!res.ok) return;
      const { user } = await res.json();
      if (user) {
        setUserId(user.id);
        const favsRes = await apiFetch("/favorites?target_type=case");
        if (favsRes.ok) {
          const favs = await favsRes.json();
          setFavorites(new Set(favs.map((f: { target_id: string }) => f.target_id)));
        }
      }
    } catch {}
  }

  async function loadCases() {
    setLoading(true);
    try {
      const res = await apiFetch("/cases");
      const data = await res.json();
      if (Array.isArray(data)) setCases(data as Case[]);
    } catch {
      setCases([]);
    }
    setLoading(false);
  }

  async function toggleFavorite(caseId: string) {
    if (!userId) return;
    const isFav = favorites.has(caseId);
    if (isFav) {
      await apiFetch("/favorites", { method: "DELETE", body: JSON.stringify({ target_type: "case", target_id: caseId }) });
      setFavorites((prev) => { const n = new Set(prev); n.delete(caseId); return n; });
    } else {
      await apiFetch("/favorites", { method: "POST", body: JSON.stringify({ target_type: "case", target_id: caseId }) });
      setFavorites((prev) => new Set(prev).add(caseId));
    }
  }

  const filteredCases = useMemo(() => {
    let result = cases;
    if (activeCategory !== "all") {
      result = result.filter((c) => c.slug?.includes(activeCategory) || c.title.toLowerCase().includes(activeCategory));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    switch (sort) {
      case "popular": case "most_favorited": result = [...result].sort((a, b) => b.sales_count - a.sales_count); break;
      case "most_viewed": result = [...result].sort((a, b) => b.view_count - a.view_count); break;
    }
    return result;
  }, [cases, activeCategory, search, sort]);

  return (
    <div className="page-content">
      <CategoryFilter categories={CATEGORIES} activeCategory={activeCategory} onSelect={setActiveCategory}
        extraSections={<div className="inspo-sidebar-section"><div className="inspo-sidebar-label">收藏</div><ul className="inspo-nav-list"><li className={`inspo-nav-item ${activeCategory === "favorites" ? "active" : ""}`} onClick={() => setActiveCategory("favorites")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>我的收藏{favorites.size > 0 && <span className="inspo-badge">{favorites.size}</span>}</li></ul></div>}
      />
      <div className="inspo-main">
        <div className="inspo-topbar">
          <div className="inspo-topbar-left"><h2 className="inspo-page-title">{CATEGORIES.find((c) => c.slug === activeCategory)?.label || "发现"}</h2></div>
          <div className="inspo-topbar-right">
            <div className="inspo-search-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input type="text" className="inspo-search" placeholder="搜索玩具..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <div className="inspo-sort"><span>排序</span><select className="inspo-sort-select" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}><option value="latest">最新</option><option value="popular">最热</option><option value="most_favorited">最多收藏</option><option value="most_viewed">最多浏览</option></select></div>
          </div>
        </div>
        {loading ? <div className="loading-spinner" /> : filteredCases.length === 0 ? (
          <div className="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 15h8M9 9h.01M15 9h.01"/></svg><div className="empty-state-text">暂无案例</div></div>
        ) : (
          <div className="inspo-grid">{filteredCases.map((c) => <CaseCard key={c.id} case_={c} isFavorited={favorites.has(c.id)} onFavorite={toggleFavorite} />)}</div>
        )}
      </div>
    </div>
  );
}

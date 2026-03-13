"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import type { Product, ProductCategory, UserPart } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import CategorySidebar from "@/components/CategorySidebar";

type SortOption = "recommended" | "latest" | "popular" | "price_asc" | "price_desc";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [userParts, setUserParts] = useState<UserPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("electronics");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("recommended");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, userRes] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/product-categories").then((r) => r.json()),
        apiFetch("/auth/me").then((r) => r.ok ? r.json() : { user: null }),
      ]);
      if (Array.isArray(productsRes)) setProducts(productsRes as Product[]);
      if (Array.isArray(categoriesRes)) setCategories(categoriesRes as ProductCategory[]);
      if (userRes.user) {
        setUserId(userRes.user.id);
        const [favsRes, partsRes] = await Promise.all([
          apiFetch("/favorites?target_type=product").then((r) => r.ok ? r.json() : []),
          apiFetch("/user-parts").then((r) => r.ok ? r.json() : []),
        ]);
        if (Array.isArray(favsRes)) setFavorites(new Set(favsRes.map((f: { target_id: string }) => f.target_id)));
        if (Array.isArray(partsRes)) setUserParts(partsRes as UserPart[]);
      }
    } catch {}
    setLoading(false);
  }

  async function toggleFavorite(productId: string) {
    if (!userId) return;
    const isFav = favorites.has(productId);
    if (isFav) {
      await apiFetch("/favorites", { method: "DELETE", body: JSON.stringify({ target_type: "product", target_id: productId }) });
      setFavorites((prev) => { const n = new Set(prev); n.delete(productId); return n; });
    } else {
      await apiFetch("/favorites", { method: "POST", body: JSON.stringify({ target_type: "product", target_id: productId }) });
      setFavorites((prev) => new Set(prev).add(productId));
    }
  }

  async function addToCart(productId: string) {
    if (!userId) return;
    await apiFetch("/cart", { method: "POST", body: JSON.stringify({ product_id: productId }) });
  }

  const getCategoryIdsBySlug = (slug: string): number[] => {
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) return [];
    return [cat.id, ...categories.filter((c) => c.parent_id === cat.id).map((c) => c.id)];
  };

  const isMyPartsView = activeCategory === "my-electronics" || activeCategory === "my-mechanical";

  const filteredProducts = useMemo(() => {
    if (isMyPartsView) return [];
    let result = products;
    if (activeCategory !== "favorites" && activeCategory !== "all") {
      const ids = getCategoryIdsBySlug(activeCategory);
      if (ids.length > 0) result = result.filter((p) => ids.includes(p.category_id));
    }
    if (activeCategory === "favorites") result = result.filter((p) => favorites.has(p.id));
    if (search.trim()) { const q = search.toLowerCase(); result = result.filter((p) => p.name.toLowerCase().includes(q) || p.spec?.toLowerCase().includes(q)); }
    switch (sort) {
      case "latest": result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case "popular": result = [...result].sort((a, b) => b.sales_count - a.sales_count); break;
      case "price_asc": result = [...result].sort((a, b) => a.price - b.price); break;
      case "price_desc": result = [...result].sort((a, b) => b.price - a.price); break;
    }
    return result;
  }, [products, categories, activeCategory, search, sort, favorites, isMyPartsView]);

  const filteredParts = useMemo(() => {
    if (!isMyPartsView) return [];
    let result = userParts;
    const ids = getCategoryIdsBySlug(activeCategory === "my-electronics" ? "electronics" : "mechanical");
    result = result.filter((p) => p.product && ids.includes(p.product.category_id));
    if (search.trim()) { const q = search.toLowerCase(); result = result.filter((p) => p.product?.name.toLowerCase().includes(q)); }
    return result;
  }, [userParts, activeCategory, search, categories, isMyPartsView]);

  return (
    <div className="page-content">
      <CategorySidebar categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
      <div className="inspo-main">
        <div className="inspo-topbar">
          <div className="inspo-topbar-left"><h2 className="inspo-page-title">{isMyPartsView ? (activeCategory === "my-electronics" ? "我的电子模块" : "我的机械零件") : "零件商城"}</h2></div>
          <div className="inspo-topbar-right">
            <div className="inspo-search-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input type="text" className="inspo-search" placeholder="搜索零件..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            {!isMyPartsView && <div className="inspo-sort"><span>排序</span><select className="inspo-sort-select" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}><option value="recommended">综合推荐</option><option value="latest">最新</option><option value="popular">最受欢迎</option><option value="price_asc">价格升序</option><option value="price_desc">价格降序</option></select></div>}
          </div>
        </div>
        {loading ? <div className="loading-spinner" /> : isMyPartsView ? (
          filteredParts.length === 0 ? <div className="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg><div className="empty-state-text">暂无零件</div></div> : (
            <div style={{ padding: "0 24px 24px" }}><div className="library-table-wrap"><table className="library-table"><thead><tr><th>模块名称</th><th>数量</th><th>添加日期</th><th>上次使用项目</th><th>规格参数</th><th>固件版本</th></tr></thead><tbody>{filteredParts.map((part) => <tr key={part.id}><td style={{ fontWeight: 500 }}>{part.product?.name || "—"}</td><td><span className="lib-count">{part.quantity}</span></td><td style={{ color: "#6b7280", fontSize: 12 }}>{new Date(part.added_at).toLocaleDateString()}</td><td>{part.last_used_project || "—"}</td><td style={{ fontSize: 12, color: "#6b7280" }}>{part.product?.spec || "—"}</td><td>{part.firmware_version || "—"}</td></tr>)}</tbody></table></div></div>
          )
        ) : filteredProducts.length === 0 ? <div className="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/></svg><div className="empty-state-text">暂无商品</div></div> : (
          <div className="inspo-grid shop-grid">{filteredProducts.map((p) => <ProductCard key={p.id} product={p} isFavorited={favorites.has(p.id)} onFavorite={toggleFavorite} onAddToCart={addToCart} />)}</div>
        )}
      </div>
    </div>
  );
}

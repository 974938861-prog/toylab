"use client";

import type { ProductCategory } from "@/lib/types";

interface CategorySidebarProps {
  categories: ProductCategory[];
  activeCategory: string;
  onSelect: (slug: string) => void;
}

export default function CategorySidebar({ categories, activeCategory, onSelect }: CategorySidebarProps) {
  const parentCategories = categories.filter((c) => !c.parent_id);

  return (
    <aside className="inspo-sidebar shop-sidebar">
      <div className="inspo-sidebar-section">
        <div className="inspo-sidebar-label">分类</div>
        <ul className="inspo-nav-list">
          {parentCategories.map((parent) => {
            const children = categories.filter((c) => c.parent_id === parent.id);
            return (
              <li key={parent.id} className="shop-nav-group">
                <details open={children.some((c) => c.slug === activeCategory) || parent.slug === activeCategory}>
                  <summary
                    className={`inspo-nav-item shop-nav-group-header ${activeCategory === parent.slug ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelect(parent.slug);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg>
                    <span className="shop-nav-group-label">{parent.name}</span>
                    <svg className="shop-nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </summary>
                  <ul className="inspo-nav-list shop-nav-sub-list">
                    {children.map((child) => (
                      <li
                        key={child.id}
                        className={`inspo-nav-item shop-nav-sub-item ${activeCategory === child.slug ? "active" : ""}`}
                        onClick={() => onSelect(child.slug)}
                      >
                        {child.name}
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="inspo-sidebar-section">
        <div className="inspo-sidebar-label">收藏</div>
        <ul className="inspo-nav-list">
          <li
            className={`inspo-nav-item ${activeCategory === "favorites" ? "active" : ""}`}
            onClick={() => onSelect("favorites")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            我的收藏
          </li>
        </ul>
      </div>

      <div className="inspo-sidebar-section">
        <div className="inspo-sidebar-label">我的零件库</div>
        <ul className="inspo-nav-list">
          <li
            className={`inspo-nav-item ${activeCategory === "my-electronics" ? "active" : ""}`}
            onClick={() => onSelect("my-electronics")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg>
            我的电子模块
          </li>
          <li
            className={`inspo-nav-item ${activeCategory === "my-mechanical" ? "active" : ""}`}
            onClick={() => onSelect("my-mechanical")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            我的机械零件
          </li>
        </ul>
      </div>
    </aside>
  );
}

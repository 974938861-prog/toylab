"use client";

interface CategoryItem {
  slug: string;
  label: string;
  icon: React.ReactNode;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  activeCategory: string;
  onSelect: (slug: string) => void;
  extraSections?: React.ReactNode;
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onSelect,
  extraSections,
}: CategoryFilterProps) {
  return (
    <aside className="inspo-sidebar">
      <div className="inspo-sidebar-section">
        <div className="inspo-sidebar-label">分类</div>
        <ul className="inspo-nav-list">
          {categories.map((cat) => (
            <li
              key={cat.slug}
              className={`inspo-nav-item ${activeCategory === cat.slug ? "active" : ""}`}
              onClick={() => onSelect(cat.slug)}
            >
              {cat.icon}
              {cat.label}
            </li>
          ))}
        </ul>
      </div>
      {extraSections}
    </aside>
  );
}

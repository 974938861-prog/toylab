"use client";

import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
  onAddToCart?: (id: string) => void;
}

export default function ProductCard({ product, onFavorite, isFavorited, onAddToCart }: ProductCardProps) {
  return (
    <article className="inspo-card shop-card">
      <div className="inspo-card-img shop-card-img" style={{ background: "#EEEFF4" }}>
        <button
          className={`inspo-fav-btn ${isFavorited ? "active" : ""}`}
          title="收藏"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(product.id);
          }}
        >
          <svg viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <img
          src={product.cover_url || "/images/placeholder-product.svg"}
          className="shop-card-img-photo"
          alt={product.name}
        />
      </div>
      <div className="inspo-card-body">
        <div className="shop-card-row shop-card-row--top">
          <div className="shop-card-name-block">
            <div className="inspo-card-title">{product.name}</div>
            {product.spec && <div className="shop-card-spec">{product.spec}</div>}
          </div>
          <span className="shop-price">$ {product.price}</span>
        </div>
        <div className="shop-card-row shop-card-row--bottom">
          <div className="inspo-card-stats">
            <span className="inspo-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span className="inspo-stat-value">{product.sales_count.toLocaleString()}</span>
            </span>
            <span className="inspo-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span className="inspo-stat-value">{product.view_count.toLocaleString()}</span>
            </span>
          </div>
          <button className="shop-cart-btn" onClick={() => onAddToCart?.(product.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            加入购物车
          </button>
        </div>
      </div>
    </article>
  );
}

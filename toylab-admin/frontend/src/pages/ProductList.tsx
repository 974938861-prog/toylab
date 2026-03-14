import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiJson } from "../lib/api";

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  category_id: number | null;
  category?: { id: number; name: string; slug: string };
  price: number;
  stock_status: string;
  cover_url: string | null;
  sales_count: number;
  view_count: number;
};

type CategoryItem = { id: number; name: string; slug: string };

/** 与 web 零件商城同源：使用公开接口 GET /api/products 拉取列表，保证管理端与 web 显示一致 */
export default function ProductList() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  useEffect(() => {
    setListError("");
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/product-categories").then((r) => r.json()),
    ])
      .then(([productsData, categoriesData]) => {
        if (Array.isArray(productsData)) setProducts(productsData as ProductItem[]);
        else setProducts([]);
        if (Array.isArray(categoriesData)) setCategories(categoriesData as CategoryItem[]);
        else setCategories([]);
      })
      .catch(() => {
        setProducts([]);
        setCategories([]);
        setListError("拉取零件列表失败，请确认 toylab-service 已启动。");
      })
      .finally(() => setLoading(false));
  }, []);

  const categoryName = (categoryId: number | null) => {
    if (categoryId == null) return "—";
    const c = categories.find((x) => x.id === categoryId);
    return c?.name ?? "—";
  };

  const stockLabel: Record<string, string> = {
    in_stock: "有货",
    out_of_stock: "缺货",
    pre_order: "预订",
  };

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>零件列表</h1>
        <p style={{ color: "#64748b", marginBottom: "1rem", fontSize: 14 }}>
          此处编辑的零件与 web 端「零件商城」为同一数据源，保存后即同步展示。
        </p>
        {loading ? (
          <p>加载中...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>封面</th>
                <th>名称</th>
                <th>标识符</th>
                <th>分类</th>
                <th>价格</th>
                <th>库存</th>
                <th>销量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.cover_url ? (
                      <img src={p.cover_url} alt="" className="cover-preview" />
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.slug}</td>
                  <td>{categoryName(p.category_id)}</td>
                  <td>¥ {p.price.toFixed(2)}</td>
                  <td>{stockLabel[p.stock_status] ?? p.stock_status}</td>
                  <td>{p.sales_count}</td>
                  <td>
                    <Link to={"/parts/" + p.id + "/edit"} className="btn">
                      编辑
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {listError && <p style={{ color: "#dc2626", marginTop: "0.5rem" }}>{listError}</p>}
        {!loading && products.length === 0 && !listError && (
          <p style={{ color: "#64748b" }}>暂无零件，请先在数据库或 Python 管理端添加。</p>
        )}
      </div>
    </div>
  );
}

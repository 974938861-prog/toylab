"use client";

import type { CaseBomItem } from "@/lib/types";

interface BomTableProps {
  items: CaseBomItem[];
}

const TYPE_TAGS: Record<string, { label: string; className: string }> = {
  device: { label: "设备", className: "cd-bom-tag--device" },
  material: { label: "材料", className: "cd-bom-tag--material" },
  electronic: { label: "电子模块", className: "cd-bom-tag--electronic" },
  mechanical: { label: "机械零件", className: "cd-bom-tag--mechanical" },
};

export default function BomTable({ items }: BomTableProps) {
  if (items.length === 0) return null;

  return (
    <section className="cd-section">
      <h2 className="cd-section-title">完整物料清单</h2>
      <table className="cd-bom-table">
        <thead>
          <tr>
            <th>类型</th>
            <th>名称</th>
            <th>规格参数</th>
            <th className="col-num">单价</th>
            <th className="col-num">所需数量</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const tag = TYPE_TAGS[item.item_type] || { label: item.item_type, className: "" };
            return (
              <tr key={item.id}>
                <td><span className={`cd-bom-tag ${tag.className}`}>{tag.label}</span></td>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td style={{ fontSize: 12, color: "#6b7280" }}>{item.spec || "—"}</td>
                <td className="col-num">
                  {item.unit_price > 0 ? `$ ${item.unit_price}` : "—"}
                </td>
                <td className="col-num">{item.required_qty > 0 ? item.required_qty : "—"}</td>
                <td><span className="cd-stock cd-stock--ok">有货</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

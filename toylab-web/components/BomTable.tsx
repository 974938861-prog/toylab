"use client";

import { useState, useMemo } from "react";
import type { CaseBomItem } from "@/lib/types";

interface BomTableProps {
  items: CaseBomItem[];
  /** 受控：与物料清单/完整物料清单共用数据时由父组件传入 */
  owned?: Record<string, number>;
  buyQty?: Record<string, number>;
  checked?: Record<string, boolean>;
  onOwnedChange?: (id: string, value: number) => void;
  onBuyQtyChange?: (id: string, value: number) => void;
  onCheckedChange?: (id: string, value: boolean) => void;
  /** 为 true 时不包一层 section，仅渲染表格（用于完整物料清单区块） */
  noSection?: boolean;
  /** 为 true 时不显示合计与立即购买（用于完整物料清单） */
  hideFooter?: boolean;
  /** "full" = 完整物料清单：图片、名称、规格参数、单价、需要数量、已有、规格书、模型下载（无购买数量/合计/勾选） */
  variant?: "purchase" | "full";
}

/** 分类列展示文案，与 admin 编辑页一致 */
const ITEM_TYPE_LABEL: Record<string, string> = {
  material: "材料",
  electronic: "电子模块",
  mechanical: "机械零件",
  device: "设备",
};

export default function BomTable({
  items,
  owned: controlledOwned,
  buyQty: controlledBuyQty,
  checked: controlledChecked,
  onOwnedChange,
  onBuyQtyChange,
  onCheckedChange,
  noSection = false,
  hideFooter = false,
  variant = "purchase",
}: BomTableProps) {
  const purchaseItems = items.filter((i) => i.item_type !== "device");
  const isControlled = controlledBuyQty != null && onBuyQtyChange != null;

  const [internalOwned, setInternalOwned] = useState<Record<string, number>>({});
  const [internalBuyQty, setInternalBuyQty] = useState<Record<string, number>>(() => {
    const o: Record<string, number> = {};
    purchaseItems.forEach((i) => { o[i.id] = i.required_qty || 0; });
    return o;
  });
  const [internalChecked, setInternalChecked] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    purchaseItems.forEach((i) => { o[i.id] = true; });
    return o;
  });

  const owned = isControlled ? (controlledOwned ?? {}) : internalOwned;
  const buyQty = isControlled ? (controlledBuyQty ?? {}) : internalBuyQty;
  const checked = isControlled ? (controlledChecked ?? {}) : internalChecked;
  const setOwned = isControlled && onOwnedChange ? (id: string, v: number) => onOwnedChange(id, v) : (id: string, v: number) => setInternalOwned((p) => ({ ...p, [id]: v }));
  const setBuyQty = isControlled ? (id: string, v: number) => onBuyQtyChange!(id, v) : (id: string, v: number) => setInternalBuyQty((p) => ({ ...p, [id]: v }));
  const setChecked = isControlled && onCheckedChange ? (id: string, v: boolean) => onCheckedChange(id, v) : (id: string, v: boolean) => setInternalChecked((p) => ({ ...p, [id]: v }));

  const total = useMemo(() => {
    return purchaseItems.reduce((sum, item) => {
      const q = buyQty[item.id] ?? item.required_qty ?? 0;
      return sum + (item.unit_price || 0) * q;
    }, 0);
  }, [purchaseItems, buyQty]);

  if (purchaseItems.length === 0) return null;

  const isFull = variant === "full";

  const tableBlock = (
    <>
      <table className={`cd-bom-table cd-bom-table--purchase ${isFull ? "cd-bom-table--full" : ""}`}>
        <thead>
          <tr>
            <th className="cd-bom-col-type">分类</th>
            {isFull && <th className="cd-bom-col-img">图片</th>}
            <th>名称</th>
            {isFull && <th>规格参数</th>}
            <th className="col-num">单价</th>
            <th className="col-num">需要数量</th>
            <th className="col-num">已有</th>
            {!isFull && (
              <>
                <th className="col-num">购买数量</th>
                <th className="col-num">合计价格</th>
                <th className="col-check" />
              </>
            )}
            {isFull && (
              <>
                <th>规格书</th>
                <th>模型下载</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {purchaseItems.map((item) => {
            const typeLabel = ITEM_TYPE_LABEL[item.item_type] || item.item_type || "—";
            const typeClass = item.item_type && ["material", "electronic", "mechanical", "device"].includes(item.item_type) ? item.item_type : "material";
            const typeCell = (
              <span className={`cd-bom-type-pill cd-bom-type-pill--${typeClass}`}>
                {typeLabel}
              </span>
            );
            if (isFull) {
              return (
                <tr key={item.id}>
                  <td className="cd-bom-col-type">{typeCell}</td>
                  <td className="cd-bom-col-img"><div className="cd-bom-full-img" /></td>
                  <td style={{ fontWeight: 500 }}>{item.name}</td>
                  <td className="cd-bom-spec">{item.spec || "—"}</td>
                  <td className="col-num">${item.unit_price > 0 ? item.unit_price : "—"}</td>
                  <td className="col-num">{item.required_qty}</td>
                  <td className="col-num">{owned[item.id] ?? 0}</td>
                  <td>{item.doc_url ? <a href={item.doc_url} target="_blank" rel="noreferrer">PDF</a> : "—"}</td>
                  <td>—</td>
                </tr>
              );
            }
            const q = buyQty[item.id] ?? item.required_qty ?? 0;
                const rowTotal = (item.unit_price || 0) * q;
                return (
                  <tr key={item.id}>
                    <td className="cd-bom-col-type">{typeCell}</td>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td className="col-num">${item.unit_price > 0 ? item.unit_price : "—"}</td>
                <td className="col-num">{item.required_qty}</td>
                <td className="col-num">{owned[item.id] ?? 0}</td>
                <td className="col-num">
                  <input
                    type="number"
                    min={0}
                    className="cd-bom-qty-input"
                    value={q}
                    onChange={(e) => setBuyQty(item.id, Math.max(0, parseInt(e.target.value, 10) || 0))}
                  />
                </td>
                <td className="col-num">${rowTotal.toFixed(0)}</td>
                <td className="col-check">
                  <input
                    type="checkbox"
                    checked={!!checked[item.id]}
                    onChange={(e) => setChecked(item.id, e.target.checked)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!hideFooter && (
        <div className="cd-bom-footer">
          <span className="cd-bom-total">合计 ${total.toFixed(0)}</span>
          <button type="button" className="cd-bom-buy-btn">立即购买</button>
        </div>
      )}
    </>
  );

  if (noSection) return tableBlock;
  return <section className="cd-section cd-bom-purchase">{tableBlock}</section>;
}

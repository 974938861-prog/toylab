"use client";

/**
 * 工作室：嵌入原型页面的完整 UI 与交互（与 prototype/index.html 一致）
 */
export default function StudioPage() {
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <iframe
        src="/prototype/index.html?view=studio&embed=1"
        title="ToyLab 工作室"
        loading="lazy"
        style={{
          flex: 1,
          width: "100%",
          border: "none",
          minHeight: "calc(100vh - var(--topbar-h, 52px))",
        }}
      />
    </div>
  );
}

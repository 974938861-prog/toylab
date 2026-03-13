export default function StudioPage() {
  return (
    <div className="empty-state" style={{ minHeight: "60vh" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, opacity: 0.4 }}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
      <div className="empty-state-text">工作室功能正在开发中...</div>
      <p style={{ color: "#9ca3af", fontSize: 13, maxWidth: 400, textAlign: "center" }}>
        画布编辑器和积木编程功能将在后续版本中上线，敬请期待！
      </p>
    </div>
  );
}

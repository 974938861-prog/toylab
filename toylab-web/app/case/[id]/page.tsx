"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Case, CaseBomItem, CaseStep, CaseResource, CaseDevLog, Comment } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import BomTable from "@/components/BomTable";
import SopSteps from "@/components/SopSteps";
import CommentSection from "@/components/CommentSection";

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [bomItems, setBomItems] = useState<CaseBomItem[]>([]);
  const [steps, setSteps] = useState<CaseStep[]>([]);
  const [resources, setResources] = useState<CaseResource[]>([]);
  const [devLogs, setDevLogs] = useState<CaseDevLog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => { loadCaseDetail(); loadUser(); }, [caseId]);

  async function loadUser() {
    try {
      const res = await apiFetch("/auth/me");
      if (res.ok) { const { user } = await res.json(); if (user) setUserId(user.id); }
    } catch {}
  }

  async function loadCaseDetail() {
    if (!caseId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${encodeURIComponent(caseId)}`);
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      if (res.ok && data.case) {
        setCaseData(data.case);
        setBomItems(data.bomItems || []);
        setSteps(data.steps || []);
        setResources(data.resources || []);
        setDevLogs(data.devLogs || []);
        setComments(data.comments || []);
      } else {
        setCaseData(null);
      }
    } catch (e) {
      console.error("案例详情加载失败", e);
      setCaseData(null);
    }
    setLoading(false);
  }

  if (loading) return <div className="loading-spinner" style={{ minHeight: "60vh" }} />;
  if (!caseData) return <div className="empty-state" style={{ minHeight: "60vh" }}><div className="empty-state-text">案例未找到</div><button className="lib-btn" onClick={() => router.push("/discover")}>返回发现页</button></div>;

  const creator = caseData.creator;
  const avatarLetter = (creator?.nickname || creator?.username || "U").charAt(0).toUpperCase();
  const avatarColor = creator?.avatar_color || "#7C3AED";

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div className="cd-hero">
        <div className="cd-hero-left"><img src={caseData.cover_url || "/images/placeholder-case.svg"} alt={caseData.title} className="cd-preview-img" /></div>
        <div className="cd-hero-right">
          <h1 className="cd-hero-title">{caseData.title}</h1>
          <div className="cd-hero-designer">
            <span className="inspo-avatar" style={{ background: avatarColor, fontSize: 12, width: 26, height: 26 }}>{avatarLetter}</span>
            <span>{creator?.nickname || creator?.username || "匿名"}</span>
            <span className="cd-hero-stats" style={{ display: "inline-flex", gap: 16, marginLeft: 12 }}>
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{new Date(caseData.created_at).toLocaleDateString()}</span>
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>{(Number(caseData.view_count) || 0).toLocaleString()}</span>
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>{(Number(caseData.sales_count) || 0).toLocaleString()}</span>
            </span>
          </div>
          {caseData.description && <div className="cd-info-inline"><span className="cd-info-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>产品简介</span><span className="cd-info-value">{caseData.description}</span></div>}
          {caseData.estimated_time && <div className="cd-info-inline"><span className="cd-info-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>预计完成时间</span><span className="cd-info-value" style={{ fontWeight: 300 }}>{caseData.estimated_time}</span></div>}
          {caseData.difficulty && <div className="cd-info-inline"><span className="cd-info-label">难度</span><span className="cd-info-value">{caseData.difficulty}</span></div>}
        </div>
      </div>
      <BomTable items={bomItems} />
      <SopSteps steps={steps} />
      {resources.length > 0 && <section className="cd-section"><h2 className="cd-section-title">数字资源</h2><div className="library-table-wrap"><table className="library-table"><thead><tr><th>类型</th><th>名称</th><th>说明</th><th>下载</th></tr></thead><tbody>{resources.map((r) => <tr key={r.id}><td><span className="cd-bom-tag cd-bom-tag--device">{r.resource_type}</span></td><td style={{ fontWeight: 500 }}>{r.name}</td><td style={{ color: "#6b7280", fontSize: 12 }}>{r.description || "—"}</td><td>{r.file_url ? <a href={r.file_url} className="lib-btn" target="_blank" rel="noreferrer">下载</a> : "—"}</td></tr>)}</tbody></table></div></section>}
      {devLogs.length > 0 && <section className="cd-section"><h2 className="cd-section-title">开发日志</h2>{devLogs.map((log) => <div key={log.id} className="devlog-item"><div className="devlog-date">{new Date(log.log_date).toLocaleDateString()}</div><div className="devlog-title">{log.title}</div>{log.content && <div className="devlog-content">{log.content}</div>}</div>)}</section>}
      <CommentSection comments={comments} targetType="case" targetId={caseId} userId={userId} onCommentAdded={(c) => setComments((prev) => [c, ...prev])} />
    </div>
  );
}

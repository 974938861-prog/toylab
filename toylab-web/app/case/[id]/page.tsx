"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const ac = new AbortController();
    // 保底：5 秒后必定结束 loading，防止一直转圈
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setLoadError((e) => (e ? e : "加载超时，请确认 toylab-service 已启动（端口 8001）"));
    }, 5000);
    loadCaseDetail(ac.signal);
    loadUser();
    return () => {
      mountedRef.current = false;
      ac.abort();
      clearTimeout(safetyTimer);
    };
  }, [caseId]);

  async function loadUser() {
    try {
      const res = await apiFetch("/auth/me");
      if (res.ok) { const { user } = await res.json(); if (user) setUserId(user.id); }
    } catch {}
  }

  const [loadError, setLoadError] = useState<string | null>(null);

  const purchaseItems = useMemo(() => bomItems.filter((i) => i.item_type !== "device"), [bomItems]);
  const [bomOwned, setBomOwned] = useState<Record<string, number>>({});
  const [bomBuyQty, setBomBuyQty] = useState<Record<string, number>>({});
  const [bomChecked, setBomChecked] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const q: Record<string, number> = {};
    const c: Record<string, boolean> = {};
    purchaseItems.forEach((i) => {
      q[i.id] = i.required_qty ?? 0;
      c[i.id] = true;
    });
    setBomBuyQty(q);
    setBomChecked(c);
  }, [purchaseItems]);

  async function loadCaseDetail(signal?: AbortSignal) {
    if (!caseId) { setLoading(false); return; }
    setLoading(true);
    setLoadError(null);
    const fallback = setTimeout(() => {
      setLoading(false);
      setLoadError("加载超时，请确认 toylab-service 已启动（端口 8001）");
    }, 5000);
    try {
      const res = await apiFetch(`/cases/${encodeURIComponent(caseId)}`, { signal });
      if (!mountedRef.current) return;
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.case) {
        setCaseData(data.case);
        setBomItems(data.bomItems || []);
        setSteps(data.steps || []);
        setResources(data.resources || []);
        setDevLogs(data.devLogs || []);
        setComments(data.comments || []);
      } else {
        setCaseData(null);
        if (res.status === 404) {
          setLoadError("案例未找到");
        } else if (!res.ok) {
          const msg = typeof data?.detail === "string" ? data.detail : "加载失败，请确认 toylab-service 已启动（端口 8001）";
          setLoadError(msg);
        } else {
          setLoadError("案例未找到");
        }
      }
    } catch (e) {
      if (mountedRef.current) {
        setCaseData(null);
        setLoadError("网络错误，请确认 toylab-service 已启动（端口 8001）");
      }
    } finally {
      clearTimeout(fallback);
      setLoading(false);
    }
  }

  if (loading) return <div className="loading-spinner" style={{ minHeight: "60vh" }} />;
  if (!caseData) return (
    <div className="empty-state" style={{ minHeight: "60vh" }}>
      <div className="empty-state-text">{loadError || "案例未找到"}</div>
      <button className="lib-btn" onClick={() => router.push("/discover")}>返回</button>
    </div>
  );

  const creator = caseData.creator;
  const demoVideoUrl = caseData.demo_video_url ?? steps.find((s) => s.video_url)?.video_url ?? null;
  const equipmentItem = bomItems.find((b) => b.item_type === "device");

  const bomState = {
    owned: bomOwned,
    buyQty: bomBuyQty,
    checked: bomChecked,
    onOwnedChange: (id: string, value: number) => setBomOwned((p) => ({ ...p, [id]: value })),
    onBuyQtyChange: (id: string, value: number) => setBomBuyQty((p) => ({ ...p, [id]: value })),
    onCheckedChange: (id: string, value: boolean) => setBomChecked((p) => ({ ...p, [id]: value })),
  };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {/* 顶部：返回 + 右侧收藏/分享/日期 浏览量 销量 */}
      <div className="cd-topbar">
        <button type="button" className="cd-back" onClick={() => router.push("/discover")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          返回
        </button>
        <div className="cd-topbar-right">
          <button type="button" className="cd-icon-btn" title="收藏"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
          <button type="button" className="cd-icon-btn" title="分享"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.82 3.98M15.41 6.51l-6.82 3.98"/></svg></button>
        </div>
      </div>

      <div className="cd-hero cd-hero--two-col">
        {/* 左栏：仅产品预览图 */}
        <div className="cd-hero-left-col">
          <div className="cd-preview-block">
            <h3 className="cd-preview-title">产品预览图</h3>
            <div className="cd-preview-placeholder">
              占位图,后期替换为可交互3D模型预览
            </div>
          </div>
        </div>

        {/* 右栏：标题、创作者、简介、预计时间、所需设备、材料表、合计、立即购买 */}
        <div className="cd-hero-right-col">
          <div className="cd-hero-right-header">
            <div>
              <h1 className="cd-hero-title">{caseData.title}</h1>
              <div className="cd-hero-designer cd-hero-designer--no-icon">
                {caseData.creator_display_name || creator?.nickname || creator?.username || "TToyLab 官方"}
              </div>
            </div>
            <span className="cd-topbar-stats cd-hero-stats-inline">
              {new Date(caseData.created_at).toLocaleDateString("sv-SE")} {(Number(caseData.view_count) || 0).toLocaleString()} {(Number(caseData.sales_count) || 0).toLocaleString()}
            </span>
          </div>

          {caseData.description && (
            <div className="cd-hero-block">
              <h3 className="cd-preview-title">产品简介</h3>
              <p className="cd-hero-block-value">{caseData.description}</p>
            </div>
          )}
          {caseData.estimated_time && (
            <div className="cd-hero-block">
              <h3 className="cd-preview-title">预计完成时间</h3>
              <p className="cd-hero-block-value">{caseData.estimated_time}</p>
            </div>
          )}

          <div className="cd-equipment-section">
            <h3 className="cd-preview-title">所需制作设备</h3>
            {equipmentItem ? (
              <div className="cd-equipment-card">
                <div className="cd-equipment-info">
                  <div className="cd-equipment-name">{equipmentItem.name}</div>
                </div>
                <a href={equipmentItem.doc_url || "#"} className="cd-equipment-link" target="_blank" rel="noreferrer">了解详情</a>
              </div>
            ) : (
              <div className="cd-equipment-card">
                <div className="cd-equipment-info">
                  <div className="cd-equipment-name">CO2激光切割机</div>
                </div>
                <a href="#" className="cd-equipment-link">了解详情</a>
              </div>
            )}
          </div>

          <div className="cd-bom-in-hero">
            <h3 className="cd-preview-title">物料清单</h3>
            <BomTable items={bomItems} {...bomState} />
          </div>
        </div>
      </div>

      {/* 案例演示视频：全宽，下移 */}
      <section className="cd-section cd-video-full">
        <h2 className="cd-section-title">案例演示视频</h2>
        {demoVideoUrl ? (
          <a href={demoVideoUrl} target="_blank" rel="noreferrer" className="cd-video-placeholder cd-video-placeholder--full">
            <span className="cd-video-play" />
            播放
          </a>
        ) : (
          <div className="cd-video-placeholder cd-video-placeholder--full">
            <span className="cd-video-play" />
          </div>
        )}
      </section>

      {/* 完整物料清单：与右侧物料清单内容一致、表格形式一致，购买数量可编辑且同步 */}
      {bomItems.length > 0 && (
        <section className="cd-section">
          <h2 className="cd-section-title">完整物料清单</h2>
          <BomTable items={bomItems} {...bomState} noSection hideFooter variant="full" />
        </section>
      )}

      {resources.length > 0 && (
        <section className="cd-section">
          <h2 className="cd-section-title">数字文件资源包</h2>
          <div className="library-table-wrap">
            <table className="library-table">
              <thead><tr><th>类型</th><th>名称</th><th>说明</th><th>格式</th><th>下载文档</th></tr></thead>
              <tbody>
                {resources.map((r) => (
                  <tr key={r.id}>
                    <td><span className="cd-bom-tag cd-bom-tag--device">{r.resource_type}</span></td>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td style={{ color: "#6b7280", fontSize: 12 }}>{r.description || "—"}</td>
                    <td style={{ fontSize: 12, color: "#6b7280" }}>—</td>
                    <td>{r.file_url ? <a href={r.file_url} className="lib-btn" target="_blank" rel="noreferrer">可下载</a> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <SopSteps steps={steps} />
      <section className="cd-section cd-designer-story">
        <h2 className="cd-section-title">设计者的故事</h2>
        <div className="cd-designer-story-inner">
          <div className="cd-designer-placeholder">设计师资料 / 团队</div>
          <div className="cd-designer-content">
            <p className="cd-designer-text">
              {caseData.designer_story || caseData.description || "做这个项目是因为想给孩子一个能自己动手做的玩具。我花了三个月时间,从第一版用纸模做的现在这个亚克力版本,每一个按键的弧度都是亲手做的。"}
            </p>
            <div className="cd-designer-author">
              <span className="cd-designer-avatar">T</span>
              <div>
                <div className="cd-designer-name">{caseData.creator_display_name || creator?.nickname || creator?.username || "ToyLab 官方"}</div>
                <div className="cd-designer-bio">ToyLab 社区创建者，已发布 12 个作品</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {devLogs.length > 0 && (
        <section className="cd-section">
          <h2 className="cd-section-title">开发日志</h2>
          <div className="library-table-wrap">
            <table className="library-table">
              <thead>
                <tr>
                  <th>迭代版本</th>
                  <th>日期</th>
                  <th>内容</th>
                </tr>
              </thead>
              <tbody>
                {devLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 500 }}>{log.title}</td>
                    <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>{new Date(log.log_date).toLocaleDateString("sv-SE")}</td>
                    <td style={{ color: "#6b7280", fontSize: 13 }}>{log.content || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <CommentSection comments={comments} targetType="case" targetId={caseId} userId={userId} onCommentAdded={(c) => setComments((prev) => [c, ...prev])} />
    </div>
  );
}

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, apiJson } from "../lib/api";

/** 完整物料清单 - 分类可选值（不含设备） */
const BOM_ITEM_TYPE_OPTIONS = [
  { value: "material", label: "材料" },
  { value: "electronic", label: "电子模块" },
  { value: "mechanical", label: "机械零件" },
];

/** 与 web 发现页左侧分类一一对应，用于案例归属分类（可多选） */
const CASE_CATEGORY_OPTIONS = [
  { slug: "car", label: "玩具车" },
  { slug: "game", label: "游戏机" },
  { slug: "boardgame", label: "桌游" },
  { slug: "pet", label: "宠物玩具" },
  { slug: "tool", label: "工具" },
  { slug: "peripheral", label: "电脑周边" },
  { slug: "appliance", label: "家电" },
  { slug: "lamp", label: "灯具" },
  { slug: "instrument", label: "乐器" },
];

type BomItem = {
  id: string;
  case_id: string;
  item_type: string;
  name: string;
  spec: string | null;
  unit_price: number;
  required_qty: number;
  doc_url: string | null;
  model_url?: string | null;
  sort_order: number;
};

type Step = {
  id: string;
  case_id: string;
  step_number: number;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  duration_minutes: number | null;
};

type Resource = {
  id: string;
  case_id: string;
  resource_type: string;
  name: string;
  file_url: string | null;
  description: string | null;
  sort_order: number;
};

type DevLog = {
  id: string;
  case_id: string;
  title: string;
  content: string | null;
  log_date: string;
  sort_order: number;
};

type CaseData = {
  id: string;
  title: string;
  slug: string;
  creator_id: string;
  creator_display_name?: string | null;
  creator?: { id: string; username?: string; nickname?: string };
  cover_url: string | null;
  description: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  price: number;
  is_free: boolean;
  is_published: boolean;
  designer_story?: string | null;
  demo_video_url?: string | null;
  preview_3d_url?: string | null;
  cover_video_url?: string | null;
  bom_items?: BomItem[];
  steps?: Step[];
  resources?: Resource[];
  dev_logs?: DevLog[];
};

export default function CaseEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<CaseData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [devLogsUnsupported, setDevLogsUnsupported] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState("");
  const pendingCoverVideoUrlRef = useRef<string | null>(null);

  const bomItems = data?.bom_items ?? [];
  const steps = data?.steps ?? [];
  const resources = data?.resources ?? [];
  const devLogs = data?.dev_logs ?? [];

  const selectedSlugs = useMemo(() => {
    if (!data?.slug) return [];
    const parts = data.slug.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.filter((s) => CASE_CATEGORY_OPTIONS.some((o) => o.slug === s));
  }, [data?.slug]);

  function toggleCategory(slug: string) {
    if (!data) return;
    const set = new Set(selectedSlugs);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    setData((d) => (d ? { ...d, slug: Array.from(set).join(",") } : null));
  }

  function setBomItem(index: number, patch: Partial<BomItem>) {
    setData((d) => {
      if (!d) return null;
      const list = [...(d.bom_items ?? [])];
      if (index < 0 || index >= list.length) return d;
      list[index] = { ...list[index], ...patch };
      return { ...d, bom_items: list };
    });
  }

  function addBomRow() {
    setData((d) => {
      if (!d) return null;
      const list = [...(d.bom_items ?? [])];
      const newItem: BomItem = {
        id: `new-${Date.now()}`,
        case_id: d.id,
        item_type: "material",
        name: "",
        spec: null,
        unit_price: 0,
        required_qty: 1,
        doc_url: null,
        model_url: null,
        sort_order: list.length,
      };
      return { ...d, bom_items: [...list, newItem] };
    });
  }

  function removeBomRow(index: number) {
    setData((d) => {
      if (!d) return null;
      const list = [...(d.bom_items ?? [])];
      if (index < 0 || index >= list.length) return d;
      return { ...d, bom_items: list.filter((_, i) => i !== index) };
    });
  }

  function addResourceRow() {
    setData((d) => {
      if (!d) return null;
      const list = [...(d.resources ?? [])];
      const newItem: Resource = {
        id: `new-${Date.now()}`,
        case_id: d.id,
        resource_type: "file",
        name: "",
        file_url: null,
        description: null,
        sort_order: list.length,
      };
      return { ...d, resources: [...list, newItem] };
    });
  }

  function removeResourceRow(index: number) {
    setData((d) => {
      if (!d) return null;
      const list = [...(d.resources ?? [])];
      if (index < 0 || index >= list.length) return d;
      return { ...d, resources: list.filter((_, i) => i !== index) };
    });
  }

  function addStepRow() {
    setData((d) => {
      if (!d) return null;
      const list = [...(d.steps ?? [])];
      const newStep: Step = {
        id: `new-${Date.now()}`,
        case_id: d.id,
        step_number: list.length + 1,
        title: `步骤 ${list.length + 1}`,
        description: null,
        image_url: null,
        video_url: null,
        duration_minutes: null,
      };
      return { ...d, steps: [...list, newStep] };
    });
  }

  function removeStepRow(index: number) {
    setData((d) => {
      if (!d) return null;
      const list = [...(d.steps ?? [])];
      if (index < 0 || index >= list.length) return d;
      const next = list.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_number: i + 1 }));
      return { ...d, steps: next };
    });
  }

  function setStep(index: number, patch: Partial<Step>) {
    setData((d) => {
      if (!d) return null;
      const list = [...(d.steps ?? [])];
      if (index < 0 || index >= list.length) return d;
      list[index] = { ...list[index], ...patch };
      return { ...d, steps: list };
    });
  }

  function setResource(index: number, patch: Partial<Resource>) {
    setData((d) => {
      if (!d) return null;
      const list = [...(d.resources ?? [])];
      if (index < 0 || index >= list.length) return d;
      list[index] = { ...list[index], ...patch };
      return { ...d, resources: list };
    });
  }

  function addDevLogRow() {
    setData((d) => {
      if (!d) return null;
      const list = [...(d.dev_logs ?? [])];
      const today = new Date().toISOString().slice(0, 10);
      const newLog: DevLog = {
        id: `new-${Date.now()}`,
        case_id: d.id,
        title: `v0.${list.length + 1}`,
        content: null,
        log_date: today,
        sort_order: list.length,
      };
      return { ...d, dev_logs: [...list, newLog] };
    });
  }

  function removeDevLogRow(index: number) {
    setData((d) => {
      if (!d) return null;
      const list = [...(d.dev_logs ?? [])];
      if (index < 0 || index >= list.length) return d;
      return { ...d, dev_logs: list.filter((_, i) => i !== index) };
    });
  }

  function setDevLog(index: number, patch: Partial<DevLog>) {
    setData((d) => {
      if (!d) return null;
      const list = [...(d.dev_logs ?? [])];
      if (index < 0 || index >= list.length) return d;
      list[index] = { ...list[index], ...patch };
      return { ...d, dev_logs: list };
    });
  }

  useEffect(() => {
    if (!id) return;
    const url = `/api/admin/cases/${id}?_t=${Date.now()}`;
    apiJson<CaseData>(url, { cache: "no-store" as RequestCache })
      .then((res) => {
        const merged = {
          ...res,
          bom_items: res.bom_items ?? [],
          steps: res.steps ?? [],
          resources: res.resources ?? [],
          dev_logs: res.dev_logs ?? [],
        };
        if (pendingCoverVideoUrlRef.current) {
          merged.cover_video_url = pendingCoverVideoUrlRef.current;
        }
        setData(merged);
      })
      .catch(() => setData(null));
  }, [id]);

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await api("/api/admin/upload/cover", { method: "POST", body: form });
      if (!res.ok) throw new Error("上传失败");
      const { url } = await res.json();
      setData((d) => (d ? { ...d, cover_url: url } : null));
    } catch {
      setError("封面上传失败");
    }
  }

  async function handlePreview3dChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await api("/api/admin/upload/preview-3d", { method: "POST", body: form });
      if (!res.ok) throw new Error("上传失败");
      const { url } = await res.json();
      setData((d) => (d ? { ...d, preview_3d_url: url } : null));
    } catch {
      setError("3D 预览上传失败，请使用 .glb / .gltf / .obj / .stl 格式");
    }
  }

  async function handleDemoVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await api("/api/admin/upload/demo-video", { method: "POST", body: form });
      if (!res.ok) throw new Error("上传失败");
      const { url } = await res.json();
      setData((d) => (d ? { ...d, demo_video_url: url } : null));
    } catch {
      setError("演示视频上传失败，请使用 .mp4 / .webm / .mov 格式");
    }
  }

  async function handleCoverVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    const form = new FormData();
    form.append("file", file);
    setError("");
    const uploadUrl =
      import.meta.env.DEV && typeof window !== "undefined"
        ? "http://127.0.0.1:8001/api/admin/upload/cover-video"
        : "/api/admin/upload/cover-video";
    try {
      const res = await api(uploadUrl, { method: "POST", body: form });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = (body as { detail?: string | string[] }).detail;
        const msg =
          res.status === 404
            ? "封面动态图接口 404：请确认 8001 端口运行的是 toylab-service（在 toylab-service 目录执行 start.bat），不是 toylab-admin。"
            : typeof detail === "string"
              ? detail
              : Array.isArray(detail)
                ? String(detail[0] ?? res.status)
                : `上传失败（${res.status}）`;
        throw new Error(msg || "封面动态图上传失败，请使用 .gif / .mp4 / .webm / .mov 格式");
      }
      const url = (body as { url?: string }).url;
      if (url) {
        pendingCoverVideoUrlRef.current = url;
        setData((d) => (d ? { ...d, cover_video_url: url } : null));
      } else {
        setError("上传成功但未返回地址");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "封面动态图上传失败";
      const isConnectionError =
        msg.includes("fetch") || msg.includes("Failed to fetch") || msg.includes("Connection") || msg.includes("RESET") || msg.includes("network");
      setError(
        isConnectionError
          ? "连接被重置或无法连接。请确认 toylab-service 已启动（toylab-service 目录下 start.bat），且文件不要过大（建议 <10MB）。"
          : msg
      );
    }
    e.target.value = "";
  }

  async function doSave(applyOnly: boolean) {
    if (import.meta.env?.DEV) {
      console.log("[CaseEdit] 保存被触发", { id, hasData: !!data, applyOnly });
    }
    if (!id) {
      setError("缺少案例 ID，请从案例列表进入编辑页");
      return;
    }
    if (!data) return;
    setSaving(true);
    setError("");
    setDevLogsUnsupported(false);
    setAppliedMessage("");
    try {
      const safeSteps = Array.isArray(steps) ? steps.filter((s): s is Step => s != null && typeof s === "object") : [];
      const safeBom = Array.isArray(bomItems) ? bomItems.filter((b): b is BomItem => b != null && typeof b === "object") : [];
      const safeRes = Array.isArray(resources) ? resources.filter((r): r is Resource => r != null && typeof r === "object") : [];
      const safeDevLogs = Array.isArray(devLogs) ? devLogs.filter((l): l is DevLog => l != null && typeof l === "object") : [];

      const payload: Record<string, unknown> = {
        title: data.title,
        slug: data.slug,
        creator_id: data.creator_id,
        creator_display_name: data.creator_display_name ?? null,
        cover_url: data.cover_url,
        description: data.description,
        difficulty: data.difficulty,
        estimated_time: data.estimated_time,
        price: data.price,
        is_free: data.is_free,
        is_published: data.is_published,
        designer_story: data.designer_story ?? null,
        demo_video_url: data.demo_video_url ?? null,
        preview_3d_url: data.preview_3d_url ?? null,
        cover_video_url: data.cover_video_url ?? null,
      };
      payload.bom_items = safeBom.map((b) => ({
        id: b.id ?? "",
        item_type: BOM_ITEM_TYPE_OPTIONS.some((o) => o.value === b.item_type) ? b.item_type : "material",
        name: b.name ?? "",
        required_qty: b.required_qty ?? 1,
        spec: b.spec ?? null,
        doc_url: b.doc_url ?? null,
        model_url: b.model_url ?? null,
      }));
      payload.resources = safeRes.map((r) => ({
        id: r.id ?? "",
        name: r.name ?? "",
        description: r.description ?? null,
        file_url: r.file_url ?? null,
      }));
      payload.steps = safeSteps.map((s, i) => ({
        id: s.id ?? `new-${Date.now()}-${i}`,
        step_number: i,
        title: `步骤 ${i + 1}`,
        description: s.description ?? null,
        image_url: s.image_url ?? null,
        video_url: s.video_url ?? null,
      }));
      payload.dev_logs = safeDevLogs.map((log, i) => ({
        id: log.id ?? `new-${Date.now()}-${i}`,
        title: `v0.${i + 1}`,
        content: log.content ?? null,
        log_date: log.log_date || new Date().toISOString().slice(0, 10),
        sort_order: i,
      }));

      const url = `/api/admin/cases/${id}`;
      const bodyStr = JSON.stringify(payload);
      if (import.meta.env?.DEV) {
        console.log("[CaseEdit] 即将发送 PUT 请求", url, "steps 条数:", (payload.steps as unknown[])?.length);
      }
      const res = await api(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
      });
      const resBody = await res.json().catch(() => ({}));
      if (import.meta.env?.DEV) {
        console.log("[CaseEdit] PUT 案例响应", res.status, res.ok ? "成功" : "失败");
      }
      if (!res.ok) {
        const detail = (resBody as { detail?: string | string[] | { msg?: string; loc?: unknown }[] }).detail;
        let msgStr: string;
        if (res.status === 404) {
          msgStr = "接口未找到(404)。请确认已启动 toylab-service（端口 8001）且为最新版本。";
        } else if (Array.isArray(detail)) {
          const first = detail[0];
          if (first && typeof first === "object" && "msg" in first) {
            msgStr = (first as { msg?: string }).msg ?? JSON.stringify(detail);
          } else {
            msgStr = typeof detail[0] === "string" ? detail[0] : JSON.stringify(detail);
          }
        } else {
          msgStr = typeof detail === "string" ? detail : `保存失败（${res.status}）`;
        }
        if (import.meta.env?.DEV) {
          console.error("[CaseEdit] 保存失败", res.status, url, resBody);
        }
        throw new Error(msgStr || `保存失败（${res.status}）`);
      }
      const stepsPayload = payload.steps as { id?: string; step_number?: number; title?: string; description?: string | null; image_url?: string | null; video_url?: string | null }[];
      const stepsRes = await api(`${url}/steps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: stepsPayload }),
      });
      const stepsBody = await stepsRes.json().catch(() => ({}));
      if (!stepsRes.ok) {
        const msg =
          stepsRes.status === 404
            ? "步骤接口未找到(404)。请确认 toylab-service 已更新并重启（端口 8001）。"
            : (stepsBody as { detail?: string })?.detail || `步骤保存失败（${stepsRes.status}）`;
        if (import.meta.env?.DEV) {
          console.error("[CaseEdit] 步骤保存失败", stepsRes.status, stepsBody);
        }
        throw new Error(msg);
      }
      if (import.meta.env?.DEV && Array.isArray((stepsBody as { steps?: unknown[] }).steps)) {
        console.log("[CaseEdit] 步骤已保存，条数:", (stepsBody as { steps: unknown[] }).steps.length);
      }
      const devLogsPayload = safeDevLogs.map((log, i) => ({
        id: log.id ?? `new-${Date.now()}-${i}`,
        title: `v0.${i + 1}`,
        content: log.content ?? null,
        log_date: log.log_date || new Date().toISOString().slice(0, 10),
        sort_order: i,
      }));
      const devLogsRes = await api(`${url}/dev_logs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dev_logs: devLogsPayload }),
      });
      const devLogsBody = await devLogsRes.json().catch(() => ({}));
      if (!devLogsRes.ok) {
        if (devLogsRes.status === 404) {
          if (safeDevLogs.length > 0) {
            setDevLogsUnsupported(true);
            setError(
              "案例与步骤已保存，但开发日志未保存（当前后端无此接口）。请用 toylab-service 启动后端：进入项目 toylab-service 目录，双击 start.bat 或执行 python -m uvicorn app.main:app --host 127.0.0.1 --port 8001，重启后再保存。"
            );
            return;
          }
          if (import.meta.env?.DEV) {
            console.warn("[CaseEdit] 开发日志独立接口 404，无开发日志行可保存");
          }
        } else {
          const msg = (devLogsBody as { detail?: string })?.detail || `开发日志保存失败（${devLogsRes.status}）`;
          if (import.meta.env?.DEV) {
            console.error("[CaseEdit] 开发日志保存失败", devLogsRes.status, devLogsBody);
          }
          throw new Error(msg);
        }
      } else if (import.meta.env?.DEV && Array.isArray((devLogsBody as { dev_logs?: unknown[] }).dev_logs)) {
        console.log("[CaseEdit] 开发日志已保存，条数:", (devLogsBody as { dev_logs: unknown[] }).dev_logs.length);
      }
      if (applyOnly) {
        setError("");
        setDevLogsUnsupported(false);
        setAppliedMessage("已应用");
        setTimeout(() => setAppliedMessage(""), 2000);
        pendingCoverVideoUrlRef.current = null;
        const updated = resBody as CaseData;
        if (updated && typeof updated === "object") {
          setData({
            ...updated,
            bom_items: Array.isArray(updated.bom_items) ? updated.bom_items : (data?.bom_items ?? []),
            steps: Array.isArray(updated.steps) ? updated.steps : (data?.steps ?? []),
            resources: Array.isArray(updated.resources) ? updated.resources : (data?.resources ?? []),
            dev_logs: Array.isArray(updated.dev_logs) ? updated.dev_logs : (data?.dev_logs ?? []),
          });
        }
      } else {
        navigate("/cases");
      }
    } catch (err) {
      const msg = String(err instanceof Error ? err.message : "保存失败");
      const isNetworkError =
        msg === "Failed to fetch" ||
        msg.includes("fetch") ||
        msg.toLowerCase().includes("aborted") ||
        (err instanceof TypeError && String((err as Error).message || "").includes("fetch"));
      const displayMsg = isNetworkError
        ? "无法连接服务器，请确认 toylab-service 已启动（端口 8001）。参见项目根目录「调试入口.md」。"
        : msg;
      setError(displayMsg);
      if (import.meta.env?.DEV) {
        console.error("[CaseEdit] 保存异常", err);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await doSave(false);
  }

  const equipmentItemIndex = bomItems.findIndex((b) => b.item_type === "device");
  const equipmentItem = equipmentItemIndex >= 0 ? bomItems[equipmentItemIndex] : null;

  if (!data) return <div className="container">加载中...</div>;

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>编辑案例</h1>
        {error && (
          <p style={{ color: "#dc2626", marginBottom: "1rem", padding: "0.75rem", background: "#fef2f2", borderRadius: "6px" }}>
            {error}
          </p>
        )}
        <form id="case-edit-form" onSubmit={handleSubmit}>
          {/* ═══ 一级：编辑卡片 ═══ */}
          <h2 className="form-h1">编辑卡片</h2>
          <p className="form-h1-desc">发现页案例卡片展示内容</p>

          <section className="form-subsection">
            <h3 className="form-section-title">案例名称与创作者</h3>
            <div className="form-row">
              <label>案例名称</label>
              <input
                value={data.title}
                onChange={(e) => setData((d) => (d ? { ...d, title: e.target.value } : null))}
                required
              />
            </div>
            <div className="form-row">
              <label>创作者名称</label>
              <input
                value={data.creator_display_name ?? data.creator?.nickname ?? data.creator?.username ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, creator_display_name: e.target.value || null } : null))}
                placeholder="展示在案例卡片与详情页的创作者名称"
              />
              <span className="form-hint">仅用于展示，不修改用户账号。创作者 ID 已隐藏。</span>
            </div>
            <div className="form-row">
              <label>发布状态</label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={!!data.is_published}
                  onChange={(e) => setData((d) => (d ? { ...d, is_published: e.target.checked } : null))}
                />
                <span>{data.is_published ? "已发布（web 发现页可见）" : "草稿（仅管理端可见）"}</span>
              </label>
              <span className="form-hint">勾选后保存，案例将出现在 web 发现页；取消勾选则隐藏。</span>
            </div>
          </section>

          <section className="form-subsection">
            <h3 className="form-section-title">封面预览图</h3>
            <div className="form-row">
              <label>上传封面</label>
              <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={handleCoverChange} />
              <span className="form-hint">选择图片后自动上传，留空保留当前封面。</span>
            </div>
            {data.cover_url && (
              <div className="form-row">
                <label>当前封面</label>
                <img src={data.cover_url} alt="封面" className="cover-preview" />
              </div>
            )}
          </section>

          <section className="form-subsection">
            <h3 className="form-section-title">案例分类</h3>
            <div className="form-row">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem" }}>
                {CASE_CATEGORY_OPTIONS.map((opt) => (
                  <label key={opt.slug} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedSlugs.includes(opt.slug)}
                      onChange={() => toggleCategory(opt.slug)}
                    />
                    <span style={{ marginLeft: "0.35rem" }}>{opt.label}</span>
                  </label>
                ))}
              </div>
              <span className="form-hint">勾选后在 web 发现页对应分类下展示。</span>
            </div>
          </section>

          <section className="form-subsection">
            <h3 className="form-section-title">封面动态图</h3>
            <div className="form-row">
              <label>上传封面动态图</label>
              <input
                type="file"
                accept=".gif,.mp4,.webm,.mov"
                onChange={handleCoverVideoChange}
              />
              <span className="form-hint">支持 .gif / .mp4 / .webm / .mov。发现页鼠标悬停案例卡片时播放。</span>
            </div>
            {data.cover_video_url && (
              <div className="form-row">
                <label>当前封面动态图</label>
                <div style={{ maxWidth: 320, maxHeight: 180, overflow: "hidden", borderRadius: 6, border: "1px solid #e5e7eb" }}>
                  {data.cover_video_url.toLowerCase().endsWith(".gif") ? (
                    <img src={data.cover_video_url} alt="封面动态图" style={{ width: "100%", height: "auto", display: "block" }} />
                  ) : (
                    <video src={data.cover_video_url} style={{ width: "100%", height: "auto", display: "block" }} muted loop playsInline />
                  )}
                </div>
                <button type="button" className="btn" onClick={() => { pendingCoverVideoUrlRef.current = null; setData((d) => (d ? { ...d, cover_video_url: null } : null)); }} style={{ marginTop: "0.5rem" }}>
                  清除
                </button>
              </div>
            )}
          </section>

          {/* ═══ 一级：编辑详情页 ═══ */}
          <h2 className="form-h1">编辑详情页</h2>
          <p className="form-h1-desc">案例详情页展示内容</p>

          <section className="form-subsection">
            <h3 className="form-section-title">产品 3D 预览图（可上传本地文档）</h3>
            <div className="form-row">
              <label>上传 3D 文件</label>
              <input
                type="file"
                accept=".glb,.gltf,.obj,.stl"
                onChange={handlePreview3dChange}
              />
              <span className="form-hint">支持 .glb / .gltf / .obj / .stl，上传后自动填入地址。</span>
            </div>
            <div className="form-row">
              <label>或填写 3D 预览地址</label>
              <input
                type="url"
                value={data.preview_3d_url ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, preview_3d_url: e.target.value || null } : null))}
                placeholder="https://... 或 /uploads/cases/preview_3d/xxx.glb"
              />
            </div>
          </section>

          <section className="form-subsection">
            <h3 className="form-section-title">产品简介</h3>
            <div className="form-row">
              <textarea
                value={data.description ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, description: e.target.value } : null))}
                rows={4}
              />
            </div>
          </section>

          <section className="form-subsection">
            <h3 className="form-section-title">预计完成时间</h3>
            <div className="form-row">
              <input
                value={data.estimated_time ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, estimated_time: e.target.value } : null))}
                placeholder="例如：约 2 小时"
              />
            </div>
          </section>

          <section className="form-subsection">
            <h3 className="form-section-title">所需要的制作设备</h3>
            {equipmentItem ? (
              <>
                <div className="form-row">
                  <label>设备名称</label>
                  <input
                    value={equipmentItem.name}
                    onChange={(e) => setBomItem(equipmentItemIndex, { name: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <label>了解详情链接</label>
                  <input
                    type="url"
                    value={equipmentItem.doc_url ?? ""}
                    onChange={(e) => setBomItem(equipmentItemIndex, { doc_url: e.target.value || null })}
                    placeholder="https://..."
                  />
                </div>
              </>
            ) : (
              <p style={{ color: "#6b7280" }}>暂无设备项（需在物料清单中存在类型为「设备」的条目）。</p>
            )}
          </section>

          <section className="form-subsection">
            <h3 className="form-section-title">案例演示视频图（可上传本地文档）</h3>
            <div className="form-row">
              <label>上传视频</label>
              <input
                type="file"
                accept=".mp4,.webm,.mov"
                onChange={handleDemoVideoChange}
              />
              <span className="form-hint">支持 .mp4 / .webm / .mov，上传后自动填入地址。</span>
            </div>
            <div className="form-row">
              <label>或填写视频地址</label>
              <input
                type="url"
                value={data.demo_video_url ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, demo_video_url: e.target.value || null } : null))}
                placeholder="https://... 或 /uploads/cases/demo_video/xxx.mp4"
              />
            </div>
          </section>

          <section className="form-subsection">
            <h3 className="form-section-title">完整物料清单</h3>
            <span className="form-hint" style={{ display: "block", marginBottom: "0.5rem" }}>
              可编辑：分类、名称、需要数量、规格参数、规格书、模型下载；支持新增行与删除行。分类可选：材料、电子模块、机械零件。
            </span>
            <div style={{ overflowX: "auto" }}>
              <table className="form-table">
                <thead>
                  <tr>
                    <th>分类</th>
                    <th>名称</th>
                    <th>需要数量</th>
                    <th>规格参数</th>
                    <th>规格书</th>
                    <th>模型下载</th>
                    <th style={{ width: "72px" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {bomItems.map((b, i) => (
                    <tr key={b.id}>
                      <td>
                        <select
                          value={BOM_ITEM_TYPE_OPTIONS.some((o) => o.value === b.item_type) ? b.item_type : "material"}
                          onChange={(e) => setBomItem(i, { item_type: e.target.value })}
                          style={{ minWidth: "100px" }}
                        >
                          {BOM_ITEM_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input value={b.name} onChange={(e) => setBomItem(i, { name: e.target.value })} style={{ width: "100%", minWidth: "100px" }} />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={b.required_qty}
                          onChange={(e) => setBomItem(i, { required_qty: parseInt(e.target.value, 10) || 0 })}
                          style={{ width: "70px" }}
                        />
                      </td>
                      <td>
                        <input value={b.spec ?? ""} onChange={(e) => setBomItem(i, { spec: e.target.value || null })} style={{ width: "100%", minWidth: "100px" }} />
                      </td>
                      <td>
                        <input type="url" value={b.doc_url ?? ""} onChange={(e) => setBomItem(i, { doc_url: e.target.value || null })} placeholder="链接" style={{ width: "100%", minWidth: "120px" }} />
                      </td>
                      <td>
                        <input type="url" value={b.model_url ?? ""} onChange={(e) => setBomItem(i, { model_url: e.target.value || null })} placeholder="链接" style={{ width: "100%", minWidth: "120px" }} />
                      </td>
                      <td>
                        <button type="button" className="btn" onClick={() => removeBomRow(i)} style={{ padding: "0.25rem 0.5rem", fontSize: "12px" }}>
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="btn" onClick={addBomRow} style={{ marginTop: "0.5rem" }}>
                + 新增一行
              </button>
            </div>
          </section>

          <section className="form-subsection">
            <h3 className="form-section-title">数字文件资源包</h3>
            <span className="form-hint" style={{ display: "block", marginBottom: "0.5rem" }}>
              可编辑：名称、说明、下载文档；支持新增行与删除行。保存后 web 案例详情页会同步显示。
            </span>
            <div style={{ overflowX: "auto" }}>
              <table className="form-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>说明</th>
                    <th>下载文档</th>
                    <th style={{ width: "72px" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r, i) => (
                    <tr key={r.id}>
                      <td>
                        <input value={r.name} onChange={(e) => setResource(i, { name: e.target.value })} style={{ width: "100%", minWidth: "100px" }} />
                      </td>
                      <td>
                        <input value={r.description ?? ""} onChange={(e) => setResource(i, { description: e.target.value || null })} style={{ width: "100%", minWidth: "120px" }} />
                      </td>
                      <td>
                        <input type="url" value={r.file_url ?? ""} onChange={(e) => setResource(i, { file_url: e.target.value || null })} placeholder="链接" style={{ width: "100%", minWidth: "140px" }} />
                      </td>
                      <td>
                        <button type="button" className="btn" onClick={() => removeResourceRow(i)} style={{ padding: "0.25rem 0.5rem", fontSize: "12px" }}>
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="btn" onClick={addResourceRow} style={{ marginTop: "0.5rem" }}>
                + 新增一行
              </button>
            </div>
          </section>

          <section className="form-subsection">
            <h3 className="form-section-title">制作步骤</h3>
            <span className="form-hint" style={{ display: "block", marginBottom: "0.5rem" }}>
              每步仅需：内容说明、上传图片或视频。支持新增步骤与删除步骤。
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {steps.map((s, i) => (
                <div key={s.id} className="form-block" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <strong>步骤 {i + 1}</strong>
                    <button type="button" className="btn" onClick={() => removeStepRow(i)} style={{ padding: "0.25rem 0.5rem", fontSize: "12px" }}>
                      删除
                    </button>
                  </div>
                  <div className="form-row">
                    <label>内容说明</label>
                    <textarea value={s.description ?? ""} onChange={(e) => setStep(i, { description: e.target.value || null })} rows={3} placeholder="本步骤的文字说明" />
                  </div>
                  <div className="form-row">
                    <label>上传图片或视频</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <input type="url" value={s.image_url ?? ""} onChange={(e) => setStep(i, { image_url: e.target.value || null })} placeholder="图片 URL（选填）" />
                      <input type="url" value={s.video_url ?? ""} onChange={(e) => setStep(i, { video_url: e.target.value || null })} placeholder="视频 URL（选填）" />
                    </div>
                    <span className="form-hint">填写图片或视频链接，二选一或都填均可。</span>
                  </div>
                </div>
              ))}
              <button type="button" className="btn" onClick={addStepRow}>
                + 新增一步
              </button>
            </div>
          </section>

          <section className="form-subsection">
            <h3 className="form-section-title">设计者故事</h3>
            <div className="form-row">
              <textarea
                value={data.designer_story ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, designer_story: e.target.value || null } : null))}
                rows={5}
                placeholder="设计者的故事正文，展示在案例详情页「设计者的故事」区域。"
              />
            </div>
          </section>

          {/* 开发日志（与 web 案例详情页一致：迭代版本、日期、内容） */}
          <section className="form-subsection" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
            <h3 className="form-section-title">开发日志</h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: "0.75rem" }}>
              迭代版本自动生成、不可编辑：第一行 v0.1，第二行 v0.2，依次类推。可增删行，填写日期与内容即可。
            </p>
            <div style={{ overflowX: "auto" }}>
              <table className="form-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ width: 90, textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>迭代版本</th>
                    <th style={{ width: 140, textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>日期</th>
                    <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>内容</th>
                    <th style={{ width: 70, padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {devLogs.map((log, i) => (
                    <tr key={log.id}>
                      <td style={{ padding: "6px 8px", verticalAlign: "top", fontWeight: 500 }}>v0.{i + 1}</td>
                      <td style={{ padding: "6px 8px", verticalAlign: "top" }}>
                        <input
                          type="date"
                          value={log.log_date || ""}
                          onChange={(e) => setDevLog(i, { log_date: e.target.value })}
                          style={{ width: "100%", padding: "4px 6px" }}
                        />
                      </td>
                      <td style={{ padding: "6px 8px", verticalAlign: "top" }}>
                        <textarea
                          value={log.content ?? ""}
                          onChange={(e) => setDevLog(i, { content: e.target.value || null })}
                          rows={2}
                          placeholder="日志内容"
                          style={{ width: "100%", padding: "4px 6px", resize: "vertical" }}
                        />
                      </td>
                      <td style={{ padding: "6px 8px", verticalAlign: "top" }}>
                        <button type="button" className="btn" onClick={() => removeDevLogRow(i)} style={{ padding: "4px 8px", fontSize: 13 }}>
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="btn" onClick={addDevLogRow} style={{ marginTop: "0.5rem" }}>
              新增一行
            </button>
          </section>

          {error && (
            <p style={{ color: "#dc2626", marginBottom: "1rem" }}>
              {error}
              {devLogsUnsupported && (
                <span style={{ display: "block", marginTop: "0.5rem" }}>
                  <Link to="/cases" className="btn" style={{ marginRight: "0.5rem" }}>
                    仍要返回列表
                  </Link>
                </span>
              )}
            </p>
          )}
        </form>
        <div
          style={{
            marginTop: "1.5rem",
            marginLeft: "-1.5rem",
            marginRight: "-1.5rem",
            marginBottom: "-1.5rem",
            padding: "1rem 1.5rem",
            background: "#fff",
            borderTop: "1px solid #e5e7eb",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap", gap: "0.5rem" }}>
            <button
              type="submit"
              form="case-edit-form"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              className="btn"
              disabled={saving}
              onClick={() => doSave(true)}
            >
              {saving ? "保存中..." : "应用"}
            </button>
            <Link to="/cases" className="btn">
              取消
            </Link>
            {appliedMessage && (
              <span style={{ color: "#16a34a", fontSize: 14 }}>{appliedMessage}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

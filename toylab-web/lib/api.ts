const TOKEN_KEY = "toylab_token";
const FETCH_TIMEOUT_MS = 12000;
/** 案例接口超时（超时后结束转圈并提示） */
const CASE_FETCH_TIMEOUT_MS = 8000;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  const externalSignal = options.signal;
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(t);
      return Promise.reject(new DOMException("Aborted", "AbortError"));
    }
    externalSignal.addEventListener("abort", () => {
      clearTimeout(t);
      ctrl.abort();
    });
  }
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(t));
}

/** 后端直连地址（.env.local 中 NEXT_PUBLIC_API_URL），直连时可避免 Next 代理异常 */
function getApiBase(): string {
  if (typeof window === "undefined") return "";
  const u = process.env.NEXT_PUBLIC_API_URL;
  return u ? String(u).replace(/\/$/, "") : "";
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const base = getApiBase();
  let url = base ? `${base}/api${path}` : `/api${path}`;
  // 案例列表与详情禁用缓存并加时间戳，确保编辑后刷新能看到最新数据
  const isCaseRequest = path.startsWith("/cases");
  if (isCaseRequest) {
    const sep = path.includes("?") ? "&" : "?";
    url += `${sep}_t=${Date.now()}`;
  }
  const opts = isCaseRequest ? { ...options, cache: "no-store" as RequestCache } : options;
  const timeout = isCaseRequest ? CASE_FETCH_TIMEOUT_MS : FETCH_TIMEOUT_MS;
  return fetchWithTimeout(url, { ...opts, headers }, timeout);
}

/** 上传文件（封面等）由 service 提供，相对路径需拼上 origin 才能加载 */
const UPLOAD_ORIGIN =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_UPLOAD_ORIGIN) ||
  "http://localhost:8001";

/**
 * 解析封面图地址：相对路径 /uploads/... 转为从 service 直连的完整 URL，确保能显示 admin 上传的图
 */
export function getCoverUrl(coverUrl: string | null | undefined): string {
  if (!coverUrl || !coverUrl.trim()) return "";
  const u = coverUrl.trim();
  if (u.startsWith("/uploads/")) return `${UPLOAD_ORIGIN}${u}`;
  return u;
}

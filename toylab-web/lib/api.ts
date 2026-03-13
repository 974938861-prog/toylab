const TOKEN_KEY = "toylab_token";
const FETCH_TIMEOUT_MS = 12000;

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
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(t));
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
  return fetchWithTimeout(`/api${path}`, { ...options, headers });
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isSignUp ? "/api/auth/register" : "/api/auth/login";
      const body = isSignUp ? { email, password, username } : { email, password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: { token?: string; detail?: string; error?: string } = {};
      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch {
          setError("服务器返回格式异常，请稍后重试");
          setLoading(false);
          return;
        }
      } else {
        const text = await res.text();
        if (res.status >= 500) {
          setError("业务服务暂时不可用，请确认 toylab-service 已启动（端口 8001）");
        } else if (text) {
          setError(text.slice(0, 100));
        } else {
          setError(`请求失败 (${res.status})`);
        }
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.detail || data.error || "操作失败");
      } else {
        setToken(data.token!);
        router.push("/discover");
        router.refresh();
      }
    } catch (err) {
      setError(`连接错误: ${err instanceof Error ? err.message : String(err)}。请确认 toylab-service 已启动。`);
    }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">{isSignUp ? "注册" : "登录"} ToyLab</h2>
        <p className="login-subtitle">
          {isSignUp ? "创建你的账号，开始创造之旅" : "欢迎回来，继续你的创造之旅"}
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="login-field">
              <label className="login-label">用户名</label>
              <input type="text" className="login-input" placeholder="输入用户名"
                value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
          )}
          <div className="login-field">
            <label className="login-label">邮箱</label>
            <input type="email" className="login-input" placeholder="your@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="login-field">
            <label className="login-label">密码</label>
            <input type="password" className="login-input" placeholder="输入密码"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "处理中..." : isSignUp ? "注册" : "登录"}
          </button>
        </form>

        <div className="login-toggle">
          {isSignUp ? "已有账号？" : "没有账号？"}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }}>
            {isSignUp ? "去登录" : "去注册"}
          </button>
        </div>
      </div>
    </div>
  );
}

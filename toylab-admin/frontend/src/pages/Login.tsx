import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.detail || "登录失败");
      return;
    }
    if (data.token) {
      setToken(data.token);
      if (data.user && data.user.role !== "admin") {
        setError("需要管理员账号登录");
        return;
      }
      navigate("/", { replace: true });
    } else {
      setError("登录失败");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: "4rem" }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>ToyLab 管理后台</h1>
        <p style={{ color: "#64748b" }}>请使用管理员账号登录</p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error ? <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p> : null}
          <button type="submit" className="btn btn-primary">登录</button>
        </form>
      </div>
    </div>
  );
}

"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import type { Project, UserPart } from "@/lib/types";

type TabType = "projects" | "modules";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [userParts, setUserParts] = useState<UserPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("projects");
  const [userId, setUserId] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const userRes = await fetch("/api/auth/me");
      const { user } = await userRes.json();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.projects) setProjects(data.projects as Project[]);
      if (data.userParts) setUserParts(data.userParts as UserPart[]);
    } catch {}
    setLoading(false);
  }

  async function createProject() {
    if (!userId || !newProjectName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setProjects((prev) => [data as Project, ...prev]);
        setNewProjectName("");
        setShowNewProject(false);
      }
    } catch {}
    setCreating(false);
  }

  async function deleteProject(id: string) {
    await fetch("/api/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return <div className="loading-spinner" style={{ minHeight: "60vh" }} />;

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div className="library-page-inner">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 className="library-page-title">我的作品库</h2>
        </div>

        <div className="lib-tabs">
          <button
            className={`lib-tab ${tab === "projects" ? "lib-tab--active" : ""}`}
            onClick={() => setTab("projects")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>
            我的项目
          </button>
          <button
            className={`lib-tab ${tab === "modules" ? "lib-tab--active" : ""}`}
            onClick={() => setTab("modules")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            我的模块
          </button>
        </div>

        {tab === "projects" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              {showNewProject ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    className="login-input"
                    style={{ width: 200, padding: "6px 12px" }}
                    placeholder="项目名称"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createProject()}
                    autoFocus
                  />
                  <button className="library-action-btn" onClick={createProject} disabled={creating}>
                    {creating ? "创建中..." : "创建"}
                  </button>
                  <button className="lib-btn" onClick={() => setShowNewProject(false)}>取消</button>
                </div>
              ) : (
                <button className="library-action-btn" onClick={() => setShowNewProject(true)}>
                  + 新建项目
                </button>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/></svg>
                <div className="empty-state-text">暂无项目，点击上方创建一个吧！</div>
              </div>
            ) : (
              <div className="lib-projects-grid">
                {projects.map((project) => (
                  <article key={project.id} className="lib-project-card">
                    <div
                      className="lib-project-cover"
                      style={
                        project.cover_url
                          ? { backgroundImage: `url(${project.cover_url})`, backgroundSize: "cover" }
                          : {}
                      }
                    >
                      <div style={{ position: "absolute", top: 8, right: 8 }}>
                        <button
                          className="lib-btn"
                          style={{ background: "rgba(255,59,48,0.15)", color: "#FF3B30", fontSize: 11 }}
                          onClick={() => deleteProject(project.id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="lib-project-body">
                      <div className="lib-project-name">{project.name}</div>
                      <div className="lib-project-date">
                        最近更新：{new Date(project.updated_at).toLocaleDateString()}
                      </div>
                      <div className="lib-project-footer">
                        <button className="lib-btn">打开</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "modules" && (
          <>
            {userParts.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                <div className="empty-state-text">暂无模块</div>
              </div>
            ) : (
              <div className="library-table-wrap">
                <table className="library-table">
                  <thead>
                    <tr>
                      <th>模块名称</th>
                      <th>数量</th>
                      <th>添加日期</th>
                      <th>上次使用项目</th>
                      <th>规格参数</th>
                      <th>固件版本</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userParts.map((part) => (
                      <tr key={part.id}>
                        <td style={{ fontWeight: 500 }}>{part.product?.name || "—"}</td>
                        <td><span className="lib-count">{part.quantity}</span></td>
                        <td style={{ color: "#6b7280", fontSize: 12 }}>{new Date(part.added_at).toLocaleDateString()}</td>
                        <td>{part.last_used_project || "—"}</td>
                        <td style={{ fontSize: 12, color: "#6b7280" }}>{part.product?.spec || "—"}</td>
                        <td>{part.firmware_version || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

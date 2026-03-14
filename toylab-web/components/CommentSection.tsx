"use client";

import { useState } from "react";
import type { Comment } from "@/lib/types";
import { apiFetch } from "@/lib/api";

interface CommentSectionProps {
  comments: Comment[];
  targetType: string;
  targetId: string;
  userId: string | null;
  onCommentAdded: (comment: Comment) => void;
}

export default function CommentSection({ comments, targetType, targetId, userId, onCommentAdded }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !content.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiFetch("/comments", {
        method: "POST",
        body: JSON.stringify({ target_type: targetType, target_id: targetId, content: content.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.id) { onCommentAdded(data as Comment); setContent(""); }
    } catch {}
    setSubmitting(false);
  }

  return (
    <section className="cd-section">
      <h2 className="cd-section-title">大家都在说</h2>
      {userId && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <input type="text" className="comment-input" placeholder="发表评论..." value={content} onChange={(e) => setContent(e.target.value)} />
          <button type="submit" className="comment-submit" disabled={submitting || !content.trim()}>{submitting ? "发送中..." : "发送"}</button>
        </form>
      )}
      {comments.length === 0 ? (
        <div style={{ padding: "20px 0", color: "#9ca3af", fontSize: 13 }}>暂无评论，快来抢沙发吧！</div>
      ) : comments.map((c) => {
        const user = c.user;
        const letter = (user?.nickname || user?.username || "U").charAt(0).toUpperCase();
        const color = user?.avatar_color || "#7C3AED";
        return (
          <div key={c.id} className="comment-item">
            <div className="comment-avatar" style={{ background: color }}>{letter}</div>
            <div className="comment-body">
              <div className="comment-header"><span className="comment-author">{user?.nickname || user?.username || "匿名"}</span><span className="comment-time">{new Date(c.created_at).toLocaleDateString()}</span></div>
              <div className="comment-text">{c.content}</div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

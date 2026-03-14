"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { Case } from "@/lib/types";
const PLACEHOLDER = "/images/placeholder-case.svg";

interface CaseCardProps {
  case_: Case;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

const coverMediaStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
};

export default function CaseCard({ case_, onFavorite, isFavorited }: CaseCardProps) {
  const [coverError, setCoverError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const creator = case_.creator;
  const coverSrc =
    coverError || !case_.cover_url ? PLACEHOLDER : case_.cover_url;
  const hasCoverVideo = !!case_.cover_video_url;
  const isGif = hasCoverVideo && case_.cover_video_url!.toLowerCase().endsWith(".gif");

  return (
    <Link href={`/case/${case_.id}`} className="inspo-card" style={{ textDecoration: "none" }} prefetch={false}>
      <div
        className="inspo-card-img"
        style={{ position: "relative", overflow: "hidden" }}
        onMouseEnter={() => {
          setIsHovered(true);
          if (hasCoverVideo && !isGif && videoRef.current) videoRef.current.play();
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          if (hasCoverVideo && !isGif && videoRef.current) videoRef.current.pause();
        }}
      >
        <img
          src={coverSrc}
          alt=""
          className="inspo-card-img-cover"
          style={{
            ...coverMediaStyle,
            opacity: isHovered && hasCoverVideo ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
          onError={() => setCoverError(true)}
        />
        {hasCoverVideo && isHovered && (
          <>
            {isGif ? (
              <img
                src={case_.cover_video_url!}
                alt=""
                className="inspo-card-img-cover"
                style={coverMediaStyle}
              />
            ) : (
              <video
                ref={videoRef}
                src={case_.cover_video_url!}
                muted
                loop
                playsInline
                className="inspo-card-img-cover"
                style={coverMediaStyle}
              />
            )}
          </>
        )}
        <button
          className={`inspo-fav-btn ${isFavorited ? "active" : ""}`}
          title="收藏"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite?.(case_.id);
          }}
        >
          <svg viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="inspo-card-body">
        <div className="inspo-card-info">
          <div className="inspo-card-info-left">
            <div className="inspo-card-title">{case_.title}</div>
            <div className="inspo-card-designer">
              {case_.creator_display_name || creator?.nickname || creator?.username || "匿名"}
            </div>
          </div>
          <div className="inspo-card-info-right">
            {!case_.is_free && case_.price > 0 && (
              <span className="inspo-card-price">${case_.price}</span>
            )}
            {case_.is_free && (
              <span className="inspo-card-price free">免费</span>
            )}
            <div className="inspo-card-stats">
              <span className="inspo-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                <span className="inspo-stat-value">{case_.sales_count.toLocaleString()}</span>
              </span>
              <span className="inspo-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                <span className="inspo-stat-value">{case_.view_count.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/discover", label: "发现", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg> },
  { href: "/shop", label: "零件商城", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { href: "/studio", label: "工作室", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
  { href: "/projects", label: "我的作品库", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg> },
];

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (user) setProfile(user as Profile);
      })
      .catch(() => {});
  }, [pathname]);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setProfile(null);
    router.push("/discover");
    router.refresh();
  };

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <Link href="/discover" className="app-logo" aria-label="ToyLab Home">
          <svg className="app-logo-svg" viewBox="0 0 403.12 371.64" fill="currentColor">
            <g><g>
              <path d="M206.79,338.16H134.24c0-5.18.41-10.25-.12-15.21A61.65,61.65,0,0,0,131,308.74a50.42,50.42,0,0,0-20.43-26c-17.12-11.05-34.72-11.26-52.26-1.67A49.67,49.67,0,0,0,38,302.59a53.54,53.54,0,0,0-5.88,28.83,7.67,7.67,0,0,1-.16,1,59.56,59.56,0,0,1-5.86-3.58C10.53,316.76,2.2,300.76.33,281.25a68.37,68.37,0,0,1,4.79-32.86,64.1,64.1,0,0,1,10.63-17.55c4.59-5.35,10-9.4,16-13.18,7.61-4.86,15.88-6.63,24.58-7.42a3.51,3.51,0,0,0,.74-.32v-3q0-45,0-90.08a119.44,119.44,0,0,1,8.12-44.44,110.91,110.91,0,0,1,14.6-26.68A127.4,127.4,0,0,1,102,22.93c5.28-4.21,11.19-7.17,17-10.52,11-6.43,23.17-8.92,35.48-11,1.47-.24,3-.31,4.45-.43C163.4.63,168-.2,172.43,0c6.58.37,13.12,1.38,19.65,2.34a80.84,80.84,0,0,1,23.75,6.88,148.4,148.4,0,0,1,20.86,11.8A101.57,101.57,0,0,1,259,42.69C270,57.12,277.86,73,280.92,91c1.39,8.14,2.69,16.41,2.78,24.64.34,30.27.16,60.55.17,90.82v3c6,1,11.66,1.6,17.19,2.84,9.65,2.17,17.51,7.78,24.38,14.53,3.81,3.75,6.57,8.6,9.65,13.06a3.86,3.86,0,0,0,3.53,1.95c3.93.16,8,.27,11.71,1.46,10.56,3.37,16.55,11.08,18.6,21.82,1.93,10.1-.26,19-7.36,26.87-5.71,6.31-12.59,9-20.81,9.24a2.59,2.59,0,0,0-1.94,1.31,56.36,56.36,0,0,1-11,18.09c-4.52,5.09-9.67,9.49-16,12.28-1,.46-2.1.87-3.47,1.43,0-3,.17-5.73,0-8.41-.83-11.25-3.81-21.7-10.83-30.88a52.36,52.36,0,0,0-13.08-12.3c-16.9-11-34.6-11.54-51.81-1.91-14.33,8-22.93,21-25.78,37.5a50.93,50.93,0,0,0-.16,17.8A19.84,19.84,0,0,1,206.79,338.16ZM181,38.59V210h71.7c.06-.68.14-1.16.14-1.65,0-29.44.06-58.88,0-88.32a87,87,0,0,0-12.59-45.58A71.79,71.79,0,0,0,220.37,52.9,101.32,101.32,0,0,0,202.73,43C196,40.05,188.59,39.13,181,38.59ZM342.62,293.31c12.07-2.25,20.21-10.57,19.18-23.86-1-13-11.11-19.72-19.18-19.06Z"/>
              <path className="logo-wheel logo-wheel-left" d="M81.38,285.24c9.89-.12,17.56,1.84,24.21,6.61,11.62,8.34,18,19.75,18.66,34.14.52,11.54-2.45,22-10.34,30.69a44.91,44.91,0,0,1-7.74,7.18c-10.74,7.27-22.45,10.12-35,5.6-6.42-2.31-12.61-5.6-17.21-10.84C43.13,346.26,39.27,332.06,43.78,316a44.14,44.14,0,0,1,14.46-22A36.71,36.71,0,0,1,81.38,285.24Z"/>
              <path className="logo-wheel logo-wheel-right" d="M257.06,285.13c8.18,0,15.85,1.93,22.44,6.82,9.74,7.22,16,16.78,17.86,28.92,2,13.18-.81,25.06-9.29,35.59-4.3,5.33-9.75,8.66-15.79,11.59a33,33,0,0,1-24.54,2.17c-13.72-4.14-24-12.74-28.93-26.55-4.92-13.64-3.76-26.77,4.08-39.22,6.48-10.28,15.44-16.76,27.49-18.74C252.58,285.35,254.83,285.32,257.06,285.13Z"/>
              <path className="logo-dots" d="M390.38,268.51h9.67c1.84,0,3.06.76,3.07,2.75s-1.27,2.64-2.92,2.66c-6.37.07-12.73.07-19.1.05a2.47,2.47,0,0,1-2.69-2.84c0-1.84.95-2.7,2.79-2.68,3.06,0,6.12,0,9.18,0Z"/>
              <path className="logo-dots" d="M394.42,301.25c-.65,1.1-1,2.38-1.76,2.72s-1.89-.33-2.7-.81c-3.9-2.34-7.79-4.69-11.59-7.18a21.84,21.84,0,0,1-4.45-3.79c-.54-.62-.71-2.39-.25-2.86s2-.49,3-.51c.44,0,.91.37,1.32.64,4.88,3.23,9.76,6.44,14.6,9.72A11.69,11.69,0,0,1,394.42,301.25Z"/>
              <path className="logo-dots" d="M375.87,254.18c-2.52-.07-3.48-1.82-2.25-3.58a11,11,0,0,1,2.72-2.76c4.73-3.16,9.5-6.24,14.35-9.21a2.39,2.39,0,0,1,2.25.7,4.64,4.64,0,0,1,.44,3c-.09.55-1,1-1.64,1.42-4.65,3.23-9.31,6.46-14,9.65A8.43,8.43,0,0,1,375.87,254.18Z"/>
            </g></g>
          </svg>
        </Link>
        <h1 className="app-title">ToyLab</h1>
      </div>

      <nav className="top-bar-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`btn-topbar-nav ${pathname.startsWith(item.href) ? "btn-topbar-nav--active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="top-bar-right">
        <div className="topbar-divider" />
        {profile ? (
          <button
            className="user-avatar-btn"
            style={{ background: profile.avatar_color || "#7C3AED" }}
            onClick={handleSignOut}
            title={`${profile.nickname || profile.username} — 点击退出`}
          >
            {(profile.nickname || profile.username || "U").charAt(0).toUpperCase()}
          </button>
        ) : (
          <Link href="/login" className="btn-login">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            登录
          </Link>
        )}
      </div>
    </header>
  );
}

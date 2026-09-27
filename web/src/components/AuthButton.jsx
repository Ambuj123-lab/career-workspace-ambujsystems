"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function AuthButton({ className = "", hideUnauthenticated = false }) {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className={`h-8 w-20 rounded-lg bg-white/5 animate-pulse ${className}`} />
    );
  }

  if (status === "authenticated" && session?.user) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-medium text-gray-200"
          id="user-menu-button"
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-5 h-5 rounded-full border border-rose-500/30 object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
              {(session.user.name || session.user.email || "U")[0].toUpperCase()}
            </div>
          )}
          <span className="hidden sm:inline max-w-[100px] truncate">{session.user.name?.split(" ")[0] || session.user.email}</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0b1021] border border-white/10 shadow-2xl py-2 z-50 backdrop-blur-xl">
            <div className="px-4 py-2 border-b border-white/5">
              <p className="text-xs font-semibold text-white truncate">{session.user.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{session.user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  // If inside internal pages where unauthenticated login button should not be rendered
  if (hideUnauthenticated) {
    return null;
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/generate" })}
      id="nav-signin-btn"
      className={`inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 text-xs font-semibold text-white transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer active:scale-95 group ${className}`}
    >
      <span>Sign In</span>
      <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
    </button>
  );
}

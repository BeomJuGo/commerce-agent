"use client";

export default function AdminLogout() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <button onClick={logout} className="ca-mono text-xs text-[#6f6f72] hover:text-red-400">
      로그아웃
    </button>
  );
}

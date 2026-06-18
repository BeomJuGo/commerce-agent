"use client";

export default function AdminLogout() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <button onClick={logout} className="ca-mono text-xs text-[#a1a1aa] hover:text-red-600">
      로그아웃
    </button>
  );
}

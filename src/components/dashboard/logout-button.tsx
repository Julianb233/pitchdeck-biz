"use client";

export function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      Sign Out
    </button>
  );
}

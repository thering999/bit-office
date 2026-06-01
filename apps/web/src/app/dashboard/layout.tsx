"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: "📊" },
    { name: "Agents", href: "/dashboard/agents", icon: "🤖" },
    { name: "Key Rotation", href: "/dashboard/keys", icon: "🔑" },
    { name: "System Logs", href: "/dashboard/logs", icon: "📝" },
    { name: "Playground", href: "/dashboard/testing", icon: "🎯" },
    { name: "API Sources", href: "/dashboard/sources", icon: "🔌" },
    { name: "Analytics", href: "/dashboard/analytics", icon: "📈" },
    { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#111] flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-indigo-400">Bit Office</h1>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Management Hub</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`text-lg ${isActive ? "opacity-100" : "opacity-50 group-hover:opacity-100"}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
              AD
            </div>
            <div className="min-width-0 flex-1">
              <p className="text-sm font-medium truncate">Administrator</p>
              <p className="text-[10px] text-white/30 truncate">admin@bit-office.ai</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-bottom border-white/5 bg-[#111]/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-medium text-white/80">
            {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-white/40 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </button>
            <div className="h-6 w-px bg-white/10"></div>
            <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors">Sign out</Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

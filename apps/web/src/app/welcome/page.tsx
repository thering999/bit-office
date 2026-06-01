"use client";

import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-4">
          <h1 className="text-5xl font-extralight tracking-tight text-white/90">
            Welcome to <span className="font-semibold text-indigo-400 italic">Bit Office</span>
          </h1>
          <p className="text-lg text-white/40 font-light max-w-lg mx-auto">
            Your orchestration hub is ready. All agents are synchronized and standing by for your command.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          <button 
            onClick={() => router.push("/office")}
            className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 group"
          >
            <div className="text-indigo-400 mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            </div>
            <h3 className="font-medium text-white/90">Open Office</h3>
            <p className="text-xs text-white/30 mt-1">Access the main orchestration scene</p>
          </button>

          <button 
            className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 group"
          >
            <div className="text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M9 20V10M15 20V4M3 20h18"></path></svg>
            </div>
            <h3 className="font-medium text-white/90">Dashboard</h3>
            <p className="text-xs text-white/30 mt-1">View system metrics and agent status</p>
          </button>
        </div>

        <div className="pt-8">
          <button 
            onClick={() => router.push("/login")}
            className="text-sm text-white/20 hover:text-white/50 transition-colors duration-200"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Decorative gradient background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}

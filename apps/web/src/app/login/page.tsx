"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { loginAction } from "./actions";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const result = await loginAction(formData);

    if (result.success) {
      router.push("/welcome");
    } else {
      setError(result.error || "An unknown error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#111] rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
        {/* Subtle Gradient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
        
        <div className="text-center relative z-10">
          <h1 className="text-3xl font-light tracking-tight text-white/90">
            Welcome <span className="font-semibold text-indigo-400">Back</span>
          </h1>
          <p className="mt-2 text-sm text-white/40 font-light">Please enter your credentials to continue</p>
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2 ml-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all duration-200 placeholder:text-white/10 text-white"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all duration-200 placeholder:text-white/10 text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400/90 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg text-center animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 active:scale-[0.98] relative overflow-hidden"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <div className="pt-4 text-center">
          <a href="#" className="text-xs text-white/30 hover:text-indigo-400 transition-colors duration-200">Forgot your password?</a>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[15%] w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
}

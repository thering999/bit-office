"use client";

import { useState, useEffect } from "react";
import { getSources, addSource, deleteSource } from "./actions";

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    setLoading(true);
    const data = await getSources();
    setSources(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await addSource(formData);
    setIsAdding(false);
    loadSources();
  }

  async function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this source?")) {
      await deleteSource(id);
      loadSources();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white/90">API Sources</h1>
          <p className="text-sm text-white/40">Manage your external data connections</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium"
        >
          {isAdding ? "Cancel" : "Add Source"}
        </button>
      </div>

      {isAdding && (
        <div className="p-6 bg-[#111] border border-white/5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase">Source Name</label>
              <input
                name="name"
                required
                placeholder="e.g. Weather API"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase">Method</label>
              <select
                name="method"
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-white/40 uppercase">Endpoint URL</label>
              <input
                name="url"
                required
                placeholder="https://api.example.com/data"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase">API Key (Optional)</label>
              <input
                name="api_key"
                type="password"
                placeholder="••••••••••••••••"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase">Custom Headers (JSON)</label>
              <input
                name="headers"
                placeholder='{"Content-Type": "application/json"}'
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all duration-200 font-medium"
              >
                Save API Source
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
          <p className="text-white/30">No API sources found. Add your first one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sources.map((source) => (
            <div
              key={source.id}
              className="group p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/[0.08] transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <span className="text-xl font-bold">{source.method}</span>
                </div>
                <div>
                  <h3 className="font-medium text-white/90">{source.name}</h3>
                  <p className="text-xs text-white/30 font-mono truncate max-w-md">{source.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleDelete(source.id)}
                  className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

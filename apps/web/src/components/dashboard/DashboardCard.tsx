"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchApiData } from "@/lib/api-fetcher";

interface DashboardCardProps {
  card: {
    id: number;
    title: string;
    type: "metric" | "graph" | "table";
    source_url: string;
    method: string;
    headers: string;
    api_key: string;
  };
  onDelete: (id: number) => void;
}

export default function DashboardCard({ card, onDelete }: DashboardCardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getData() {
      setLoading(true);
      try {
        const result = await fetchApiData(card.source_url, card.method, card.headers, card.api_key);
        if (result) {
          setData(result);
        } else {
          setError("No data received");
        }
      } catch (err) {
        setError("Failed to fetch");
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, [card]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative group bg-[#111] border border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all duration-500 overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest">{card.title}</h3>
          <p className="text-[10px] text-indigo-400/60 font-mono mt-1">Live Feed</p>
        </div>
        <button 
          onClick={() => onDelete(card.id)} 
          className="opacity-0 group-hover:opacity-100 p-1.5 text-white/20 hover:text-red-400 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="h-24 flex items-center justify-center text-xs text-red-400/50 italic">
          {error}
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          {card.type === "metric" && (
            <div className="flex flex-col">
              <div className="text-4xl font-light text-white tracking-tight">
                {typeof data === 'object' ? (data.value || data.count || "N/A") : data}
                <span className="text-lg text-white/30 ml-1">{data.unit || ""}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                <span>Synced successfully</span>
              </div>
            </div>
          )}

          {card.type === "graph" && (
            <div className="h-24 w-full bg-white/5 rounded-xl border border-white/5 relative overflow-hidden flex items-end gap-1 px-2 pb-2">
              {Array.isArray(data?.points) ? data.points.map((p: any, i: number) => (
                <div key={i} className="flex-1 bg-indigo-500/40 rounded-t-sm" style={{ height: `${p.value}%` }}></div>
              )) : (
                [40, 70, 45, 90, 65, 80, 55, 75, 40, 60, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-indigo-500/10 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))
              )}
            </div>
          )}

          {card.type === "table" && (
            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
              <div className="flex justify-between py-1 border-b border-white/5 text-[10px] text-white/20 uppercase tracking-tighter">
                <span>Label</span>
                <span>Status</span>
              </div>
              {Array.isArray(data) ? data.slice(0, 5).map((item: any, i: number) => (
                <div key={i} className="flex justify-between py-1 text-xs text-white/70">
                  <span>{item.name || item.label || `Item ${i+1}`}</span>
                  <span className={item.status === 'error' ? 'text-red-400' : 'text-emerald-400'}>
                    {item.status || "OK"}
                  </span>
                </div>
              )) : (
                <p className="text-[10px] text-white/30 italic">No list data available</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl -mr-12 -mt-12 pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
    </motion.div>
  );
}

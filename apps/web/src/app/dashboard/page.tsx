"use client";

import { useState, useEffect } from "react";
import { getCards, addCard, deleteCard } from "./actions";
import { getSources } from "./sources/actions";
import DashboardCard from "@/components/dashboard/DashboardCard";

import { AnimatePresence, motion } from "framer-motion";

export default function DashboardPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [cardsData, sourcesData] = await Promise.all([getCards(), getSources()]);
    setCards(cardsData);
    setSources(sourcesData);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await addCard(formData);
    setIsAdding(false);
    loadData();
  }

  async function handleDelete(id: number) {
    await deleteCard(id);
    loadData();
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-semibold text-white/90">Overview</h1>
          <p className="text-sm text-white/40">Real-time system telemetry and metrics</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Widget
        </motion.button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">New Widget</h2>
                <button onClick={() => setIsAdding(false)} className="text-white/20 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Widget Title</label>
                    <input name="title" required placeholder="e.g. CPU Load" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Data Source</label>
                    <select name="source_id" required className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors">
                      {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      {sources.length === 0 && <option disabled>No sources available</option>}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Widget Type</label>
                    <select name="type" required className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors">
                      <option value="metric">Metric (Single Value)</option>
                      <option value="graph">Graph (Time-series)</option>
                      <option value="table">Table (Data Grid)</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={sources.length === 0} 
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                  >
                    Add to Dashboard
                  </button>
                  {sources.length === 0 && (
                    <p className="text-[10px] text-amber-400/60 mt-2 text-center italic">
                      You need to add an API source first.
                    </p>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-32 bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          </div>
          <p className="text-white/40 text-lg font-light">Your dashboard is empty.</p>
          <button onClick={() => setIsAdding(true)} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium">Create your first widget</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <DashboardCard 
              key={card.id} 
              card={card} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

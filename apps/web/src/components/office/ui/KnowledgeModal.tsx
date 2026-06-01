"use client";
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Download, RefreshCw, X, FileText, CheckCircle2 } from 'lucide-react';
import { useOfficeStore } from '../../../store/office-store';
import { sendCommand } from '../../../lib/connection';

export const KnowledgeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const content = useOfficeStore(state => state.knowledgeContent);
  const projectDir = useOfficeStore(state => state.knowledgeDir);

  useEffect(() => {
    if (isOpen) {
      sendCommand({ type: 'SYNC_KNOWLEDGE' });
    }
  }, [isOpen]);

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PROJECT_KNOWLEDGE_${projectDir || 'latest'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    sendCommand({ type: 'SYNC_KNOWLEDGE' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.6)',
            backdropFilter: 'blur(8px)',
          }}
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          style={{
            position: 'relative',
            width: '85%',
            maxWidth: '1000px',
            height: '80vh',
            background: 'rgba(13, 13, 20, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px 32px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <BookOpen size={22} style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>Project Knowledge Base</h2>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', margin: '4px 0 0 0' }}>
                  NotebookLM-Compatible • Bilingual (TH/EN) • Auto-Updating
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleRefresh}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                <RefreshCw size={16} /> Refresh
              </button>
              <button
                onClick={handleDownload}
                disabled={!content}
                style={{
                  background: '#8b5cf6',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: content ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: 600,
                  opacity: content ? 1 : 0.5,
                }}
              >
                <Download size={16} /> Download for NotebookLM
              </button>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Sidebar with Meta */}
            <div style={{
              width: '240px',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px',
              background: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div>
                <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginBottom: '12px' }}>Project Info</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>Dir:</span> {projectDir || 'N/A'}
                   </div>
                   <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} style={{ color: '#10b981' }} /> 
                      <span>NotebookLM Ready</span>
                   </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <p style={{ fontSize: '11px', lineHeight: 1.6, color: 'rgba(255,255,255,0.3)' }}>
                  This file is automatically generated as agents complete tasks. It captures the project mission, module hierarchy, and feature updates in a format optimized for RAG and NotebookLM.
                </p>
              </div>
            </div>

            {/* Markdown Preview */}
            <div style={{ flex: 1, padding: '0', background: '#050508', overflow: 'auto' }}>
              {content ? (
                <div style={{ padding: '40px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.6 }}>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                    {content}
                  </pre>
                </div>
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', gap: '16px' }}>
                  <FileText size={48} strokeWidth={1} />
                  <p>Initializing knowledge stream...</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

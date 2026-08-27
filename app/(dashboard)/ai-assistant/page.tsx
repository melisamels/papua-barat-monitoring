'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useApp } from '@/components/providers/AppProvider';
import { ChatMessage } from '@/lib/types';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  FileText,
  User,
  Clock,
  CheckCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

const SUGGESTION_QUESTIONS = [
  'Kabupaten mana yang kegiatannya belum selesai?',
  'Distrik mana yang masih Planning?',
  'Distrik mana yang belum memiliki jadwal?',
  'Berapa total guru yang sudah dilatih?',
  'Berapa total siswa yang sudah mengikuti program?',
  'Berapa total RAB program?',
  'Berapa total realisasi program?',
  'Berapa sisa anggaran?',
  'Kabupaten mana yang memiliki penyerapan terbesar?',
  'Kegiatan mana yang realisasinya melebihi RAB?',
  'Kegiatan apa saja bulan ini?',
  'Apa kegiatan bulan September 2026?',
  'Kabupaten mana yang dokumentasinya belum lengkap?',
  'Distrik mana yang LPJ-nya belum lengkap?',
  'Buat ringkasan progress program.',
  'Buat ringkasan untuk pimpinan.',
  'Apa masalah utama program saat ini?',
  'Kegiatan mana yang membutuhkan perhatian?',
];

export default function AiAssistantPage() {
  const { currentUser, showToast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      content: `Halo Bapak/Ibu **${currentUser.full_name}**! Saya **Papua Barat Program Assistant**.\n\nSaya dapat menganalisis dan menjawab pertanyaan seputar pelaksanaan **Program Pandai Berhitung dengan Metode GASING** di seluruh 7 kabupaten dan 23 distrik Provinsi Papua Barat berdasarkan data aktual di database sistem.\n\nSilakan pilih salah satu pertanyaan rekomendasi di bawah atau ketikkan pertanyaan Anda.`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          role: currentUser.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses pertanyaan');

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        context_time: data.context_time,
        sources: data.sources,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      showToast(err.message, 'error');
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          content: 'Terjadi kendala saat menghubungkan ke database server. Silakan coba kembali.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateExecutiveSummary = async () => {
    if (isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: 'Tolong buatkan Ringkasan Eksekutif Lengkap (Executive Summary) untuk Pimpinan.',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: currentUser.role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal generate summary');

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        context_time: data.context_time,
        sources: data.sources,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-110px)] flex flex-col">
      <Breadcrumbs items={[{ label: 'AI Assistant (Papua Barat Program Assistant)' }]} />

      {/* Assistant Header Banner (#35) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#1E5E3A] flex items-center justify-center text-white shadow-md">
            <BotMessageSquare className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Papua Barat Program Assistant</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                Online • Data Realtime
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              AI Intelligence berbasis basis data Program Pandai Berhitung Metode GASING Papua Barat
            </p>
          </div>
        </div>

        {/* Generate Executive Summary Button (#37) */}
        <button
          onClick={handleGenerateExecutiveSummary}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#0B2545] to-[#134074] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Generate Executive Summary</span>
        </button>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                <BotMessageSquare className="w-4 h-4 text-amber-300" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#0B2545] text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              <div
                className={`mt-2 pt-2 border-t text-[10px] flex items-center justify-between ${
                  msg.sender === 'user' ? 'border-white/10 text-white/60' : 'border-slate-200 text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && (
                  <span className="italic">Terhubung ke Database</span>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                {currentUser.full_name.charAt(0)}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center text-xs text-slate-400 p-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center animate-pulse">
              <BotMessageSquare className="w-4 h-4 text-amber-300" />
            </div>
            <span>Papua Barat Assistant sedang membaca database dan menganalisis...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips (#36) */}
      <div className="shrink-0 space-y-1.5">
        <div className="text-[10px] font-bold uppercase text-slate-400 px-1">
          Rekomendasi Pertanyaan Cepat:
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {SUGGESTION_QUESTIONS.slice(0, 7).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 rounded-xl text-slate-700 whitespace-nowrap text-[11px] font-medium transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="shrink-0 relative flex items-center"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ketik pertanyaan terkait progress, distrik, guru, siswa, atau anggaran..."
          className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-sm"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="absolute right-2 p-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl transition-all shadow-xs"
          title="Kirim Pertanyaan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

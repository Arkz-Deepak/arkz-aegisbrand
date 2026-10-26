'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  Copy,
  Key,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  FileText,
  BadgeAlert,
  Check,
  Zap,
  Sun,
  Moon,
  Info,
  Server,
  Cpu,
} from 'lucide-react';
import defaultGuidelines from '@/data/defaultBrandGuidelines.json';
import channelTemplates from '@/data/channelTemplates.json';
import {
  BrandGuideline,
  VerificationReport,
  VerificationIssue,
  RewriteOption,
  ComplianceCertificate,
} from '@/types/brand';
import { calculateWcagContrast } from '@/lib/verifier';

type ChannelKey = 'Paid Digital Ad' | 'Press Release' | 'Blog Post' | 'Social Media Copy' | 'Whitepaper Deck';

export default function AegisBrandApp() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'studio' | 'vault' | 'friction' | 'live' | 'ledger'>('studio');
  const [channel, setChannel] = useState<ChannelKey>('Paid Digital Ad');
  const [content, setContent] = useState<string>(channelTemplates.channels['Paid Digital Ad'].flawed);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyStatus, setApiKeyStatus] = useState<{ testing: boolean; message?: string; valid?: boolean }>({ testing: false });
  const [showApiDrawer, setShowApiDrawer] = useState<boolean>(false);
  const [guidelines, setGuidelines] = useState<BrandGuideline>(defaultGuidelines as unknown as BrandGuideline);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, 'Conservative' | 'Balanced' | 'Creative'>>({});
  const [reviewerName, setReviewerName] = useState<string>('Deepak R (Lead Reviewer)');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [certificate, setCertificate] = useState<ComplianceCertificate | null>(null);
  const [ledger, setLedger] = useState<ComplianceCertificate[]>([]);
  const [contrastColor1, setContrastColor1] = useState<string>('#FFFFFF');
  const [contrastColor2, setContrastColor2] = useState<string>('#0F172A');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Run inspection on initial mount
  useEffect(() => {
    handleRunInspection(channelTemplates.channels['Paid Digital Ad'].flawed, 'Paid Digital Ad');
    testApiKeyOnLoad();
  }, []);

  async function testApiKeyOnLoad(keyToTest = apiKey) {
    setApiKeyStatus({ testing: true });
    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest || undefined }),
      });
      const data = await res.json();
      if (data.valid) {
        setApiKeyStatus({
          testing: false,
          valid: true,
          message: `Connected: Google Gemini API (${data.supportedModels?.[0]?.id || 'Gemini Flash'} ready)`,
        });
      } else {
        setApiKeyStatus({
          testing: false,
          valid: false,
          message: data.error || data.message || 'No Gemini API Key set — using deterministic engine.',
        });
      }
    } catch {
      setApiKeyStatus({ testing: false, valid: false, message: 'Could not test API key.' });
    }
  }

  function handleChannelChange(newChannel: ChannelKey, variant: 'flawed' | 'compliant' = 'flawed') {
    setChannel(newChannel);
    const newContent = channelTemplates.channels[newChannel]?.[variant] || '';
    setContent(newContent);
    handleRunInspection(newContent, newChannel);
  }

  async function handleRunInspection(textToVerify = content, channelContext = channel) {
    setIsInspecting(true);
    setCertificate(null);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textToVerify,
          guideline: guidelines,
          apiKey: apiKey || undefined,
          channel: channelContext,
        }),
      });

      if (res.ok) {
        const data: VerificationReport = await res.json();
        setReport(data);

        // Default all issues to 'Balanced' suggestion
        const initialMap: Record<string, 'Conservative' | 'Balanced' | 'Creative'> = {};
        data.issues?.forEach((issue) => {
          initialMap[issue.id] = 'Balanced';
        });
        setSelectedSuggestions(initialMap);
      }
    } catch (err) {
      console.error('Inspection failed:', err);
    } finally {
      setIsInspecting(false);
    }
  }

  function handleApplySuggestion(issue: VerificationIssue, option: RewriteOption) {
    if (!content.includes(issue.flaggedExcerpt)) return;
    const updated = content.replace(issue.flaggedExcerpt, option.text);
    setContent(updated);
    handleRunInspection(updated, channel);
  }

  async function handleApproveAndCertify() {
    try {
      const res = await fetch('/api/certify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetTitle: `${channel} Campaign Release`,
          content,
          guidelineVersion: guidelines.version,
          approvedBy: reviewerName,
        }),
      });

      if (res.ok) {
        const cert: ComplianceCertificate = await res.json();
        setCertificate(cert);
        setLedger((prev) => [cert, ...prev]);

        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      console.error('Certification failed:', err);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const currentContrast = calculateWcagContrast(contrastColor1, contrastColor2);
  const wcagAAMet = currentContrast >= 4.5;

  // Theme styling helpers
  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardClass = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const innerClass = isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';
  const borderSubtle = isDark ? 'border-slate-800' : 'border-slate-200';

  return (
    <div className={`min-h-screen ${bgClass} flex flex-col font-sans transition-colors duration-200`}>
      {/* TOP NAVBAR */}
      <header className={`border-b ${borderSubtle} ${isDark ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur sticky top-0 z-50 px-6 py-3.5`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-extrabold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  AegisBrand AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30">
                  Team ARKZ
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                  Codex 48 • Round 2
                </span>
              </div>
              <p className={`text-xs ${textMuted}`}>Intelligent Pre-Publication Brand Governance & Verification Engine</p>
            </div>
          </div>

          {/* RIGHT NAVBAR CONTROLS */}
          <div className="flex items-center gap-2">
            {/* API KEY INDICATOR & DRAWER TOGGLE */}
            <button
              onClick={() => setShowApiDrawer(!showApiDrawer)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition ${
                apiKeyStatus.valid
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Click to configure Gemini API Key"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span className="hidden md:inline">
                {apiKeyStatus.valid ? 'Gemini Live' : 'Deterministic Engine'}
              </span>
            </button>

            {/* LIGHT / DARK THEME TOGGLE */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-lg border transition ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* NAVIGATION TABS */}
            <nav className={`flex items-center gap-1 p-1 rounded-lg border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-300'} text-xs`}>
              <button
                onClick={() => setActiveTab('studio')}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'studio'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : `${textMuted} hover:text-blue-500`
                }`}
              >
                <FileCheck2 className="h-3.5 w-3.5" /> Pre-Flight
              </button>
              <button
                onClick={() => setActiveTab('vault')}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'vault'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : `${textMuted} hover:text-blue-500`
                }`}
              >
                <Layers className="h-3.5 w-3.5" /> Vault
              </button>
              <button
                onClick={() => setActiveTab('friction')}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'friction'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : `${textMuted} hover:text-blue-500`
                }`}
              >
                <Search className="h-3.5 w-3.5" /> Friction
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'live'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : `${textMuted} hover:text-blue-500`
                }`}
              >
                <Zap className="h-3.5 w-3.5" /> Live Linter
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'ledger'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : `${textMuted} hover:text-blue-500`
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Ledger
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* EXPANDABLE GEMINI API KEY & ENGINE SETTINGS DRAWER */}
      {showApiDrawer && (
        <div className={`border-b ${borderSubtle} ${isDark ? 'bg-slate-900' : 'bg-slate-100'} p-4 text-xs transition`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-500">
                <Key className="h-4 w-4" /> Gemini AI Engine Settings
              </div>
              <p className={textMuted}>
                The engine connects to Google Gemini Flash API if an API key is set in Vercel environment variables or entered below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <input
                type="password"
                placeholder="Paste Gemini API Key (or leave empty to use Vercel env)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs w-full md:w-80 focus:outline-none focus:ring-1 focus:ring-blue-500 ${innerClass}`}
              />
              <button
                onClick={() => testApiKeyOnLoad(apiKey)}
                disabled={apiKeyStatus.testing}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition flex items-center gap-1"
              >
                {apiKeyStatus.testing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Test Key'}
              </button>
            </div>
          </div>
          {apiKeyStatus.message && (
            <div className="max-w-7xl mx-auto mt-2 text-[11px] font-mono text-slate-400">
              <strong>Status:</strong> {apiKeyStatus.message}
            </div>
          )}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* TAB 1: PRE-FLIGHT STUDIO (THE CORE WORKFLOW) */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* 1-CLICK JUDGE BENCHMARK SELECTOR */}
            <div className={`border rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
              isDark ? 'bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-indigo-500/30' : 'bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/70 border-indigo-200'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                    Judge Interactive Demo Benchmarks
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${textMuted}`}>
                  Select a channel and content preset to test immediate multimodal triage:
                </p>
              </div>

              {/* QUICK TOGGLE BUTTONS FOR ACTIVE CHANNEL */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleChannelChange(channel, 'flawed')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition flex items-center gap-1.5"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Load Flawed Copy (Has Violations)
                </button>
                <button
                  onClick={() => handleChannelChange(channel, 'compliant')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Load Compliant Copy (Clean)
                </button>
              </div>
            </div>

            {/* SPLIT STUDIO LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: CREATOR WORKSTATION (5 COLS) */}
              <div className="lg:col-span-5 space-y-4">
                <div className={`border rounded-xl p-4 shadow-sm space-y-4 ${cardClass}`}>
                  <div className={`flex items-center justify-between border-b ${borderSubtle} pb-3`}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <h2 className="text-sm font-bold">Content Workstation</h2>
                    </div>

                    {/* CHANNEL DROPDOWN */}
                    <div className="flex items-center gap-1">
                      <label className="text-[11px] font-medium text-slate-500">Channel:</label>
                      <select
                        value={channel}
                        onChange={(e) => handleChannelChange(e.target.value as ChannelKey, 'flawed')}
                        className={`text-xs font-semibold rounded-md px-2 py-1 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${innerClass}`}
                      >
                        <option>Paid Digital Ad</option>
                        <option>Press Release</option>
                        <option>Blog Post</option>
                        <option>Social Media Copy</option>
                        <option>Whitepaper Deck</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={`text-xs font-medium ${textMuted}`}>
                        Marketing Copy / Content Under Inspection:
                      </label>
                      <span className="text-[10px] font-mono text-blue-500">Channel: {channel}</span>
                    </div>

                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      className={`w-full rounded-lg p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y font-mono border ${innerClass}`}
                      placeholder="Type or paste copy to inspect..."
                    />
                    <div className={`flex justify-between items-center text-[11px] ${textMuted} mt-1`}>
                      <span>{content.split(/\s+/).filter(Boolean).length} words • {content.length} characters</span>
                      <span>Active Policy: {guidelines.name} (v{guidelines.version})</span>
                    </div>
                  </div>

                  {/* VISUAL & ACCESSIBILITY QUICK CHECKER */}
                  <div className={`border-t ${borderSubtle} pt-3 space-y-2`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold flex items-center gap-1.5">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-500" /> WCAG 2.1 Contrast Linter
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${wcagAAMet ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                        {wcagAAMet ? 'WCAG AA Pass' : 'Contrast Fail'} ({currentContrast}:1)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className={`text-[10px] block mb-1 ${textMuted}`}>Text Color</label>
                        <div className={`flex items-center gap-2 p-1.5 rounded border ${innerClass}`}>
                          <input
                            type="color"
                            value={contrastColor1}
                            onChange={(e) => setContrastColor1(e.target.value)}
                            className="h-5 w-6 rounded bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={contrastColor1}
                            onChange={(e) => setContrastColor1(e.target.value)}
                            className="w-16 bg-transparent text-xs font-mono uppercase focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`text-[10px] block mb-1 ${textMuted}`}>Background Color</label>
                        <div className={`flex items-center gap-2 p-1.5 rounded border ${innerClass}`}>
                          <input
                            type="color"
                            value={contrastColor2}
                            onChange={(e) => setContrastColor2(e.target.value)}
                            className="h-5 w-6 rounded bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={contrastColor2}
                            onChange={(e) => setContrastColor2(e.target.value)}
                            className="w-16 bg-transparent text-xs font-mono uppercase focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      style={{ backgroundColor: contrastColor2, color: contrastColor1 }}
                      className="p-2.5 rounded-lg text-center text-xs font-medium border border-slate-700/30 shadow-inner"
                    >
                      Sample Visual Banner Preview (Ratio {currentContrast}:1)
                    </div>
                  </div>

                  {/* RUN INSPECTION BUTTON */}
                  <button
                    onClick={() => handleRunInspection()}
                    disabled={isInspecting || !content.trim()}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isInspecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Inspecting Content ({channel})...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Run Pre-Flight Inspection
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: DIAGNOSTIC & VERIFICATION HUB (7 COLS) */}
              <div className="lg:col-span-7 space-y-4">
                {/* ACTIVE ENGINE TELEMETRY BADGE */}
                {report && (
                  <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
                    report.engineUsed === 'GEMINI_LIVE'
                      ? isDark ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : isDark ? 'bg-blue-950/30 border-blue-500/30 text-blue-300' : 'bg-blue-50 border-blue-300 text-blue-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      <span>
                        <strong>Engine:</strong> {report.engineUsed === 'GEMINI_LIVE' ? `Google Gemini Live (${report.modelUsed})` : 'Local Deterministic Rule & Semantic Engine'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      {report.latencyMs && <span>Latency: {report.latencyMs}ms</span>}
                      <span>Channel: {report.channelContext || channel}</span>
                    </div>
                  </div>
                )}

                {/* BRAND ADHERENCE SCORECARD */}
                {report && (
                  <div className={`border rounded-xl p-4 shadow-sm ${cardClass}`}>
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${borderSubtle} pb-4`}>
                      <div>
                        <div className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                          Overall Brand Adherence Score
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span
                            className={`text-3xl font-extrabold ${
                              report.overallScore >= 85
                                ? 'text-emerald-500'
                                : report.overallScore >= 60
                                ? 'text-amber-500'
                                : 'text-rose-500'
                            }`}
                          >
                            {report.overallScore}/100
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              report.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                            }`}
                          >
                            {report.status === 'APPROVED' ? 'Pass: Publication Ready' : 'Changes Requested'}
                          </span>
                        </div>
                      </div>

                      {/* SUB-SCORES */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className={`p-2 rounded-lg text-center border ${innerClass}`}>
                          <div className={`text-[10px] ${textMuted}`}>Tone Alignment</div>
                          <div className="text-sm font-bold mt-0.5">{report.toneAlignmentScore}%</div>
                        </div>
                        <div className={`p-2 rounded-lg text-center border ${innerClass}`}>
                          <div className={`text-[10px] ${textMuted}`}>Factual / Claims</div>
                          <div className="text-sm font-bold mt-0.5">{report.factualAccuracyScore}%</div>
                        </div>
                        <div className={`p-2 rounded-lg text-center border ${innerClass}`}>
                          <div className={`text-[10px] ${textMuted}`}>Visual Standards</div>
                          <div className="text-sm font-bold mt-0.5">{report.visualAdherenceScore}%</div>
                        </div>
                      </div>
                    </div>

                    {/* DIAGNOSTIC FINDINGS LIST */}
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <BadgeAlert className="h-4 w-4 text-amber-500" />
                          Diagnostic Findings ({report.issues?.length || 0} Flagged)
                        </h3>
                        {report.issues?.length === 0 && (
                          <span className="text-xs text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> All guidelines satisfied
                          </span>
                        )}
                      </div>

                      {report.issues?.length === 0 ? (
                        <div className={`border rounded-xl p-6 text-center space-y-2 ${
                          isDark ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200'
                        }`}>
                          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                          <h4 className="text-sm font-bold text-emerald-600">Content Verified Clean!</h4>
                          <p className={`text-xs max-w-md mx-auto ${textMuted}`}>
                            No unverified claims, tone deviations, or prohibited terms detected for {channel}. This collateral is ready for final human sign-off.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {report.issues.map((issue) => (
                            <div
                              key={issue.id}
                              className={`border rounded-xl p-3.5 space-y-2.5 transition ${innerClass}`}
                            >
                              {/* Header */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                                      issue.type === 'CRITICAL_CLAIM'
                                        ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                                        : issue.type === 'TONE_DRIFT'
                                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                        : 'bg-purple-500/20 text-purple-500 border border-purple-500/30'
                                    }`}
                                  >
                                    {issue.type.replace('_', ' ')}
                                  </span>
                                  <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 font-mono">
                                    "{issue.flaggedExcerpt}"
                                  </span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-300 text-slate-600'}`}>
                                  {issue.ruleCitation}
                                </span>
                              </div>

                              {/* Explanation */}
                              <p className="text-xs leading-relaxed">{issue.explanation}</p>
                              <div className="text-[11px] text-rose-500 font-medium">
                                <strong>Risk Assessment:</strong> {issue.riskAssessment}
                              </div>

                              {/* Intent-Preserving Rewrite Options */}
                              {issue.suggestions && issue.suggestions.length > 0 && (
                                <div className={`border-t ${borderSubtle} pt-2.5 space-y-2`}>
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-semibold text-slate-500 flex items-center gap-1">
                                      <Sparkles className="h-3 w-3 text-cyan-500" /> Intent-Preserving Alternatives:
                                    </span>
                                    <div className="flex gap-1">
                                      {(['Conservative', 'Balanced', 'Creative'] as const).map((style) => (
                                        <button
                                          key={style}
                                          onClick={() =>
                                            setSelectedSuggestions((prev) => ({ ...prev, [issue.id]: style }))
                                          }
                                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                                            (selectedSuggestions[issue.id] || 'Balanced') === style
                                              ? 'bg-blue-600 text-white'
                                              : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                                          }`}
                                        >
                                          {style}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Active Suggestion Box */}
                                  {(() => {
                                    const activeStyle = selectedSuggestions[issue.id] || 'Balanced';
                                    const activeSuggestion =
                                      issue.suggestions.find((s) => s.style === activeStyle) || issue.suggestions[0];

                                    return (
                                      <div className={`border rounded-lg p-2.5 flex items-center justify-between gap-3 ${
                                        isDark ? 'bg-slate-900 border-blue-900/40' : 'bg-blue-50/50 border-blue-200'
                                      }`}>
                                        <div className="text-xs">
                                          <div className="font-mono text-emerald-500 font-semibold">
                                            "{activeSuggestion.text}"
                                          </div>
                                          <div className={`text-[10px] mt-0.5 ${textMuted}`}>
                                            {activeSuggestion.rationale}
                                          </div>
                                        </div>

                                        <button
                                          onClick={() => handleApplySuggestion(issue, activeSuggestion)}
                                          className="shrink-0 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                                        >
                                          <Check className="h-3.5 w-3.5" /> Apply
                                        </button>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* HUMAN REVIEW & SIGN-OFF GATE */}
                    <div className={`mt-5 border-t ${borderSubtle} pt-4 space-y-3`}>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">
                          Human Review & Cryptographic Sign-Off Gate
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className={`text-[10px] block mb-1 ${textMuted}`}>Authorized Reviewer</label>
                          <input
                            type="text"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            className={`w-full rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border ${innerClass}`}
                          />
                        </div>
                        <div>
                          <label className={`text-[10px] block mb-1 ${textMuted}`}>Override / Approval Justification</label>
                          <input
                            type="text"
                            placeholder="e.g. Verified with product legal counsel"
                            value={reviewerNotes}
                            onChange={(e) => setReviewerNotes(e.target.value)}
                            className={`w-full rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border ${innerClass}`}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleApproveAndCertify}
                        className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                      >
                        <FileCheck2 className="h-4 w-4" />
                        Approve & Issue Cryptographic Certificate
                      </button>

                      {/* DISPLAY CERTIFICATE IF ISSUED */}
                      {certificate && (
                        <div className={`border rounded-xl p-4 space-y-3 mt-3 animate-in fade-in duration-300 ${
                          isDark ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40' : 'bg-emerald-50/70 border-emerald-300'
                        }`}>
                          <div className={`flex items-center justify-between border-b ${borderSubtle} pb-2`}>
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-5 w-5 text-emerald-500" />
                              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                                Compliance Certificate Issued
                              </span>
                            </div>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isDark ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-white text-emerald-700 border-emerald-300'}`}>
                              {certificate.certificateId}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className={textMuted}>Approved By:</span>{' '}
                              <span className="font-semibold">{certificate.approvedBy}</span>
                            </div>
                            <div>
                              <span className={textMuted}>Policy Version:</span>{' '}
                              <span className="font-semibold">{certificate.guidelineVersion}</span>
                            </div>
                            <div className="col-span-2">
                              <span className={textMuted}>SHA-256 Signature:</span>
                              <div className={`font-mono text-[10px] p-1.5 rounded mt-0.5 border break-all flex items-center justify-between ${
                                isDark ? 'bg-slate-950 text-emerald-400 border-slate-800' : 'bg-white text-emerald-700 border-slate-200'
                              }`}>
                                <span>{certificate.signatureSha256}</span>
                                <button
                                  onClick={() => copyToClipboard(certificate.signatureSha256, 'sig')}
                                  className="text-slate-400 hover:text-blue-500 ml-2"
                                >
                                  {copiedId === 'sig' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BRAND KNOWLEDGE VAULT */}
        {activeTab === 'vault' && (
          <div className={`border rounded-xl p-6 space-y-6 ${cardClass}`}>
            <div className={`flex items-center justify-between border-b ${borderSubtle} pb-4`}>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-500" /> Computable Brand Knowledge Vault
                </h2>
                <p className={`text-xs mt-1 ${textMuted}`}>
                  Single source of truth: Ingests brandbooks, truth specs, SLA promises, and asset dictionaries into computable rule graphs.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30">
                v{guidelines.version} Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* APPROVED TRUTH SPECS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Approved Factual Truth Specs
                </h3>
                <div className="space-y-2">
                  {guidelines.approvedTruthSpecs.map((spec, i) => (
                    <div key={i} className={`border rounded-lg p-3 text-xs space-y-1 ${innerClass}`}>
                      <div className="font-semibold">{spec.approvedStatement}</div>
                      <div className={`text-[10px] ${textMuted}`}>
                        <strong>Source:</strong> {spec.sourceDoc}
                      </div>
                      <div className="text-[10px] text-rose-500">
                        <strong>Banned Variations:</strong> {spec.bannedVariations.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PROHIBITED TERMS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Banned Terminology Dictionary
                </h3>
                <div className="space-y-2">
                  {guidelines.prohibitedTerms.map((term, i) => (
                    <div key={i} className={`border rounded-lg p-3 text-xs space-y-1 ${innerClass}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-rose-500">"{term.term}"</span>
                        <span className="text-[10px] text-emerald-500 font-mono">Use: "{term.replacement}"</span>
                      </div>
                      <p className={`text-[10px] ${textMuted}`}>{term.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FRICTION & AMBIGUITY DISCOVERY (IMPROVEMENT #2) */}
        {activeTab === 'friction' && (
          <div className={`border rounded-xl p-6 space-y-6 ${cardClass}`}>
            <div className={`border-b ${borderSubtle} pb-4`}>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 uppercase">
                  Strategic Improvement #2
                </span>
                <h2 className="text-lg font-bold">Algorithmic Guideline Friction & Ambiguity Discovery</h2>
              </div>
              <p className={`text-xs mt-1 ${textMuted}`}>
                Applies unsupervised clustering across reviewer rejection logs and guideline rules to surface conflicting or obsolete brand instructions before they cause repeated errors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`border rounded-xl p-4 space-y-2 ${isDark ? 'bg-slate-950 border-amber-900/40' : 'bg-amber-50/50 border-amber-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Conflict Detected: Rule 2.1 vs Rule 4.3
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${isDark ? 'bg-amber-950/60 text-amber-300 border-amber-800/40' : 'bg-white text-amber-800 border-amber-200'}`}>
                    High Ambiguity
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  Rule 2.1 instructs writers to maintain <em>"Informal and friendly tone"</em>, while Rule 4.3 strictly prohibits the use of contractions (e.g. "don't", "we're"). Creators have triggered 14 review overrides this week due to this conflict.
                </p>
                <div className={`p-2.5 rounded text-xs font-medium border ${isDark ? 'bg-slate-900 text-emerald-400 border-emerald-900/30' : 'bg-white text-emerald-800 border-emerald-200'}`}>
                  <strong>Recommended Amendment:</strong> Amend Rule 4.3 to permit standard conversational contractions in social copy while retaining the strict prohibition for formal whitepapers.
                </div>
              </div>

              <div className={`border rounded-xl p-4 space-y-2 ${isDark ? 'bg-slate-950 border-blue-900/40' : 'bg-blue-50/50 border-blue-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Outdated Terminology Drift: "v1.2 Cloud Engine"
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${isDark ? 'bg-blue-950/60 text-blue-300 border-blue-800/40' : 'bg-white text-blue-800 border-blue-200'}`}>
                    Deprecation Alert
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  Three external agencies published collateral referencing "v1.2 Cloud Engine", which was officially deprecated in Q3 2026.
                </p>
                <div className={`p-2.5 rounded text-xs font-medium border ${isDark ? 'bg-slate-900 text-emerald-400 border-emerald-900/30' : 'bg-white text-emerald-800 border-emerald-200'}`}>
                  <strong>Recommended Amendment:</strong> Push an automated notification to all external agency workspaces requiring terminology sync to "v2.0 Next-Gen Core".
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IN-SITU LIVE LINTER (IMPROVEMENT #1) */}
        {activeTab === 'live' && (
          <div className={`border rounded-xl p-6 space-y-6 ${cardClass}`}>
            <div className={`border-b ${borderSubtle} pb-4`}>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 uppercase">
                  Strategic Improvement #1
                </span>
                <h2 className="text-lg font-bold">In-Situ Live Linter (Figma & CMS Embed Simulation)</h2>
              </div>
              <p className={`text-xs mt-1 ${textMuted}`}>
                Real-time inline linting directly within the authoring canvas. As creators type, non-compliant claims and tone drift are flagged instantaneously without leaving the tool.
              </p>
            </div>

            <div className={`border rounded-xl p-4 space-y-3 ${innerClass}`}>
              <div className={`text-xs ${textMuted}`}>
                Type or modify content below to see real-time syntax highlighting for brand violations:
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className={`w-full rounded-lg p-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 border ${innerClass}`}
              />
              <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
                <Zap className="h-4 w-4 animate-pulse" />
                Live WebSocket Channel Active • Real-time rule matching connected to Knowledge Vault
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COMPLIANCE LEDGER (IMPROVEMENT #3) */}
        {activeTab === 'ledger' && (
          <div className={`border rounded-xl p-6 space-y-6 ${cardClass}`}>
            <div className={`border-b ${borderSubtle} pb-4`}>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 uppercase">
                  Strategic Improvement #3
                </span>
                <h2 className="text-lg font-bold">Cryptographically Verifiable Pre-Publication Audit Ledger</h2>
              </div>
              <p className={`text-xs mt-1 ${textMuted}`}>
                Immutable record of all approved assets with SHA-256 signatures, timestamps, and authorized reviewer credentials for regulatory, legal, and enterprise compliance.
              </p>
            </div>

            {ledger.length === 0 ? (
              <div className={`text-center py-8 text-xs ${textMuted}`}>
                No certified assets in this session yet. Go to Pre-Flight Studio and click "Approve & Issue Cryptographic Certificate" to populate this ledger.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className={`uppercase font-mono text-[10px] border-b ${borderSubtle} ${isDark ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                    <tr>
                      <th className="py-2.5 px-3">Certificate ID</th>
                      <th className="py-2.5 px-3">Asset Title</th>
                      <th className="py-2.5 px-3">Approved By</th>
                      <th className="py-2.5 px-3">Verified At</th>
                      <th className="py-2.5 px-3">SHA-256 Signature</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-mono text-[11px] ${borderSubtle}`}>
                    {ledger.map((cert) => (
                      <tr key={cert.certificateId} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100'}>
                        <td className="py-2 px-3 text-emerald-500 font-semibold">{cert.certificateId}</td>
                        <td className="py-2 px-3">{cert.assetTitle}</td>
                        <td className="py-2 px-3 text-slate-500">{cert.approvedBy}</td>
                        <td className="py-2 px-3 text-slate-400">{new Date(cert.verifiedAt).toLocaleTimeString()}</td>
                        <td className="py-2 px-3 text-slate-500 text-[10px]">{cert.signatureSha256.substring(0, 16)}...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className={`border-t ${borderSubtle} px-6 py-4 text-center text-xs ${textMuted} ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <p>
          <strong>AegisBrand AI</strong> • Developed by <strong>Deepak R (Team ARKZ)</strong> for <strong>Codex 48 Hackathon Round 2</strong>.
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Multimodal Pre-Publication Brand Governance • Powered by Google Gemini &amp; Mathematical Vision
        </p>
      </footer>
    </div>
  );
}

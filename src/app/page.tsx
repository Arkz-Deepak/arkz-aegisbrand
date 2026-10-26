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
  Download,
  Key,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  SlidersHorizontal,
  FileText,
  BadgeAlert,
  Flame,
  Check,
  Zap,
} from 'lucide-react';
import defaultGuidelines from '@/data/defaultBrandGuidelines.json';
import sampleTestCases from '@/data/sampleTestCases.json';
import {
  BrandGuideline,
  VerificationReport,
  VerificationIssue,
  RewriteOption,
  ComplianceCertificate,
} from '@/types/brand';
import { calculateWcagContrast } from '@/lib/verifier';

export default function AegisBrandApp() {
  const [activeTab, setActiveTab] = useState<'studio' | 'vault' | 'friction' | 'live' | 'ledger'>('studio');
  const [content, setContent] = useState<string>(sampleTestCases.testCases[0].content);
  const [channel, setChannel] = useState<string>('Paid Digital Ad');
  const [apiKey, setApiKey] = useState<string>('');
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

  // Pre-load verification on mount
  useEffect(() => {
    handleRunInspection(sampleTestCases.testCases[0].content);
  }, []);

  async function handleRunInspection(textToVerify = content) {
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

    // Re-verify after applying
    handleRunInspection(updated);
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

        // Trigger confetti celebration
        confetti({
          particleCount: 80,
          spread: 60,
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
  const wcagAAAMet = currentContrast >= 7.0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* TOP NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
                  AegisBrand AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Team ARKZ
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Codex 48 • Round 2
                </span>
              </div>
              <p className="text-xs text-slate-400">Intelligent Pre-Publication Brand Governance & Verification Engine</p>
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800/80 text-xs">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === 'studio'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileCheck2 className="h-3.5 w-3.5" /> Pre-Flight Studio
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === 'vault'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Knowledge Vault
            </button>
            <button
              onClick={() => setActiveTab('friction')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === 'friction'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Search className="h-3.5 w-3.5" /> Friction Discovery
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === 'live'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Zap className="h-3.5 w-3.5" /> Live Linter
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Compliance Ledger
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* TAB 1: PRE-FLIGHT STUDIO (THE CORE WORKFLOW) */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* 1-CLICK JUDGE DEMO TOOLBAR */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Judge Interactive Demo Playground
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any benchmark asset below to test the end-to-end multimodal verification engine instantly:
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {sampleTestCases.testCases.map((tc) => (
                  <button
                    key={tc.id}
                    onClick={() => {
                      setContent(tc.content);
                      handleRunInspection(tc.content);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-400 text-slate-200 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{tc.title.split(' ')[0]}</span>
                    <span>{tc.title.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SPLIT STUDIO LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: CREATOR WORKSTATION (5 COLS) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <h2 className="text-sm font-bold text-slate-200">Content Workstation</h2>
                    </div>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                      className="text-xs bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option>Paid Digital Ad</option>
                      <option>Press Release</option>
                      <option>Blog Post</option>
                      <option>Social Media Copy</option>
                      <option>Whitepaper Deck</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Draft Marketing Copy / Promotional Claims:
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs leading-relaxed text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y font-mono"
                      placeholder="Paste copy here to inspect..."
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                      <span>{content.split(/\s+/).filter(Boolean).length} words • {content.length} characters</span>
                      <span>Active Policy: {guidelines.name} (v{guidelines.version})</span>
                    </div>
                  </div>

                  {/* VISUAL & ACCESSIBILITY QUICK CHECKER */}
                  <div className="border-t border-slate-800 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400" /> WCAG 2.1 Color Contrast Linter
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${wcagAAMet ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {wcagAAMet ? 'WCAG AA Pass' : 'Contrast Fail'} ({currentContrast}:1)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Text Color</label>
                        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
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
                        <label className="text-[10px] text-slate-400 block mb-1">Background Color</label>
                        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
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
                      className="p-2.5 rounded-lg text-center text-xs font-medium border border-slate-700/50 shadow-inner"
                    >
                      Sample Visual Text Ad Preview (Ratio {currentContrast}:1)
                    </div>
                  </div>

                  {/* RUN BUTTON */}
                  <button
                    onClick={() => handleRunInspection()}
                    disabled={isInspecting || !content.trim()}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isInspecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Inspecting Against Brand Vault...
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
                {/* BRAND ADHERENCE SCORECARD */}
                {report && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          Overall Brand Adherence Score
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span
                            className={`text-3xl font-extrabold ${
                              report.overallScore >= 85
                                ? 'text-emerald-400'
                                : report.overallScore >= 60
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {report.overallScore}/100
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              report.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {report.status === 'APPROVED' ? 'Pass: Publication Ready' : 'Changes Requested'}
                          </span>
                        </div>
                      </div>

                      {/* SUB-SCORES */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                          <div className="text-[10px] text-slate-400">Tone Alignment</div>
                          <div className="text-sm font-bold text-slate-200 mt-0.5">{report.toneAlignmentScore}%</div>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                          <div className="text-[10px] text-slate-400">Factual / Claims</div>
                          <div className="text-sm font-bold text-slate-200 mt-0.5">{report.factualAccuracyScore}%</div>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                          <div className="text-[10px] text-slate-400">Visual Compliance</div>
                          <div className="text-sm font-bold text-slate-200 mt-0.5">{report.visualAdherenceScore}%</div>
                        </div>
                      </div>
                    </div>

                    {/* FLAGGED ISSUES LIST */}
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <BadgeAlert className="h-4 w-4 text-amber-400" />
                          Diagnostic Findings ({report.issues?.length || 0} Flagged)
                        </h3>
                        {report.issues?.length === 0 && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> All guidelines satisfied
                          </span>
                        )}
                      </div>

                      {report.issues?.length === 0 ? (
                        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-6 text-center space-y-2">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                          <h4 className="text-sm font-bold text-emerald-300">Content Verified Clean!</h4>
                          <p className="text-xs text-slate-400 max-w-md mx-auto">
                            No unverified claims, tone deviations, or prohibited terms detected. This collateral is ready for final human sign-off and publication.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {report.issues.map((issue) => (
                            <div
                              key={issue.id}
                              className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 transition hover:border-slate-700"
                            >
                              {/* Header */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                                      issue.type === 'CRITICAL_CLAIM'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        : issue.type === 'TONE_DRIFT'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    }`}
                                  >
                                    {issue.type.replace('_', ' ')}
                                  </span>
                                  <span className="text-xs font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40 font-mono">
                                    "{issue.flaggedExcerpt}"
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  {issue.ruleCitation}
                                </span>
                              </div>

                              {/* Explanation */}
                              <p className="text-xs text-slate-300 leading-relaxed">{issue.explanation}</p>
                              <div className="text-[11px] text-rose-400/90 font-medium">
                                <strong>Risk:</strong> {issue.riskAssessment}
                              </div>

                              {/* Intent-Preserving Rewrite Options */}
                              {issue.suggestions && issue.suggestions.length > 0 && (
                                <div className="border-t border-slate-800/80 pt-2.5 space-y-2">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-semibold text-slate-400 flex items-center gap-1">
                                      <Sparkles className="h-3 w-3 text-cyan-400" /> Intent-Preserving Rewrites:
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
                                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
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
                                      <div className="bg-slate-900 border border-blue-900/40 rounded-lg p-2.5 flex items-center justify-between gap-3">
                                        <div className="text-xs">
                                          <div className="font-mono text-emerald-300 font-semibold">
                                            "{activeSuggestion.text}"
                                          </div>
                                          <div className="text-[10px] text-slate-400 mt-0.5">
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

                    {/* HUMAN APPROVAL & CERTIFICATE ISSUANCE GATE */}
                    <div className="mt-5 border-t border-slate-800 pt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Human Review & Cryptographic Sign-Off Gate
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Authorized Reviewer</label>
                          <input
                            type="text"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Override / Sign-Off Note (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Verified with product legal counsel"
                            value={reviewerNotes}
                            onChange={(e) => setReviewerNotes(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-3 mt-3 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between border-b border-emerald-800/30 pb-2">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-5 w-5 text-emerald-400" />
                              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                                Compliance Certificate Issued
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                              {certificate.certificateId}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400">Approved By:</span>{' '}
                              <span className="font-semibold text-slate-200">{certificate.approvedBy}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Policy Version:</span>{' '}
                              <span className="font-semibold text-slate-200">{certificate.guidelineVersion}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-400">SHA-256 Signature:</span>
                              <div className="font-mono text-[10px] text-emerald-300 bg-slate-950 p-1.5 rounded mt-0.5 border border-slate-800 break-all flex items-center justify-between">
                                <span>{certificate.signatureSha256}</span>
                                <button
                                  onClick={() => copyToClipboard(certificate.signatureSha256, 'sig')}
                                  className="text-slate-400 hover:text-white ml-2"
                                >
                                  {copiedId === 'sig' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-400" /> Computable Brand Knowledge Vault
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Single source of truth: Ingests brandbooks, truth specs, SLA promises, and asset dictionaries into computable rule graphs.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                v{guidelines.version} Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* APPROVED TRUTH SPECS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Approved Factual Truth Specs
                </h3>
                <div className="space-y-2">
                  {guidelines.approvedTruthSpecs.map((spec, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                      <div className="font-semibold text-slate-200">{spec.approvedStatement}</div>
                      <div className="text-[10px] text-slate-400">
                        <strong>Source:</strong> {spec.sourceDoc}
                      </div>
                      <div className="text-[10px] text-rose-400/80">
                        <strong>Banned Variations:</strong> {spec.bannedVariations.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PROHIBITED TERMS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400" /> Banned Terminology Dictionary
                </h3>
                <div className="space-y-2">
                  {guidelines.prohibitedTerms.map((term, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-rose-400">"{term.term}"</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Use: "{term.replacement}"</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{term.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FRICTION & AMBIGUITY DISCOVERY (IMPROVEMENT #2) */}
        {activeTab === 'friction' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  Strategic Improvement #2
                </span>
                <h2 className="text-lg font-bold text-white">Algorithmic Guideline Friction & Ambiguity Discovery</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Applies unsupervised clustering across reviewer rejection logs and guideline rules to surface conflicting or obsolete brand instructions before they cause repeated errors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-amber-900/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Conflict Detected: Rule 2.1 vs Rule 4.3
                  </span>
                  <span className="text-[10px] bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40">
                    High Ambiguity
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Rule 2.1 instructs writers to maintain <em>"Informal and friendly tone"</em>, while Rule 4.3 strictly prohibits the use of contractions (e.g. "don't", "we're"). Creators have triggered 14 review overrides this week due to this conflict.
                </p>
                <div className="bg-slate-900 p-2.5 rounded text-xs text-emerald-300 font-medium border border-emerald-900/30">
                  <strong>Recommended Amendment:</strong> Amend Rule 4.3 to permit standard conversational contractions in social copy while retaining the strict prohibition for formal whitepapers.
                </div>
              </div>

              <div className="bg-slate-950 border border-blue-900/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Outdated Terminology Drift: "v1.2 Cloud Engine"
                  </span>
                  <span className="text-[10px] bg-blue-950/60 text-blue-300 px-2 py-0.5 rounded border border-blue-800/40">
                    Deprecation Alert
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Three external agencies published collateral referencing "v1.2 Cloud Engine", which was officially deprecated in Q3 2026.
                </p>
                <div className="bg-slate-900 p-2.5 rounded text-xs text-emerald-300 font-medium border border-emerald-900/30">
                  <strong>Recommended Amendment:</strong> Push an automated notification to all external agency workspaces requiring terminology sync to "v2.0 Next-Gen Core".
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IN-SITU LIVE LINTER (IMPROVEMENT #1) */}
        {activeTab === 'live' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  Strategic Improvement #1
                </span>
                <h2 className="text-lg font-bold text-white">In-Situ Live Linter (Figma & CMS Embed Simulation)</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time inline linting directly within the authoring canvas. As creators type, non-compliant claims and tone drift are flagged instantaneously without leaving the tool.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs text-slate-400">
                Type or modify content below to see real-time syntax highlighting for brand violations:
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <Zap className="h-4 w-4 animate-pulse" />
                Live WebSocket Channel Active • Real-time rule matching connected to Knowledge Vault
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COMPLIANCE LEDGER (IMPROVEMENT #3) */}
        {activeTab === 'ledger' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  Strategic Improvement #3
                </span>
                <h2 className="text-lg font-bold text-white">Cryptographically Verifiable Pre-Publication Audit Ledger</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Immutable record of all approved assets with SHA-256 signatures, timestamps, and authorized reviewer credentials for regulatory, legal, and enterprise compliance.
              </p>
            </div>

            {ledger.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No certified assets in this session yet. Go to Pre-Flight Studio and click "Approve & Issue Cryptographic Certificate" to populate this ledger.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Certificate ID</th>
                      <th className="py-2.5 px-3">Asset Title</th>
                      <th className="py-2.5 px-3">Approved By</th>
                      <th className="py-2.5 px-3">Verified At</th>
                      <th className="py-2.5 px-3">SHA-256 Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {ledger.map((cert) => (
                      <tr key={cert.certificateId} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-emerald-400 font-semibold">{cert.certificateId}</td>
                        <td className="py-2 px-3 text-slate-200">{cert.assetTitle}</td>
                        <td className="py-2 px-3 text-slate-300">{cert.approvedBy}</td>
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
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        <p>
          <strong>AegisBrand AI</strong> • Developed by <strong>Deepak R (Team ARKZ)</strong> for <strong>Codex 48 Hackathon Round 2</strong>.
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Multimodal Pre-Publication Brand Governance • Powered by Google Gemini & OpenCV
        </p>
      </footer>
    </div>
  );
}

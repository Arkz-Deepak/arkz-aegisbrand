import { BrandGuideline, VerificationIssue, VerificationReport, RewriteOption, VisualCheckResult } from '@/types/brand';

const CANDIDATE_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
];

export async function verifyContentWithGemini(
  content: string,
  guideline: BrandGuideline,
  apiKey?: string,
  channel?: string,
  preferredModel?: string
): Promise<VerificationReport> {
  const startTime = performance.now();
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  if (activeKey) {
    let lastError: string | null = null;
    let quotaExceededModel: string | null = null;

    const modelsToTry = preferredModel
      ? [preferredModel, ...CANDIDATE_MODELS.filter((m) => m !== preferredModel)]
      : CANDIDATE_MODELS;

    for (const model of modelsToTry) {
      try {
        const prompt = `
You are the core brand-governance inspection engine of AegisBrand AI for Team ARKZ.
Channel Context: ${channel || 'Digital Marketing'}
Inspect the following copy against the provided Brand Knowledge Vault.

BRAND GUIDELINES:
- Brand Name: ${guideline.name} (v${guideline.version})
- Approved Tone: ${guideline.toneArchetypes.primary}
- Tones to Avoid: ${guideline.toneArchetypes.avoid.join(', ')}
- Prohibited Terms: ${JSON.stringify(guideline.prohibitedTerms)}
- Approved Factual Truth Specs: ${JSON.stringify(guideline.approvedTruthSpecs)}
- Pricing Rules: ${JSON.stringify(guideline.pricingRules)}

CONTENT TO INSPECT:
"""
${content}
"""

TASK:
1. Detect unverified promotional claims, false SLA promises, or factual errors.
2. Detect tone drift (e.g. overly casual tech-bro slang, hype, non-authoritative).
3. Detect prohibited terminology and unverified superlatives.
4. For each issue, explain why it was flagged, cite the exact source guideline, assess the risk (e.g. FTC regulatory liability, SLA contract breach), and generate THREE ranked rewrite options that preserve creator intent:
   - "Conservative": Legally approved, compliant phrasing.
   - "Balanced": Professional, engaging, and compliant.
   - "Creative": High-energy, punchy marketing copy that still stays within brand bounds.
5. Provide overall adherence score (0-100), tone score, and factual accuracy score.

Return STRICT JSON matching this schema:
{
  "overallScore": number,
  "toneAlignmentScore": number,
  "factualAccuracyScore": number,
  "issues": [
    {
      "id": string,
      "type": "CRITICAL_CLAIM" | "TONE_DRIFT" | "TERMINOLOGY",
      "severity": "high" | "medium" | "low",
      "flaggedExcerpt": string,
      "ruleCitation": string,
      "explanation": string,
      "riskAssessment": string,
      "suggestions": [
        { "style": "Conservative", "text": string, "rationale": string },
        { "style": "Balanced", "text": string, "rationale": string },
        { "style": "Creative", "text": string, "rationale": string }
      ]
    }
  ]
}
`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
                ...(model.includes('preview') || model === 'gemini-3-flash-preview' ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
              },
            }),
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            rawText = rawText.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(rawText);
            const latencyMs = Math.round(performance.now() - startTime);

            // Normalize issue items
            const issues: VerificationIssue[] = (parsed.issues || []).map((iss: Record<string, unknown> | string, idx: number) => {
              if (typeof iss === 'string') {
                return {
                  id: `issue-${idx}-${Date.now()}`,
                  type: 'CRITICAL_CLAIM',
                  severity: 'high',
                  flaggedExcerpt: iss.substring(0, 40),
                  ruleCitation: 'Enterprise Claims Policy',
                  explanation: iss,
                  riskAssessment: 'Potential compliance or brand alignment risk.',
                  suggestions: [
                    { style: 'Conservative', text: 'compliant phrasing', rationale: 'Direct alignment' },
                    { style: 'Balanced', text: 'professional phrasing', rationale: 'Brand balance' },
                    { style: 'Creative', text: 'impactful phrasing', rationale: 'Creative engagement' },
                  ],
                };
              }

              const rawType = String(iss.type || '').toUpperCase();
              let type: VerificationIssue['type'] = 'TERMINOLOGY';
              if (rawType.includes('CLAIM') || rawType.includes('SLA') || rawType.includes('FACT') || rawType.includes('GUARANTEE')) {
                type = 'CRITICAL_CLAIM';
              } else if (rawType.includes('TONE') || rawType.includes('STYLE') || rawType.includes('VOICE')) {
                type = 'TONE_DRIFT';
              }

              return {
                id: String(iss.id || `issue-${idx}-${Date.now()}`),
                type,
                severity: (iss.severity === 'medium' || iss.severity === 'low') ? iss.severity : 'high',
                flaggedExcerpt: String(iss.flaggedExcerpt || ''),
                ruleCitation: String(iss.ruleCitation || 'Brand Guidelines v2.4'),
                explanation: String(iss.explanation || 'Violates brand governance rules.'),
                riskAssessment: String(iss.riskAssessment || 'Potential regulatory or brand alignment risk.'),
                suggestions: Array.isArray(iss.suggestions) ? iss.suggestions : [],
              };
            });

            let debugNote = `Live AI verified via Google Gemini (${model}) in ${latencyMs}ms.`;
            if (quotaExceededModel) {
              debugNote += ` (${quotaExceededModel} daily quota limit was reached, auto-routed to ${model}).`;
            }

            return {
              assetId: `ast-${Date.now()}`,
              timestamp: new Date().toISOString(),
              engineUsed: 'GEMINI_LIVE',
              modelUsed: model,
              latencyMs,
              apiDebugInfo: debugNote,
              overallScore: Math.min(100, Math.max(10, parsed.overallScore ?? 85)),
              toneAlignmentScore: Math.min(100, Math.max(10, parsed.toneAlignmentScore ?? 85)),
              factualAccuracyScore: Math.min(100, Math.max(10, parsed.factualAccuracyScore ?? 85)),
              visualAdherenceScore: 100,
              channelContext: channel,
              issues,
              status: issues.length > 0 ? 'CHANGES_REQUESTED' : 'APPROVED',
            };
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || response.statusText;
          if (response.status === 429) {
            quotaExceededModel = model;
          }
          lastError = `HTTP ${response.status} on ${model}: ${errMsg}`;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        lastError = `Model ${model} (${message})`;
      }
    }

    console.warn('Gemini models attempted had issues, falling back to deterministic engine:', lastError);
    const deterministicReport = runDeterministicVerification(content, guideline, channel);
    deterministicReport.apiDebugInfo = `Gemini call note: ${lastError}. Local deterministic engine provided instant fallback.`;
    return deterministicReport;
  }

  // Deterministic Rule & Semantic Verification Engine
  const report = runDeterministicVerification(content, guideline, channel);
  report.apiDebugInfo = 'No GEMINI_API_KEY detected in environment or request. Local deterministic rule & semantic engine active.';
  return report;
}

export function runDeterministicVerification(
  content: string,
  guideline: BrandGuideline,
  channel?: string
): VerificationReport {
  const issues: VerificationIssue[] = [];
  const lowerContent = content.toLowerCase();

  // 1. Prohibited Terms Check from Guideline
  guideline.prohibitedTerms.forEach((item, idx) => {
    const termLower = item.term.toLowerCase();
    const regex = new RegExp(`\\b${escapeRegExp(termLower)}\\b`, 'gi');
    const match = regex.exec(content);
    if (match) {
      const excerpt = match[0];
      issues.push({
        id: `term-${idx}-${Date.now()}`,
        type: 'TERMINOLOGY',
        severity: 'high',
        flaggedExcerpt: excerpt,
        ruleCitation: `Brand Terminology Policy, Section 3.2 ("${item.term}")`,
        explanation: `The term "${excerpt}" is prohibited in enterprise collateral. ${item.reason}`,
        riskAssessment: 'Damages brand positioning and creates potential legal/contractual vulnerability.',
        suggestions: [
          {
            style: 'Conservative',
            text: item.replacement,
            rationale: 'Directly substitutes the approved standardized terminology.',
          },
          {
            style: 'Balanced',
            text: `enterprise-grade ${item.replacement}`,
            rationale: 'Retains commercial confidence while eliminating non-compliant phrasing.',
          },
          {
            style: 'Creative',
            text: `industry-leading ${item.replacement}`,
            rationale: 'Preserves high marketing energy within approved brand boundaries.',
          },
        ],
      });
    }
  });

  // 2. Factual Claim Verification (SLA, Truth Specs)
  guideline.approvedTruthSpecs.forEach((spec, idx) => {
    spec.bannedVariations.forEach((banned) => {
      if (lowerContent.includes(banned.toLowerCase())) {
        issues.push({
          id: `claim-${idx}-${Date.now()}`,
          type: 'CRITICAL_CLAIM',
          severity: 'high',
          flaggedExcerpt: banned,
          ruleCitation: spec.sourceDoc,
          explanation: `The statement "${banned}" contradicts verified enterprise documentation. Approved statement: "${spec.approvedStatement}"`,
          riskAssessment: 'High regulatory exposure under FTC truth-in-advertising guidelines and SLA breach liability.',
          suggestions: [
            {
              style: 'Conservative',
              text: spec.approvedStatement,
              rationale: 'Verbatim authorized statement from official compliance documentation.',
            },
            {
              style: 'Balanced',
              text: 'backed by our enterprise SLA with 99.95% verified availability',
              rationale: 'Conversational yet rigorously aligned with legal commitments.',
            },
            {
              style: 'Creative',
              text: 'delivering dependable cloud resilience with financial SLA guarantees',
              rationale: 'Impactful narrative focusing on business outcome without false superlatives.',
            },
          ],
        });
      }
    });
  });

  // 3. Dynamic Superlatives & Over-promising
  const unverifiedSuperlatives = [
    { word: '#1', reason: 'Unsubstantiated market claim without third-party auditor citation.' },
    { word: 'undisputed champion', reason: 'Aggressive marketing claim lacking factual verification.' },
    { word: 'never goes down', reason: 'Absolutist SLA assertion violating contract boundaries.' },
    { word: 'completely broken', reason: 'Direct competitor disparagement breaching professional guidelines.' },
    { word: 'zero data footprint anywhere', reason: 'Technically inaccurate and legally unsupportable claim.' },
    { word: 'completely unhackable', reason: 'Misleading cybersecurity assertion violating compliance standards.' },
    { word: 'winner of every ai benchmark', reason: 'Uncited competitive ranking assertion.' },
  ];

  unverifiedSuperlatives.forEach((item, idx) => {
    if (lowerContent.includes(item.word.toLowerCase())) {
      const match = new RegExp(`\\b${escapeRegExp(item.word)}\\b`, 'i').exec(content);
      const excerpt = match ? match[0] : item.word;
      if (!issues.some((i) => i.flaggedExcerpt.toLowerCase() === excerpt.toLowerCase())) {
        issues.push({
          id: `sup-${idx}-${Date.now()}`,
          type: 'CRITICAL_CLAIM',
          severity: 'high',
          flaggedExcerpt: excerpt,
          ruleCitation: 'Enterprise Claims & Truth-in-Advertising Policy v2.4',
          explanation: `The claim "${excerpt}" is an unsupported superlative. ${item.reason}`,
          riskAssessment: 'Violates truth-in-advertising guidelines and creates reputational liability.',
          suggestions: [
            {
              style: 'Conservative',
              text: 'recognized as an industry leader',
              rationale: 'Temperate phrasing referencing third-party evaluations.',
            },
            {
              style: 'Balanced',
              text: 'high-performance enterprise solution',
              rationale: 'Focuses on architectural capability without ungrounded ranking claims.',
            },
            {
              style: 'Creative',
              text: 'trusted by leading global organizations',
              rationale: 'Customer-focused social proof.',
            },
          ],
        });
      }
    }
  });

  // 4. Tone Drift Heuristics
  const casualSlang = [
    'crazy excited', 'crushing it', 'game changer', 'unbelievable', 'insane speed',
    'stop wasting cash', 'go crazy', 'winning', '#winning', '#gamechanger'
  ];
  casualSlang.forEach((phrase, idx) => {
    if (lowerContent.includes(phrase)) {
      issues.push({
        id: `tone-${idx}-${Date.now()}`,
        type: 'TONE_DRIFT',
        severity: 'medium',
        flaggedExcerpt: phrase,
        ruleCitation: 'Brand Voice Manual v2.4, Page 8 (Tone Archetype: Authoritative & Clear)',
        explanation: `The phrase "${phrase}" introduces colloquial, over-hyped tone that departs from the enterprise brand persona.`,
        riskAssessment: 'Dilutes enterprise credibility and sounds informal to C-level buyers.',
        suggestions: [
          {
            style: 'Conservative',
            text: 'pleased to introduce',
            rationale: 'Formal, dignified enterprise announcement phrasing.',
          },
          {
            style: 'Balanced',
            text: 'delighted to announce',
            rationale: 'Enthusiastic without relying on hyperbole.',
          },
          {
            style: 'Creative',
            text: 'proud to unlock next-generation performance with',
            rationale: 'Action-oriented and forward-looking.',
          },
        ],
      });
    }
  });

  // Calculate Scores
  const totalDeductions = issues.reduce((acc, issue) => {
    if (issue.severity === 'high') return acc + 20;
    if (issue.severity === 'medium') return acc + 10;
    return acc + 5;
  }, 0);

  const overallScore = Math.max(15, Math.min(100, 100 - totalDeductions));
  const claimIssues = issues.filter((i) => i.type === 'CRITICAL_CLAIM').length;
  const toneIssues = issues.filter((i) => i.type === 'TONE_DRIFT').length;

  return {
    assetId: `ast-${Date.now()}`,
    timestamp: new Date().toISOString(),
    engineUsed: 'DETERMINISTIC',
    overallScore,
    toneAlignmentScore: Math.max(20, 100 - toneIssues * 25),
    factualAccuracyScore: Math.max(10, 100 - claimIssues * 40),
    visualAdherenceScore: 100,
    channelContext: channel,
    issues,
    status: issues.length > 0 ? 'CHANGES_REQUESTED' : 'APPROVED',
  };
}

export function calculateWcagContrast(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

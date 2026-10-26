export interface BrandGuideline {
  id: string;
  name: string;
  version: string;
  lastUpdated: string;
  toneArchetypes: {
    primary: string;
    avoid: string[];
    readingLevel: string;
  };
  prohibitedTerms: {
    term: string;
    reason: string;
    replacement: string;
  }[];
  approvedTruthSpecs: {
    claimKey: string;
    approvedStatement: string;
    bannedVariations: string[];
    sourceDoc: string;
  }[];
  pricingRules: {
    tier: string;
    price: string;
    features: string[];
  }[];
  visualRules: {
    primaryPalette: { name: string; hex: string }[];
    secondaryPalette: { name: string; hex: string }[];
    minContrastRatio: number;
    logoRules: {
      minExclusionZonePx: number;
      allowInversion: boolean;
      approvedVariants: string[];
    };
  };
}

export type IssueSeverity = 'CRITICAL_CLAIM' | 'TONE_DRIFT' | 'TERMINOLOGY' | 'VISUAL_DEFECT' | 'ACCESSIBILITY';

export interface RewriteOption {
  style: 'Conservative' | 'Balanced' | 'Creative';
  text: string;
  rationale: string;
}

export interface VerificationIssue {
  id: string;
  type: IssueSeverity;
  severity: 'high' | 'medium' | 'low';
  flaggedExcerpt: string;
  ruleCitation: string;
  explanation: string;
  riskAssessment: string;
  suggestions: RewriteOption[];
  resolved?: boolean;
}

export interface VisualCheckResult {
  hasLogo: boolean;
  logoBoundingBox?: { x: number; y: number; width: number; height: number };
  detectedColors: { hex: string; percentage: number; closestBrandMatch: string; deltaE: number }[];
  contrastRatio: number;
  wcagAAMet: boolean;
  wcagAAAMet: boolean;
  issues: string[];
}

export interface VerificationReport {
  assetId: string;
  timestamp: string;
  engineUsed: 'GEMINI_LIVE' | 'DETERMINISTIC';
  modelUsed?: string;
  latencyMs?: number;
  apiDebugInfo?: string;
  overallScore: number;
  toneAlignmentScore: number;
  factualAccuracyScore: number;
  visualAdherenceScore: number;
  channelContext?: string;
  issues: VerificationIssue[];
  visualCheck?: VisualCheckResult;
  status: 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED';
  reviewerNotes?: string;
  certificateHash?: string;
}

export interface ComplianceCertificate {
  certificateId: string;
  assetTitle: string;
  contentHash: string;
  guidelineVersion: string;
  verifiedAt: string;
  approvedBy: string;
  signatureSha256: string;
  verdict: 'APPROVED_FOR_PUBLICATION';
}

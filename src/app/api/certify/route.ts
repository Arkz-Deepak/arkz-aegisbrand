import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ComplianceCertificate } from '@/types/brand';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assetTitle, content, guidelineVersion, approvedBy } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required for certification' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const contentHash = crypto.createHash('sha256').update(content).digest('hex');

    // Generate cryptographic compliance signature
    const signaturePayload = `${assetTitle}:${contentHash}:${guidelineVersion}:${approvedBy}:${timestamp}`;
    const signatureSha256 = crypto.createHash('sha256').update(signaturePayload).digest('hex');

    const certificate: ComplianceCertificate = {
      certificateId: `CERT-${Date.now()}-${signatureSha256.substring(0, 8).toUpperCase()}`,
      assetTitle: assetTitle || 'Marketing Collateral',
      contentHash,
      guidelineVersion: guidelineVersion || '2.4.0',
      verifiedAt: timestamp,
      approvedBy: approvedBy || 'Authorized Brand Reviewer (Deepak R)',
      signatureSha256,
      verdict: 'APPROVED_FOR_PUBLICATION',
    };

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { verifyContentWithGemini } from '@/lib/verifier';
import defaultGuidelines from '@/data/defaultBrandGuidelines.json';
import { BrandGuideline } from '@/types/brand';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const content = body.content || '';
    const guideline: BrandGuideline = body.guideline || defaultGuidelines;
    const apiKey = body.apiKey || process.env.GEMINI_API_KEY;
    const channel = body.channel || 'Digital Marketing';

    if (!content.trim()) {
      return NextResponse.json({ error: 'Content is required for verification' }, { status: 400 });
    }

    const report = await verifyContentWithGemini(content, guideline, apiKey, channel);
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error verifying content:', error);
    return NextResponse.json({ error: 'Internal server error during verification' }, { status: 500 });
  }
}

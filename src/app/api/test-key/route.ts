import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const key = body.apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      return NextResponse.json({
        valid: false,
        keySource: 'none',
        message: 'No GEMINI_API_KEY detected in environment variables or request payload.',
      });
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        valid: false,
        keySource: body.apiKey ? 'client_input' : 'server_env',
        error: data.error?.message || `HTTP ${res.status}: Failed to authenticate with Google Gemini API`,
        code: data.error?.code,
      });
    }

    const flashModels = (data.models || [])
      .filter((m: { name: string }) => m.name.includes('flash') || m.name.includes('gemini'))
      .map((m: { name: string; displayName?: string }) => ({
        id: m.name.replace('models/', ''),
        displayName: m.displayName || m.name,
      }));

    return NextResponse.json({
      valid: true,
      keySource: body.apiKey ? 'client_input' : 'server_env',
      totalModels: data.models?.length || 0,
      supportedModels: flashModels.slice(0, 8),
      message: 'Gemini API successfully authenticated! Live AI inspection is active.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      valid: false,
      error: `Network / Exception: ${message}`,
    });
  }
}

import { NextResponse } from 'next/server';

const TEST_MODELS = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.8-pro', 'gemini-2.0-flash', 'gemini-1.5-flash'];

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

    // 1. Fetch available models list
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

    const availableModelNames: string[] = (data.models || []).map((m: { name: string }) => m.name.replace('models/', ''));

    // 2. Actively ping gemini-3.8-flash (or top candidate)
    let pingedModel = 'gemini-3.8-flash';
    let pingSuccess = false;
    let pingError: string | null = null;

    for (const testModel of TEST_MODELS) {
      try {
        const pingRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Respond with OK' }] }],
            }),
          }
        );

        if (pingRes.ok) {
          pingSuccess = true;
          pingedModel = testModel;
          break;
        } else {
          const errBody = await pingRes.json().catch(() => ({}));
          pingError = `Model ${testModel}: ${errBody.error?.message || pingRes.statusText}`;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        pingError = `${testModel} exception: ${message}`;
      }
    }

    return NextResponse.json({
      valid: true,
      keySource: body.apiKey ? 'client_input' : 'server_env',
      pingSuccess,
      activeModel: pingedModel,
      pingError,
      availableModelsCount: availableModelNames.length,
      availableModels: availableModelNames.slice(0, 10),
      message: pingSuccess
        ? `Successfully authenticated! Active Model: ${pingedModel}`
        : `Key valid, but active generation ping had issues: ${pingError}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      valid: false,
      error: `Network Exception: ${message}`,
    });
  }
}

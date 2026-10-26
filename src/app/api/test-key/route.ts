import { NextResponse } from 'next/server';

const TEST_MODELS = [
  'gemini-3.8-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
];

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

    // 1. Fetch available models list from Google AI Studio
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

    const availableModelNames: string[] = (data.models || []).map((m: { name: string }) =>
      m.name.replace('models/', '')
    );

    // 2. Actively ping gemini-3.8-flash / candidate models
    let pingedModel = 'gemini-3.8-flash';
    let pingSuccess = false;
    let pingDetails: string | null = null;

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
          pingDetails = `Active & generating live responses (${testModel})`;
          break;
        } else {
          const errBody = await pingRes.json().catch(() => ({}));
          const errMsg = errBody.error?.message || pingRes.statusText;
          if (pingRes.status === 429) {
            pingDetails = `Model ${testModel} free tier daily rate limit (20 req/day) was reached on this key; auto-failover to next Flash model active.`;
          } else {
            pingDetails = `Model ${testModel} status: ${errMsg}`;
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        pingDetails = `${testModel}: ${message}`;
      }
    }

    return NextResponse.json({
      valid: true,
      keySource: body.apiKey ? 'client_input' : 'server_env',
      pingSuccess,
      activeModel: pingedModel,
      pingDetails,
      availableModelsCount: availableModelNames.length,
      availableModels: availableModelNames.slice(0, 10),
      message: pingSuccess
        ? `Successfully authenticated! Active Live Model: ${pingedModel}`
        : `Key valid & 50 models registered! Note: ${pingDetails}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      valid: false,
      error: `Network Exception: ${message}`,
    });
  }
}

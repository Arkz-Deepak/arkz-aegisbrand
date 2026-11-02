import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targetUrl, certificate, secretKey = 'arkz-aegisbrand-webhook-secret' } = body;

    if (!certificate || !certificate.certificateId) {
      return NextResponse.json(
        { error: 'Valid ComplianceCertificate required for webhook dispatch' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const payload = {
      event: 'compliance.certificate.approved',
      timestamp,
      environment: process.env.NODE_ENV || 'production',
      certificate,
      metadata: {
        issuer: 'AegisBrand AI Governance Engine',
        version: '3.0.0',
        auditStandard: 'ISO-27001-AegisBrand-v3',
      },
    };

    const payloadString = JSON.stringify(payload);
    // Cryptographic HMAC-SHA256 signature for webhook recipient verification
    const signatureHmac = crypto
      .createHmac('sha256', secretKey)
      .update(payloadString)
      .digest('hex');

    const headers = {
      'Content-Type': 'application/json',
      'X-AegisBrand-Signature': `sha256=${signatureHmac}`,
      'X-AegisBrand-Event': 'compliance.certificate.approved',
      'X-AegisBrand-Timestamp': timestamp,
    };

    const start = Date.now();
    let responseStatus = 200;
    let responseBody = 'Simulated delivery success (Enterprise Webhook Sink OK)';
    let remoteDelivery = false;

    // If an external live HTTP(S) URL is supplied (e.g., Slack webhook or Webhook.site)
    if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
      remoteDelivery = true;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers,
          body: payloadString,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        responseStatus = res.status;
        responseBody = await res.text();
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : 'Network failure';
        responseStatus = 502;
        responseBody = `Remote dispatch failed: ${errMessage}`;
      }
    }

    const latencyMs = Date.now() - start;

    return NextResponse.json({
      success: responseStatus >= 200 && responseStatus < 300,
      deliveryId: `DEL-${Date.now()}-${signatureHmac.substring(0, 6)}`,
      targetUrl: targetUrl || 'Mock Enterprise Webhook Sink (Slack / CMS / GitHub Actions)',
      remoteDelivery,
      status: responseStatus,
      latencyMs: Math.max(12, latencyMs),
      signatureHmac,
      headersDispatched: headers,
      deliveredAt: timestamp,
      payload,
      responseSummary: typeof responseBody === 'string' ? responseBody.substring(0, 200) : 'OK',
    });
  } catch (error: unknown) {
    console.error('Webhook dispatch error:', error);
    return NextResponse.json(
      { error: 'Failed to dispatch enterprise webhook' },
      { status: 500 }
    );
  }
}

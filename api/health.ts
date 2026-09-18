import type { Request, Response } from 'express';

/**
 * Serverless health check endpoint.
 * Route: GET /api/health
 */
export default async function handler(req: Request | any, res?: Response | any) {
  const accountKeyConfigured = Boolean(
    process.env.LTA_ACCOUNT_KEY || 
    process.env.LTA_DATAMALL_KEY ||
    req.headers?.['accountkey'] ||
    req.headers?.['x-account-key']
  );

  const payload = {
    status: 'ok',
    service: 'lta-carpark-api',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    ltaKeyConfigured: accountKeyConfigured,
    endpoints: {
      health: '/api/health',
      carparkAvailability: '/api/carparkavailability',
      ltaDatamallSource: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
    },
  };

  if (res && typeof res.status === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, x-account-key');
    return res.status(200).json(payload);
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

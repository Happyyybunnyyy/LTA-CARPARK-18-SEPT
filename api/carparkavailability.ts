import type { Request, Response } from 'express';

const LTA_DATAMALL_CARPARK_URL = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

// In-memory cache for recent responses (60-second TTL) to protect against rate-limiting
interface CacheEntry {
  timestamp: number;
  data: any;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export interface LtaCarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // e.g. "1.2935 103.8572"
  AvailableLots: number;
  LotType: string; // 'C' for Cars, 'H' for Heavy, 'Y' for Motorcycles
  Agency: 'HDB' | 'URA' | 'LTA' | string;
}

export interface LtaDataMallResponse {
  'odata.metadata'?: string;
  value: LtaCarparkItem[];
}

/**
 * Serverless function to pull live carpark availability from LTA DataMall.
 * Route: GET /api/carparkavailability
 *
 * Query Parameters:
 *  - skip: number of records to skip (default: 0)
 *  - all: if "true" or "1", auto-paginates to fetch all records across Singapore
 *  - refresh: if "true" or "1", bypasses the 60s memory cache
 */
export default async function handler(req: Request | any, res?: Response | any) {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, x-account-key');
      return res.status(204).end();
    }
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, AccountKey, x-account-key',
      },
    });
  }

  // 1. Resolve AccountKey from environment or headers without hardcoding
  const accountKey = 
    process.env.LTA_ACCOUNT_KEY || 
    process.env.LTA_DATAMALL_KEY ||
    (req.headers ? (req.headers['accountkey'] || req.headers['x-account-key']) : undefined);

  if (!accountKey || typeof accountKey !== 'string' || accountKey.trim() === '') {
    const errorBody = {
      success: false,
      error: 'LTA_ACCOUNT_KEY_MISSING',
      message: 'AccountKey is not set. Please configure LTA_ACCOUNT_KEY in your environment variables or provide an AccountKey header.',
      endpoint: LTA_DATAMALL_CARPARK_URL,
      headerRequired: 'AccountKey: <LTA_ACCOUNT_KEY>',
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(401).json(errorBody);
    }
    return new Response(JSON.stringify(errorBody), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Parse query parameters
  const query = req.query || (req.url ? Object.fromEntries(new URL(req.url, 'http://localhost').searchParams) : {});
  const skipParam = Number(query.$skip ?? query.skip ?? 0);
  const fetchAll = query.all === 'true' || query.all === '1';
  const forceRefresh = query.refresh === 'true' || query.refresh === '1';

  const cacheKey = fetchAll ? 'all_carparks' : `skip_${skipParam}`;
  const now = Date.now();

  // Check cache
  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      const cachedPayload = {
        ...cached.data,
        cached: true,
        cacheAgeSeconds: Math.floor((now - cached.timestamp) / 1000),
      };

      if (res && typeof res.status === 'function') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json(cachedPayload);
      }
      return new Response(JSON.stringify(cachedPayload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  try {
    if (fetchAll) {
      // Auto-paginate through LTA DataMall (typically 4-5 pages of 500 records each)
      const allItems: LtaCarparkItem[] = [];
      let currentSkip = 0;
      let hasMore = true;
      let pagesFetched = 0;
      const MAX_PAGES = 10; // Safety guard: max 5,000 records

      while (hasMore && pagesFetched < MAX_PAGES) {
        const pageUrl = currentSkip > 0 
          ? `${LTA_DATAMALL_CARPARK_URL}?$skip=${currentSkip}` 
          : LTA_DATAMALL_CARPARK_URL;

        const pageRes = await fetch(pageUrl, {
          method: 'GET',
          headers: {
            'AccountKey': accountKey.trim(),
            'accept': 'application/json',
          },
        });

        if (!pageRes.ok) {
          const errText = await pageRes.text();
          throw new Error(`LTA DataMall API error (HTTP ${pageRes.status}): ${errText}`);
        }

        const pageData = (await pageRes.json()) as LtaDataMallResponse;
        const items = pageData.value || [];
        allItems.push(...items);

        pagesFetched++;
        if (items.length < 500) {
          hasMore = false;
        } else {
          currentSkip += 500;
        }
      }

      const responsePayload = {
        success: true,
        source: 'LTA DataMall CarParkAvailabilityv2',
        timestamp: new Date().toISOString(),
        totalCount: allItems.length,
        pages: pagesFetched,
        value: allItems,
      };

      cache.set(cacheKey, { timestamp: now, data: responsePayload });

      if (res && typeof res.status === 'function') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json(responsePayload);
      }
      return new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      // Fetch single page
      const targetUrl = skipParam > 0
        ? `${LTA_DATAMALL_CARPARK_URL}?$skip=${skipParam}`
        : LTA_DATAMALL_CARPARK_URL;

      const ltaResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'AccountKey': accountKey.trim(),
          'accept': 'application/json',
        },
      });

      if (!ltaResponse.ok) {
        const errText = await ltaResponse.text();
        const errorPayload = {
          success: false,
          error: 'LTA_DATAMALL_API_ERROR',
          statusCode: ltaResponse.status,
          message: errText || ltaResponse.statusText,
        };

        if (res && typeof res.status === 'function') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.status(ltaResponse.status).json(errorPayload);
        }
        return new Response(JSON.stringify(errorPayload), {
          status: ltaResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const data = (await ltaResponse.json()) as LtaDataMallResponse;
      const responsePayload = {
        success: true,
        source: 'LTA DataMall CarParkAvailabilityv2',
        timestamp: new Date().toISOString(),
        skip: skipParam,
        count: data.value?.length || 0,
        value: data.value || [],
        metadata: data['odata.metadata'],
      };

      cache.set(cacheKey, { timestamp: now, data: responsePayload });

      if (res && typeof res.status === 'function') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json(responsePayload);
      }
      return new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (error: any) {
    const errorPayload = {
      success: false,
      error: 'SERVER_REQUEST_FAILED',
      message: error.message || 'Failed to communicate with LTA DataMall',
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(500).json(errorPayload);
    }
    return new Response(JSON.stringify(errorPayload), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

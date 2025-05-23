import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { groqLLM } from '@/utils/groqLLM';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Helper function to get client IP
function getClientIP(req: NextRequest): string {
  // Try different headers for IP detection
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default identifier
  return 'unknown';
}

export async function POST(req: NextRequest) {
  let browser;
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json(
        { error: "URL required" },
        { status: 400 }
      );
    }
    if (!url.startsWith('http')) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const cacheKey = `analysis:${url}`;
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    // Rate limiting
    const ip = getClientIP(req);
    const rateKey = `rate:${ip}`;
    const count = await redis.incr(rateKey);
    await redis.expire(rateKey, 60);
    if (count > 5) {
      return NextResponse.json(
        { error: "Rate limit exceeded - try again in 1 minute" },
        { status: 429 }
      );
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
    );

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Verify successful page load
    const content = await page.content();
    if (content.length < 500) {
      throw new Error('Page content loading failed');
    }

    const title = await page.title();
    const description = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('p'))
        .map(p => p.textContent?.trim() || '')
        .join(' ')
        .slice(0, 3000);
    });

    const prompt = `Analyze the following rental listing for potential scams. Reply in JSON:
{
  "suspicion": 1-10,
  "flags": ["..."],
  "reasoning": "..."
}

Title: ${title}
Description: ${description}`;

    const analysis = await groqLLM(prompt);

    // Validate response structure
    if (!analysis?.suspicion || !analysis.flags || !analysis.reasoning) {
      throw new Error('Invalid analysis structure from Groq');
    }

    await redis.set(cacheKey, analysis, { ex: 3600 });

    return NextResponse.json(analysis);
  } catch (err) {
    if (err instanceof Error) {
      console.error("Analysis Error:", {
        message: err.message,
        stack: err.stack,
        url: req.url
      });
      return NextResponse.json(
        { error: "Analysis failed", details: err.message },
        { status: 500 }
      );
    } else {
      console.error("Unknown Analysis Error:", err);
      return NextResponse.json(
        { error: "Unknown error occurred" },
        { status: 500 }
      );
    }
  } finally {
    if (browser) await browser.close().catch(console.error);
  }
}
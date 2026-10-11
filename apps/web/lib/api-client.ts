import { z } from 'zod';
import type {
  Quote,
  OHLCV,
  Fundamentals,
  EarningsItem,
  NewsItem,
  Filing,
  ScreenerQuery,
  ScreenerResult,
  ScreenerPreset,
  Watchlist,
  Portfolio,
  PortfolioRiskMetrics,
  AlertRule,
  AlertNotification,
  ThesisReport,
  NLScreenerOutput,
  FilingDiffReport,
  PortfolioRiskExplanation,
  AnomalyExplanationReport,
  BacktestAssistantResponse,
} from '@stockan/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.any().optional(),
    })
    .optional(),
  meta: z.record(z.string(), z.any()).optional(),
});

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const raw = await res.json();
  const parsed = ApiResponseSchema.safeParse(raw);
  if (!res.ok || (parsed.success && !parsed.data.success)) {
    const errorMsg =
      (parsed.success && parsed.data.error?.message) ||
      raw.error?.message ||
      `API error ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }

  return (parsed.success ? parsed.data.data : raw.data) as T;
}

export const api = {
  // Market
  getQuote: (symbol: string) => fetchJson<Quote>(`/market/quote/${symbol}`),
  getHistory: (symbol: string, interval = '1d', range = '1y') =>
    fetchJson<OHLCV[]>(`/market/history/${symbol}?interval=${interval}&range=${range}`),
  getFundamentals: (symbol: string) => fetchJson<Fundamentals>(`/market/fundamentals/${symbol}`),
  getEarnings: () => fetchJson<EarningsItem[]>('/market/earnings'),
  getNews: (symbol?: string) =>
    fetchJson<NewsItem[]>(`/market/news${symbol ? `?symbol=${symbol}` : ''}`),
  getFilings: (symbol: string) => fetchJson<Filing[]>(`/market/filings/${symbol}`),

  // Live SSE Stream
  subscribeQuotesStream: (
    symbols: string[],
    onQuote: (quote: Quote) => void,
    onError?: (err: any) => void
  ): (() => void) => {
    if (typeof window === 'undefined') return () => {};
    const url = `${API_BASE}/market/stream?symbols=${symbols.join(',')}`;
    const es = new EventSource(url);
    es.addEventListener('quote', (e) => {
      try {
        const data = JSON.parse(e.data);
        onQuote(data);
      } catch (err) {
        if (onError) onError(err);
      }
    });
    es.onerror = (err) => {
      if (onError) onError(err);
    };
    return () => es.close();
  },

  // Screener
  runScreener: (query: ScreenerQuery) =>
    fetchJson<ScreenerResult>('/screener/run', {
      method: 'POST',
      body: JSON.stringify(query),
    }),
  getScreenerPresets: () => fetchJson<ScreenerPreset[]>('/screener/presets'),

  // Watchlists
  getWatchlists: () => fetchJson<Watchlist[]>('/watchlists'),
  createWatchlist: (
    data: { name: string; description?: string; symbols?: string[] } | string,
    description?: string
  ) => {
    const payload =
      typeof data === 'string'
        ? { name: data, description: description ?? '', symbols: [] }
        : { name: data.name, description: data.description ?? '', symbols: data.symbols ?? [] };
    return fetchJson<Watchlist>('/watchlists', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  addWatchlistItem: (watchlistId: string, symbol: string) =>
    fetchJson<Watchlist>(`/watchlists/${watchlistId}/items`, {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    }),
  removeWatchlistItem: (watchlistId: string, symbol: string) =>
    fetchJson<Watchlist>(`/watchlists/${watchlistId}/items/${symbol}`, {
      method: 'DELETE',
    }),
  addSymbolToWatchlist: (watchlistId: string, symbol: string) =>
    fetchJson<Watchlist>(`/watchlists/${watchlistId}/items`, {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    }),
  removeSymbolFromWatchlist: (watchlistId: string, symbol: string) =>
    fetchJson<Watchlist>(`/watchlists/${watchlistId}/items/${symbol}`, {
      method: 'DELETE',
    }),

  // Portfolio
  getPortfolio: () => fetchJson<Portfolio>('/portfolio'),
  getPortfolios: () => fetchJson<Portfolio[]>('/portfolio'),
  addPosition: (data: { symbol: string; shares: number; averageCost: number }) =>
    fetchJson<Portfolio>('/portfolio/positions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deletePosition: (id: string) =>
    fetchJson<Portfolio>(`/portfolio/positions/${id}`, {
      method: 'DELETE',
    }),
  getPortfolioRisk: (portfolioId?: string) =>
    fetchJson<PortfolioRiskMetrics>(portfolioId ? `/portfolio/${portfolioId}/risk` : '/portfolio/risk'),

  // Alerts
  getAlerts: () => fetchJson<AlertRule[]>('/alerts'),
  createAlert: (data: { symbol: string; type: string; threshold: number }) =>
    fetchJson<AlertRule>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAlertNotifications: () => fetchJson<AlertNotification[]>('/alerts/notifications'),

  // AI Orchestration Layer
  getThesis: (symbol: string) => fetchJson<ThesisReport>(`/ai/thesis/${symbol}`),
  parseNLScreener: (query: string) =>
    fetchJson<NLScreenerOutput>('/ai/screener', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
  diffFilings: (symbol: string) => fetchJson<FilingDiffReport>(`/ai/filing-diff/${symbol}`),
  explainPortfolioRisk: (portfolioId: string, positions: any[]) =>
    fetchJson<PortfolioRiskExplanation>('/ai/portfolio-risk', {
      method: 'POST',
      body: JSON.stringify({ portfolioId, positions }),
    }),
  explainAnomaly: (symbol: string) =>
    fetchJson<AnomalyExplanationReport>(`/ai/anomaly/${symbol}`),
  assistBacktest: (description: string, symbol: string) =>
    fetchJson<BacktestAssistantResponse>('/ai/backtest', {
      method: 'POST',
      body: JSON.stringify({ description, symbol }),
    }),

  // AI SSE Stream
  subscribeAIStream: (
    onEvent: (event: string, data: any) => void,
    onError?: (err: any) => void
  ): (() => void) => {
    if (typeof window === 'undefined') return () => {};
    const url = `${API_BASE}/ai/stream`;
    const es = new EventSource(url);
    const eventTypes = ['connected', 'tool_call', 'tool_result', 'done'];
    for (const type of eventTypes) {
      es.addEventListener(type, (e: any) => {
        try {
          const data = JSON.parse(e.data);
          onEvent(type, data);
        } catch (err) {
          if (onError) onError(err);
        }
      });
    }
    es.onerror = (err) => {
      if (onError) onError(err);
    };
    return () => es.close();
  },
};

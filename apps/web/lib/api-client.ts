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

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    const errorMsg = json.error?.message || `API error ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }

  return json.data as T;
}

export const api = {
  // Market
  getQuote: (symbol: string) => fetchJson<Quote>(`/market/quote/${symbol}`),
  getHistory: (symbol: string, interval = '1d', range = '1y') =>
    fetchJson<OHLCV[]>(`/market/history/${symbol}?interval=${interval}&range=${range}`),
  getFundamentals: (symbol: string) => fetchJson<Fundamentals>(`/market/fundamentals/${symbol}`),
  getEarnings: () => fetchJson<EarningsItem[]>('/market/earnings'),
  getNews: (symbol?: string) => fetchJson<NewsItem[]>(`/market/news${symbol ? `?symbol=${symbol}` : ''}`),
  getFilings: (symbol: string) => fetchJson<Filing[]>(`/market/filings/${symbol}`),

  // Screener
  runScreener: (query: ScreenerQuery) =>
    fetchJson<ScreenerResult>('/screener/run', {
      method: 'POST',
      body: JSON.stringify(query),
    }),
  getScreenerPresets: () => fetchJson<ScreenerPreset[]>('/screener/presets'),

  // Watchlists
  getWatchlists: () => fetchJson<Watchlist[]>('/watchlists'),
  createWatchlist: (data: { name: string; description?: string; symbols?: string[] }) =>
    fetchJson<Watchlist>('/watchlists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addWatchlistItem: (id: string, symbol: string) =>
    fetchJson<Watchlist>(`/watchlists/${id}/items`, {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    }),
  removeWatchlistItem: (id: string, symbol: string) =>
    fetchJson<Watchlist>(`/watchlists/${id}/items/${symbol}`, {
      method: 'DELETE',
    }),

  // Portfolio
  getPortfolio: () => fetchJson<Portfolio>('/portfolio'),
  addPosition: (data: { symbol: string; shares: number; averageCost: number }) =>
    fetchJson<Portfolio>('/portfolio/positions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deletePosition: (id: string) =>
    fetchJson<Portfolio>(`/portfolio/positions/${id}`, {
      method: 'DELETE',
    }),
  getPortfolioRisk: () => fetchJson<PortfolioRiskMetrics>('/portfolio/risk'),

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
  explainAnomaly: (symbol: string) => fetchJson<AnomalyExplanationReport>(`/ai/anomaly/${symbol}`),
  assistBacktest: (description: string, symbol: string) =>
    fetchJson<BacktestAssistantResponse>('/ai/backtest', {
      method: 'POST',
      body: JSON.stringify({ description, symbol }),
    }),
};

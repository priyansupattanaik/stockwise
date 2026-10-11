import type {
  Quote,
  OHLCV,
  Fundamentals,
  EarningsItem,
  NewsItem,
  Filing,
  ScreenerQuery,
  ScreenerResult,
  HistoryInterval,
  HistoryRange,
} from '@stockan/shared';

export interface IMarketDataProvider {
  readonly providerName: string;
  getQuote(symbol: string): Promise<Quote>;
  getHistory(
    symbol: string,
    interval?: HistoryInterval,
    range?: HistoryRange
  ): Promise<OHLCV[]>;
  getFundamentals(symbol: string): Promise<Fundamentals>;
  getEarnings(startDate?: string, endDate?: string): Promise<EarningsItem[]>;
  getNews(symbol?: string): Promise<NewsItem[]>;
  getFilings(symbol: string): Promise<Filing[]>;
  screen(query: ScreenerQuery): Promise<ScreenerResult>;
}

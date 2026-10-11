import type {
  Quote,
  OHLCV,
  Fundamentals,
  EarningsItem,
  NewsItem,
  Filing,
  ScreenerQuery,
  ScreenerResult,
  ScreenerResultRow,
  HistoryInterval,
  HistoryRange,
  ScreenerCriterion,
} from '@stockwise/shared';
import type { IMarketDataProvider } from './market-data.interface';
import { NotFoundError } from '../core/errors';

interface StockDatabaseEntry {
  quote: Omit<Quote, 'timestamp' | 'source'>;
  fundamentals: Fundamentals;
  filings: Filing[];
  earnings: EarningsItem[];
  news: NewsItem[];
}

export class MockMarketDataProvider implements IMarketDataProvider {
  public readonly providerName = 'mock-us-equities';

  private readonly database: Map<string, StockDatabaseEntry> = new Map();

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    // AAPL
    this.database.set('AAPL', {
      quote: {
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        price: 232.15,
        change: 2.45,
        changePercent: 1.07,
        open: 230.1,
        high: 233.4,
        low: 229.8,
        previousClose: 229.7,
        volume: 48920100,
        avgVolume: 51200000,
        marketCap: 3520000000000,
        peRatio: 34.2,
        week52High: 237.23,
        week52Low: 164.08,
        isDelayed: true,
      },
      fundamentals: {
        symbol: 'AAPL',
        profile: {
          symbol: 'AAPL',
          companyName: 'Apple Inc.',
          sector: 'Technology',
          industry: 'Consumer Electronics',
          description:
            'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services.',
          ceo: 'Tim Cook',
          employees: 161000,
          headquarters: 'Cupertino, California',
          website: 'https://www.apple.com',
        },
        metrics: {
          peRatioTTM: 34.2,
          forwardPE: 30.1,
          pbRatio: 48.5,
          psRatio: 8.9,
          evToEbitda: 25.4,
          profitMargin: 24.1,
          operatingMargin: 30.7,
          returnOnEquity: 147.2,
          debtToEquity: 1.45,
          dividendYield: 0.44,
          beta: 1.08,
        },
        statements: [
          {
            period: '2024-Q4',
            date: '2024-09-30',
            revenue: 94930000000,
            grossProfit: 43879000000,
            operatingIncome: 29591000000,
            netIncome: 14736000000,
            eps: 0.97,
            totalAssets: 364980000000,
            totalLiabilities: 308030000000,
            totalDebt: 106629000000,
            operatingCashFlow: 26800000000,
            freeCashFlow: 23800000000,
          },
          {
            period: '2024-Q3',
            date: '2024-06-30',
            revenue: 85777000000,
            grossProfit: 39678000000,
            operatingIncome: 25352000000,
            netIncome: 21448000000,
            eps: 1.4,
            totalAssets: 351400000000,
            totalLiabilities: 284700000000,
            totalDebt: 101200000000,
            operatingCashFlow: 28900000000,
            freeCashFlow: 26400000000,
          },
          {
            period: '2024-Q2',
            date: '2024-03-31',
            revenue: 90753000000,
            grossProfit: 42271000000,
            operatingIncome: 27900000000,
            netIncome: 23636000000,
            eps: 1.53,
            totalAssets: 337411000000,
            totalLiabilities: 263200000000,
            totalDebt: 104590000000,
            operatingCashFlow: 22700000000,
            freeCashFlow: 20600000000,
          },
          {
            period: '2023-Q4',
            date: '2023-09-30',
            revenue: 89498000000,
            grossProfit: 40427000000,
            operatingIncome: 26969000000,
            netIncome: 22956000000,
            eps: 1.46,
            totalAssets: 352583000000,
            totalLiabilities: 290437000000,
            totalDebt: 111088000000,
            operatingCashFlow: 24500000000,
            freeCashFlow: 21800000000,
          },
        ],
      },
      filings: [
        {
          id: 'aapl-10k-2024',
          symbol: 'AAPL',
          formType: '10-K',
          filingDate: '2024-11-01',
          reportDate: '2024-09-30',
          description: 'Annual report for fiscal year ended September 30, 2024',
          url: 'https://www.sec.gov/edgar/data/320193/aapl-202410k.htm',
          keyMetrics: {
            totalRevenue: 391035000000,
            servicesRevenue: 96169000000,
            productsRevenue: 294866000000,
            netIncome: 93736000000,
            rndExpense: 31370000000,
            effectiveTaxRate: '24.1%',
          },
        },
        {
          id: 'aapl-10q-2024-q3',
          symbol: 'AAPL',
          formType: '10-Q',
          filingDate: '2024-08-02',
          reportDate: '2024-06-29',
          description: 'Quarterly report for the period ended June 29, 2024',
          url: 'https://www.sec.gov/edgar/data/320193/aapl-2024q3.htm',
          keyMetrics: {
            totalRevenue: 85777000000,
            servicesRevenue: 24213000000,
            productsRevenue: 61564000000,
            netIncome: 21448000000,
            rndExpense: 8000000000,
            effectiveTaxRate: '15.2%',
          },
        },
      ],
      earnings: [
        {
          symbol: 'AAPL',
          companyName: 'Apple Inc.',
          reportDate: '2025-01-30',
          timeOfDay: 'amc',
          estimatedEPS: 2.35,
          actualEPS: null,
          estimatedRevenue: 124200000000,
          actualRevenue: null,
          currency: 'USD',
        },
        {
          symbol: 'AAPL',
          companyName: 'Apple Inc.',
          reportDate: '2024-10-31',
          timeOfDay: 'amc',
          estimatedEPS: 0.95,
          actualEPS: 0.97,
          estimatedRevenue: 94500000000,
          actualRevenue: 94930000000,
          currency: 'USD',
        },
      ],
      news: [
        {
          id: 'news-aapl-1',
          symbol: 'AAPL',
          title: 'Services revenue hits all-time high of $96.2 billion in FY24',
          summary: 'Apple reported continuing strength in its high-margin services division, which grew 13% year-over-year.',
          source: 'MarketWire',
          url: 'https://example.com/news/aapl-services-fy24',
          publishedAt: '2024-11-05T14:30:00Z',
          sentimentScore: 0.65,
        },
        {
          id: 'news-aapl-2',
          symbol: 'AAPL',
          title: 'Supply chain checks indicate steady iPhone production runs',
          summary: 'Component suppliers in East Asia report baseline delivery orders consistent with seasonal expectations.',
          source: 'TechAnalytics',
          url: 'https://example.com/news/aapl-supply-checks',
          publishedAt: '2024-11-12T09:15:00Z',
          sentimentScore: 0.15,
        },
      ],
    });

    // MSFT
    this.database.set('MSFT', {
      quote: {
        symbol: 'MSFT',
        companyName: 'Microsoft Corporation',
        price: 418.5,
        change: -1.2,
        changePercent: -0.29,
        open: 420.0,
        high: 422.3,
        low: 416.7,
        previousClose: 419.7,
        volume: 18450000,
        avgVolume: 20100000,
        marketCap: 3110000000000,
        peRatio: 35.8,
        week52High: 468.35,
        week52Low: 366.5,
        isDelayed: true,
      },
      fundamentals: {
        symbol: 'MSFT',
        profile: {
          symbol: 'MSFT',
          companyName: 'Microsoft Corporation',
          sector: 'Technology',
          industry: 'Software - Infrastructure',
          description:
            'Microsoft Corporation develops and supports software, services, devices and solutions including Azure cloud, Microsoft 365, and AI platform infrastructure.',
          ceo: 'Satya Nadella',
          employees: 228000,
          headquarters: 'Redmond, Washington',
          website: 'https://www.microsoft.com',
        },
        metrics: {
          peRatioTTM: 35.8,
          forwardPE: 28.5,
          pbRatio: 11.2,
          psRatio: 12.4,
          evToEbitda: 21.8,
          profitMargin: 35.3,
          operatingMargin: 44.6,
          returnOnEquity: 38.4,
          debtToEquity: 0.38,
          dividendYield: 0.79,
          beta: 1.15,
        },
        statements: [
          {
            period: '2025-Q1',
            date: '2024-09-30',
            revenue: 65585000000,
            grossProfit: 45437000000,
            operatingIncome: 30552000000,
            netIncome: 24667000000,
            eps: 3.3,
            totalAssets: 523820000000,
            totalLiabilities: 249000000000,
            totalDebt: 97800000000,
            operatingCashFlow: 34200000000,
            freeCashFlow: 19300000000,
          },
          {
            period: '2024-Q4',
            date: '2024-06-30',
            revenue: 64727000000,
            grossProfit: 44900000000,
            operatingIncome: 27925000000,
            netIncome: 22036000000,
            eps: 2.95,
            totalAssets: 512163000000,
            totalLiabilities: 243686000000,
            totalDebt: 98000000000,
            operatingCashFlow: 37200000000,
            freeCashFlow: 23300000000,
          },
        ],
      },
      filings: [
        {
          id: 'msft-10k-2024',
          symbol: 'MSFT',
          formType: '10-K',
          filingDate: '2024-07-31',
          reportDate: '2024-06-30',
          description: 'Annual report for fiscal year ended June 30, 2024',
          url: 'https://www.sec.gov/edgar/data/789019/msft-202410k.htm',
          keyMetrics: {
            cloudRevenue: 137400000000,
            totalRevenue: 245122000000,
            operatingIncome: 109433000000,
            capitalExpenditures: 55700000000,
          },
        },
      ],
      earnings: [
        {
          symbol: 'MSFT',
          companyName: 'Microsoft Corporation',
          reportDate: '2025-01-28',
          timeOfDay: 'amc',
          estimatedEPS: 3.12,
          actualEPS: null,
          estimatedRevenue: 68800000000,
          actualRevenue: null,
          currency: 'USD',
        },
      ],
      news: [
        {
          id: 'news-msft-1',
          symbol: 'MSFT',
          title: 'Azure Cloud expands datacenter capacity in North America and Europe',
          summary: 'Capital expenditures reflect sustained infrastructure buildout for enterprise workload compute.',
          source: 'CloudDaily',
          url: 'https://example.com/news/msft-cloud-infra',
          publishedAt: '2024-11-10T11:00:00Z',
          sentimentScore: 0.4,
        },
      ],
    });

    // NVDA
    this.database.set('NVDA', {
      quote: {
        symbol: 'NVDA',
        companyName: 'NVIDIA Corporation',
        price: 138.25,
        change: 4.85,
        changePercent: 3.63,
        open: 134.1,
        high: 139.5,
        low: 133.8,
        previousClose: 133.4,
        volume: 72100000,
        avgVolume: 65400000,
        marketCap: 3390000000000,
        peRatio: 52.4,
        week52High: 140.76,
        week52Low: 45.43,
        isDelayed: true,
      },
      fundamentals: {
        symbol: 'NVDA',
        profile: {
          symbol: 'NVDA',
          companyName: 'NVIDIA Corporation',
          sector: 'Technology',
          industry: 'Semiconductors',
          description:
            'NVIDIA Corporation designs graphics processing units (GPUs) for gaming and professional markets, as well as system on a chip units (SoCs) for mobile and automotive platforms, and enterprise AI hardware.',
          ceo: 'Jensen Huang',
          employees: 29600,
          headquarters: 'Santa Clara, California',
          website: 'https://www.nvidia.com',
        },
        metrics: {
          peRatioTTM: 52.4,
          forwardPE: 33.2,
          pbRatio: 42.1,
          psRatio: 28.5,
          evToEbitda: 41.2,
          profitMargin: 55.0,
          operatingMargin: 62.1,
          returnOnEquity: 115.4,
          debtToEquity: 0.18,
          dividendYield: 0.03,
          beta: 1.68,
        },
        statements: [
          {
            period: '2025-Q3',
            date: '2024-10-27',
            revenue: 35082000000,
            grossProfit: 26162000000,
            operatingIncome: 21869000000,
            netIncome: 19309000000,
            eps: 0.78,
            totalAssets: 95300000000,
            totalLiabilities: 28400000000,
            totalDebt: 10400000000,
            operatingCashFlow: 17600000000,
            freeCashFlow: 16800000000,
          },
          {
            period: '2025-Q2',
            date: '2024-07-28',
            revenue: 30040000000,
            grossProfit: 22574000000,
            operatingIncome: 18642000000,
            netIncome: 16599000000,
            eps: 0.67,
            totalAssets: 85200000000,
            totalLiabilities: 27100000000,
            totalDebt: 10500000000,
            operatingCashFlow: 14500000000,
            freeCashFlow: 13500000000,
          },
        ],
      },
      filings: [
        {
          id: 'nvda-10q-2025-q3',
          symbol: 'NVDA',
          formType: '10-Q',
          filingDate: '2024-11-20',
          reportDate: '2024-10-27',
          description: 'Quarterly report for the period ended October 27, 2024',
          url: 'https://www.sec.gov/edgar/data/1045810/nvda-2025q3.htm',
          keyMetrics: {
            datacenterRevenue: 30771000000,
            gamingRevenue: 3279000000,
            grossMargin: '74.6%',
            operatingMargin: '62.3%',
          },
        },
      ],
      earnings: [
        {
          symbol: 'NVDA',
          companyName: 'NVIDIA Corporation',
          reportDate: '2025-02-26',
          timeOfDay: 'amc',
          estimatedEPS: 0.84,
          actualEPS: null,
          estimatedRevenue: 37500000000,
          actualRevenue: null,
          currency: 'USD',
        },
      ],
      news: [
        {
          id: 'news-nvda-1',
          symbol: 'NVDA',
          title: 'Datacenter revenue reaches record $30.8 billion in fiscal third quarter',
          summary: 'Hyperscalers and sovereign cloud programs drive continued hardware platform adoption.',
          source: 'SemiInsight',
          url: 'https://example.com/news/nvda-datacenter-q3',
          publishedAt: '2024-11-21T08:00:00Z',
          sentimentScore: 0.78,
        },
      ],
    });

    // Additional entries: GOOGL, AMZN, JNJ, JPM
    this.seedAdditionalEquities();
  }

  private seedAdditionalEquities() {
    const symbols = [
      {
        sym: 'GOOGL',
        name: 'Alphabet Inc.',
        sector: 'Communication Services',
        industry: 'Internet Content & Information',
        price: 178.4,
        pe: 23.4,
        cap: 2210000000000,
        beta: 1.05,
        div: 0.45,
      },
      {
        sym: 'AMZN',
        name: 'Amazon.com, Inc.',
        sector: 'Consumer Cyclical',
        industry: 'Internet Retail',
        price: 204.6,
        pe: 43.1,
        cap: 2140000000000,
        beta: 1.28,
        div: 0.0,
      },
      {
        sym: 'META',
        name: 'Meta Platforms, Inc.',
        sector: 'Communication Services',
        industry: 'Internet Content & Information',
        price: 588.2,
        pe: 27.8,
        cap: 1490000000000,
        beta: 1.22,
        div: 0.34,
      },
      {
        sym: 'TSLA',
        name: 'Tesla, Inc.',
        sector: 'Consumer Cyclical',
        industry: 'Auto Manufacturers',
        price: 320.5,
        pe: 88.5,
        cap: 1030000000000,
        beta: 2.12,
        div: 0.0,
      },
      {
        sym: 'JPM',
        name: 'JPMorgan Chase & Co.',
        sector: 'Financial Services',
        industry: 'Banks - Diversified',
        price: 242.1,
        pe: 12.8,
        cap: 687000000000,
        beta: 0.94,
        div: 2.15,
      },
      {
        sym: 'JNJ',
        name: 'Johnson & Johnson',
        sector: 'Healthcare',
        industry: 'Drug Manufacturers - General',
        price: 153.2,
        pe: 16.2,
        cap: 368000000000,
        beta: 0.54,
        div: 3.24,
      },
      {
        sym: 'XOM',
        name: 'Exxon Mobil Corporation',
        sector: 'Energy',
        industry: 'Oil & Gas Integrated',
        price: 118.4,
        pe: 14.1,
        cap: 462000000000,
        beta: 0.78,
        div: 3.21,
      },
    ];

    for (const item of symbols) {
      this.database.set(item.sym, {
        quote: {
          symbol: item.sym,
          companyName: item.name,
          price: item.price,
          change: Number((Math.random() * 4 - 2).toFixed(2)),
          changePercent: Number((Math.random() * 2 - 1).toFixed(2)),
          open: Number((item.price * 0.995).toFixed(2)),
          high: Number((item.price * 1.01).toFixed(2)),
          low: Number((item.price * 0.99).toFixed(2)),
          previousClose: Number((item.price * 0.998).toFixed(2)),
          volume: 25000000,
          avgVolume: 24000000,
          marketCap: item.cap,
          peRatio: item.pe,
          week52High: Number((item.price * 1.15).toFixed(2)),
          week52Low: Number((item.price * 0.75).toFixed(2)),
          isDelayed: true,
        },
        fundamentals: {
          symbol: item.sym,
          profile: {
            symbol: item.sym,
            companyName: item.name,
            sector: item.sector,
            industry: item.industry,
            description: `${item.name} operates in the ${item.sector} sector (${item.industry}).`,
            ceo: 'Executive Management',
            headquarters: 'United States',
          },
          metrics: {
            peRatioTTM: item.pe,
            forwardPE: Number((item.pe * 0.88).toFixed(1)),
            pbRatio: 4.5,
            psRatio: 3.8,
            profitMargin: 21.0,
            operatingMargin: 26.5,
            returnOnEquity: 24.2,
            debtToEquity: 0.65,
            dividendYield: item.div,
            beta: item.beta,
          },
          statements: [
            {
              period: '2024-Q3',
              date: '2024-09-30',
              revenue: 45000000000,
              netIncome: 11000000000,
              eps: 2.1,
            },
          ],
        },
        filings: [
          {
            id: `${item.sym.toLowerCase()}-10q-2024-q3`,
            symbol: item.sym,
            formType: '10-Q',
            filingDate: '2024-10-25',
            reportDate: '2024-09-30',
            description: `Quarterly report for ${item.name}`,
            url: `https://www.sec.gov/edgar/data/${item.sym}`,
          },
        ],
        earnings: [
          {
            symbol: item.sym,
            companyName: item.name,
            reportDate: '2025-02-05',
            timeOfDay: 'amc',
            estimatedEPS: 2.05,
            currency: 'USD',
          },
        ],
        news: [
          {
            id: `news-${item.sym}-1`,
            symbol: item.sym,
            title: `${item.name} reports operational developments and execution targets`,
            summary: `Company releases quarterly operations review detailing divisional performance and capital deployment.`,
            source: 'Corporate Wire',
            url: `https://example.com/news/${item.sym}`,
            publishedAt: '2024-11-15T12:00:00Z',
          },
        ],
      });
    }
  }

  async getQuote(symbol: string): Promise<Quote> {
    const sym = symbol.toUpperCase();
    const entry = this.database.get(sym);
    if (!entry) {
      // Graceful fallback for arbitrary requested symbol
      return {
        symbol: sym,
        companyName: `${sym} Corporation`,
        price: 150.0,
        change: 0.75,
        changePercent: 0.5,
        open: 149.5,
        high: 151.2,
        low: 149.0,
        previousClose: 149.25,
        volume: 12000000,
        avgVolume: 11500000,
        marketCap: 150000000000,
        peRatio: 22.5,
        week52High: 175.0,
        week52Low: 120.0,
        timestamp: new Date().toISOString(),
        isDelayed: true,
        source: this.providerName,
      };
    }

    return {
      ...entry.quote,
      timestamp: new Date().toISOString(),
      source: this.providerName,
    };
  }

  async getHistory(
    symbol: string,
    _interval: HistoryInterval = '1d',
    range: HistoryRange = '1y'
  ): Promise<OHLCV[]> {
    const quote = await this.getQuote(symbol);
    const basePrice = quote.price;

    let barsCount = 252;
    if (range === '1m') barsCount = 22;
    else if (range === '3m') barsCount = 66;
    else if (range === '6m') barsCount = 126;
    else if (range === '1y') barsCount = 252;
    else if (range === '5y') barsCount = 1260;

    const bars: OHLCV[] = [];
    const now = new Date();

    // Generate deterministic historical trajectory ending at quote.price
    let current = basePrice * 0.8;
    const stepDrift = (basePrice - current) / barsCount;

    for (let i = barsCount; i >= 1; i--) {
      const barDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      // Skip weekends
      const dayOfWeek = barDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const randomOscillation = Math.sin(i / 5) * (basePrice * 0.015);
      const close = Number((current + randomOscillation).toFixed(2));
      const open = Number((close * (1 + (Math.sin(i) * 0.005))).toFixed(2));
      const high = Number((Math.max(open, close) * 1.008).toFixed(2));
      const low = Number((Math.min(open, close) * 0.992).toFixed(2));
      const volume = Math.floor(quote.volume * (0.8 + Math.abs(Math.sin(i) * 0.4)));

      bars.push({
        timestamp: barDate.toISOString().split('T')[0]!,
        open,
        high,
        low,
        close,
        volume,
      });

      current += stepDrift;
    }

    // Ensure last bar close matches quote price
    if (bars.length > 0) {
      bars[bars.length - 1]!.close = quote.price;
    }

    return bars;
  }

  async getFundamentals(symbol: string): Promise<Fundamentals> {
    const sym = symbol.toUpperCase();
    const entry = this.database.get(sym);
    if (!entry) {
      throw new NotFoundError('Company fundamentals', sym);
    }
    return entry.fundamentals;
  }

  async getEarnings(_startDate?: string, _endDate?: string): Promise<EarningsItem[]> {
    const allEarnings: EarningsItem[] = [];
    for (const entry of this.database.values()) {
      allEarnings.push(...entry.earnings);
    }
    return allEarnings.sort((a, b) => a.reportDate.localeCompare(b.reportDate));
  }

  async getNews(symbol?: string): Promise<NewsItem[]> {
    if (symbol) {
      const sym = symbol.toUpperCase();
      const entry = this.database.get(sym);
      return entry ? entry.news : [];
    }
    const allNews: NewsItem[] = [];
    for (const entry of this.database.values()) {
      allNews.push(...entry.news);
    }
    return allNews.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  async getFilings(symbol: string): Promise<Filing[]> {
    const sym = symbol.toUpperCase();
    const entry = this.database.get(sym);
    if (!entry) {
      throw new NotFoundError('Filings', sym);
    }
    return entry.filings;
  }

  async screen(query: ScreenerQuery): Promise<ScreenerResult> {
    const rows: ScreenerResultRow[] = [];

    for (const entry of this.database.values()) {
      const q = entry.quote;
      const f = entry.fundamentals;

      const row: ScreenerResultRow = {
        symbol: q.symbol,
        companyName: q.companyName,
        sector: f.profile.sector,
        price: q.price,
        changePercent: q.changePercent,
        volume: q.volume,
        marketCap: q.marketCap ?? 0,
        peRatioTTM: f.metrics.peRatioTTM,
        forwardPE: f.metrics.forwardPE,
        psRatio: f.metrics.psRatio,
        pbRatio: f.metrics.pbRatio,
        dividendYield: f.metrics.dividendYield,
        profitMargin: f.metrics.profitMargin,
        returnOnEquity: f.metrics.returnOnEquity,
        debtToEquity: f.metrics.debtToEquity,
        beta: f.metrics.beta,
        rsi14: 52.4, // baseline
      };

      // Evaluate criteria
      let match = true;
      for (const crit of query.criteria) {
        if (!this.matchesCriterion(row, crit)) {
          match = false;
          break;
        }
      }

      if (match) {
        rows.push(row);
      }
    }

    // Sort
    rows.sort((a, b) => {
      const field = query.sortBy as keyof ScreenerResultRow;
      const valA = a[field];
      const valB = b[field];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return query.sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return query.sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    const totalCount = rows.length;
    const paginated = rows.slice(query.offset, query.offset + query.limit);

    return {
      items: paginated,
      totalCount,
      limit: query.limit,
      offset: query.offset,
    };
  }

  private matchesCriterion(row: ScreenerResultRow, crit: ScreenerCriterion): boolean {
    const val = (row as any)[crit.field];
    if (val === undefined || val === null) return false;

    switch (crit.operator) {
      case 'eq':
        return typeof crit.value === 'string'
          ? String(val).toLowerCase() === crit.value.toLowerCase()
          : val === crit.value;
      case 'neq':
        return val !== crit.value;
      case 'gt':
        return typeof val === 'number' && typeof crit.value === 'number' && val > crit.value;
      case 'gte':
        return typeof val === 'number' && typeof crit.value === 'number' && val >= crit.value;
      case 'lt':
        return typeof val === 'number' && typeof crit.value === 'number' && val < crit.value;
      case 'lte':
        return typeof val === 'number' && typeof crit.value === 'number' && val <= crit.value;
      case 'between':
        if (Array.isArray(crit.value) && crit.value.length === 2) {
          const [min, max] = crit.value as [number, number];
          return typeof val === 'number' && val >= min && val <= max;
        }
        return false;
      case 'in':
        if (Array.isArray(crit.value)) {
          return crit.value.some((target) =>
            typeof target === 'string'
              ? String(val).toLowerCase() === target.toLowerCase()
              : val === target
          );
        }
        return false;
      case 'contains':
        return String(val).toLowerCase().includes(String(crit.value).toLowerCase());
      default:
        return false;
    }
  }
}

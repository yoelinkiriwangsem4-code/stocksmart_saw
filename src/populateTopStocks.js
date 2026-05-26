// populateTopStocks.js – run with `node src/populateTopStocks.js`
// This script fetches data from Yahoo Finance for a predefined list of tickers per sector,
// selects the three stocks with the highest price (or any other metric you prefer),
// and inserts them into the `saham` table via Prisma.

const YF = require('yahoo-finance2').default;
const yahooFinance = new YF();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Define ticker symbols per sector (use .JK suffix for IDX stocks)
const sectorTickers = {
  Perbankan: ['BBCA', 'BBNI', 'BMRI'],
  Teknologi: ['BUKA', 'WIFI', 'GOTO'],
  Konsumer: ['UNVR', 'MYOR', 'ICBP']
};

// Helper to fetch quote data for a ticker (price & basic fundamentals)
async function fetchQuote(ticker) {
  try {
    const q = await yahooFinance.quote(`${ticker}.JK`).catch(() => null);
    const qs = await yahooFinance.quoteSummary(`${ticker}.JK`, {
      modules: ['defaultKeyStatistics', 'financialData']
    }).catch(() => null);
    if (!q) return null;
    return {
      kode_saham: ticker,
      nama_perusahaan: q.shortName || ticker,
      harga: q.regularMarketPrice || 0,
      per: q.trailingPE || 0,
      pbv: qs?.defaultKeyStatistics?.priceToBook || 0,
      roe: qs?.financialData?.returnOnEquity ? qs.financialData.returnOnEquity * 100 : 0,
      der: qs?.financialData?.debtToEquity || 0,
      eps_growth: qs?.financialData?.earningsGrowth ? qs.financialData.earningsGrowth * 100 : 0,
      sektor: null // will be set later
    };
  } catch (e) {
    console.error(`Error fetching ${ticker}:`, e.message);
    return null;
  }
}

async function main() {
  for (const [sector, tickers] of Object.entries(sectorTickers)) {
    // Remove any existing stocks for this sector to keep exactly 3 entries
    await prisma.saham.deleteMany({ where: { sektor: sector } });
    const quotes = [];
    for (const tick of tickers) {
      const data = await fetchQuote(tick);
      if (data) {
        data.sektor = sector;
        quotes.push(data);
      }
    }
    // Sort by price descending (you can change the criteria, e.g., PER, ROE, etc.)
    quotes.sort((a, b) => b.harga - a.harga);
    // Ensure we only keep the 3 highest‑priced stocks
    const top3 = quotes.slice(0, 3);
    // If fewer than 3 were fetched (e.g., API missing), we still insert whatever we have
    if (top3.length < 3) {
      console.warn(`Only ${top3.length} stocks found for sector ${sector}`);
    }
    for (const stock of top3) {
      // Upsert: create if not exists, otherwise update fields
      await prisma.saham.upsert({
        where: { kode_saham: stock.kode_saham },
        update: stock,
        create: stock
      });
      console.log(`Inserted/updated ${stock.kode_saham} (${stock.nama_perusahaan}) in sector ${sector}`);
    }
  }
}

main()
  .catch(e => console.error('Fatal error:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });

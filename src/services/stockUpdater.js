const yahooFinance = require('yahoo-finance2').default;
const prisma = require('../prisma');

async function updateStocks() {
  console.log('[CRON] Memulai sinkronisasi data saham dari Yahoo Finance...');
  try {
    const stocks = await prisma.saham.findMany();
    let successCount = 0;
    let failCount = 0;

    for (let stock of stocks) {
      const cleanKode = stock.kode_saham.split('_')[0];
      const ticker = `${cleanKode}.JK`;
      
      try {
        // Fetch data
        const quote = await yahooFinance.quote(ticker).catch(() => null);
        const quoteSummary = await yahooFinance.quoteSummary(ticker, {
            modules: ['defaultKeyStatistics', 'financialData']
        }).catch(() => null);

        let harga = stock.harga;
        let per = stock.per;
        let pbv = stock.pbv;
        let roe = stock.roe;
        let der = stock.der;
        let eps = stock.eps_growth;

        if (quote) {
            harga = quote.regularMarketPrice || harga;
            if (quote.trailingPE) per = quote.trailingPE;
        }

        if (quoteSummary) {
           if (quoteSummary.defaultKeyStatistics) {
               pbv = quoteSummary.defaultKeyStatistics.priceToBook || pbv;
           }
           if (quoteSummary.financialData) {
               roe = (quoteSummary.financialData.returnOnEquity * 100) || roe; // Convert to %
               eps = (quoteSummary.financialData.earningsGrowth * 100) || eps; // Convert to %
               der = quoteSummary.financialData.debtToEquity || der;
           }
        }

        await prisma.saham.update({
          where: { kode_saham: stock.kode_saham },
          data: {
            harga: parseInt(harga) || 0,
            per: parseFloat(per) || 0,
            pbv: parseFloat(pbv) || 0,
            roe: parseFloat(roe) || 0,
            der: parseFloat(der) || 0,
            eps_growth: parseFloat(eps) || 0,
          }
        });
        successCount++;
        // delay slightly to avoid rate limit
        await new Promise(res => setTimeout(res, 300));
      } catch (err) {
        console.error(`[CRON] Gagal update saham ${ticker}:`, err.message);
        failCount++;
      }
    }
    console.log(`[CRON] Sinkronisasi selesai. Berhasil: ${successCount}, Gagal: ${failCount}`);
  } catch (error) {
    console.error('[CRON] Terjadi kesalahan fatal:', error);
  }
}

module.exports = { updateStocks };

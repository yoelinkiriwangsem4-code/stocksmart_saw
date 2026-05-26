const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

async function cekDataAPI() {
  const ticker = 'BBCA.JK'; // Coba cek saham BCA

  try {
    console.log(`Mengambil data API lengkap untuk ${ticker}...`);

    // 1. Ambil Quote Dasar (Harga, Volume, 52-week High/Low, dll)
    const quote = await yahooFinance.quote(ticker);
    console.log("\n=== DATA QUOTE ===");
    console.log(quote);

    // 2. Ambil Statistik Finansial Lanjutan
    const summary = await yahooFinance.quoteSummary(ticker, {
      modules: ['defaultKeyStatistics', 'financialData', 'summaryProfile']
    });
    
    console.log("\n=== DATA STATISTIK KEUANGAN ===");
    console.log(summary.defaultKeyStatistics);

    console.log("\n=== DATA PROFIL PERUSAHAAN ===");
    console.log(summary.summaryProfile);

  } catch (err) {
    console.error("Gagal:", err.message);
  }
}

cekDataAPI();

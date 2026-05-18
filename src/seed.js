const prisma = require("./prisma");

async function main() {
  console.log("Memulai seeding database...");

  // 1. SEED DEFAULT USERS
  console.log("Menciptakan user default...");
  await prisma.users.createMany({
    data: [
      { username: "admin", password: "adminpassword", tipe_pengguna: "admin" },
      { username: "yoel", password: "password123", tipe_pengguna: "user" },
      { username: "kageno", password: "password123", tipe_pengguna: "user" }
    ],
    skipDuplicates: true
  });

  // 2. SEED DEFAULT KRITERIA
  console.log("Menciptakan kriteria default...");
  await prisma.kriteria.createMany({
    data: [
      { kode_kriteria: "C1", nama_kriteria: "PER", bobot: 0.2, tipe: "cost" },
      { kode_kriteria: "C2", nama_kriteria: "PBV", bobot: 0.2, tipe: "cost" },
      { kode_kriteria: "C3", nama_kriteria: "ROE", bobot: 0.2, tipe: "benefit" },
      { kode_kriteria: "C4", nama_kriteria: "DER", bobot: 0.2, tipe: "cost" },
      { kode_kriteria: "C5", nama_kriteria: "EPS Growth", bobot: 0.2, tipe: "benefit" }
    ],
    skipDuplicates: true
  });

  // 3. SEED DEFAULT SAHAM (Perbankan, Teknologi, Konsumer)
  console.log("Menciptakan saham default per-sektor...");
  await prisma.saham.createMany({
    data: [
      // Sektor Perbankan
      { kode_saham: "BBCA", nama_perusahaan: "Bank Central Asia Tbk", harga: 9800, per: 24.5, pbv: 4.8, roe: 19.5, der: 0.15, eps_growth: 12.0, sektor: "Perbankan", username: null },
      { kode_saham: "BMRI", nama_perusahaan: "Bank Mandiri (Persero) Tbk", harga: 6200, per: 12.8, pbv: 2.2, roe: 17.2, der: 0.20, eps_growth: 15.4, sektor: "Perbankan", username: null },
      { kode_saham: "BBNI", nama_perusahaan: "Bank Negara Indonesia Tbk", harga: 4700, per: 9.5, pbv: 1.2, roe: 13.0, der: 0.22, eps_growth: 10.5, sektor: "Perbankan", username: null },
      
      // Sektor Teknologi
      { kode_saham: "GOTO", nama_perusahaan: "GoTo Gojek Tokopedia Tbk", harga: 65, per: -8.5, pbv: 0.8, roe: -12.4, der: 0.10, eps_growth: 25.0, sektor: "Teknologi", username: null },
      { kode_saham: "BUKA", nama_perusahaan: "Bukalapak.com Tbk", harga: 120, per: -14.2, pbv: 0.6, roe: -4.5, der: 0.05, eps_growth: 18.2, sektor: "Teknologi", username: null },
      { kode_saham: "WIFY", nama_perusahaan: "WiFi Indonesia Tbk", harga: 150, per: 18.5, pbv: 1.8, roe: 10.2, der: 0.45, eps_growth: 8.0, sektor: "Teknologi", username: null },
      
      // Sektor Konsumer
      { kode_saham: "ICBP", nama_perusahaan: "Indofood CBP Sukses Makmur Tbk", harga: 11200, per: 15.6, pbv: 3.2, roe: 20.5, der: 0.80, eps_growth: 9.5, sektor: "Konsumer", username: null },
      { kode_saham: "UNVR", nama_perusahaan: "Unilever Indonesia Tbk", harga: 2400, per: 28.4, pbv: 22.5, roe: 88.0, der: 0.95, eps_growth: -2.0, sektor: "Konsumer", username: null },
      { kode_saham: "MYOR", nama_perusahaan: "Mayora Indah Tbk", harga: 2600, per: 19.2, pbv: 2.8, roe: 15.4, der: 0.55, eps_growth: 11.2, sektor: "Konsumer", username: null }
    ],
    skipDuplicates: true
  });

  console.log("Seeding database selesai dengan sukses! 🎉");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

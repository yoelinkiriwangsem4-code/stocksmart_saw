const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

// =======================================
// SAW GLOBAL (Static / Read-only)
// =======================================
router.get("/", async (req, res) => {
  try {
    const saham = await prisma.saham.findMany({
      where: { username: null } // Only default global stocks
    });

    if (saham.length === 0) {
      return res.json([]);
    }

    // Run basic SAW with equal weights (0.2)
    const result = runSawMath(saham, { per: 0.2, pbv: 0.2, roe: 0.2, der: 0.2, eps: 0.2 });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal proses SAW" });
  }
});

// =======================================
// GET SAVED RESULTS PER USER
// =======================================
router.get("/saved", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: "Username harus disertakan!" });
    }

    const data = await prisma.hasil.findMany({
      where: { username },
      include: { saham: true },
      orderBy: { ranking: "asc" }
    });

    const formatted = data.map(d => ({
      kode_saham: d.kode_saham.split("_")[0],
      full_kode_saham: d.kode_saham,
      nama_perusahaan: d.saham.nama_perusahaan,
      nilai_preferensi: d.nilai_preferensi,
      ranking: d.ranking,
      sektor: d.saham.sektor
    }));

    res.json(formatted);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal memuat hasil tersimpan", error: error.message });
  }
});

// =======================================
// CALCULATE & SAVE ADAPTIVE SAW
// =======================================
router.post("/hitung", async (req, res) => {
  try {
    const { username, saham_terpilih, bobot: customBobot } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username harus disertakan!" });
    }

    // 1. Dapatkan daftar saham untuk dihitung
    let saham = [];
    if (saham_terpilih && saham_terpilih.length > 0) {
      saham = await prisma.saham.findMany({
        where: {
          kode_saham: { in: saham_terpilih }
        }
      });
    } else {
      // Jika kosong, bandingkan semua saham milik user + default
      saham = await prisma.saham.findMany({
        where: {
          OR: [
            { username: null },
            { username }
          ]
        }
      });
    }

    if (saham.length === 0) {
      return res.json([]);
    }

    // 2. Tentukan bobot kriteria yang akan digunakan
    let finalBobot = { per: 0.2, pbv: 0.2, roe: 0.2, der: 0.2, eps: 0.2 };

    if (customBobot) {
      finalBobot = {
        per: parseFloat(customBobot.C1) || 0.2,
        pbv: parseFloat(customBobot.C2) || 0.2,
        roe: parseFloat(customBobot.C3) || 0.2,
        der: parseFloat(customBobot.C4) || 0.2,
        eps: parseFloat(customBobot.C5) || 0.2
      };
    } else {
      // Load dari tabel user_kriteria jika ada, gabung dengan default
      const globalKriteria = await prisma.kriteria.findMany();
      const userWeights = await prisma.user_kriteria.findMany({
        where: { username }
      });

      const activeWeights = {};
      globalKriteria.forEach(k => {
        const custom = userWeights.find(uw => uw.kode_kriteria === k.kode_kriteria);
        activeWeights[k.kode_kriteria] = custom ? custom.bobot : k.bobot;
      });

      finalBobot = {
        per: activeWeights["C1"] !== undefined ? activeWeights["C1"] : 0.2,
        pbv: activeWeights["C2"] !== undefined ? activeWeights["C2"] : 0.2,
        roe: activeWeights["C3"] !== undefined ? activeWeights["C3"] : 0.2,
        der: activeWeights["C4"] !== undefined ? activeWeights["C4"] : 0.2,
        eps: activeWeights["C5"] !== undefined ? activeWeights["C5"] : 0.2
      };
    }

    // 3. Jalankan Matematika SAW
    const hasilSaw = runSawMath(saham, finalBobot);

    // 4. Simpan ke database
    await prisma.hasil.deleteMany({
      where: { username }
    });

    for (let i = 0; i < hasilSaw.length; i++) {
      const h = hasilSaw[i];
      await prisma.hasil.create({
        data: {
          kode_hasil: `${username}-${h.kode_saham}-${Date.now()}-${i}`,
          username: username,
          kode_saham: h.kode_saham,
          nilai_preferensi: h.nilai_preferensi,
          ranking: h.ranking
        }
      });
    }

    const cleanHasil = hasilSaw.map(h => ({
      ...h,
      kode_saham: h.kode_saham.split("_")[0]
    }));

    res.json(cleanHasil);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal hitung/simpan SAW", error: error.message });
  }
});

// =======================================
// HELPER: SAW MATH CALCULATION ENGINE
// =======================================
function runSawMath(saham, bobot) {
  if (saham.length === 0) return [];

  // Preprocessing untuk menangani rasio finansial negatif/tidak wajar secara akademis
  const cleanedSaham = saham.map((s) => {
    return {
      kode_saham: s.kode_saham,
      nama_perusahaan: s.nama_perusahaan,
      per: s.per < 0 ? 999.0 : s.per, // PER negatif = rugi bersih, di-clamp ke nilai tinggi (sangat buruk untuk Cost)
      pbv: s.pbv < 0 ? 99.0 : s.pbv,   // PBV negatif = ekuitas negatif/hampir bangkrut, di-clamp ke nilai tinggi (Cost)
      roe: s.roe < 0 ? 0.0 : s.roe,     // ROE negatif = merugi/tanpa profitabilitas, di-clamp ke 0 (Benefit)
      der: s.der < 0 ? 99.0 : s.der,   // DER negatif = ekuitas negatif/tidak sehat, di-clamp ke nilai tinggi (Cost)
      eps_growth: s.eps_growth < 0 ? 0.0 : s.eps_growth // EPS negatif = laba menurun, di-clamp ke 0 (Benefit)
    };
  });

  // 1. Cari nilai Max (untuk Benefit) dan Min (untuk Cost)
  // Cost: PER, PBV, DER (Nilai minimum lebih baik)
  // Benefit: ROE, EPS Growth (Nilai maksimum lebih baik)
  const minMax = {
    per: Math.min(...cleanedSaham.map(s => s.per)),
    pbv: Math.min(...cleanedSaham.map(s => s.pbv)),
    roe: Math.max(...cleanedSaham.map(s => s.roe)),
    der: Math.min(...cleanedSaham.map(s => s.der)),
    eps: Math.max(...cleanedSaham.map(s => s.eps_growth))
  };

  // 2. Normalisasi Matriks berdasarkan rumus SAW
  const normalisasi = cleanedSaham.map((s) => {
    return {
      kode_saham: s.kode_saham,
      nama_perusahaan: s.nama_perusahaan,
      // Cost: Min / Nilai
      per: s.per === 0 ? 0 : (minMax.per / s.per),
      pbv: s.pbv === 0 ? 0 : (minMax.pbv / s.pbv),
      der: s.der === 0 ? 0 : (minMax.der / s.der),
      // Benefit: Nilai / Max
      roe: minMax.roe === 0 ? 0 : (s.roe / minMax.roe),
      eps: minMax.eps === 0 ? 0 : (s.eps_growth / minMax.eps)
    };
  });

  // 3. Hitung Nilai Preferensi (V)
  const hasil = normalisasi.map((n) => {
    const nilai_preferensi = 
      (n.per * bobot.per) +
      (n.pbv * bobot.pbv) +
      (n.roe * bobot.roe) +
      (n.der * bobot.der) +
      (n.eps * bobot.eps);

    return {
      kode_saham: n.kode_saham,
      nama_perusahaan: n.nama_perusahaan,
      nilai_preferensi: parseFloat(nilai_preferensi.toFixed(4))
    };
  });

  // 4. Ranking
  hasil.sort((a, b) => b.nilai_preferensi - a.nilai_preferensi);
  hasil.forEach((h, index) => {
    h.ranking = index + 1;
  });

  return hasil;
}

module.exports = router;
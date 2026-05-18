const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

// =======================================
// TOPSIS GLOBAL (Static / Read-only)
// =======================================
router.get("/", async (req, res) => {
  try {
    const saham = await prisma.saham.findMany({
      where: { username: null } // Only default global stocks
    });

    if (saham.length === 0) {
      return res.json([]);
    }

    // Run basic TOPSIS with equal weights (0.2)
    const result = runTopsisMath(saham, { per: 0.2, pbv: 0.2, roe: 0.2, der: 0.2, eps: 0.2 });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal proses TOPSIS" });
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
// CALCULATE & SAVE ADAPTIVE TOPSIS
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

    // 3. Jalankan Matematika TOPSIS
    const hasilTopsis = runTopsisMath(saham, finalBobot);

    // 4. Simpan ke database
    await prisma.hasil.deleteMany({
      where: { username }
    });

    for (let i = 0; i < hasilTopsis.length; i++) {
      const h = hasilTopsis[i];
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

    const cleanHasil = hasilTopsis.map(h => ({
      ...h,
      kode_saham: h.kode_saham.split("_")[0]
    }));

    res.json(cleanHasil);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal hitung/simpan TOPSIS", error: error.message });
  }
});

// =======================================
// HELPER: TOPSIS MATH CALCULATION ENGINE
// =======================================
function runTopsisMath(saham, bobot) {
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

  // 1. Pembagi Normalisasi
  let pembagi = { per: 0, pbv: 0, roe: 0, der: 0, eps: 0 };
  cleanedSaham.forEach((s) => {
    pembagi.per += s.per ** 2;
    pembagi.pbv += s.pbv ** 2;
    pembagi.roe += s.roe ** 2;
    pembagi.der += s.der ** 2;
    pembagi.eps += s.eps_growth ** 2;
  });

  pembagi.per = Math.sqrt(pembagi.per) || 1;
  pembagi.pbv = Math.sqrt(pembagi.pbv) || 1;
  pembagi.roe = Math.sqrt(pembagi.roe) || 1;
  pembagi.der = Math.sqrt(pembagi.der) || 1;
  pembagi.eps = Math.sqrt(pembagi.eps) || 1;

  // 2. Normalisasi Terbobot
  const normalisasi = cleanedSaham.map((s) => {
    return {
      kode_saham: s.kode_saham,
      nama_perusahaan: s.nama_perusahaan,
      per: (s.per / pembagi.per) * bobot.per,
      pbv: (s.pbv / pembagi.pbv) * bobot.pbv,
      roe: (s.roe / pembagi.roe) * bobot.roe,
      der: (s.der / pembagi.der) * bobot.der,
      eps: (s.eps_growth / pembagi.eps) * bobot.eps
    };
  });

  // 3. Solusi Ideal Positif & Negatif
  // PER, PBV, DER -> Cost (kecil lebih baik)
  // ROE, EPS Growth -> Benefit (besar lebih baik)
  const idealPositif = {
    per: Math.min(...normalisasi.map(n => n.per)),
    pbv: Math.min(...normalisasi.map(n => n.pbv)),
    roe: Math.max(...normalisasi.map(n => n.roe)),
    der: Math.min(...normalisasi.map(n => n.der)),
    eps: Math.max(...normalisasi.map(n => n.eps))
  };

  const idealNegatif = {
    per: Math.max(...normalisasi.map(n => n.per)),
    pbv: Math.max(...normalisasi.map(n => n.pbv)),
    roe: Math.min(...normalisasi.map(n => n.roe)),
    der: Math.max(...normalisasi.map(n => n.der)),
    eps: Math.min(...normalisasi.map(n => n.eps))
  };

  // 4. Jarak Solusi & Preferensi
  const hasil = normalisasi.map((n) => {
    const dPositif = Math.sqrt(
      ((n.per - idealPositif.per) ** 2) +
      ((n.pbv - idealPositif.pbv) ** 2) +
      ((n.roe - idealPositif.roe) ** 2) +
      ((n.der - idealPositif.der) ** 2) +
      ((n.eps - idealPositif.eps) ** 2)
    );

    const dNegatif = Math.sqrt(
      ((n.per - idealNegatif.per) ** 2) +
      ((n.pbv - idealNegatif.pbv) ** 2) +
      ((n.roe - idealNegatif.roe) ** 2) +
      ((n.der - idealNegatif.der) ** 2) +
      ((n.eps - idealNegatif.eps) ** 2)
    );

    const nilai_preferensi = (dPositif + dNegatif) === 0 ? 0 : dNegatif / (dPositif + dNegatif);

    return {
      kode_saham: n.kode_saham,
      nama_perusahaan: n.nama_perusahaan,
      nilai_preferensi: parseFloat(nilai_preferensi.toFixed(4))
    };
  });

  // 5. Ranking
  hasil.sort((a, b) => b.nilai_preferensi - a.nilai_preferensi);
  hasil.forEach((h, index) => {
    h.ranking = index + 1;
  });

  return hasil;
}

module.exports = router;
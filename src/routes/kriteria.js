const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

// ======================================
// GET ALL CRITERIA (With Optional User Custom Weights Merged)
// ======================================
router.get("/user", async (req, res) => {
  try {
    const { username } = req.query;

    // 1. Ambil kriteria global
    const globalKriteria = await prisma.kriteria.findMany();

    if (!username) {
      return res.json(globalKriteria);
    }

    // 2. Ambil bobot kustom milik user jika ada
    const userWeights = await prisma.user_kriteria.findMany({
      where: { username }
    });

    // 3. Merge: Jika user punya bobot kustom, ganti bobot global dengan bobot kustom
    const merged = globalKriteria.map(gk => {
      const custom = userWeights.find(uw => uw.kode_kriteria === gk.kode_kriteria);
      return {
        ...gk,
        bobot: custom ? custom.bobot : gk.bobot,
        is_custom: !!custom
      };
    });

    res.json(merged);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ======================================
// GET GLOBAL ONLY
// ======================================
router.get("/", async (req, res) => {
  try {
    const data = await prisma.kriteria.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================
// SAVE CUSTOM USER WEIGHTS
// ======================================
router.post("/user", async (req, res) => {
  try {
    const { username, bobot } = req.body; // bobot is an object like { C1: 0.25, C2: 0.15, C3: 0.30, C4: 0.10, C5: 0.20 }

    if (!username || !bobot) {
      return res.status(400).json({ message: "Username dan data bobot harus disertakan!" });
    }

    // 1. Hapus bobot kustom lama milik user ini
    await prisma.user_kriteria.deleteMany({
      where: { username }
    });

    // 2. Simpan bobot kustom baru
    const insertData = Object.keys(bobot).map(kode => ({
      username,
      kode_kriteria: kode,
      bobot: parseFloat(bobot[kode])
    }));

    await prisma.user_kriteria.createMany({
      data: insertData
    });

    res.json({ success: true, message: "Bobot preferensi berhasil disimpan!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ======================================
// POST GLOBAL (Admin only)
// ======================================
router.post("/", async (req, res) => {
  try {
    const { kode_kriteria, nama_kriteria, bobot, tipe } = req.body;

    if (!kode_kriteria || !nama_kriteria || !bobot || !tipe) {
      return res.status(400).json({ message: "Semua field harus diisi!" });
    }

    const data = await prisma.kriteria.create({
      data: {
        kode_kriteria,
        nama_kriteria,
        bobot: parseFloat(bobot),
        tipe: tipe.toLowerCase()
      }
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error server", error: error.message });
  }
});

module.exports = router;
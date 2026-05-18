const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

// =======================
// GET SEMUA PENILAIAN
// =======================
router.get("/", async (req, res) => {
  try {
    const data = await prisma.penilaian.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error server",
      error: error.message,
    });
  }
});

// =======================
// POST TAMBAH PENILAIAN
// =======================
router.post("/", async (req, res) => {
  try {
    console.log("BODY MASUK:", req.body); // DEBUG

    const { no_penilaian, kode_saham, kode_kriteria, nilai } = req.body;

    // VALIDASI WAJIB
    if (!no_penilaian || !kode_saham || !kode_kriteria || nilai === undefined) {
      return res.status(400).json({
        message: "Semua field harus diisi!",
      });
    }

    // VALIDASI NILAI
    if (nilai < 0) {
      return res.status(400).json({
        message: "Nilai tidak boleh negatif",
      });
    }

    // SIMPAN KE DATABASE
    const data = await prisma.penilaian.create({
      data: {
        no_penilaian,
        kode_saham,
        kode_kriteria,
        nilai,
      },
    });

    res.json({
      message: "Data berhasil ditambahkan",
      data,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error server",
      error: error.message,
    });
  }
});

module.exports = router;
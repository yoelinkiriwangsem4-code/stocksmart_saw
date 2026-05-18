const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

// ======================================
// GET ALL STOCKS (Default & Custom User)
// ======================================
router.get("/", async (req, res) => {
  try {
    const { username } = req.query;

    const data = await prisma.saham.findMany({
      where: {
        OR: [
          { username: null },
          username ? { username: username } : { username: "___NONE___" } // Avoid loading random custom stocks if not logged in
        ]
      }
    });

    // Add clean_kode by stripping username suffix if present
    const formatted = data.map(s => ({
      ...s,
      clean_kode: s.kode_saham.split("_")[0]
    }));

    res.json(formatted);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal memuat data saham" });
  }
});

// ======================================
// ADD STOCK (Admin Global or User Custom)
// ======================================
router.post("/", async (req, res) => {
  try {
    const {
      kode_saham,
      nama_perusahaan,
      harga,
      per,
      pbv,
      roe,
      der,
      eps_growth,
      sektor,
      username
    } = req.body;

    if (!kode_saham || !nama_perusahaan) {
      return res.status(400).json({ message: "Kode saham dan nama perusahaan wajib diisi" });
    }

    // If it's a custom user stock, scope the primary key to the user: e.g. EMTK_yoel
    const final_kode_saham = username 
      ? `${kode_saham.toUpperCase().trim()}_${username}`
      : kode_saham.toUpperCase().trim();

    // Cek duplikasi menggunakan key yang di-scope
    const cekSaham = await prisma.saham.findUnique({
      where: { kode_saham: final_kode_saham }
    });

    if (cekSaham) {
      return res.status(400).json({ message: "Kode saham sudah Anda gunakan!" });
    }

    const data = await prisma.saham.create({
      data: {
        kode_saham: final_kode_saham,
        nama_perusahaan,
        harga: parseInt(harga) || 0,
        per: parseFloat(per) || 0,
        pbv: parseFloat(pbv) || 0,
        roe: parseFloat(roe) || 0,
        der: parseFloat(der) || 0,
        eps_growth: parseFloat(eps_growth) || 0,
        sektor: sektor || "Perbankan",
        username: username || null
      }
    });

    res.json({ 
      success: true, 
      data: {
        ...data,
        clean_kode: data.kode_saham.split("_")[0]
      } 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal menambah data saham", error: error.message });
  }
});

// ======================================
// UPDATE STOCK
// ======================================
router.put("/:kode_saham", async (req, res) => {
  try {
    const { kode_saham } = req.params;
    const { nama_perusahaan, harga, per, pbv, roe, der, eps_growth, sektor } = req.body;

    const data = await prisma.saham.update({
      where: { kode_saham: kode_saham.toUpperCase() },
      data: {
        nama_perusahaan,
        harga: parseInt(harga) || 0,
        per: parseFloat(per) || 0,
        pbv: parseFloat(pbv) || 0,
        roe: parseFloat(roe) || 0,
        der: parseFloat(der) || 0,
        eps_growth: parseFloat(eps_growth) || 0,
        sektor: sektor
      }
    });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Update gagal", error: error.message });
  }
});

// ======================================
// DELETE STOCK
// ======================================
router.delete("/:kode_saham", async (req, res) => {
  try {
    const { kode_saham } = req.params;

    // Hapus relasi penilaian dan hasil terlebih dahulu untuk mencegah foreign key error
    await prisma.penilaian.deleteMany({
      where: { kode_saham: kode_saham.toUpperCase() }
    });

    await prisma.hasil.deleteMany({
      where: { kode_saham: kode_saham.toUpperCase() }
    });

    await prisma.saham.delete({
      where: { kode_saham: kode_saham.toUpperCase() }
    });

    res.json({ success: true, message: "Data saham berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Delete gagal", error: error.message });
  }
});

module.exports = router;
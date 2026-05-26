const express = require("express");
const cors = require("cors");
const app = express();

const path = require("path");

const session =
  require("express-session");

// =======================
// MIDDLEWARE
// =======================

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.use(session({

  secret: "spksecret",

  resave: false,

  saveUninitialized: true

}));

// =======================
// ROUTES
// =======================

const sahamRoutes =
  require("./routes/saham");

app.use("/saham", sahamRoutes);

const kriteriaRoutes =
  require("./routes/kriteria");

app.use("/kriteria", kriteriaRoutes);

const penilaianRoutes =
  require("./routes/penilaian");

app.use("/penilaian", penilaianRoutes);

const sawRoutes =
  require("./routes/saw");

app.use("/saw", sawRoutes);

const usersRoute =
  require("./routes/users");

app.use("/users", usersRoute);

// =======================
// STATIC FILE
// =======================

app.use(
  express.static(
    path.join(__dirname, "../public")
  )
);

// =======================
// LANDING PAGE
// =======================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "../public/index.html"
    )
  );

});

// =======================
// SERVER
// =======================

const cron = require("node-cron");
const { updateStocks } = require("./services/stockUpdater");

// Jadwalkan auto-update setiap jam 17:00 (Jam 5 Sore)
// Auto‑update 5 menit setelah penutupan pasar (16:05 WIB)
// node‑cron memakai zona waktu server; asumsikan server berada di WIB (UTC+7)
cron.schedule("5 16 * * 1-5", () => {
  updateStocks();
}, { timezone: "Asia/Jakarta" });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
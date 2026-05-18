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

const topsisRoutes =
require("./routes/topsis");

app.use("/topsis", topsisRoutes);

const usersRoute =
require("./routes/users");

app.use("/users", usersRoute);

// =======================
// SERVER
// =======================

if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Server jalan di http://localhost:3000");
  });
}

module.exports = app;
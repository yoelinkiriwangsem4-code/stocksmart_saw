const express = require("express");

const router = express.Router();

const prisma = require("../prisma");

// ======================================
// REGISTER
// ======================================
router.post("/register", async (req, res) => {

    try {

        const {
            username,
            password,
            tipe_pengguna
        } = req.body;

        // CEK USERNAME
        const cekUser =
            await prisma.users.findUnique({

                where: {
                    username
                }

            });

        // JIKA SUDAH ADA
        if (cekUser) {

            return res.json({

                success: false,

                message:
                    "Username sudah digunakan"

            });

        }

        // SIMPAN USER
        await prisma.users.create({

            data: {

                username,
                password,

                tipe_pengguna:
                    tipe_pengguna || "user"

            }

        });

        // BERHASIL
        res.json({

            success: true,

            message:
                "Register berhasil"

        });

    }

    catch (error) {

        console.error("Error saat register:", error);

        res.json({

            success: false,

            message:
                "Server error: " + error.message

        });

    }

});

// ======================================
// LOGIN
// ======================================
router.post("/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        // CARI USER
        const user =
            await prisma.users.findUnique({

                where: {
                    username
                }

            });

        // USER TIDAK ADA
        if (!user) {

            return res.json({

                success: false,

                message:
                    "Username salah"

            });

        }

        // PASSWORD SALAH
        if (
            user.password !== password
        ) {

            return res.json({

                success: false,

                message:
                    "Password salah"

            });

        }

        // SIMPAN SESSION
        req.session.user = {

            username:
                user.username,

            role:
                user.tipe_pengguna

        };

        // LOGIN BERHASIL
        res.json({

            success: true,

            message:
                "Login berhasil",

            role:
                user.tipe_pengguna,

            username:
                user.username

        });

    }

    catch (error) {

        console.error("Error saat login:", error);

        res.json({

            success: false,

            message:
                "Server error: " + error.message

        });

    }

});

// ======================================
// GET ALL USERS (Khusus Admin)
// ======================================
router.get("/", async (req, res) => {
    try {
        const data = await prisma.users.findMany({
            select: {
                username: true,
                tipe_pengguna: true,
                hasil: {
                    include: {
                        saham: true
                    }
                }
            }
        });
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
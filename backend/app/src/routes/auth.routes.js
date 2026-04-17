import express from "express";
import jwt from "jsonwebtoken";

export const authRouter = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "super-secret-key-12345";

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Obtain JWT Token (admin / admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT Token
 */
authRouter.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "24h" });
    return res.json({ token });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

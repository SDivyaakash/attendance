import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { JWT_SECRET } from "../middleware/auth.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/signup", (req, res) => {
  const { name, email, password, role, roll_no } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "name, email, password, role are required" });
  }
  if (!["teacher", "student"].includes(role)) {
    return res.status(400).json({ error: "role must be 'teacher' or 'student'" });
  }
  if (role === "student" && !roll_no) {
    return res.status(400).json({ error: "roll_no is required for students" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const password_hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare(
      "INSERT INTO users (name, email, password_hash, role, roll_no) VALUES (?, ?, ?, ?, ?)"
    )
    .run(name, email, password_hash, role, roll_no || null);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, roll_no: user.roll_no } });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, roll_no: user.roll_no } });
});

export default router;

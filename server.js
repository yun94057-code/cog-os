// ============================================================
// Cognitive OS — Cloud Memory Server
// 单文件、零依赖数据库，JSON 文件存储。
// 部署：node server.js  或部署到 Railway / Render / VPS
// ============================================================

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---- Static files: serve chat.html & assets ----
app.use(express.static(__dirname));
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "chat.html")));

// ---- Config ----
const DATA_DIR  = path.join(__dirname, "data");
const API_KEY   = process.env.COG_API_KEY || "cog-os-dev-key-change-me";
const PORT      = process.env.PORT || 3456;

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ---- Auth ----
function auth(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key || key !== API_KEY) return res.status(401).json({ error: "无效的 API Key" });
  next();
}

// ---- File helpers ----
function readJSON(filename) {
  const fp = path.join(DATA_DIR, filename);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, "utf-8")); }
  catch { return []; }
}

function writeJSON(filename, data) {
  const fp = path.join(DATA_DIR, filename);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
}

// ---- Health ----
app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ---- Memories ----
app.get("/api/memories", auth, (_req, res) => {
  res.json(readJSON("memories.json"));
});

app.post("/api/memories", auth, (req, res) => {
  const { memories } = req.body;
  if (!Array.isArray(memories)) return res.status(400).json({ error: "memories 必须是数组" });
  writeJSON("memories.json", memories);
  res.json({ ok: true, count: memories.length });
});

// ---- Chat History ----
app.get("/api/chat", auth, (_req, res) => {
  res.json(readJSON("chat.json"));
});

app.post("/api/chat", auth, (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages)) return res.status(400).json({ error: "messages 必须是数组" });
  writeJSON("chat.json", messages);
  res.json({ ok: true, count: messages.length });
});

// ---- Start ----
app.listen(PORT, () => {
  console.log(`🧠 Cognitive OS Memory Server running on port ${PORT}`);
  console.log(`   Data dir: ${DATA_DIR}`);
  console.log(`   API Key:  ${API_KEY === "cog-os-dev-key-change-me" ? "⚠ 请设置 COG_API_KEY 环境变量" : "✅ 已配置"}`);
});

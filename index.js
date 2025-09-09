import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { execSync } from "child_process";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
const DB_PATH = "./score.db";

app.use(express.static(__dirname));
app.use(express.json());

// Database
let db;
(async () => {
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT,
      character INTEGER,
      score INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

// Route
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

// DB API
// 점수 저장
app.post("/submit-score", async (req, res) => {
  const { nickname, character, score } = req.body;
  if (!nickname || score == null) {
    return res.status(400).json({ error: "Invalid data" });
  }

  await db.run(
    "INSERT INTO scores (nickname, character, score) VALUES (?, ?, ?)",
    [nickname, character, score]
  );

  res.json({ success: true });
});

// 오늘 랭킹 (Top 10)
app.get("/daily-rank-korea", async (req, res) => {
    try {
        const rows = await db.all(`
            SELECT nickname, character, score
            FROM scores
            WHERE DATE(datetime(created_at, '+9 hours')) = DATE('now', '+9 hours')
            ORDER BY score DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching daily scores");
    }
});

// 이번 주 랭킹 (Top 10) - 한국 시간대
app.get("/weekly-rank-korea", async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT nickname, character, score, created_at
      FROM scores
      WHERE datetime(created_at, '+9 hours') >= datetime('now', '+9 hours', 'weekday 1', '-7 days')
      ORDER BY score DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching weekly scores");
  }
});

app.listen(port, () => {
     console.log(`Listening on port ${port}`);
})

// 3. 하루 1회 DB 백업 → Git commit + push
function getKSTISOString() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().replace("T", " ").split(".")[0]; 
}

function backupDB() {
  try {
    execSync("git pull origin main", { stdio: "inherit", shell: true });
    execSync("git add score.db", { stdio: "inherit", shell: true });

    const kstTime = getKSTISOString();

    // 변경 사항이 있을 때만 커밋
    try {
      execSync(`git commit -m "backup: ${kstTime}"`, {
        stdio: "inherit",
        shell: true,
      });
    } catch (err) {
      console.log("변경된 내용 없음 → 커밋 스킵");
    }

    execSync("git push origin main", { stdio: "inherit", shell: true });
    console.log("DB 백업 완료");
  } catch (err) {
    console.error("DB 백업 실패:", err);
  }
}

// 하루 1회 (24시간 간격)
setInterval(backupDB, 24 * 60 * 60 * 1000);
// setInterval(backupDB, 60 * 1000);
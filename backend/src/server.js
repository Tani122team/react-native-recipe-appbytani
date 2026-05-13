import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { getDb } from "./config/db.js";
import { runMigrations } from "./config/migrate.js";
import { favoritesTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";
import job from "./config/cron.js";

const app = express();
const PORT = ENV.PORT || 5001;

await runMigrations();

if (ENV.NODE_ENV === "production" && process.env.API_URL) {
  job.start();
} else if (ENV.NODE_ENV === "production") {
  console.warn("API_URL not set; keepalive cron disabled");
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>Recipe API</title>
<style>body{font-family:system-ui,sans-serif;max-width:36rem;margin:3rem auto;padding:0 1rem;line-height:1.5}
code{background:#eee;padding:0 .2rem}</style></head><body>
<h1>Recipe API (backend)</h1>
<p>This URL is your <strong>server</strong> only. The recipe <strong>app UI</strong> runs on your phone with <strong>Expo Go</strong> (<code>npx expo start</code> in the <code>mobile</code> folder) — not here in the browser.</p>
<p><a href="/api/health">Open <code>/api/health</code></a> to verify the API.</p>
</body></html>`);
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    database: Boolean(ENV.DATABASE_URL),
  });
});

app.post("/api/favorites", async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({ error: "DATABASE_URL is not configured" });
    }

    const { userId, recipeId, title, image, cookTime, servings } = req.body;

    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(newFavorite[0]);
  } catch (error) {
    console.log("Error adding favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({ error: "DATABASE_URL is not configured" });
    }

    const { userId } = req.params;

    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json(userFavorites);
  } catch (error) {
    console.log("Error fetching the favorites", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({ error: "DATABASE_URL is not configured" });
    }

    const { userId, recipeId } = req.params;

    await db
      .delete(favoritesTable)
      .where(
        and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, parseInt(recipeId)))
      );

    res.status(200).json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.log("Error removing a favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server is running on PORT:", PORT);
});

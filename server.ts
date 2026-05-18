import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI-powered search/suggestions or recipe auto-complete
  app.post("/api/generate-recipe", async (req, res) => {
    try {
      const { mealName } = req.body;
      if (!mealName) return res.status(400).json({ error: "Meal name is required" });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Generate a Cameroonian recipe for "${mealName}". 
      Return ONLY a JSON object with: 
      title, description, ingredients (array), instructions (string), 
      cookingTime (number in minutes), difficulty (Easy/Medium/Hard), category (Breakfast/Lunch/Supper/Brunch).`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      
      res.json(JSON.parse(text || "{}"));
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate recipe" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite development middleware loaded.");
    } catch (viteError) {
      console.error("Failed to start Vite server:", viteError);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Global Kitchen by YOH PRECIOUS running on Port ${PORT}`);
  });
}

startServer();

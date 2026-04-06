import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");

// Initial data
const initialData = {
  guests: [
    { id: "1", name: "Felipe Evaristo", confirmed: false },
    { id: "2", name: "Flavia Silva", confirmed: false },
    { id: "3", name: "João Souza", confirmed: false },
  ],
  gifts: [
    { id: "1", name: "Jogo de Jantar", price: 250, image: "https://picsum.photos/seed/dinner/400/300", bought: false },
    { id: "2", name: "Cafeteira Nespresso", price: 450, image: "https://picsum.photos/seed/coffee/400/300", bought: false },
  ],
  config: {
    coupleNames: "Felipe & Flavia",
    weddingDate: "2026-12-20T18:00:00",
    location: "Espaço Elegance, São Paulo - SP",
    pixKey: "felipe.evaristo.campos@gmail.com",
    whatsappNumber: "5511999999999",
    envelopeText: "Um convite especial para você",
    adminPassword: "admin",
    heroImage: "https://picsum.photos/seed/wedding-couple/1200/800",
    gallery: [
      "https://picsum.photos/seed/couple-1/400/400",
      "https://picsum.photos/seed/couple-2/400/400",
      "https://picsum.photos/seed/couple-3/400/400",
      "https://picsum.photos/seed/couple-4/400/400"
    ],
    playlist: [
      { title: "A Thousand Years", artist: "Christina Perri", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { title: "Perfect", artist: "Ed Sheeran", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    ]
  }
};

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
} else {
  // Migration: ensure all fields from initialData are present in existing data.json
  const existingData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const mergedData = {
    ...initialData,
    ...existingData,
    config: {
      ...initialData.config,
      ...(existingData.config || {})
    }
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(mergedData, null, 2));
}

function getData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function saveData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/data", (req, res) => {
    const data = getData();
    // Don't send password to client
    const { adminPassword, ...safeConfig } = data.config;
    res.json({ ...data, config: safeConfig });
  });

  app.post("/api/rsvp", (req, res) => {
    const { guestId, confirmed } = req.body;
    const data = getData();
    const guest = data.guests.find((g: any) => g.id === guestId);
    if (guest) {
      guest.confirmed = confirmed;
      saveData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Guest not found" });
    }
  });

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const data = getData();
    if (password === data.config.adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  app.post("/api/admin/update", (req, res) => {
    const { password, type, payload } = req.body;
    const data = getData();
    if (password !== data.config.adminPassword) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (type === "guests") {
      data.guests = payload;
    } else if (type === "gifts") {
      data.gifts = payload;
    } else if (type === "config") {
      data.config = { ...data.config, ...payload };
    }

    saveData(data);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

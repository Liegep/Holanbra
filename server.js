import express from 'express';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function startServer() {
  const multer = (await import('multer')).default;
  const sharp = (await import('sharp')).default;

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error("Express error:", err);
    res.status(500).send("Internal Server Error");
  });

  // 0. Logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. Vite Middleware (Moved early for dev robustness)
  if (process.env.NODE_ENV !== 'production') {
    console.log("Starting Vite in middleware mode...");
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: false 
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log("Vite middleware attached.");
    } catch (e) {
      console.error("Failed to start Vite middleware:", e);
    }
  }

  // 2. Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyC5mcwNnfJnhMHpjayfwtn8byn0mj86pqs",
    authDomain: "ai-studio-a67ed34f-6f84-4e0f-ae53-5ee58939e52e.firebaseapp.com",
    projectId: "ai-studio-a67ed34f-6f84-4e0f-ae53-5ee58939e52e",
    storageBucket: "ai-studio-a67ed34f-6f84-4e0f-ae53-5ee58939e52e.appspot.com",
    messagingSenderId: "586275517087",
    appId: "1:586275517087:web:aded5d70fa0223a32328aa",
    firestoreDatabaseId: "ai-studio-a67ed34f-6f84-4e0f-ae53-5ee58939e52e"
  };

  console.log("Configuring Firebase with Project ID:", firebaseConfig.projectId);

  const appFirebase = initializeApp(firebaseConfig);
  const db = getFirestore(appFirebase, firebaseConfig.firestoreDatabaseId);
  console.log("✅ Firebase initialized");

  // Helper for security
  const validateSlToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const secretToken = process.env.SL_SECRET_TOKEN;
    if (!secretToken) return next();
    if (authHeader === `Bearer ${secretToken}` || req.headers['x-sl-token'] === secretToken) return next();
    return res.status(401).json({ error: 'Não autorizado' });
  };

  // API Routes
  app.post('/api/casperlet/sync', async (req, res) => {
    try {
      const { unit_name, price, status, tenant, casperletId } = req.body;
      const docId = unit_name || casperletId;
      if (!docId) return res.status(400).json({ error: 'Missing unit_name or casperletId' });

      await setDoc(doc(db, 'properties', docId), {
        price: price ? Number(price) : 0,
        status: status || "available",
        tenant: tenant || "Disponível",
        lastUpdate: new Date().toISOString(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/casperlet/status", async (req, res) => {
    try {
      const slDoc = await getDoc(doc(db, "settings", "sl_config"));
      const data = slDoc.exists() ? slDoc.data() : { status: "offline", slName: "Victoria Holanbra" };
      res.json({ status: data.status, managers: [{ slName: data.slName, status: data.status, slId: data.slId }] });
    } catch (error) {
      res.json({ status: "offline", managers: [] });
    }
  });

  const upload = multer({ dest: 'uploads/' });
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const isVideo = req.file.mimetype.startsWith('video/');
    const outputPath = `uploads/${req.file.filename}${isVideo ? (path.extname(req.file.originalname) || '.mp4') : '.webp'}`;
    try {
      if (!isVideo) {
        await sharp(req.file.path).resize(1920, 1080, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 }).toFile(outputPath);
        fs.unlinkSync(req.file.path);
      } else {
        fs.renameSync(req.file.path, outputPath);
      }
      res.json({ url: `/${outputPath}` });
    } catch (error) {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.use('/uploads', express.static('uploads'));

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
    }
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port 3000`);
  });
}

startServer().catch(err => console.error("FATAL:", err));

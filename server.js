import express from 'express';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from "multer";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 1. Configuração Firebase (Using the keys you already have)
  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-studio-a67ed34f-6f84-4e0f-ae53-5ee58939e52e.firebaseapp.com",
    projectId: (process.env.VITE_FIREBASE_PROJECT_ID && !process.env.VITE_FIREBASE_PROJECT_ID.startsWith('gen-lang')) 
      ? process.env.VITE_FIREBASE_PROJECT_ID 
      : "ai-studio-a67ed34f-6f84-4e0f-ae53-5ee58939e52e",
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-studio-a67ed34f-6f84-4e0f-ae53-5ee58939e52e.firebasestorage.app",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
  };

  // Initialize Firebase with Client SDK as requested
  const appFirebase = initializeApp(firebaseConfig);
  const db = getFirestore(appFirebase);
  console.log("✅ Servidor conectado ao Firebase via Client SDK");

  // Helper for security
  const validateSlToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const secretToken = process.env.SL_SECRET_TOKEN;

    if (!secretToken) {
      return next(); // Skip if not configured
    }

    if (authHeader === `Bearer ${secretToken}` || req.headers['x-sl-token'] === secretToken) {
      return next();
    }

    return res.status(401).json({ error: 'Não autorizado' });
  };

  // 2. Rota para o Second Life (CasperLet Sync)
  app.post('/api/casperlet/sync', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const secretToken = process.env.SL_SECRET_TOKEN;

    if (secretToken && authHeader !== `Bearer ${secretToken}`) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    try {
      const { unit_name, price, status, tenant, casperletId } = req.body;
      
      // We use unit_name or casperletId as the document ID
      const docId = unit_name || casperletId;
      if (!docId) return res.status(400).json({ error: 'Missing unit_name or casperletId' });

      // Salva os dados no Firestore
      await setDoc(doc(db, 'properties', docId), {
        price: price ? Number(price) : 0,
        status: status || "available",
        tenant: tenant || "Disponível",
        lastUpdate: new Date().toISOString(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("Erro no Sync:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 2.1 Additional Second Life Routes (Registration and Status)
  app.post('/api/sl/register', validateSlToken, async (req, res) => {
    const { slId, slName, status, callbackUrl } = req.body;
    try {
      await setDoc(doc(db, "settings", "sl_config"), {
        slId,
        slName,
        status: status || "online",
        callbackUrl: callbackUrl || null,
        lastSeen: serverTimestamp()
      }, { merge: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/casperlet/status", async (req, res) => {
    try {
      const slDoc = await getDoc(doc(db, "settings", "sl_config"));
      const data = slDoc.exists() ? slDoc.data() : { status: "offline", slName: "Victoria Holanbra" };
      res.json({ 
        status: data.status, 
        managers: [{ slName: data.slName, status: data.status, slId: data.slId }] 
      });
    } catch (error) {
      res.json({ status: "offline", managers: [] });
    }
  });

  // 2.2 Upload logic (Essential for Admin Panel)
  const upload = multer({ dest: 'uploads/' });
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const isVideo = req.file.mimetype.startsWith('video/');
    const outputPath = `uploads/${req.file.filename}${isVideo ? (path.extname(req.file.originalname) || '.mp4') : '.webp'}`;
    
    try {
      if (!isVideo) {
        await sharp(req.file.path)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(outputPath);
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

  // 3. Servir o Front-end (Design)
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      app.get('/', (req, res) => {
        res.send('Aguardando build... se o erro persistir, clique em Reimplantar na Hostinger.');
      });
    }
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor voando na porta ${PORT}`);
  });
}

startServer();

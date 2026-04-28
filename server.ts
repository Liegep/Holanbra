import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc, setDoc } from "firebase/firestore";

// Helper to get config from env or fallback to file for local dev
const getFirebaseConfig = () => {
  if (process.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
      firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || ""
    };
  }
  
  try {
    // Standard import for local AI Studio environment
    const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8"));
    return config;
  } catch (e) {
    console.warn("No Firebase config found in environment or file.");
    return {};
  }
};

const firebaseConfig = getFirebaseConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, (firebaseConfig as any).firestoreDatabaseId);

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for videos
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Security Middleware for SL/CasperLet routes
  const validateSlToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers['x-sl-token'] || req.body.secret_token;
    const expectedToken = process.env.SL_SECRET_TOKEN;

    if (!expectedToken) {
      console.warn("SL_SECRET_TOKEN not set in environment. Skipping security check.");
      return next();
    }

    if (token !== expectedToken) {
      console.warn(`Unauthorized request from ${req.ip} - Invalid Token`);
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };
  
  app.get("/api/ping", (req, res) => {
    res.send("pong");
  });

  // CasperLet Sync Endpoint (Webhook from Second Life)
  app.post("/api/casperlet/sync", validateSlToken, async (req, res) => {
    console.log("CasperLet Sync request received:", req.body);
    const { casperletId, status, tenant, price, slurl, name } = req.body;

    if (!casperletId) {
      return res.status(400).json({ error: "Missing casperletId" });
    }

    try {
      // Find property by casperletId
      const q = query(collection(db, "properties"), where("casperletId", "==", casperletId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(404).json({ error: "Property not found in catalog" });
      }

      const propertyDoc = querySnapshot.docs[0];
      const propertyRef = doc(db, "properties", propertyDoc.id);

      // Prepare update data
      let updateData: any = {
        status: status || "available",
        updatedAt: serverTimestamp(),
      };

      if (price) updateData.price = parseFloat(price);
      if (slurl) updateData.slurl = slurl;

      await updateDoc(propertyRef, updateData);

      console.log(`Property ${casperletId} updated successfully.`);
      res.json({ success: true, message: "Sync completed" });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ error: "Internal sync error" });
    }
  });

  // Image/Video Upload
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const isVideo = req.file.mimetype.startsWith('video/');
    
    if (isVideo) {
      // For videos, we just move them to a proper extension if needed, but for now just keep as is
      const ext = path.extname(req.file.originalname) || '.mp4';
      const outputPath = `uploads/${req.file.filename}${ext}`;
      fs.renameSync(req.file.path, outputPath);
      
      return res.json({ 
        url: `/${outputPath}`,
        format: 'video',
        type: req.file.mimetype
      });
    }

    const outputPath = `uploads/${req.file.filename}.webp`;
    
    try {
      await sharp(req.file.path)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75, effort: 6 })
        .toFile(outputPath);

      // Clean up original file
      fs.unlinkSync(req.file.path);
      
      res.json({ 
        url: `/uploads/${req.file.filename}.webp`,
        format: 'webp'
      });
    } catch (error) {
      console.error("Processing failed:", error);
      res.status(500).json({ error: "Processing failed" });
    }
  });

  // Serve static uploads
  app.use('/uploads', express.static('uploads'));

  // SL Integration Endpoints
  app.get("/api/sl/status", async (req, res) => {
    res.json({ message: "SL API is active" });
  });

  // This endpoint is called by the LSL script in-world
  app.post(["/api/sl/register", "/api/sl/register/"], validateSlToken, async (req, res) => {
    console.log("SL Register request received at:", req.path);
    console.log("Body:", req.body);
    const { slId, slName, status, callbackUrl } = req.body;
    
    if (!slId || !slName) {
      return res.status(400).json({ error: "Missing SL identity" });
    }

    try {
      await setDoc(doc(db, "settings", "sl_config"), {
        slId,
        slName,
        status: status || "online",
        callbackUrl: callbackUrl || null,
        lastSeen: serverTimestamp()
      }, { merge: true });

      res.json({ success: true, message: "Registered on website" });
    } catch (error) {
      console.error("SL Register error:", error);
      res.status(500).json({ error: "Fail to register" });
    }
  });

  // This endpoint is called by the website chat
  app.post(["/api/sl/message", "/api/sl/message/"], async (req, res) => {
    const { message, senderName } = req.body;

    try {
      const slDoc = await getDoc(doc(db, "settings", "sl_config"));
      if (!slDoc.exists()) return res.status(404).json({ error: "SL Agent not registered" });

      const { callbackUrl } = slDoc.data();
      if (!callbackUrl) return res.status(400).json({ error: "SL Agent offline (no callback URL)" });

      // Forward to Second Life
      const slRes = await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sender: senderName })
      });

      if (!slRes.ok) throw new Error("SL Object unreachable");

      res.json({ success: true });
    } catch (error) {
      console.error("SL Message Error:", error);
      res.status(500).json({ error: "Failed to reach SL Agent" });
    }
  });

  // API Route for CasperLet (Now reading real status)
  app.get("/api/casperlet/status", async (req, res) => {
    try {
      const slDoc = await getDoc(doc(db, "settings", "sl_config"));
      const data = slDoc.exists() ? slDoc.data() : { status: "offline", slName: "Victoria Holanbra" };
      
      // Check if lastSeen was more than 5 minutes ago
      const lastSeen = data.lastSeen?.toDate();
      const status = (lastSeen && (new Date().getTime() - lastSeen.getTime()) < 300000) 
        ? data.status 
        : "offline";

      res.json({ 
        status: status, 
        managers: [
          { slName: data.slName, status: status, slId: data.slId }
        ] 
      });
    } catch (error) {
      res.json({ status: "offline", managers: [] });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Catch-all for API 404s to help debug
    app.use('/api/*', (req, res) => {
      console.log(`404 on API route: ${req.method} ${req.path}`);
      res.status(404).json({ error: "API route not found", path: req.path, method: req.method });
    });
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

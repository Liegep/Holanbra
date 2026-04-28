import express from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

// 1. Configuração do Firebase Admin
const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

try {
  if (firebaseConfig.projectId) {
    initializeApp({ credential: cert(firebaseConfig) });
    console.log("✅ Firebase Admin Conectado");
  }
} catch (e) {
  console.error("❌ Erro ao iniciar Firebase:", e.message);
}

const db = getFirestore();

// 2. Rota para o Second Life
app.post('/api/casperlet/sync', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const secretToken = process.env.SL_SECRET_TOKEN;

  if (!authHeader || authHeader !== `Bearer ${secretToken}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const { unit_name, price, status, tenant } = req.body;
    const propertyRef = db.collection('properties').doc(unit_name);
    
    await propertyRef.set({
      price: Number(price),
      status: status,
      tenant: tenant || "Disponível",
      lastUpdate: new Date().toISOString()
    }, { merge: true });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Servir o Front-end (Design do AI Studio)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Aguardando conclusão do build do design...');
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
});

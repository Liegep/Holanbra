import express from 'express';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

// 1. Configuração Firebase (Usando as chaves que você JÁ TEM)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Inicializa o Firebase sem precisar do arquivo JSON bloqueado
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);
console.log("✅ Servidor conectado ao Firebase via Client SDK");

// 2. Rota para o Second Life
app.post('/api/casperlet/sync', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const secretToken = process.env.SL_SECRET_TOKEN;

  if (!authHeader || authHeader !== `Bearer ${secretToken}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const { unit_name, price, status, tenant } = req.body;
    
    // Salva os dados no Firestore
    await setDoc(doc(db, 'properties', unit_name), {
      price: Number(price),
      status: status,
      tenant: tenant || "Disponível",
      lastUpdate: new Date().toISOString()
    }, { merge: true });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erro no Sync:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Servir o Front-end (Design)
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor voando na porta ${PORT}`);
});

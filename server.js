import express from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para servir os arquivos do site (Vite)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

// 1. Configuração do Firebase
const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

try {
  initializeApp({ credential: cert(firebaseConfig) });
  console.log("✅ Firebase conectado!");
} catch (e) {
  console.error("❌ Erro Firebase:", e);
}

const db = getFirestore();

// 2. ROTA DE SINCRONIZAÇÃO (Second Life)
app.post('/api/casperlet/sync', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const secretToken = process.env.SL_SECRET_TOKEN;

  if (!authHeader || authHeader !== `Bearer ${secretToken}`) {
    return res.status(401).json({ error: 'Token Inválido' });
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

    console.log(`🏠 Unidade ${unit_name} atualizada.`);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. SERVIR O SITE LINDO (A parte visual do AI Studio)
// Isso diz ao Node para mostrar o site que o Vite construiu na pasta /dist
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

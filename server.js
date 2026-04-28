import express from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Ativa a leitura das variáveis de ambiente
dotenv.config();

const app = express();
app.use(express.json());

// Configuração do Firebase usando as chaves que você colocou na Hostinger
const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Esse replace resolve o problema comum de quebra de linha na chave do Firebase
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

try {
  initializeApp({
    credential: cert(firebaseConfig)
  });
  console.log("✅ Conexão com Firebase iniciada!");
} catch (error) {
  console.error("❌ Erro ao conectar no Firebase:", error);
}

const db = getFirestore();

// A ROTA QUE O SECOND LIFE VAI CHAMAR
app.post('/api/casperlet/sync', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const secretToken = process.env.SL_SECRET_TOKEN;

  // Verifica se o Token de segurança está certo
  if (!authHeader || authHeader !== `Bearer ${secretToken}`) {
    console.warn("⚠️ Bloqueado: Token inválido ou ausente.");
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const { unit_name, price, status, tenant } = req.body;

    // Atualiza o Firestore (Coleção 'properties', Documento com o nome da casa)
    const propertyRef = db.collection('properties').doc(unit_name);
    
    await propertyRef.set({
      price: Number(price),
      status: status,
      lastUpdate: new Date().toISOString(),
      tenant: tenant || "Nenhum"
    }, { merge: true });

    console.log(`🚀 Sucesso! Unidade ${unit_name} agora custa L$ ${price}`);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ Erro ao salvar no banco:", error);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

// Porta automática da Hostinger
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Servidor ativo na porta ${PORT}`);
});

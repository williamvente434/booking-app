// server.js
// Petit backend Node/Express pour encaisser de vrais acomptes via Stripe Checkout.
//
// Installation :
//   npm init -y
//   npm install express stripe cors dotenv better-sqlite3
//   node server.js
//
// Variables d'environnement à définir dans un fichier .env (voir .env.example)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const Database = require('better-sqlite3');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY manquant dans .env — le serveur ne peut pas démarrer correctement.');
}
if (!process.env.FRONTEND_URL) {
  console.error('❌ FRONTEND_URL manquant dans .env — mets par ex. FRONTEND_URL=http://127.0.0.1:5500');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

// --- Base de données minimale (fichier local SQLite) ---
const db = new Database('appointments.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    service_name TEXT,
    date TEXT,
    time TEXT,
    client_name TEXT,
    client_phone TEXT,
    deposit_amount INTEGER,
    status TEXT DEFAULT 'en_attente_paiement',
    stripe_session_id TEXT,
    created_at INTEGER
  )
`);

// IMPORTANT : la route webhook a besoin du corps brut (pas du JSON parsé),
// donc on la déclare AVANT app.use(express.json()).
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Signature webhook invalide :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const appointmentId = session.metadata.appointment_id;

    db.prepare(`UPDATE appointments SET status = 'confirme', stripe_session_id = ? WHERE id = ?`)
      .run(session.id, appointmentId);

    console.log(`✅ Acompte payé et rendez-vous confirmé : ${appointmentId}`);
    // Ici tu peux aussi envoyer un email/SMS de confirmation au client
  }

  res.json({ received: true });
});

app.use(cors());
app.use(express.json());

// --- Route de vérification : ouvre juste http://localhost:4000/test-stripe dans ton navigateur ---
app.get('/test-stripe', async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.send(`
      <h2>✅ Stripe est bien connecté</h2>
      <p>Ta clé API fonctionne. Compte en mode ${balance.livemode ? 'LIVE (réel)' : 'TEST'}.</p>
      <p>Devise disponible : ${balance.available.map(b => b.currency.toUpperCase()).join(', ')}</p>
    `);
  } catch (err) {
    res.status(500).send(`
      <h2>❌ Stripe n'est PAS connecté</h2>
      <p><strong>Erreur exacte :</strong> ${err.message}</p>
      <p>Vérifie ta clé STRIPE_SECRET_KEY dans le fichier .env (copie-la à nouveau depuis le dashboard Stripe avec le bouton presse-papier).</p>
    `);
  }
});

// --- Créer une session de paiement Stripe ---
app.post('/create-checkout-session', async (req, res) => {
  console.log('📩 Requête reçue sur /create-checkout-session :', req.body);

  try {
    const { serviceName, date, time, clientName, clientPhone, depositAmount } = req.body;

    if (!serviceName || !date || !time || !clientName || !depositAmount) {
      console.log('⚠️ Champs manquants');
      return res.status(400).json({ error: 'Champs manquants' });
    }

    const appointmentId = 'apt_' + Date.now();

    // On enregistre le rendez-vous en "en attente" AVANT le paiement
    db.prepare(`
      INSERT INTO appointments (id, service_name, date, time, client_name, client_phone, deposit_amount, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(appointmentId, serviceName, date, time, clientName, clientPhone || '', depositAmount, Date.now());

    console.log('✅ Rendez-vous enregistré en base, création de la session Stripe...');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `Acompte — ${serviceName} (${date} à ${time})` },
          unit_amount: depositAmount * 100, // Stripe attend des centimes
        },
        quantity: 1,
      }],
      metadata: { appointment_id: appointmentId },
      success_url: `${process.env.FRONTEND_URL}/confirmation.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/index.html`,
    });

    console.log('✅ Session Stripe créée :', session.url);
    res.json({ url: session.url });

  } catch (err) {
    console.error('❌ Erreur dans /create-checkout-session :', err);
    res.status(500).json({ error: err.message || 'Erreur inconnue côté serveur' });
  }
});

// --- Lister les rendez-vous (pour le tableau de bord pro) ---
app.get('/appointments', (req, res) => {
  const rows = db.prepare(`SELECT * FROM appointments ORDER BY date, time`).all();
  res.json(rows);
});

// --- Vérifier le statut d'une session (page de confirmation) ---
app.get('/session-status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  res.json({ status: session.payment_status, appointmentId: session.metadata.appointment_id });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));

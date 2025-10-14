# 🎾 SportBook SAAS

Sistema completo per la gestione di centri sportivi, campi da tennis e padel con prenotazioni online e pagamenti sicuri.

## 🚀 Caratteristiche Principali

### 🔐 Sicurezza Enterprise
- JWT Authentication con Refresh Token
- Rate Limiting e protezione Brute Force
- XSS e SQL Injection Protection
- Helmet.js per security headers
- Audit Logging completo
- Password hashing con bcrypt (12 rounds)

### 📅 Gestione Prenotazioni
- Prenotazione campi in tempo reale
- Calendario disponibilità
- Gestione conflitti automatica
- Sistema di cancellazione con policy
- Notifiche email/SMS
- Check disponibilità real-time

### 💳 Pagamenti Sicuri
- Integrazione Stripe (PCI Compliant)
- Payment Intent con 3D Secure
- Gestione rimborsi automatici
- Webhook handler per eventi asincroni
- Report finanziari dettagliati

### 👥 Multi-Tenant
- Supporto organizzazioni multiple
- Gestione utenti con ruoli
- Configurazione personalizzata per organizzazione
- Admin panel completo

### 📊 Dashboard e Report
- Statistiche in tempo reale
- Report revenue
- Analytics prenotazioni
- Gestione utenti avanzata

---

## 📋 Prerequisiti

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 15
- **Redis** >= 7.0
- **npm** >= 9.0.0
- **Docker** (opzionale)

---

## 🛠️ Installazione

### Metodo 1: Installazione Manuale

#### 1. Clone del Repository
```bash
git clone https://github.com/your-username/sportbook-saas.git
cd sportbook-saas
```

#### 2. Setup Backend
```bash
cd backend

# Installa dipendenze
npm install

# Copia file .env
cp .env.example .env

# Modifica .env con le tue credenziali
nano .env

# Genera Prisma Client
npx prisma generate

# Esegui le migration
npx prisma migrate dev --name init

# Seed del database (dati demo)
npm run seed
```

#### 3. Avvia i Servizi

**PostgreSQL:**
```bash
# Linux/Mac
sudo service postgresql start

# Mac con Homebrew
brew services start postgresql

# Verifica connessione
psql -U postgres -d sportbook
```

**Redis:**
```bash
# Linux/Mac
redis-server

# Mac con Homebrew
brew services start redis

# Verifica
redis-cli ping
```

**Backend:**
```bash
cd backend
npm run dev
```

Il backend sarà disponibile su: http://localhost:5000

---

### Metodo 2: Con Docker (RACCOMANDATO)

```bash
# Avvia tutti i servizi
docker-compose up -d

# Vedi i logs
docker-compose logs -f backend

# Ferma tutto
docker-compose down

# Reset completo
docker-compose down -v
```

**Servizi disponibili:**
- Backend API: http://localhost:5000
- Prisma Studio: http://localhost:5555
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## 🔑 Credenziali Demo

Dopo il seed del database:

**Admin:**
- Email: `admin@demotennisclub.com`
- Password: `Admin123!`

**Manager:**
- Email: `manager@demotennisclub.com`
- Password: `Manager123!`

**Member:**
- Email: `mario.rossi@example.com`
- Password: `Member123!`

---

## 📁 Struttura Progetto

```
sportbook-saas/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Schema database
│   │   └── seed.js              # Dati iniziali
│   ├── src/
│   │   ├── config/              # Configurazioni
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # API routes
│   │   ├── utils/               # Utility functions
│   │   └── server.js            # Entry point
│   ├── .env.example             # Template variabili
│   ├── package.json
│   └── Dockerfile
├── frontend/                     # React app (WIP)
├── docker-compose.yml
└── README.md
```

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/register        # Registrazione
POST   /api/auth/login           # Login
POST   /api/auth/refresh         # Refresh token
POST   /api/auth/logout          # Logout
POST   /api/auth/forgot-password # Reset password
POST   /api/auth/reset-password  # Conferma reset
GET    /api/auth/me              # Profilo utente
PUT    /api/auth/profile         # Aggiorna profilo
```

### Bookings
```
GET    /api/bookings             # Lista prenotazioni
POST   /api/bookings             # Crea prenotazione
GET    /api/bookings/:id         # Dettaglio prenotazione
PUT    /api/bookings/:id         # Aggiorna prenotazione
POST   /api/bookings/:id/cancel  # Cancella prenotazione
GET    /api/bookings/availability/:fieldId  # Check disponibilità
```

### Fields
```
GET    /api/fields               # Lista campi
POST   /api/fields               # Crea campo (Admin)
GET    /api/fields/:id           # Dettaglio campo
PUT    /api/fields/:id           # Aggiorna campo (Admin)
DELETE /api/fields/:id           # Elimina campo (Admin)
```

### Payments
```
GET    /api/payments             # Lista pagamenti
POST   /api/payments/create-payment-intent  # Crea payment intent
POST   /api/payments/confirm-payment        # Conferma pagamento
POST   /api/payments/:id/refund             # Rimborso (Admin)
```

### Admin
```
GET    /api/admin/dashboard      # Dashboard stats
GET    /api/admin/settings       # Impostazioni org
PUT    /api/admin/settings       # Aggiorna settings
PUT    /api/admin/payment-config # Config pagamenti
PUT    /api/admin/email-config   # Config email
GET    /api/admin/users          # Gestione utenti
POST   /api/admin/users          # Crea utente
PUT    /api/admin/users/:id      # Aggiorna utente
DELETE /api/admin/users/:id      # Elimina utente
```

---

## 🔧 Comandi Utili

### Development
```bash
npm run dev              # Avvia dev server
npm run lint             # Check linting
npm run lint:fix         # Fix linting errors
npm run format           # Format code con Prettier
```

### Database
```bash
npx prisma studio        # GUI database (http://localhost:5555)
npx prisma migrate dev   # Crea migration
npx prisma migrate reset # Reset database
npm run seed             # Popola database
npx prisma db push       # Push schema senza migration
```

### Testing
```bash
npm test                 # Run tests
npm run test:ci          # CI/CD tests
```

### Production
```bash
npm run build            # Build application
npm start                # Start production server
```

### Docker
```bash
docker-compose up -d              # Avvia servizi
docker-compose down               # Ferma servizi
docker-compose logs -f backend    # Vedi logs
docker-compose restart backend    # Riavvia backend
docker-compose exec backend sh    # Shell nel container
```

---

## 🔒 Configurazione Stripe

1. Crea account su [Stripe](https://stripe.com)
2. Ottieni le API keys da Dashboard > Developers > API keys
3. Aggiungi le keys nel file `.env`:
```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```
4. Configura webhook:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Eventi: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`

---

## 📧 Configurazione Email

### Gmail
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

**Nota:** Usa [App Password](https://support.google.com/accounts/answer/185833) per Gmail

### SendGrid (Alternativa)
```bash
SENDGRID_API_KEY="SG.your_api_key"
```

---

## 🚀 Deploy in Produzione

### Variabili Ambiente Produzione
```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db"
REDIS_URL="redis://host:6379"
JWT_SECRET="strong-secret-256-bit"
```

### Con Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Checklist Pre-Deploy
- [ ] Cambia JWT_SECRET
- [ ] Configura database produzione
- [ ] Setup Redis produzione
- [ ] Configura Stripe produzione keys
- [ ] Setup email provider
- [ ] Configura SSL/HTTPS
- [ ] Setup backup database
- [ ] Configura monitoring

---

## 📊 Monitoring e Logs

### Logs
```bash
# Backend logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Docker logs
docker-compose logs -f backend
```

### Health Check
```bash
curl http://localhost:5000/health
```

---

## 🤝 Contribuire

1. Fork il progetto
2. Crea branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

---

## 📝 License

MIT License - vedi [LICENSE](LICENSE) file

---

## 📞 Supporto

- 📧 Email: support@sportbook.com
- 📚 Documentazione: [docs.sportbook.com](https://docs.sportbook.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/sportbook-saas/issues)

---

## 🙏 Credits

Sviluppato con ❤️ usando:
- Node.js + Express
- PostgreSQL + Prisma ORM
- Redis
- Stripe
- React + Material-UI

---

**Made with ❤️ for Sports Management**
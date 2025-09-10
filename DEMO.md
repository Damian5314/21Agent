# 21Agent Demo Guide

Deze demo toont een AI-agent die medewerkers ondersteunt bij repeterende taken in het 21QUBZ-platform.

## 🚀 Quick Start

1. **Setup uitvoeren:**
   ```bash
   ./setup.sh
   ```

2. **API Key configureren:**
   - Open `backend/.env`
   - Voeg je Google Gemini API key toe:
     ```
     GOOGLE_AI_API_KEY=your_api_key_here
     ```

3. **Applicatie starten:**
   ```bash
   npm run dev
   ```

4. **Dashboard openen:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/health

## 🎯 Demo Scenario's

### Scenario 1: Verlopen Contracten Opschonen
**Instructie:** "Verwijder alle ingeplande ledigingen bij contracten die al verlopen zijn"

**Verwacht gedrag:**
- Agent analyseert de instructie met AI
- Opent browser en navigeert naar 21QUBZ testomgeving
- Voert systematisch de benodigde acties uit
- Geeft live feedback over voortgang

### Scenario 2: Dubbele Entries Detecteren
**Instructie:** "Zoek naar dubbele entries in het systeem en markeer deze voor review"

**Verwacht gedrag:**
- Agent scant database voor duplicaten
- Markeert verdachte entries
- Genereert rapport voor medewerker review

### Scenario 3: Factuur Controle
**Instructie:** "Controleer alle openstaande facturen ouder dan 30 dagen"

**Verwacht gedrag:**
- Agent filtert facturen op datum
- Controleert status en betalingen
- Genereert overzicht voor follow-up

## 🔧 Dashboard Functionaliteiten

### Agent Besturing
- **Start Agent:** Begin een nieuwe taak met instructies
- **Pauzeren/Hervatten:** Onderbreek of hervat de agent
- **Stoppen:** Stop de huidige taak volledig
- **Snelle Acties:** Voorgedefinieerde instructies

### Live Monitoring
- **Real-time Status:** Zie wat de agent momenteel doet
- **Stappen Weergave:** Volg de voortgang stap voor stap
- **Pauzeer Modus:** Visual feedback wanneer gepauzeerd

### Logs & Historie
- **Real-time Logs:** Alle agent acties worden gelogd
- **Filter Opties:** Filter op log niveau (info, warning, error)
- **Export Functie:** Download logs voor analyse
- **Auto-cleanup:** Houdt alleen laatste 100 logs

## 🔌 WebSocket Events

De frontend communiceert real-time met de backend via WebSocket:

### Client → Server
- `agent:start` - Start agent met instructies
- `agent:stop` - Stop huidige taak
- `agent:pause` - Pauzeer/hervat agent

### Server → Client
- `agent:status` - Status updates (idle/running/paused)
- `agent:log` - Nieuwe log entries
- `agent:step` - Huidige stap informatie

## 🧪 Testing

### Backend API Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Agent status
curl http://localhost:3001/api/agent/status

# Start agent
curl -X POST http://localhost:3001/api/agent/start \
  -H "Content-Type: application/json" \
  -d '{"instructions": "Test instructie"}'
```

### Browser Testing
1. Open meerdere browser tabs naar localhost:3000
2. Start een taak in één tab
3. Zie real-time updates in alle tabs

## 📋 Project Structuur

```
21Agent/
├── frontend/                # Next.js React app
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks (WebSocket)
│   └── types/             # TypeScript definitions
├── backend/               # Express.js API
│   ├── routes/           # API routes
│   ├── services/         # Business logic (AgentService)
│   └── server.js         # Main server file
└── shared/               # Shared types/utilities
```

## 🔍 Technische Details

### AI Integration
- **Google Gemini API** voor instructie analyse
- **Playwright** voor browserautomatisering
- **Structured prompts** voor consistente resultaten

### Real-time Communication
- **Socket.io** voor bidirectionele communicatie
- **Event-driven** architectuur
- **Auto-reconnection** bij verbindingsproblemen

### Security & Safety
- **Testomgeving only** - geen productie data risico
- **Human oversight** - agent kan gestopt/gepauzeerd worden
- **Audit trail** - alle acties worden gelogd

## 🚨 Troubleshooting

### Agent start niet
- Controleer of Google API key correct is ingesteld
- Verificeer dat backend draait op poort 3001

### WebSocket verbinding mislukt
- Controleer of backend draait
- Refresh de frontend pagina

### Browser automatisering problemen
- Playwright installeert automatisch browsers
- Bij problemen: `cd backend && npx playwright install`

## 📈 Mogelijke Uitbreidingen

- **Meerdere agents tegelijk**
- **Task scheduling & queuing**
- **Advanced AI modellen**
- **Integratie met echte 21QUBZ API**
- **Gebruikers authenticatie**
- **Workflow templates**
- **Performance monitoring**
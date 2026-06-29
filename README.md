# KARTGP — Campionato di Kart Amatoriale

![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat&logo=react&logoColor=white)
![Made with TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Made with Vite](https://img.shields.io/badge/Made%20with-Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Made with Tailwind CSS](https://img.shields.io/badge/Made%20with-Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Made with Firebase](https://img.shields.io/badge/Made%20with-Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![Made with React Router](https://img.shields.io/badge/Made%20with-React%20Router-CA4245?style=flat&logo=reactrouter&logoColor=white)
![Made with Recharts](https://img.shields.io/badge/Made%20with-Recharts-22B5BF?style=flat&logo=chartdotjs&logoColor=white)
![Made with Lucide](https://img.shields.io/badge/Made%20with-Lucide%20React-F97316?style=flat)

---

Applicazione web full-stack per la gestione completa di un campionato di kart amatoriale. Permette di seguire la classifica in tempo reale, consultare i risultati di ogni gara, visualizzare le statistiche dei piloti e gestire tutti i dati tramite un'area amministrativa protetta da autenticazione.

---

## Indice

- [Tech Stack](#tech-stack)
- [Struttura del Progetto](#struttura-del-progetto)
- [Modello Dati](#modello-dati-firestore)
- [Algoritmo di Classifica](#algoritmo-di-classifica)
- [Pagine Pubbliche](#pagine-pubbliche)
- [Area Admin](#area-admin)
- [Design System](#design-system)
- [Security Rules](#security-rules-firestore)
- [Avvio Rapido](#avvio-rapido)
- [Configurazione Firebase](#configurazione-firebase)

---

## Tech Stack

| Tecnologia | Versione | Ruolo nel progetto |
|-----------|----------|--------------------|
| **React** | 19 | Libreria UI component-based, gestione dello stato e rendering |
| **TypeScript** | 5 | Type safety completo su tutto il codebase |
| **Vite** | 8 | Dev server con HMR istantaneo e build ottimizzata |
| **Tailwind CSS** | v4 | Utility-first CSS con design system custom tramite `@theme` |
| **Firebase Firestore** | v11 | Database NoSQL real-time su cloud, listener in tempo reale |
| **Firebase Auth** | v11 | Autenticazione Email/Password per l'area admin |
| **React Router DOM** | v7 | Routing SPA client-side con layout annidati |
| **Recharts** | v2 | Grafici LineChart per sparkline e andamento punti pilota |
| **Lucide React** | latest | Libreria icone SVG leggere e consistenti |

---

## Struttura del Progetto

```
KART/
├── index.html                  # Entry point HTML con meta SEO e Open Graph
├── vite.config.ts              # Configurazione Vite + plugin Tailwind + alias @/
├── tsconfig.app.json           # Configurazione TypeScript
├── .env.example                # Template variabili d'ambiente da copiare
├── .env.local                  # Credenziali Firebase reali (NON committare)
├── firestore.rules             # Security rules Firestore con validazione campi
└── src/
    ├── main.tsx                # Punto di ingresso React
    ├── App.tsx                 # Router + AuthProvider + Layout + ErrorBoundary
    ├── index.css               # Design system globale (font, variabili, utility CSS)
    │
    ├── types/
    │   └── index.ts            # Tutte le interfacce TypeScript (Driver, Event, Result, ecc.)
    │
    ├── firebase/
    │   └── firebase.ts         # Inizializzazione Firebase (resiliente: non crasha senza .env)
    │
    ├── lib/
    │   └── scoring.ts          # Funzione pura di calcolo classifica (nessuna dipendenza esterna)
    │
    ├── contexts/
    │   └── AuthContext.tsx     # Context React per lo stato di autenticazione globale
    │
    ├── hooks/
    │   ├── useDrivers.ts       # Listener real-time Firestore per la collezione drivers
    │   ├── useEvents.ts        # Listener real-time Firestore per la collezione events
    │   ├── useResults.ts       # Listener real-time Firestore per la collezione results
    │   └── useStandings.ts     # Calcolo classifica memoizzato (useMemo su scoring.ts)
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Navbar.tsx           # Barra di navigazione sticky con hamburger mobile
    │   │   ├── CountdownTimer.tsx   # Conto alla rovescia live aggiornato ogni secondo
    │   │   ├── HeroSection.tsx      # Hero fullscreen con griglia racing e info prossima gara
    │   │   ├── TopThreeCards.tsx    # Card podio con avatar, punti e sparkline Recharts
    │   │   ├── StandingsTable.tsx   # Tabella classifica (modalità compatta o completa)
    │   │   ├── DriverModal.tsx      # Modale scheda pilota con statistiche e grafico punti
    │   │   └── RaceHistoryCard.tsx  # Card collassabile con i risultati di Gara 1 e Gara 2
    │   └── admin/
    │       ├── AdminLogin.tsx       # Form di login con gestione errori Firebase localizzata
    │       ├── AdminDashboard.tsx   # Dashboard con tab Appuntamenti e Piloti
    │       ├── EventForm.tsx        # Form CRUD per la creazione e modifica degli appuntamenti
    │       ├── RaceResultForm.tsx   # Form inserimento risultati gara con preview punti live
    │       └── DriverForm.tsx       # Form CRUD per la gestione dei piloti con avatar preview
    │
    └── pages/
        ├── HomePage.tsx         # Hero + Podio Top 3 + Preview classifica
        ├── StandingsPage.tsx    # Classifica completa con spiegazione regole
        ├── RacesPage.tsx        # Storico di tutti gli appuntamenti e relative gare
        ├── DriversPage.tsx      # Griglia con tutti i piloti iscritti
        └── AdminPage.tsx        # Guard di autenticazione → redirect a login o dashboard
```

---

## Modello Dati (Firestore)

Il database è strutturato su tre collezioni principali, collegate tramite ID documento.

### Collezione `drivers`
Contiene i piloti iscritti al campionato.

```typescript
{
  id: string            // Auto-generato da Firestore
  name: string          // Nome e cognome del pilota
  kartNumber: number    // Numero di gara (1–99)
  photoUrl: string      // URL immagine profilo (opzionale)
  team?: string         // Nome del team o club (opzionale)
}
```

### Collezione `events`
Contiene gli appuntamenti del calendario.

```typescript
{
  id: string            // Auto-generato da Firestore
  name: string          // Nome dell'appuntamento (es. "Round 1 — Parma")
  date: string          // Data in formato ISO (es. "2025-09-14")
  circuitName: string   // Nome del circuito
  trackLength: number   // Lunghezza della pista in metri
  weather: 'sunny' | 'cloudy' | 'rain' | 'wet'   // Condizioni meteo
  imageUrl?: string     // URL immagine circuito (opzionale)
}
```

### Collezione `results`
Contiene i risultati di ogni singola gara. Ogni documento rappresenta il risultato di un pilota in una specifica gara di uno specifico appuntamento.

```typescript
{
  id: string              // Auto-generato da Firestore
  eventId: string         // ID dell'evento di riferimento
  raceNumber: 1 | 2       // Indica se è Gara 1 o Gara 2
  driverId: string        // ID del pilota di riferimento
  position: number        // Posizione finale (0 = DNF / non classificato)
  hasPole: boolean        // Il pilota ha ottenuto la pole position (+2pt)
  hasBestLap: boolean     // Il pilota ha fatto il giro più veloce (+2pt)
  hasConsistency: boolean // Il pilota è stato il più costante (+2pt)
  penaltyPoints: number   // Punti di penalità da sottrarre (0 se nessuna)
}
```

---

## Algoritmo di Classifica

Il calcolo della classifica è interamente contenuto nel file `src/lib/scoring.ts` ed è implementato come una **funzione pura**: riceve tre array come input e restituisce la classifica ordinata senza effetti collaterali, senza dipendenze da Firebase o React. Questo lo rende testabile in isolamento e facilmente riusabile.

```typescript
function calculateStandings(
  drivers: Driver[],
  events: Event[],
  results: RaceResult[]
): StandingsEntry[]
```

### Tabella Punti per Posizione

| 1° | 2° | 3° | 4° | 5° | 6° | 7° | 8° | 9° | 10° | 11°–15° |
|----|----|----|----|----|----|----|----|----|-----|---------|
| 20 | 17 | 15 | 13 | 11 |  9 |  7 |  5 |  3 |   1 |    0    |

### Bonus Assegnabili per Gara

| Tipo di Bonus | Punti | Regola |
|--------------|-------|--------|
| Partecipazione | +5 | Assegnato a tutti i piloti presenti **eccetto Max Verstappen** |
| Pole Position | +2 | Solo 1 pilota per gara. Corrisponde al miglior tempo in qualifica |
| Giro Veloce | +2 | Solo 1 pilota per gara. Il giro singolo più rapido della corsa |
| Costanza | +2 | Solo 1 pilota per gara. I tempi sul giro più regolari |
| Penalità | -N | Sottrazione diretta configurabile dall'admin per infrazioni |

### Regola Verstappen
Max Verstappen **non riceve il bonus partecipazione (+5 punti)** per rendere il campionato più equilibrato e competitivo. Questa regola è applicata hardcoded sul nome del pilota ed è visibile nel form di inserimento risultati con un avviso dedicato.

### Regola dello Scarto
Per ogni appuntamento in cui sono state disputate entrambe le gare, il sistema scarta automaticamente il risultato peggiore tra Gara 1 e Gara 2 (inclusi i relativi bonus e penalità). Solo il risultato migliore viene conteggiato nel totale del campionato.

```
Punteggio Gara 1  =  punti posizione + bonus - penalità
Punteggio Gara 2  =  punti posizione + bonus - penalità
Punti Evento      =  max(Gara 1, Gara 2)   ← il risultato peggiore viene scartato

Punti Campionato  =  somma dei Punti Evento di tutti gli appuntamenti
```

La gara scartata è indicata con un asterisco `*` nella tabella classifica e con la riga barrata nel dettaglio della scheda pilota.

---

## Pagine Pubbliche

### Homepage
La pagina principale è composta da tre sezioni:

- **Hero Section**: occupa l'intera altezza dello schermo con uno sfondo a griglia racing animato. Mostra il nome del prossimo appuntamento, la data, il circuito, la lunghezza della pista, il meteo atteso e un conto alla rovescia live che si aggiorna ogni secondo. Quando l'evento è passato, il countdown mostra "GARA IN CORSO".
- **Podio Top 3**: tre card affiancate che mostrano i primi tre classificati nel campionato. Ogni card include avatar del pilota, numero kart, punti totali, vittorie, pole position e una sparkline (mini grafico a linea) che mostra l'andamento dei punti nelle gare precedenti. Le card sono ordinate 2°–1°–3° seguendo lo stile del podio reale, con quella del primo classificato leggermente sollevata.
- **Preview Classifica**: tabella con i primi 8 piloti e link alla pagina classifica completa.

### Pagina Classifica
Mostra la classifica generale completa del campionato con tutti i piloti. Include una sezione informativa che spiega la regola dello scarto e la regola Verstappen. La tabella riporta per ogni pilota: posizione, avatar, numero kart, vittorie, pole, giri veloci, punti ottenuti in ciascun appuntamento (con indicazione degli scarti) e il totale finale. Cliccando su qualsiasi riga si apre la scheda dettaglio del pilota.

### Scheda Pilota (Modale)
Si apre cliccando su un pilota dalla classifica, dal podio o dalla pagina piloti. Contiene:
- Informazioni anagrafiche: avatar, nome, team, numero kart e posizione in campionato
- Quattro box statistici: vittorie, podi, pole position, giri veloci e ritiri
- Grafico linea (Recharts LineChart) che mostra l'andamento dei punti appuntamento per appuntamento
- Tabella dettaglio per ogni evento con i punti di Gara 1 e Gara 2, indicando quale gara è stata scartata con la riga barrata

### Pagina Storico Gare
Mostra tutti gli appuntamenti del calendario divisi in due sezioni: prossimi eventi e gare già disputate. Ogni appuntamento è rappresentato da una card collassabile che mostra il nome, la data e il circuito. Espandendola si vedono affiancati i risultati completi di Gara 1 e Gara 2 con le posizioni di ogni pilota, le icone dei bonus ottenuti (pole, giro veloce, costanza) e le eventuali penalità.

### Pagina Piloti
Griglia di card per tutti i piloti iscritti al campionato. Ogni card mostra avatar, nome, numero kart, posizione attuale in classifica e punti totali. I piloti in top 3 hanno un badge con la medaglia corrispondente. Cliccando su una card si apre la scheda dettaglio del pilota.

---

## Area Admin

Accessibile all'indirizzo `/admin`. Se l'utente non è autenticato viene reindirizzato automaticamente al form di login. Dopo l'autenticazione riuscita si accede alla dashboard di gestione.

### Login
Form con campo email e password, toggle per mostrare/nascondere la password e messaggi di errore localizzati in italiano per i principali codici di errore Firebase (credenziali errate, troppi tentativi, ecc.).

### Dashboard — Tab Appuntamenti
Mostra tutti gli appuntamenti con data, nome e circuito. Ogni card indica visivamente se i risultati di Gara 1 e Gara 2 sono già stati inseriti. Sono disponibili tre azioni per ogni appuntamento:
- **Gara 1 / Gara 2**: apre il form di inserimento risultati per quella specifica gara
- **Modifica**: apre il form per aggiornare i dati dell'appuntamento (nome, data, circuito, meteo, ecc.)

Il pulsante "Nuovo Appuntamento" permette di creare un nuovo evento nel calendario.

### Dashboard — Tab Piloti
Griglia di tutti i piloti registrati. Cliccando su un pilota si apre il form di modifica. Il pulsante "Nuovo Pilota" permette di aggiungere un nuovo pilota al campionato. Durante la compilazione del form è visibile un'anteprima dell'avatar del pilota (URL personalizzato o avatar generato automaticamente dalle iniziali).

### Form Inserimento Risultati Gara
Tabella con una riga per ogni pilota. Per ciascuno è possibile:
- Selezionare la posizione finale (dal 1° al 15° posto oppure DNF)
- Spuntare i checkbox per pole position, giro veloce e costanza
- Inserire eventuali punti di penalità

Il sistema valida che non ci siano posizioni duplicate e che ogni bonus venga assegnato a un solo pilota. La colonna "Totale" mostra in tempo reale i punti che verrebbero assegnati al pilota applicando già la regola Verstappen. Il salvataggio è atomico: i risultati precedenti vengono eliminati e sostituiti integralmente dai nuovi.

---

## Design System

Il tema grafico è definito interamente in `src/index.css` tramite la direttiva `@theme` di Tailwind CSS v4, che permette di definire variabili CSS custom disponibili come utility classes.

### Palette colori

| Ruolo | Colore | Hex |
|-------|--------|-----|
| Background principale | Quasi nero | `#09090b` |
| Background card | Grigio scuro sfumato | `#141414` |
| Accento primario | Verde lime / Neon | `#a3e635` |
| Accento pericolo | Rosso corsa | `#ef4444` |
| Primo posto | Oro | `#fbbf24` |
| Secondo posto | Argento | `#a1a1aa` |
| Terzo posto | Bronzo | `#b45309` |

### Font
- **Rajdhani** (Google Fonts, pesi 400–700): usato per tutti i titoli, numeri, badge e label. Il carattere è squadrato e tecnologico, ispirato all'estetica dei display digitali sportivi.
- **Inter** (Google Fonts): usato per il corpo del testo e i paragrafi, garantisce massima leggibilità anche su schermi piccoli.

### Effetti e animazioni
- **Hover card**: `translateY(-2px)` con transizione 300ms e bordo che diventa verde lime
- **Glow neon**: `box-shadow` con colore lime o rosso per elementi in evidenza e al passaggio del mouse
- **Conto alla rovescia**: digit con sfondo scuro e numero lime, aggiornato ogni secondo tramite `setInterval`
- **Loading spinner**: bordo circolare animato con colore lime

---

## Security Rules Firestore

Le regole di sicurezza in `firestore.rules` seguono il principio del minimo privilegio. I dati pubblici del campionato sono leggibili da chiunque (necessario per mostrare la classifica senza login), mentre qualsiasi operazione di scrittura richiede un utente Firebase autenticato.

| Collezione | Lettura pubblica | Scrittura |
|-----------|-----------------|-----------|
| `drivers` | Sì | Solo utente autenticato |
| `events`  | Sì | Solo utente autenticato |
| `results` | Sì | Solo utente autenticato |

Ogni operazione di scrittura viene validata a livello di regole: tipi dei campi, lunghezza delle stringhe, range dei valori numerici (es. `kartNumber` da 1 a 99, `position` da 0 a 15), valori enum consentiti per il campo `weather` e presenza dei campi obbligatori.

> Prima del lancio in produzione con un numero elevato di utenti admin, si consiglia di implementare **Firebase Custom Claims** per blindare ulteriormente i permessi di scrittura solo a specifici UID autorizzati, indipendentemente dall'autenticazione.

---

## Avvio Rapido

```bash
# 1. Installa le dipendenze
npm install

# 2. Crea il file di configurazione Firebase
cp .env.example .env.local
# Apri .env.local con un editor e incolla le credenziali del tuo progetto Firebase

# 3. Avvia il server di sviluppo
npm run dev
# L'applicazione sarà disponibile su http://localhost:5173

# 4. Build per la produzione
npm run build

# 5. Anteprima della build di produzione
npm run preview
```

> Se il file `.env.local` non è presente, l'applicazione si avvia comunque mostrando un banner giallo in basso con le istruzioni per la configurazione. Non ci saranno crash o schermata nera.

---

## Configurazione Firebase

1. Accedi alla [Firebase Console](https://console.firebase.google.com) e crea un nuovo progetto
2. Nella sezione **Firestore Database**, crea un database in modalità produzione
3. Nella sezione **Authentication**, abilita il provider **Email/Password**
4. Crea manualmente l'utente amministratore tramite la console di Authentication
5. Registra una nuova **Web App** nel progetto e copia le credenziali nel file `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

6. Deploya le security rules su Firestore:

```bash
npx -y firebase-tools@latest login
npx -y firebase-tools@latest use <il-tuo-project-id>
npx -y firebase-tools@latest deploy --only firestore:rules
```

---

> **Nota**: il file `.env.local` contiene le chiavi private del progetto Firebase e non deve mai essere committato su Git. È già incluso nel `.gitignore` generato da Vite.

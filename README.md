# Thermostat-IoT Dashboard

Dashboard web per il monitoraggio in tempo reale di un termostato IoT basato su ESP32, con dati salvati su Firebase Realtime Database.

---

## Requisiti

- [Node.js](https://nodejs.org) versione 18 o superiore
- Un browser moderno (Chrome, Firefox, Safari, Edge)

---

## Avvio in locale

### 1. Installa Node.js
Scarica e installa Node.js da: https://nodejs.org  
Scegli la versione **LTS** (quella consigliata).

### 2. Apri il terminale nella cartella del progetto
- **Windows**: apri la cartella `thermostat-app`, clicca sulla barra degli indirizzi, scrivi `cmd` e premi Invio
- **Mac**: tasto destro sulla cartella → "Nuovo terminale nella cartella"

### 3. Installa le dipendenze
```bash
npm install
```
Questo comando scarica tutti i pacchetti necessari (circa 1 minuto, solo la prima volta).

### 4. Crea il file con le credenziali Firebase
Nella cartella del progetto crea un file chiamato `.env` e incolla questo contenuto con le tue credenziali:

```
VITE_FIREBASE_API_KEY=la_tua_api_key
VITE_FIREBASE_AUTH_DOMAIN=il_tuo_progetto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://il_tuo_progetto-default-rtdb.europe-west1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=il_tuo_project_id
VITE_FIREBASE_STORAGE_BUCKET=il_tuo_progetto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=il_tuo_sender_id
VITE_FIREBASE_APP_ID=il_tuo_app_id
```

> Se non hai il file `.env` il sito funziona comunque in **modalità demo** con dati simulati.

### 5. Avvia il sito
```bash
npm run dev
```

Apri il browser su: **http://localhost:5173**

---

## Struttura delle pagine

| Pagina | Descrizione |
|---|---|
| **Dashboard** | Temperatura e umidità in tempo reale |
| **Storico** | Grafici delle ultime 24 ore |
| **Impostazioni** | Temperatura target e info app |
| **Stato** | Diagnostica connessione Firebase |

---

## Build per la produzione (deploy su Render)

```bash
npm run build
```

Genera la cartella `dist/` pronta per essere caricata su qualsiasi hosting statico.

---

## Aggiornamento Meteo Automatico (GitHub Actions)

Il progetto include uno script (`meteo-firebase/fetch_data.js`) che scarica il meteo di Bari (via open-meteo) e lo salva su Firestore.
È stato configurato un workflow GitHub Actions (`.github/workflows/meteo-cron.yml`) che esegue questo script **automaticamente ogni ora**, in modo totalmente gratuito.

**Per farlo funzionare su GitHub:**
1. Vai nel tuo repository su GitHub.
2. Clicca su **Settings** > **Secrets and variables** > **Actions**.
3. Clicca su **New repository secret**.
4. Nome: `FIREBASE_SERVICE_ACCOUNT`
5. Valore: Incolla l'intero contenuto del tuo file `serviceAccountKey.json`.
6. Clicca **Add secret**.


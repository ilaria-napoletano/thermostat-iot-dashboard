# ThermoIoT Dashboard

Dashboard web per il monitoraggio in tempo reale di un termostato IoT basato su ESP8266, con dati salvati su Firebase Realtime Database.

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

## Note

- Il file `.env` contiene le credenziali Firebase e **non va mai condiviso o caricato su GitHub**
- La cartella `node_modules` è pesante (~300 MB) e non va copiata: si rigenera con `npm install`

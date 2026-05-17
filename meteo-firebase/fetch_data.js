const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// L'API originale con i dati delle 24 ore
const API_URL = "https://api.open-meteo.com/v1/forecast?latitude=41.1171&longitude=16.8719&hourly=temperature_2m,relative_humidity_2m&timezone=auto&forecast_days=1";

async function updateThermostatData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    // 1. Troviamo l'ora attuale formattata a due cifre (es. "23")
    const currentHour = new Date().getHours().toString().padStart(2, '0');
    
    // 2. Creiamo il suffisso che l'API usa per le ore (es. "T23:00")
    const targetSuffix = `T${currentHour}:00`;

    // 3. Cerchiamo in quale posizione dell'array si trova l'ora attuale
    const currentIndex = data.hourly.time.findIndex(timeStr => timeStr.endsWith(targetSuffix));

    if (currentIndex === -1) {
        throw new Error("Orario non trovato nell'array delle 24 ore.");
    }

    // 4. Estraiamo i dati specifici di quest'ora per il display principale
    const currentTemp = data.hourly.temperature_2m[currentIndex];
    const currentHumidity = data.hourly.relative_humidity_2m[currentIndex];
    const stringaOrarioApi = data.hourly.time[currentIndex]; // es. "2026-05-17T23:00"

    // 5. Scriviamo su Firebase SIA i dati correnti SIA tutto lo storico delle 24h
    await db.collection('thermostat_data').doc('current_state').set({
      // Dati per il display istantaneo del termostato
      current_temperature: currentTemp,
      current_humidity: currentHumidity,
      
      // L'intero storico delle 24 ore (utile per la UX dei grafici nella PWA)
      history_24h: {
          times: data.hourly.time,
          temperatures: data.hourly.temperature_2m,
          humidities: data.hourly.relative_humidity_2m
      },
      
      last_update: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 6. Formattazione elegante per la stampa in console
    const [dataPart, timePart] = stringaOrarioApi.split('T');
    const [anno, mese, giorno] = dataPart.split('-');
    
    console.log(`Data Rilevazione: ${giorno}/${mese}/${anno}`);
    console.log(`Ora  Rilevazione: ${timePart}`);
    console.log(`Temperatura:     ${currentTemp}°C`);
    console.log(`Umidità:         ${currentHumidity}%`);

  } catch (error) {
    console.error("❌ Errore di connessione API:", error);
  }
}

updateThermostatData();
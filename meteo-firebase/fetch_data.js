const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// L'API aggiornata per richiedere solo il valore attuale
const API_URL = "https://api.open-meteo.com/v1/forecast?latitude=41.1171&longitude=16.8719&current=temperature_2m,relative_humidity_2m&timezone=auto";

async function updateThermostatData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    // Estraiamo i dati correnti
    const currentTemp = data.current.temperature_2m;
    const currentHumidity = data.current.relative_humidity_2m;
    const stringaOrarioApi = data.current.time;

    // Scriviamo su Firebase SOLO i dati correnti
    await db.collection('thermostat_data').doc('current_state').set({
      // Dati per il display istantaneo del termostato
      current_temperature: currentTemp,
      current_humidity: currentHumidity,
      
      // Rimuoviamo il campo history_24h visto che non serve più
      history_24h: admin.firestore.FieldValue.delete(),
      
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
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// API meteo con temperatura, umidità, velocità del vento e codice meteo
const API_URL = "https://api.open-meteo.com/v1/forecast?latitude=41.1171&longitude=16.8719&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto";

function getWeatherStatus(code) {
  if (code >= 0 && code <= 1) return { text: "Soleggiato", icon: "☀️" };
  if (code >= 2 && code <= 3) return { text: "Nuvoloso", icon: "☁️" };
  if (code === 45 || code === 48) return { text: "Nebbia", icon: "🌫️" };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { text: "Piovoso", icon: "🌧️" };
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { text: "Nevoso", icon: "❄️" };
  if (code >= 95 && code <= 99) return { text: "Temporale", icon: "⛈️" };
  return { text: "Variabile", icon: "⛅" };
}

async function updateThermostatData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    // Estraiamo i dati correnti
    const currentTemp = data.current.temperature_2m;
    const currentHumidity = data.current.relative_humidity_2m;
    const windSpeed = data.current.wind_speed_10m;
    const weatherCode = data.current.weather_code;
    const stringaOrarioApi = data.current.time;

    const weatherState = getWeatherStatus(weatherCode);

    // Scriviamo su Firebase i dati correnti del meteo integrati
    await db.collection('thermostat_data').doc('current_state').set({
      current_temperature: currentTemp,
      current_humidity: currentHumidity,
      wind_speed: windSpeed,
      meteo_status_text: weatherState.text,
      meteo_status_icon: weatherState.icon,
      
      // Rimuoviamo il campo history_24h obsoleto
      history_24h: admin.firestore.FieldValue.delete(),
      last_update: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    const [dataPart, timePart] = stringaOrarioApi.split('T');
    const [anno, mese, giorno] = dataPart.split('-');
    
    console.log(`Data Rilevazione: ${giorno}/${mese}/${anno}`);
    console.log(`Ora  Rilevazione: ${timePart}`);
    console.log(`Temperatura:     ${currentTemp}°C`);
    console.log(`Umidità:         ${currentHumidity}%`);
    console.log(`Vento:           ${windSpeed} km/h`);
    console.log(`Meteo:           ${weatherState.text} ${weatherState.icon}`);

  } catch (error) {
    console.error("❌ Errore di connessione API:", error);
  }
}

updateThermostatData();

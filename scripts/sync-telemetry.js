import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

// Parse the service account JSON injected by GitHub Actions
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const rtdb = getDatabase();
const firestore = getFirestore();

async function syncData() {
  try {
    console.log('Fetching telemetry from RTDB (termostato/status)...');
    const snapshot = await rtdb.ref('termostato/status').once('value');
    const status = snapshot.val();

    if (!status) {
      console.log('No status data found in RTDB. Skipping.');
      process.exit(0);
    }

    const temp = status.temp !== undefined ? status.temp : null;
    const hum = status.hum !== undefined ? status.hum : null;
    // Ensure timestamp is a valid number, otherwise fallback to current time
    const parsedTime = Number(status.time);
    const timeInMillis = (parsedTime > 0 && parsedTime < 1e11) ? parsedTime * 1000 : parsedTime;
    const validTimestamp = (!isNaN(timeInMillis) && timeInMillis > 0) ? timeInMillis : Date.now();

    const telemetryData = {
      temperature: temp,
      humidity: hum,
      timestamp: Timestamp.fromMillis(validTimestamp),
      syncedAt: FieldValue.serverTimestamp()
    };

    console.log('Data to sync:', { temperature: temp, humidity: hum });
    console.log('Writing to Firestore collection "storico_termostato"...');
    
    await firestore.collection('storico_termostato').add(telemetryData);
    
    console.log('Sync completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing telemetry:', error);
    process.exit(1);
  }
}

syncData();

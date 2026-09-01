#!/usr/bin/env node
/*
 * scripts/grant-admin.js
 *
 * Grants (or revokes) BitNova admin access for a given Firebase Auth user
 * by writing to the `admins/{uid}` node in the Realtime Database, using
 * the Firebase Admin SDK. This bypasses the client-side security rules
 * (which correctly disallow users from writing to `admins/{uid}` themselves).
 *
 * SETUP
 * 1. Install dependencies:
 *      npm install firebase-admin
 *
 * 2. Generate a service account key for your Firebase project:
 *      Firebase console -> Project settings -> Service accounts
 *      -> "Generate new private key"
 *    Save the downloaded JSON file somewhere OUTSIDE this repo
 *    (never commit service account keys to source control).
 *
 * 3. Set an environment variable pointing to that file:
 *      export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
 *
 * 4. Set your Realtime Database URL (from firebase-config.js, `databaseURL`),
 *    e.g.:
 *      export FIREBASE_DATABASE_URL="https://<project-id>-default-rtdb.firebaseio.com"
 *
 * USAGE
 *   Find the target user's UID first:
 *     Firebase console -> Authentication -> Users -> copy the "User UID" column
 *
 *   Grant admin access:
 *     node scripts/grant-admin.js <uid>
 *
 *   Revoke admin access:
 *     node scripts/grant-admin.js <uid> --revoke
 *
 * This script never touches passwords, API keys or user balances — it only
 * writes a single boolean value at admins/{uid}.
 */

const admin = require('firebase-admin');

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const uid = args.find((a) => !a.startsWith('--'));
const revoke = args.includes('--revoke');

if (!uid) {
  fail(
    'Missing UID.\n\nUsage:\n' +
      '  node scripts/grant-admin.js <uid>            # grant admin access\n' +
      '  node scripts/grant-admin.js <uid> --revoke    # revoke admin access\n\n' +
      'Find a user\'s UID in the Firebase console under Authentication -> Users.'
  );
}

const databaseURL = process.env.FIREBASE_DATABASE_URL;
if (!databaseURL) {
  fail(
    'Missing FIREBASE_DATABASE_URL environment variable.\n' +
      'Set it to the databaseURL value from assets/firebase-config.js, e.g.\n' +
      '  export FIREBASE_DATABASE_URL="https://<project-id>-default-rtdb.firebaseio.com"'
  );
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  fail(
    'Missing GOOGLE_APPLICATION_CREDENTIALS environment variable.\n' +
      'Generate a service account key (Firebase console -> Project settings ->\n' +
      'Service accounts -> Generate new private key) and set:\n' +
      '  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"'
  );
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL,
});

async function main() {
  const db = admin.database();

  // Confirm the user actually exists before writing anything.
  try {
    await admin.auth().getUser(uid);
  } catch (err) {
    fail(`No Firebase Authentication user found with UID "${uid}": ${err.message}`);
  }

  const ref = db.ref(`admins/${uid}`);

  if (revoke) {
    await ref.remove();
    console.log(`\n✔ Revoked admin access for UID: ${uid}\n`);
  } else {
    await ref.set(true);
    console.log(
      `\n✔ Granted admin access for UID: ${uid}\n` +
        'This account can now use "Admin login" on the BitNova login page.\n'
    );
  }

  process.exit(0);
}

main().catch((err) => fail(err.message));

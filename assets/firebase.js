/*
 * BitNova Firebase bootstrap.
 *
 * Loaded after the Firebase compat SDK <script> tags and firebase-config.js
 * on every page. Exposes `window.BN` with auth + Realtime Database helpers
 * used by assets/app.js and each page's inline script.
 *
 * This app performs NO real financial transactions. All balances, trades,
 * deposits and withdrawals are simulated values stored in your Firebase
 * Realtime Database — see the "Demo" notices throughout the UI.
 */
(function () {
  if (!window.firebase) {
    console.error('Firebase SDK not loaded. Include the compat scripts before firebase.js.');
    return;
  }

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.database();

  function genId(prefix) {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ts = Date.now().toString(36).toUpperCase().slice(-5);
    return `${prefix}-${ts}${rand}`;
  }

  function userRef(uid, path) {
    return db.ref(`users/${uid}` + (path ? '/' + path : ''));
  }

  function defaultUserRecord(name, email) {
    return {
      profile: {
        name: name || 'Trader',
        email: email || '',
        acctId: genId('BNU'),
        created: Date.now(),
        verified: true,
      },
      balance: {
        cash: 25480.0,
        totalDeposits: 0,
        totalWithdrawals: 0,
      },
      holdings: {},
      settings: { theme: 'dark', currency: 'USD', notifications: true, twoFA: false },
    };
  }

  async function ensureUserRecord(user) {
    const snap = await userRef(user.uid).once('value');
    if (!snap.exists()) {
      const name = user.displayName || (user.isAnonymous ? 'Demo Trader' : 'Trader');
      const email = user.email || (user.isAnonymous ? 'demo@bitnova.app' : '');
      await userRef(user.uid).set(defaultUserRecord(name, email));
    }
    return (await userRef(user.uid).once('value')).val();
  }

  async function isAdmin(uid) {
    const snap = await db.ref(`admins/${uid}`).once('value');
    return snap.val() === true;
  }

  function requireAuth(onReady) {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        if (!location.pathname.endsWith('index.html') && location.pathname !== '/') {
          location.href = 'index.html';
        }
        return;
      }
      onReady(user);
    });
  }

  window.BN = {
    auth,
    db,
    genId,
    userRef,
    defaultUserRecord,
    ensureUserRecord,
    isAdmin,
    requireAuth,
  };
})();

/*
 * BitNova Firebase bootstrap.
 *
 * Loaded after the Firebase compat SDK <script> tags and firebase-config.js
 * on every page. Exposes `window.BN` with auth + Realtime Database helpers
 * used by assets/app.js and each page's inline script.
 *
 * Balances, trades, deposits and withdrawals are stored as values in your
 * Firebase Realtime Database.
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

  const BN_ADDR_HEX = '0123456789abcdef';
  const BN_ADDR_BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const BN_ADDR_BASE36 = '0123456789abcdefghijklmnopqrstuvwxyz';
  function genRandChars(len, charset) {
    let out = '';
    for (let i = 0; i < len; i++) out += charset[Math.floor(Math.random() * charset.length)];
    return out;
  }
  // Generates a mock, plausible-looking wallet address for the given coin id.
  // These are NOT real deposit addresses - this is a demo app with no custody.
  function genAddress(coinId) {
    switch (coinId) {
      case 'BTC':
        return 'bc1q' + genRandChars(38, BN_ADDR_BASE36);
      case 'ETH':
      case 'BNB':
      case 'USDT':
        return '0x' + genRandChars(40, BN_ADDR_HEX);
      case 'SOL':
        return genRandChars(44, BN_ADDR_BASE58);
      case 'XRP':
        return 'r' + genRandChars(33, BN_ADDR_BASE58);
      case 'ADA':
        return 'addr1' + genRandChars(53, BN_ADDR_BASE36);
      case 'DOGE':
        return 'D' + genRandChars(33, BN_ADDR_BASE58);
      default:
        return genId(coinId || 'ADDR');
    }
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
      kycLevel: 0,
    };
  }

  async function ensureUserRecord(user) {
    const snap = await userRef(user.uid).once('value');
    if (!snap.exists()) {
      const name = user.displayName || (user.isAnonymous ? 'Guest Trader' : 'Trader');
      const email = user.email || (user.isAnonymous ? 'guest@bitnova.app' : '');
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
    genAddress,
    userRef,
    defaultUserRecord,
    ensureUserRecord,
    isAdmin,
    requireAuth,
  };
})();

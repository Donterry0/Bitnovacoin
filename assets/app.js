/*
 * BitNova shared front-end helpers (coins, formatting, nav, toasts, chart).
 * Used by every page alongside assets/firebase.js.
 */
const BN_COINS = [
  { id: 'BTC', name: 'Bitcoin', price: 64250.32, change24h: 2.34, color: '#f7931a' },
  { id: 'ETH', name: 'Ethereum', price: 3145.87, change24h: 1.12, color: '#627eea' },
  { id: 'SOL', name: 'Solana', price: 142.55, change24h: -3.48, color: '#14f195' },
  { id: 'BNB', name: 'BNB', price: 571.2, change24h: 0.87, color: '#f3ba2f' },
  { id: 'XRP', name: 'XRP', price: 0.5231, change24h: -1.76, color: '#23292f' },
  { id: 'ADA', name: 'Cardano', price: 0.4487, change24h: 4.21, color: '#0033ad' },
  { id: 'DOGE', name: 'Dogecoin', price: 0.1523, change24h: -0.62, color: '#c2a633' },
  { id: 'USDT', name: 'Tether', price: 1.0, change24h: 0.01, color: '#26a17b' },
];

const BN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: 'dashboard.html' },
  { id: 'markets', label: 'Markets', icon: '📈', href: 'markets.html' },
  { id: 'trade', label: 'Trade', icon: '⇄', href: 'trade.html' },
  { id: 'portfolio', label: 'Portfolio', icon: '💼', href: 'portfolio.html' },
  { id: 'transactions', label: 'Transactions', icon: '🧾', href: 'transactions.html' },
  { id: 'deposit', label: 'Deposit', icon: '⬇', href: 'deposit.html' },
  { id: 'withdraw', label: 'Withdraw', icon: '⬆', href: 'withdraw.html' },
  { id: 'profile', label: 'Profile', icon: '👤', href: 'profile.html' },
  { id: 'settings', label: 'Settings', icon: '⚙', href: 'settings.html' },
];

function bnFmtUSD(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function bnFmtQty(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('en-US', { maximumFractionDigits: 6 });
}
function bnFmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
function bnEscapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function bnEmptyRow(cols) {
  return `<tr><td colspan="${cols}" style="text-align:center;color:var(--text-faint);padding:24px;">No data yet</td></tr>`;
}

/* ---------------------------- Navigation shell ---------------------------- */
function bnBuildNav(activeView) {
  const sidebarNav = document.getElementById('sidebarNav');
  const bottomList = document.getElementById('bottomNavList');
  if (sidebarNav) {
    sidebarNav.innerHTML = BN_NAV_ITEMS.map(
      (n) => `<li class="nav-item${n.id === activeView ? ' active' : ''}" onclick="location.href='${n.href}'"><span class="ic">${n.icon}</span> ${n.label}</li>`
    ).join('');
  }
  if (bottomList) {
    bottomList.innerHTML = BN_NAV_ITEMS.map(
      (n) => `<li class="${n.id === activeView ? 'active' : ''}" onclick="location.href='${n.href}'"><span class="ic">${n.icon}</span>${n.label}</li>`
    ).join('');
  }
  const title = document.getElementById('viewTitle');
  if (title) {
    const item = BN_NAV_ITEMS.find((n) => n.id === activeView);
    title.textContent = item ? item.label : activeView.charAt(0).toUpperCase() + activeView.slice(1);
  }
}

function bnSetAvatarInitials(name) {
  const initials = (name || 'U').split(' ').map((s) => s[0]).join('').substring(0, 2).toUpperCase();
  const top = document.getElementById('topAvatar');
  if (top) top.textContent = initials;
}

function bnApplyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme || 'dark');
  localStorage.setItem('bitnova_theme', theme || 'dark');
}

/* ---------------------------- Toasts ---------------------------- */
function bnShowToast(title, body, isErr) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = 'toast' + (isErr ? ' err' : '');
  t.innerHTML = `<div class="t-title">${bnEscapeHtml(title)}</div><div>${bnEscapeHtml(body)}</div>`;
  wrap.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity .3s';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

/* ---------------------------- Notifications dropdown ---------------------------- */
function bnWireNotifications(uid) {
  const btn = document.getElementById('notifBtn');
  const dropdown = document.getElementById('notifDropdown');
  if (!btn || !dropdown) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const opening = !dropdown.classList.contains('open');
    dropdown.classList.toggle('open');
    if (opening) {
      BN.userRef(uid, 'notifications').once('value').then((snap) => {
        const updates = {};
        snap.forEach((child) => {
          if (!child.val().read) updates[child.key + '/read'] = true;
        });
        if (Object.keys(updates).length) BN.userRef(uid, 'notifications').update(updates);
      });
    }
  });
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) dropdown.classList.remove('open');
  });
  BN.userRef(uid, 'notifications').limitToLast(40).on('value', (snap) => {
    const list = [];
    snap.forEach((child) => list.unshift({ id: child.key, ...child.val() }));
    const unread = list.filter((n) => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread;
        badge.classList.remove('hidden');
      } else badge.classList.add('hidden');
    }
    const listEl = document.getElementById('notifList');
    if (listEl) {
      listEl.innerHTML = list.length
        ? list.map((n) => `<div class="notif-item"><div class="n-title">${bnEscapeHtml(n.title)}</div><div>${bnEscapeHtml(n.body)}</div><div class="n-time">${bnFmtDate(n.time)}</div></div>`).join('')
        : '<div class="notif-empty">No notifications yet</div>';
    }
  });
  const clearBtn = document.getElementById('notifClear');
  if (clearBtn) clearBtn.addEventListener('click', () => BN.userRef(uid, 'notifications').remove());
}

function bnPushNotification(uid, title, body, notificationsEnabled) {
  if (notificationsEnabled === false) return;
  BN.userRef(uid, 'notifications').push({ title, body, time: Date.now(), read: false });
}

/* ---------------------------- Price chart (canvas) ---------------------------- */
const BN_TIMEFRAMES = ['1H', '1D', '1W', '1M', '1Y'];
const bnChartSeeds = {};
function bnSeededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
function bnGenerateSeries(coin, timeframe) {
  const key = coin.id + timeframe;
  if (bnChartSeeds[key]) return bnChartSeeds[key];
  const points = 60;
  let seed = 0;
  for (let i = 0; i < coin.id.length; i++) seed += coin.id.charCodeAt(i) * (i + 1);
  seed += timeframe.length * 97;
  const rand = bnSeededRandom(seed + 1);
  const volatilityByTF = { '1H': 0.002, '1D': 0.01, '1W': 0.03, '1M': 0.08, '1Y': 0.25 };
  const vol = volatilityByTF[timeframe] || 0.02;
  let price = coin.price * (1 - vol / 2);
  const series = [];
  for (let i = 0; i < points; i++) {
    const drift = (rand() - 0.48) * vol * coin.price * 0.1;
    price = Math.max(price + drift, coin.price * 0.5);
    series.push(price);
  }
  series[series.length - 1] = coin.price;
  bnChartSeeds[key] = series;
  return series;
}
function bnHexToRgba(color, alpha) {
  color = color.trim();
  if (color.startsWith('#')) {
    const bigint = parseInt(color.slice(1), 16);
    const r = (bigint >> 16) & 255,
      g = (bigint >> 8) & 255,
      b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}
function bnRenderChart(canvas, coin, timeframe) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || 600,
    h = 260;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const series = bnGenerateSeries(coin, timeframe);
  const min = Math.min(...series),
    max = Math.max(...series);
  const pad = 16;
  const styles = getComputedStyle(document.documentElement);
  const up = series[series.length - 1] >= series[0];
  const lineColor = up ? styles.getPropertyValue('--green').trim() : styles.getPropertyValue('--red').trim();

  ctx.beginPath();
  series.forEach((p, i) => {
    const x = pad + (i / (series.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p - min) / (max - min || 1)) * (h - pad * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  const last = series.length - 1;
  const lastX = pad + (last / (series.length - 1)) * (w - pad * 2);
  ctx.lineTo(lastX, h - pad);
  ctx.lineTo(pad, h - pad);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, bnHexToRgba(lineColor, 0.28));
  grad.addColorStop(1, bnHexToRgba(lineColor, 0));
  ctx.fillStyle = grad;
  ctx.fill();
}

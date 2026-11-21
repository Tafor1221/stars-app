import { CONFIG } from './config.js';
import { inTelegram, initTelegram, getOwnUsername, haptic, sendOrder } from './telegram.js';
import { mountStickers } from './sticker.js';

const USERNAME_RE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;

const $ = (id) => document.getElementById(id);
const el = {
  balance: $('balance'),
  amount: $('amount'),
  price: $('price'),
  chips: $('chips'),
  username: $('username'),
  self: $('self'),
  submit: $('submit'),
  status: $('status'),
};

// ---------- Форматирование ----------
const formatNumber = (n) => n.toLocaleString('ru-RU');
const formatMoney = (n) => `${formatNumber(Math.round(n * 100) / 100)} ${CONFIG.currency}`;

// ---------- Чтение формы ----------
const readStars = () => parseInt(el.amount.value, 10) || 0;
const readUsername = () => el.username.value.trim();
const isStarsValid = (n) => n >= CONFIG.minStars && n <= CONFIG.maxStars;

// ---------- Отрисовка ----------
function showBalance() {
  // Баланс передаёт бот в ссылке: .../index.html?balance=1250
  const balance = Number(new URLSearchParams(location.search).get('balance')) || 0;
  el.balance.textContent = formatMoney(balance);
}

function showStatus(text = '', isError = false) {
  el.status.textContent = text;
  el.status.classList.toggle('status--error', isError);
}

function renderChips() {
  for (const amount of CONFIG.quickAmounts) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.dataset.value = amount;
    chip.textContent = formatNumber(amount);
    el.chips.append(chip);
  }
}

// Пересчитывает всё, что зависит от количества звёзд
function update() {
  const stars = readStars();
  const valid = isStarsValid(stars);
  const total = formatMoney(stars * CONFIG.pricePerStar);

  el.price.textContent = stars ? total : '';
  el.submit.disabled = !valid;
  el.submit.textContent = valid ? `Купить ${formatNumber(stars)} ⭐ · ${total}` : 'Введите количество';

  for (const chip of el.chips.children) {
    chip.classList.toggle('is-active', Number(chip.dataset.value) === stars);
  }

  const rangeError = stars && !valid;
  showStatus(rangeError ? `От ${formatNumber(CONFIG.minStars)} до ${formatNumber(CONFIG.maxStars)} ⭐` : '', true);
}

// ---------- Действия ----------
function onSelfClick() {
  const me = getOwnUsername();
  if (!me) {
    showStatus(inTelegram ? 'В вашем профиле Telegram не указан username' : 'Кнопка работает только внутри Telegram', true);
    return;
  }
  haptic();
  el.username.value = me;
  showStatus();
}

function onSubmit() {
  const stars = readStars();
  const username = readUsername();

  if (!USERNAME_RE.test(username)) {
    haptic('medium');
    showStatus('Проверьте username: 5–32 символа, латиница, цифры и _', true);
    el.username.focus();
    return;
  }

  const order = {
    username,
    stars,
    price: Math.round(stars * CONFIG.pricePerStar * 100) / 100,
    currency: CONFIG.currency,
  };

  haptic('medium');
  if (!sendOrder(order)) {
    showStatus(`Демо: заказ ${formatNumber(stars)} ⭐ для @${username} не отправлен, страница открыта вне Telegram`);
  }
}

// ---------- Подписки на события ----------
el.amount.addEventListener('input', () => {
  el.amount.value = el.amount.value.replace(/\D/g, ''); // только цифры
  update();
});

el.chips.addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  haptic();
  el.amount.value = chip.dataset.value;
  update();
});

el.username.addEventListener('input', () => {
  el.username.value = el.username.value.replace(/[\s@]/g, ''); // без пробелов и @
  showStatus();
});

el.self.addEventListener('click', onSelfClick);
el.submit.addEventListener('click', onSubmit);

// ---------- Запуск ----------
initTelegram();
showBalance();
renderChips();
update();
mountStickers();

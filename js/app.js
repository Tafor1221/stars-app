import { CONFIG } from './config.js';
import { loadAccount } from './account.js';
import { describeCountry } from './countries.js';
import { copyText } from './clipboard.js';
import { initTelegram, haptic } from './telegram.js';

const $ = (id) => document.getElementById(id);
const el = {
  tariff: $('tariff'),
  status: $('status'),
  statusDot: $('statusDot'),
  balance: $('balance'),
  hint: $('hint'),
  dots: $('dots'),
  countries: $('countries'),
  countriesCount: $('countriesCount'),
  keyValue: $('keyValue'),
  copy: $('copy'),
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const account = loadAccount();

// ---------- Форматирование ----------
const formatNumber = (n) => n.toLocaleString('ru-RU');
const formatMoney = (n) => `${formatNumber(Math.round(n * 100) / 100)} ${CONFIG.currency}`;

// Склонение: plural(5, ['страна', 'страны', 'стран']) -> 'стран'
function plural(n, [one, few, many]) {
  const last = n % 10;
  const lastTwo = n % 100;
  if (last === 1 && lastTwo !== 11) return one;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
  return many;
}

// ---------- На сколько хватит баланса ----------
// Считаем по цене дня. Если хватает меньше суток, показываем время.
function describeRunway(balance) {
  if (balance <= 0) return 'Пополните баланс, чтобы подключиться';

  const endsAt = new Date(Date.now() + (balance / CONFIG.dailyPrice) * DAY);

  if (endsAt - Date.now() >= DAY) {
    const sameYear = endsAt.getFullYear() === new Date().getFullYear();
    const date = endsAt.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      ...(sameYear ? {} : { year: 'numeric' }),
    });
    return `Хватит до ${date}`;
  }

  const time = endsAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const isToday = endsAt.toDateString() === new Date().toDateString();
  return `Хватит до ${time} ${isToday ? 'сегодня' : 'завтра'}`;
}

// ---------- Отрисовка ----------
function renderBalance() {
  const active = account.balance > 0;
  el.tariff.textContent = `${formatMoney(CONFIG.dailyPrice)} в день`;
  el.balance.textContent = formatNumber(Math.round(account.balance * 100) / 100);
  el.hint.textContent = describeRunway(account.balance);
  el.status.textContent = active ? 'Активна' : 'Неактивна';
  el.statusDot.classList.toggle('is-off', !active);
}

function renderDevices() {
  const total = Math.min(account.maxDevices, CONFIG.maxDeviceDots);
  el.dots.setAttribute('aria-label', `Подключено ${account.devices} из ${account.maxDevices}`);
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('i');
    dot.classList.toggle('is-on', i < account.devices);
    el.dots.append(dot);
  }
}

function renderCountries() {
  const count = account.countries.length;
  el.countriesCount.textContent = count ? `${count} ${plural(count, ['страна', 'страны', 'стран'])}` : '';

  for (const code of account.countries) {
    const { name, html } = describeCountry(code);
    const chip = document.createElement('span');
    chip.className = 'country';
    chip.innerHTML = html;  // html здесь только наш svg из countries.js
    chip.append(name);      // название вставляем как текст
    el.countries.append(chip);
  }
}

function renderKey() {
  if (!account.key) {
    el.keyValue.textContent = 'Ключ пока не выдан';
    el.copy.disabled = true;
    return;
  }
  el.keyValue.textContent = account.key;
}

// ---------- Копирование ключа ----------
let copiedTimer;
el.copy.addEventListener('click', async () => {
  const ok = await copyText(account.key);
  if (!ok) {
    // не получилось: выделяем текст, чтобы можно было скопировать вручную
    window.getSelection().selectAllChildren(el.keyValue);
    haptic('error');
    return;
  }
  haptic('success');
  el.copy.classList.add('is-copied');
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => el.copy.classList.remove('is-copied'), 1500);
});

// ---------- Запуск ----------
initTelegram();
renderBalance();
renderDevices();
renderCountries();
renderKey();

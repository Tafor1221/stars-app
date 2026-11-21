import { CONFIG } from './config.js';
import { loadAccount } from './account.js';
import { describeCountry } from './countries.js';
import { initTelegram, haptic, sendToBot } from './telegram.js';

const $ = (id) => document.getElementById(id);
const el = {
  balance: $('balance'),
  status: $('status'),
  statusDot: $('statusDot'),
  timeValue: $('timeValue'),
  timeUnit: $('timeUnit'),
  timeHint: $('timeHint'),
  dots: $('dots'),
  devices: $('devices'),
  countries: $('countries'),
  countriesCount: $('countriesCount'),
  renew: $('renew'),
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const account = loadAccount();

// ---------- Форматирование ----------
const formatNumber = (n) => n.toLocaleString('ru-RU');
const formatMoney = (n) => `${formatNumber(Math.round(n * 100) / 100)} ${CONFIG.currency}`;

// Склонение: plural(5, ['день', 'дня', 'дней']) -> 'дней'
function plural(n, [one, few, many]) {
  const last = n % 10;
  const lastTwo = n % 100;
  if (last === 1 && lastTwo !== 11) return one;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
  return many;
}

// ---------- Сколько осталось ----------
// Дни, если их хотя бы один. Иначе часы, а в самом конце минуты.
function describeTimeLeft(expires) {
  const left = expires - Date.now();
  if (!expires || left <= 0) {
    return { value: 0, unit: 'дней', hint: 'Подписка закончилась', active: false };
  }

  const days = Math.floor(left / DAY);
  if (days > 0) {
    const date = new Date(expires).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    return { value: days, unit: plural(days, ['день', 'дня', 'дней']), hint: `до ${date}`, active: true };
  }

  const time = new Date(expires).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const hours = Math.floor(left / HOUR);
  if (hours > 0) {
    return { value: hours, unit: plural(hours, ['час', 'часа', 'часов']), hint: `сегодня до ${time}`, active: true };
  }

  const minutes = Math.max(1, Math.floor(left / MINUTE));
  return { value: minutes, unit: plural(minutes, ['минута', 'минуты', 'минут']), hint: `сегодня до ${time}`, active: true };
}

// ---------- Отрисовка ----------
function renderTime() {
  const time = describeTimeLeft(account.expires);
  el.timeValue.textContent = time.value;
  el.timeUnit.textContent = time.unit;
  el.timeHint.textContent = time.hint;
  el.status.textContent = time.active ? 'Активна' : 'Истекла';
  el.statusDot.classList.toggle('is-off', !time.active);
}

function renderDevices() {
  const { devices, maxDevices } = account;
  el.devices.textContent = `${devices}/${maxDevices}`;

  el.dots.replaceChildren();
  if (maxDevices > CONFIG.maxDeviceDots) return; // слишком много, остаётся только число
  for (let i = 0; i < maxDevices; i++) {
    const dot = document.createElement('i');
    dot.classList.toggle('is-on', i < devices);
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
    chip.innerHTML = html;          // html здесь только наш svg из countries.js
    chip.append(name);              // название вставляем как текст
    el.countries.append(chip);
  }
}

// ---------- Действия ----------
el.renew.addEventListener('click', () => {
  haptic('medium');
  sendToBot({ action: 'renew' }); // бот получит это и пришлёт варианты оплаты
});

// ---------- Запуск ----------
initTelegram();
el.balance.textContent = formatMoney(account.balance);
renderTime();
renderDevices();
renderCountries();
setInterval(renderTime, MINUTE); // обновляем остаток, пока приложение открыто

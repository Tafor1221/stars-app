import { CONFIG } from './config.js';

// Данные подписки. Бот открывает Mini App со ссылкой такого вида:
//   .../index.html?balance=1250&expires=1797000000&devices=2&max=3&countries=de,nl,fi
//   balance   баланс в рублях
//   expires   когда кончается подписка, unix-время в секундах
//   devices   сколько устройств подключено,  max  сколько разрешено
//   countries коды стран через запятую
// Важно: это только для показа. Реальные проверки всегда делает сервер.

const DAY = 24 * 60 * 60 * 1000;

const DEMO_ACCOUNT = {
  balance: 1250,
  expires: Date.now() + 27 * DAY + 6 * 60 * 60 * 1000,
  devices: 2,
  maxDevices: 3,
  countries: ['de', 'nl', 'fi', 'se', 'fr', 'pl', 'jp', 'us'],
};

export function loadAccount() {
  const query = new URLSearchParams(location.search);
  if (CONFIG.demo && !query.has('expires')) return DEMO_ACCOUNT;

  return {
    balance: Number(query.get('balance')) || 0,
    expires: (Number(query.get('expires')) || 0) * 1000,
    devices: parseInt(query.get('devices'), 10) || 0,
    maxDevices: parseInt(query.get('max'), 10) || 0,
    countries: (query.get('countries') || '').toLowerCase().split(',').filter((c) => /^[a-z]{2}$/.test(c)),
  };
}

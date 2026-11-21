import { CONFIG } from './config.js';

// Данные пользователя. Бот открывает Mini App со ссылкой такого вида:
//   .../index.html?balance=120&devices=2&max=3&countries=de,nl,fi&key=https%3A%2F%2Fsub.site%2Fabc
//   balance   баланс в рублях
//   devices   сколько устройств подключено,  max  сколько разрешено
//   countries коды стран через запятую
//   key       ключ или ссылка для Happ (в ссылке его нужно закодировать, encodeURIComponent)
// Важно: это только для показа. Реальные проверки всегда делает сервер.

const DEMO_ACCOUNT = {
  balance: 120,
  devices: 2,
  maxDevices: 3,
  countries: ['de', 'nl', 'fi', 'se', 'fr', 'pl', 'jp', 'us'],
  key: 'https://sub.example.com/c7f3a91e2b84d0',
};

export function loadAccount() {
  const query = new URLSearchParams(location.search);
  if (CONFIG.demo && !query.has('balance')) return DEMO_ACCOUNT;

  return {
    balance: Number(query.get('balance')) || 0,
    devices: parseInt(query.get('devices'), 10) || 0,
    maxDevices: parseInt(query.get('max'), 10) || 0,
    countries: (query.get('countries') || '').toLowerCase().split(',').filter((c) => /^[a-z]{2}$/.test(c)),
    key: query.get('key') || '',
  };
}

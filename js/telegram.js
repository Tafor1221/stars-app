// Всё общение с Telegram собрано в этом файле.
// Если страницу открыли вне Telegram, функции просто ничего не делают.

const tg = window.Telegram?.WebApp ?? null;

// SDK подключён и в обычном браузере, но initData есть только внутри Telegram
export const inTelegram = Boolean(tg?.initData);

// Светлая или тёмная тема Telegram (css подстраивается по атрибуту data-theme)
function applyTheme() {
  document.documentElement.dataset.theme = tg.colorScheme;
}

export function initTelegram() {
  if (!inTelegram) return;
  applyTheme();
  tg.onEvent('themeChanged', applyTheme);
  tg.setHeaderColor?.('bg_color');     // верхняя панель сливается с фоном страницы
  tg.setBackgroundColor?.('bg_color');
  tg.ready();                          // сообщаем Telegram, что страница загружена
  // tg.expand() не вызываем, поэтому окно остаётся в compact-режиме
}

// Username текущего пользователя (пустая строка, если не задан)
export function getOwnUsername() {
  return tg?.initDataUnsafe?.user?.username ?? '';
}

// Лёгкая вибрация: 'light' | 'medium' | 'heavy'
export function haptic(type = 'light') {
  tg?.HapticFeedback?.impactOccurred(type);
}

// Отправка заказа боту. Возвращает false, если мы не в Telegram.
// Важно: sendData работает, только если Mini App открыт кнопкой reply-клавиатуры.
// Если открываешь через Menu Button, заказ надо слать на свой сервер через fetch(),
// передавая tg.initData, чтобы сервер мог проверить подлинность.
export function sendOrder(order) {
  if (!inTelegram) return false;
  tg.sendData(JSON.stringify(order));
  return true;
}

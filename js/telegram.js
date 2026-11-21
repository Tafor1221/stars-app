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
  // Родные панели Telegram сливаются с фоном страницы
  tg.setHeaderColor?.('bg_color');
  tg.setBackgroundColor?.('bg_color');
  tg.setBottomBarColor?.('bg_color');
  tg.ready(); // сообщаем Telegram, что страница загружена
  // tg.expand() не вызываем, поэтому окно остаётся в compact-режиме
}

// Вибрация: 'light' | 'medium' | 'heavy' | 'success' | 'error'
export function haptic(type = 'light') {
  const feedback = tg?.HapticFeedback;
  if (!feedback) return;
  if (type === 'success' || type === 'error') feedback.notificationOccurred(type);
  else feedback.impactOccurred(type);
}

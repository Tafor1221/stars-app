// Копирование текста. Внутри Telegram современный способ иногда запрещён,
// поэтому есть запасной через временное поле.
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // идём дальше
  }

  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
  document.body.append(area);
  area.select();
  area.setSelectionRange(0, text.length);

  let ok = false;
  try { ok = document.execCommand('copy'); } catch { /* не вышло */ }
  area.remove();
  return ok;
}

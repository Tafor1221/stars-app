// Страны: русское название и флаг в виде SVG.
// Флаги нарисованы кодом, потому что эмодзи-флаги не отображаются в Telegram на Windows.
// Чтобы добавить страну, допиши строку: код (2 буквы) -> название и содержимое svg (viewBox 24x24).
const rect = (fill, x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const bands = (a, b, c) => rect(a, 0, 0, 24, 8) + rect(b, 0, 8, 24, 8) + rect(c, 0, 16, 24, 8);   // горизонтальные
const columns = (a, b, c) => rect(a, 0, 0, 8, 24) + rect(b, 8, 0, 8, 24) + rect(c, 16, 0, 8, 24); // вертикальные
const cross = (bg, fg) => rect(bg, 0, 0, 24, 24) + rect(fg, 6, 0, 4, 24) + rect(fg, 0, 10, 24, 4); // скандинавский крест

export const COUNTRIES = {
  de: { name: 'Германия', flag: bands('#000', '#d00', '#ffce00') },
  nl: { name: 'Нидерланды', flag: bands('#ae1c28', '#fff', '#21468b') },
  fr: { name: 'Франция', flag: columns('#0055a4', '#fff', '#ef4135') },
  it: { name: 'Италия', flag: columns('#009246', '#fff', '#ce2b37') },
  fi: { name: 'Финляндия', flag: cross('#fff', '#003580') },
  se: { name: 'Швеция', flag: cross('#006aa7', '#fecc00') },
  at: { name: 'Австрия', flag: bands('#ed2939', '#fff', '#ed2939') },
  ru: { name: 'Россия', flag: bands('#fff', '#0039a6', '#d52b1e') },
  pl: { name: 'Польша', flag: rect('#fff', 0, 0, 24, 12) + rect('#dc143c', 0, 12, 24, 12) },
  jp: { name: 'Япония', flag: rect('#fff', 0, 0, 24, 24) + '<circle cx="12" cy="12" r="5.5" fill="#bc002d"/>' },
  ch: { name: 'Швейцария', flag: rect('#d52b1e', 0, 0, 24, 24) + '<path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="4"/>' },
  tr: { name: 'Турция', flag: rect('#e30a17', 0, 0, 24, 24) + '<circle cx="11" cy="12" r="5.5" fill="#fff"/><circle cx="12.6" cy="12" r="4.4" fill="#e30a17"/><circle cx="16.2" cy="12" r="1.3" fill="#fff"/>' },
  us: { name: 'США', flag: rect('#fff', 0, 0, 24, 24) + rect('#b22234', 0, 0, 24, 4) + rect('#b22234', 0, 8, 24, 4) + rect('#b22234', 0, 16, 24, 4) + rect('#3c3b6e', 0, 0, 12, 12) },
  gb: { name: 'Великобритания', flag: rect('#012169', 0, 0, 24, 24)
    + '<path d="M0 0L24 24M24 0L0 24" stroke="#fff" stroke-width="4"/><path d="M0 0L24 24M24 0L0 24" stroke="#c8102e" stroke-width="1.6"/>'
    + '<path d="M12 0V24M0 12H24" stroke="#fff" stroke-width="6"/><path d="M12 0V24M0 12H24" stroke="#c8102e" stroke-width="3.4"/>' },
};

// Возвращает { name, html } для кода страны. Неизвестный код показывается серым кругом с буквами.
export function describeCountry(code) {
  const known = COUNTRIES[code];
  if (known) {
    return { name: known.name, html: `<svg class="flag" viewBox="0 0 24 24" aria-hidden="true">${known.flag}</svg>` };
  }
  return { name: code.toUpperCase(), html: `<span class="flag flag--code" aria-hidden="true">${code.toUpperCase()}</span>` };
}

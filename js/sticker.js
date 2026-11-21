// Анимированные стикеры Telegram (.tgs) = сжатый gzip-ом Lottie JSON.
// Любой элемент с атрибутом data-tgs="путь/к/файлу.tgs" становится анимацией.
// Если файла нет или он битый, остаётся эмодзи, написанное внутри элемента.

export function mountStickers(root = document) {
  root.querySelectorAll('[data-tgs]').forEach(mount);
}

async function mount(el) {
  if (!window.lottie) return; // библиотека не загрузилась
  try {
    const data = await loadAnimationData(el.dataset.tgs);
    el.textContent = '';
    el.classList.add('is-animated');
    window.lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: data,
    });
  } catch {
    // оставляем эмодзи-заглушку
  }
}

async function loadAnimationData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Нет файла ${url}`);
  const bytes = new Uint8Array(await response.arrayBuffer());

  const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b; // .tgs
  if (!isGzip) return JSON.parse(new TextDecoder().decode(bytes)); // обычный .json

  const unzipped = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(unzipped).text());
}

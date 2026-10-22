'use strict';

/* Container Vision: site estático. Não executa OCR nem acessa câmeras. */
const $ = selector => document.querySelector(selector);
const all = selector => Array.from(document.querySelectorAll(selector));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const menuButton = $('.menu-button');
const navigation = $('#navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  navigation.classList.toggle('open', open);
});
all('.navigation a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});

/* ISO 6346, anexo A: A=10; omitem-se múltiplos de 11; pesos 2^posição.
 * O resto 10 corresponde ao dígito 0. A consistência matemática não comprova
 * existência, propriedade ou registro do equipamento no BIC.
 */
function checkDigit(firstTen) {
  if (!/^[A-Z]{3}[UJZ]\d{6}$/.test(firstTen)) return null;
  const sum = Array.from(firstTen).reduce((total, char, index) => {
    let value;
    if (/\d/.test(char)) value = Number(char);
    else {
      const position = char.charCodeAt(0) - 65;
      value = 10 + position + Math.floor((position + 9) / 10);
    }
    return total + value * 2 ** index;
  }, 0);
  return (sum % 11) % 10;
}
function inspectCode(raw) {
  const code = raw.toUpperCase().replace(/[\s-]/g, '');
  if (!/^[A-Z]{3}[UJZ]\d{7}$/.test(code)) return { code, valid: false, message: 'Use quatro letras e sete números, como CSQU 305438 3. A quarta letra deve ser U, J ou Z.' };
  const expected = checkDigit(code.slice(0, 10));
  const valid = expected === Number(code[10]);
  return { code, valid, expected, message: valid ? '✓ Estrutura e dígito de controle corretos.' : `Confira o último número: para essa sequência, ele deve ser ${expected}.` };
}

const example = { code: 'CSQU3054383', display: 'CSQU 305438 3', size: '20 pés', type: 'Carga geral', sizeType: '22G1' };
const views = [
  { name: 'Porta inteira', label: 'Número na porta', scale: 1, focusY: .215 },
  { name: 'Número ampliado', label: 'Número do contêiner', scale: 2.5, focusY: .215 },
  { name: 'Tipo ampliado', label: 'Marcação de tamanho e tipo', scale: 3.6, focusY: .288 }
];
let activeView = 0;
let captureTimer;
let capturePending = false;
let capturedAt = null;
let toastTimer;

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4000);
}
function updateManualCheck() {
  const result = inspectCode($('#container-code').value);
  $('#validation-message').textContent = result.message;
  $('#validation-message').classList.toggle('error', !result.valid);
  $('#container-code').setAttribute('aria-invalid', String(!result.valid));
  return result;
}
function updateCameraView() {
  const frame = $('#camera-frame');
  const w = frame.clientWidth, h = frame.clientHeight;
  if (!w || !h) return;
  const size = Math.min(w, h), view = views[activeView], scale = view.scale;
  const x = (w - size) / 2 + size * .835;
  const y = (h - size) / 2 + size * view.focusY;
  const dx = activeView === 0 ? 0 : -(x - w / 2) * scale;
  const dy = activeView === 0 ? 0 : -(y - h / 2) * scale;
  $('#camera-view').style.transform = `translate3d(${dx}px,${dy}px,0) scale(${scale})`;
  const box = $('.ocr-box');
  const bw = size * .17 * scale;
  const bh = size * (activeView === 2 ? .065 : .18) * scale;
  box.style.left = `${activeView === 0 ? (w-size)/2+size*.76 : w/2-bw/2}px`;
  box.style.top = `${activeView === 0 ? (h-size)/2+size*.14 : h/2-bh/2}px`;
  box.style.width = `${bw}px`;
  box.style.height = `${bh}px`;
}
function setView(index) {
  activeView = index;
  $('#camera-frame').dataset.camera = String(index);
  $('#camera-view-name').textContent = views[index].name;
  $('#ocr-label').textContent = views[index].label;
  all('button[data-camera]').forEach((button, current) => {
    button.classList.toggle('active', current === index);
    button.setAttribute('aria-pressed', String(current === index));
  });
  updateCameraView();
}
all('button[data-camera]').forEach(button => button.addEventListener('click', () => setView(Number(button.dataset.camera))));
$('#container-code').addEventListener('input', updateManualCheck);
$('#container-code').addEventListener('keydown', event => {
  if (event.key === 'Enter') { event.preventDefault(); updateManualCheck(); }
});
$('#validate-button').addEventListener('click', updateManualCheck);
$('#compare-number').addEventListener('click', () => {
  setView(1);
  $('#camera-frame').scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center'});
});
$('#capture-button').addEventListener('click', () => {
  if (capturePending) return;
  capturePending = true;
  let scrollAtStart = window.scrollY;
  $('#camera-frame').classList.remove('is-captured');
  $('#camera-frame').classList.add('is-scanning');
  $('#demo-result').setAttribute('aria-busy', 'true');
  $('#demo-result').classList.add('is-reading');
  $('#capture-button').disabled = true;
  $('#capture-button').textContent = 'Reproduzindo a leitura…';
  $('#demo-status').textContent = 'Localizando o número na imagem de exemplo…';
  $('#reading-badge').textContent = 'EM LEITURA';
  $('#reading-badge').classList.remove('complete');
  $('#export-button').disabled = true;
  $('#compare-number').disabled = true;
  all('button[data-camera]').forEach(button => { button.disabled = true; });
  setView(1);
  if (window.innerWidth <= 680 && !reducedMotion.matches) {
    const frame = $('#camera-frame');
    const rect = frame.getBoundingClientRect();
    scrollAtStart = window.scrollY + rect.top + (rect.height-window.innerHeight)/2;
    frame.scrollIntoView({behavior:'smooth',block:'center'});
  }
  captureTimer = setTimeout(() => {
    capturePending = false;
    capturedAt = new Date().toISOString();
    $('#camera-frame').classList.remove('is-scanning');
    $('#camera-frame').classList.add('is-captured');
    $('#demo-result').classList.remove('is-reading');
    $('#demo-result').setAttribute('aria-busy', 'false');
    $('#demo-status').textContent = 'Exemplo concluído. O número e as características estão reunidos abaixo.';
    $('#reading-badge').textContent = 'CONCLUÍDO';
    $('#reading-badge').classList.add('complete');
    $('#capture-button').disabled = false;
    $('#capture-button').innerHTML = '<span aria-hidden="true">↻</span> Repetir exemplo';
    $('#export-button').disabled = false;
    $('#compare-number').disabled = false;
    all('button[data-camera]').forEach(button => { button.disabled = false; });
    setView(0);
    // Ao tocar no celular, o resultado permanece visível. Não desloca a página
    // se a pessoa já tiver rolado para outra seção durante a reprodução.
    if (window.innerWidth <= 680 && Math.abs(window.scrollY-scrollAtStart)<80) {
      $('#reading-panel').scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start'});
    }
  }, reducedMotion.matches ? 200 : 1600);
});
$('#export-button').addEventListener('click', () => {
  if (capturePending) return;
  const record = [
    'CONTAINER VISION / SIAMAC',
    'REGISTRO DE EXEMPLO',
    '',
    `Número do contêiner: ${example.display}`,
    `Tamanho: ${example.size}`,
    `Tipo: ${example.type}`,
    `Marcação na porta: ${example.sizeType}`,
    '',
    capturedAt ? `Exemplo reproduzido em: ${new Date(capturedAt).toLocaleString('pt-BR')}` : 'Dados da imagem de exemplo.',
    '',
    'Registro ilustrativo com dados predefinidos. Esta página não está conectada a câmeras e não processou uma nova imagem.'
  ].join('\n');
  const blob = new Blob(['\uFEFF',record], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `container-vision-exemplo-${example.code}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Registro de exemplo baixado.');
});

setView(0);
updateManualCheck();
new ResizeObserver(updateCameraView).observe($('#camera-frame'));

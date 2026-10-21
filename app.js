const input = document.getElementById('jsonInput');
const output = document.querySelector('#jsonOutput code');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const pasteBtn = document.getElementById('pasteBtn');
const statusEl = document.getElementById('status');
const indentSize = document.getElementById('indentSize');

let formattedJson = '';
let parseTimer = null;

function setStatus(message, type = 'neutral') {
  statusEl.textContent = message;
  statusEl.classList.remove('is-error', 'is-success');

  if (type === 'error') statusEl.classList.add('is-error');
  if (type === 'success') statusEl.classList.add('is-success');
}

function getIndentation() {
  if (indentSize.value === 'tab') return '\t';
  return Number(indentSize.value);
}

function resetOutput() {
  formattedJson = '';
  output.textContent = 'Le JSON formaté apparaîtra ici.';
  copyBtn.disabled = true;
}

function formatJson() {
  const raw = input.value.trim();

  if (!raw) {
    resetOutput();
    setStatus('Prêt.');
    return;
  }

  try {
    const parsed = JSON.parse(raw);

    formattedJson = JSON.stringify(
      parsed,
      null,
      getIndentation()
    );

    output.textContent = formattedJson;
    copyBtn.disabled = false;

    const type = Array.isArray(parsed)
      ? 'array'
      : parsed === null
        ? 'null'
        : typeof parsed;

    const size = new Blob([formattedJson]).size;

    setStatus(
      `JSON valide · type: ${type} · ${size.toLocaleString('fr-BE')} octets`,
      'success'
    );
  } catch (error) {
    formattedJson = '';
    output.textContent = 'JSON incomplet ou invalide.';
    copyBtn.disabled = true;

    const message = error.message
      .replace(/^JSON\.parse:\s*/i, '')
      .replace(/^Unexpected token\s*/i, 'Caractère inattendu ')
      .replace(/^Unexpected end of JSON input$/i, 'JSON incomplet');

    setStatus(message, 'error');
  }
}

function scheduleFormat() {
  clearTimeout(parseTimer);

  parseTimer = setTimeout(() => {
    formatJson();
  }, 120);
}

async function copyOutput() {
  if (!formattedJson) return;

  try {
    await navigator.clipboard.writeText(formattedJson);

    const previous = copyBtn.textContent;
    copyBtn.textContent = 'Copied';

    setStatus(
      'JSON copié dans le presse-papiers.',
      'success'
    );

    setTimeout(() => {
      copyBtn.textContent = previous;
    }, 1400);
  } catch {
    setStatus(
      'Impossible de copier automatiquement. Sélectionne le texte manuellement.',
      'error'
    );
  }
}

async function pasteInput() {
  try {
    input.value = await navigator.clipboard.readText();
    formatJson();
    input.focus();
  } catch {
    setStatus(
      'Le navigateur a bloqué l’accès au presse-papiers.',
      'error'
    );
  }
}

function clearAll() {
  clearTimeout(parseTimer);

  input.value = '';
  resetOutput();

  setStatus('Prêt.');
  input.focus();
}

copyBtn.addEventListener('click', copyOutput);
pasteBtn.addEventListener('click', pasteInput);
clearBtn.addEventListener('click', clearAll);

indentSize.addEventListener('change', () => {
  if (input.value.trim()) {
    formatJson();
  }
});

input.addEventListener('input', () => {
  if (!input.value.trim()) {
    clearTimeout(parseTimer);
    resetOutput();
    setStatus('Prêt.');
    return;
  }

  scheduleFormat();
});

input.addEventListener('paste', () => {
  requestAnimationFrame(() => {
    formatJson();
  });
});

input.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    clearTimeout(parseTimer);
    formatJson();
  }
});
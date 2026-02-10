const sourceTextEl = document.getElementById('sourceText');
const resultTextEl = document.getElementById('resultText');
const rewriteBtn = document.getElementById('rewriteBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const modeEl = document.getElementById('mode');
const intensityEl = document.getElementById('intensity');
const intensityValueEl = document.getElementById('intensityValue');
const statusEl = document.getElementById('status');

const synonyms = {
  помогает: ['способствует', 'упрощает', 'позволяет'],
  быстро: ['оперативно', 'в короткие сроки', 'без задержек'],
  находить: ['подбирать', 'обнаруживать', 'выявлять'],
  решения: ['варианты', 'подходы', 'ответы'],
  сложных: ['непростых', 'комплексных', 'трудных'],
  задач: ['вопросов', 'кейсов', 'проблем'],
  сервис: ['инструмент', 'платформа', 'система'],
  важно: ['существенно', 'значимо', 'критично'],
  удобно: ['комфортно', 'практично', 'эффективно'],
  сделать: ['выполнить', 'реализовать', 'осуществить'],
};

const formalStarters = ['Следует отметить, что', 'Таким образом,', 'Важно подчеркнуть, что'];
const creativeStarters = ['Представьте, что', 'Если взглянуть шире,', 'На практике это выглядит так:'];

intensityEl.addEventListener('input', () => {
  intensityValueEl.textContent = intensityEl.value;
});

rewriteBtn.addEventListener('click', () => {
  const text = sourceTextEl.value.trim();

  if (!text) {
    setStatus('Введите текст для обработки.');
    resultTextEl.value = '';
    return;
  }

  const mode = modeEl.value;
  const intensity = Number(intensityEl.value);
  const rewritten = rewriteText(text, mode, intensity);

  resultTextEl.value = rewritten;
  setStatus('Готово: текст переписан.');
});

copyBtn.addEventListener('click', async () => {
  const text = resultTextEl.value.trim();

  if (!text) {
    setStatus('Сначала получите результат, затем копируйте.');
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus('Результат скопирован в буфер обмена.');
  } catch {
    setStatus('Не удалось скопировать автоматически. Скопируйте вручную.');
  }
});

clearBtn.addEventListener('click', () => {
  sourceTextEl.value = '';
  resultTextEl.value = '';
  setStatus('Поля очищены.');
});

function rewriteText(text, mode, intensity) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const rewritten = sentences.map((sentence, index) => {
    let output = replaceSynonyms(sentence, intensity);

    if (mode === 'formal') {
      output = formalize(output, index, intensity);
    }

    if (mode === 'creative') {
      output = makeCreative(output, index, intensity);
    }

    return output;
  });

  return rewritten.join(' ');
}

function replaceSynonyms(sentence, intensity) {
  let changed = sentence;

  Object.entries(synonyms).forEach(([word, list]) => {
    const variant = list[(intensity - 1) % list.length];
    const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
    changed = changed.replace(wordRegex, (match) => preserveCase(match, variant));
  });

  return changed;
}

function formalize(sentence, index, intensity) {
  const starter = formalStarters[index % formalStarters.length];
  if (intensity === 1) {
    return sentence;
  }

  if (!sentence.toLowerCase().startsWith(starter.toLowerCase())) {
    return `${starter} ${lowerFirst(sentence)}`;
  }

  return sentence;
}

function makeCreative(sentence, index, intensity) {
  const starter = creativeStarters[index % creativeStarters.length];

  if (intensity === 1) {
    return sentence;
  }

  if (intensity === 2) {
    return `${starter} ${lowerFirst(sentence)}`;
  }

  const words = sentence.split(' ');
  if (words.length > 8) {
    const pivot = Math.floor(words.length / 2);
    const rotated = [...words.slice(pivot), ...words.slice(0, pivot)].join(' ');
    return `${starter} ${lowerFirst(rotated)}`;
  }

  return `${starter} ${lowerFirst(sentence)}`;
}

function preserveCase(source, replacement) {
  if (source[0] === source[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function lowerFirst(text) {
  if (!text) return text;
  return text[0].toLowerCase() + text.slice(1);
}

function setStatus(message) {
  statusEl.textContent = message;
}

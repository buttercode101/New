const intro = document.getElementById('intro');
const loaderBar = document.getElementById('loaderBar');
const loaderText = document.getElementById('loaderText');
const fxCanvas = document.getElementById('fxCanvas');

const stage = document.getElementById('stage');
const envelopeWrap = document.getElementById('envelopeWrap');
const envelope = document.getElementById('envelope');
const topFlap = document.getElementById('topFlap');
const seal = document.getElementById('seal');
const sealProgress = document.getElementById('sealProgress');
const hint = document.getElementById('hint');

const letterStage = document.getElementById('letterStage');
const letter = document.getElementById('letter');
const lines = [...document.querySelectorAll('.line, .signature')];
const closeBtn = document.getElementById('closeBtn');
const outro = document.getElementById('outro');
const replayBtn = document.getElementById('replayBtn');
const skyGlow = document.querySelector('.sky-glow');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let introDone = false;
let opened = false;
let dragging = false;
let dragStartX = 0;
let timeouts = [];

const audioContext = window.AudioContext || window.webkitAudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;

function tone(type, frequency, duration, gain) {
  if (!audioContext || audioContext.state !== 'running') return;
  const osc = audioContext.createOscillator();
  const amp = audioContext.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  amp.gain.value = gain;
  osc.connect(amp).connect(audioContext.destination);
  osc.start();
  amp.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  osc.stop(audioContext.currentTime + duration);
}

function sfx(kind) {
  if (kind === 'tap') tone('triangle', 230, 0.08, 0.02);
  if (kind === 'crack') {
    tone('square', 120, 0.1, 0.04);
    setTimeout(() => tone('square', 88, 0.09, 0.03), 30);
  }
  if (kind === 'ink') tone('sine', 510, 0.08, 0.01);
  if (kind === 'close') tone('sine', 300, 0.22, 0.025);
}

function resumeAudio() {
  if (!audioContext) return;
  if (audioContext.state !== 'running') audioContext.resume().catch(() => {});
}

function hintText(text) {
  hint.textContent = text;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setProgress(value) {
  sealProgress.style.setProperty('--p', `${Math.max(0, Math.min(100, value))}%`);
}

function typeLine(el, text, speed = 22) {
  return new Promise((resolve) => {
    el.textContent = '';
    el.classList.add('visible');
    let i = 0;
    const tick = () => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i % 7 === 0) sfx('ink');
      if (i < text.length) {
        const id = setTimeout(tick, reduced ? 0 : speed);
        timeouts.push(id);
      } else {
        resolve();
      }
    };
    tick();
  });
}

async function revealLetter() {
  letter.classList.remove('folded');
  letterStage.classList.add('active');
  letterStage.setAttribute('aria-hidden', 'false');

  for (const el of lines) {
    await typeLine(el, el.dataset.text || '', 17);
    await wait(reduced ? 0 : 250);
  }
}

function clearTimers() {
  timeouts.forEach(clearTimeout);
  timeouts = [];
}

async function openExperience() {
  if (opened) return;
  opened = true;
  dragging = false;
  seal.classList.remove('dragging');
  seal.classList.add('cracked');
  envelope.classList.add('envelope-open');
  hintText('Opening your letter…');
  sfx('crack');
  if (navigator.vibrate) navigator.vibrate([15, 30, 20]);

  await wait(reduced ? 80 : 900);
  stage.style.opacity = '0';
  stage.style.pointerEvents = 'none';
  skyGlow.style.background =
    'radial-gradient(circle at 70% 20%, rgba(146, 156, 255, 0.32), transparent 38%), radial-gradient(circle at 14% 20%, rgba(160, 124, 255, 0.16), transparent 45%), linear-gradient(165deg, rgba(14, 18, 34, 0.65), rgba(7, 8, 16, 0.95))';
  fxCanvas.style.opacity = '0.96';

  await wait(reduced ? 30 : 280);
  await revealLetter();
  hintText('');
}

function handleStart(clientX) {
  if (!introDone || opened) return;
  resumeAudio();
  dragging = true;
  dragStartX = clientX;
  seal.classList.add('dragging');
  hintText('Keep dragging to break the seal…');
  sfx('tap');
}

function handleMove(clientX) {
  if (!dragging || opened) return;
  const drag = Math.max(0, clientX - dragStartX);
  const rotate = Math.min(18, drag / 9);
  const shift = Math.min(48, drag / 3.6);
  const progress = Math.min(100, (drag / 130) * 100);
  setProgress(progress);
  seal.style.transform = `translate(-50%, -50%) rotate(${rotate}deg) translateX(${shift}px)`;

  envelopeWrap.style.transform = `translateY(${Math.max(-16, -drag / 25)}px) rotateY(${Math.min(8, drag / 35)}deg)`;
  if (drag > 130) openExperience();
}

function handleEnd() {
  if (!dragging || opened) return;
  dragging = false;
  seal.classList.remove('dragging');
  seal.style.transform = 'translate(-50%, -50%)';
  envelopeWrap.style.transform = '';
  setProgress(0);
  hintText('Almost there — drag farther right, or press Enter.');
}

function resetAll() {
  clearTimers();
  introDone = false;
  opened = false;
  dragging = false;

  for (const el of lines) {
    el.classList.remove('visible');
    el.textContent = '';
  }

  outro.classList.remove('active');
  letter.classList.add('folded');
  letterStage.classList.remove('active');
  letterStage.setAttribute('aria-hidden', 'true');

  stage.style.opacity = '1';
  stage.style.pointerEvents = 'auto';

  envelope.classList.remove('envelope-open');
  seal.classList.remove('cracked', 'dragging');
  seal.style.transform = 'translate(-50%, -50%)';
  setProgress(0);

  skyGlow.style.background =
    'radial-gradient(circle at 72% 15%, rgba(255, 193, 128, 0.42), transparent 34%), radial-gradient(circle at 15% 20%, rgba(138, 128, 255, 0.18), transparent 40%), linear-gradient(165deg, rgba(22, 10, 17, 0.3), rgba(8, 8, 16, 0.8))';
  fxCanvas.style.opacity = '0';

  loaderBar.style.width = '0%';
  loaderText.textContent = 'Preparing the night sky…';
  intro.classList.add('active');

  startIntro();
}

function bindInput() {
  seal.addEventListener('mousedown', (e) => handleStart(e.clientX));
  window.addEventListener('mousemove', (e) => handleMove(e.clientX));
  window.addEventListener('mouseup', handleEnd);

  seal.addEventListener('touchstart', (e) => handleStart(e.touches[0].clientX), { passive: true });
  window.addEventListener('touchmove', (e) => handleMove(e.touches[0].clientX), { passive: true });
  window.addEventListener('touchend', handleEnd);

  seal.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !opened) {
      e.preventDefault();
      resumeAudio();
      setProgress(100);
      openExperience();
    }
  });

  closeBtn.addEventListener('click', async () => {
    letter.classList.add('folded');
    await wait(reduced ? 40 : 700);
    outro.classList.add('active');
    sfx('close');
  });

  replayBtn.addEventListener('click', () => {
    resumeAudio();
    resetAll();
  });
}

function bindPointerTilt() {
  window.addEventListener('pointermove', (e) => {
    if (!introDone || opened || dragging) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const tx = (e.clientX - cx) / cx;
    const ty = (e.clientY - cy) / cy;
    envelope.style.transform = `rotateY(${tx * 6}deg) rotateX(${-ty * 4}deg)`;
  });
}

function initFX() {
  const ctx = fxCanvas.getContext('2d');
  const stars = [];
  const hearts = [];

  function resize() {
    fxCanvas.width = innerWidth;
    fxCanvas.height = innerHeight;
    stars.length = 0;
    hearts.length = 0;

    const starCount = Math.floor((innerWidth * innerHeight) / (reduced ? 26000 : 14000));
    for (let i = 0; i < starCount; i += 1) {
      stars.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.6 + 0.2, a: Math.random(), da: Math.random() * 0.012 + 0.002 });
    }

    const heartCount = reduced ? 6 : 12;
    for (let i = 0; i < heartCount; i += 1) {
      hearts.push({ x: Math.random() * innerWidth, y: innerHeight + Math.random() * innerHeight, s: Math.random() * 10 + 8, v: Math.random() * 0.35 + 0.2, a: Math.random() * 0.4 + 0.15 });
    }
  }

  function heart(x, y, s, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s / 12, s / 12);
    ctx.fillStyle = `rgba(255, 188, 201, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(0, -2, -6, -2, -6, 3);
    ctx.bezierCurveTo(-6, 7, 0, 10, 0, 12);
    ctx.bezierCurveTo(0, 10, 6, 7, 6, 3);
    ctx.bezierCurveTo(6, -2, 0, -2, 0, 3);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (const s of stars) {
      s.a += s.da;
      if (s.a > 1 || s.a < 0.2) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(226, 233, 255, ${s.a})`;
      ctx.fill();
    }

    for (const h of hearts) {
      h.y -= h.v;
      if (h.y < -40) h.y = innerHeight + Math.random() * 120;
      heart(h.x, h.y, h.s, h.a);
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

async function startIntro() {
  const phrases = ['Preparing the night sky…', 'Lighting the room…', 'Sealing it with love…'];
  loaderBar.style.width = '100%';
  for (const p of phrases) {
    loaderText.textContent = p;
    await wait(reduced ? 30 : 700);
  }

  await wait(reduced ? 80 : 700);
  intro.classList.remove('active');
  introDone = true;
  hintText('Drag the wax seal to the right, or press Enter.');
  seal.focus();
}

initFX();
bindInput();
bindPointerTilt();
startIntro();

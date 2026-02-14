const intro = document.getElementById('intro');
const loaderBar = document.getElementById('loaderBar');
const envelopeShell = document.getElementById('envelopeShell');
const seal = document.getElementById('seal');
const hint = document.getElementById('hint');
const deskStage = document.getElementById('deskStage');
const letterStage = document.getElementById('letterStage');
const letter = document.getElementById('letter');
const inks = [...document.querySelectorAll('.ink, .signature')];
const closeBtn = document.getElementById('closeBtn');
const outro = document.getElementById('outro');
const sunlight = document.getElementById('sunlight');
const starsCanvas = document.getElementById('stars');

let dragStartX = 0;
let dragDistance = 0;
let introDone = false;
let opened = false;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playTone({ type = 'sine', frequency = 440, duration = 0.15, gain = 0.035 }) {
  const o = audioContext.createOscillator();
  const g = audioContext.createGain();
  o.type = type;
  o.frequency.value = frequency;
  g.gain.value = gain;
  o.connect(g).connect(audioContext.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  o.stop(audioContext.currentTime + duration);
}

function playRustle() {
  playTone({ type: 'triangle', frequency: 220, duration: 0.12, gain: 0.03 });
  setTimeout(() => playTone({ type: 'triangle', frequency: 280, duration: 0.12, gain: 0.02 }), 55);
}

function playCrack() {
  playTone({ type: 'square', frequency: 130, duration: 0.1, gain: 0.045 });
  setTimeout(() => playTone({ type: 'square', frequency: 90, duration: 0.08, gain: 0.03 }), 40);
}

function playInk() {
  playTone({ type: 'sine', frequency: 520, duration: 0.12, gain: 0.012 });
}

function initIntro() {
  requestAnimationFrame(() => {
    loaderBar.style.width = '100%';
  });

  setTimeout(() => {
    intro.classList.remove('active');
    introDone = true;
    hint.textContent = 'Press and drag across the wax seal to open.';
  }, 2800);
}

function crackSealAndOpen() {
  if (opened) return;
  opened = true;

  seal.classList.remove('dragging');
  seal.classList.add('cracked');
  playCrack();
  envelopeShell.classList.add('envelope-open');
  hint.textContent = 'The letter is opening…';

  setTimeout(() => {
    deskStage.style.opacity = '0';
    deskStage.style.pointerEvents = 'none';
    letterStage.classList.add('active');
    letterStage.setAttribute('aria-hidden', 'false');
    letter.classList.remove('folded');
    playRustle();
    revealInkParagraphs();
    transitionToNight();
  }, 1300);
}

function revealInkParagraphs() {
  inks.forEach((line, i) => {
    setTimeout(() => {
      line.classList.add('visible');
      playInk();
      line.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, i * 1700 + 500);
  });
}

function transitionToNight() {
  sunlight.style.background =
    'radial-gradient(circle at 70% 25%, rgba(170,177,255,0.28) 0%, rgba(69,85,142,0.22) 30%, rgba(16,22,40,0.58) 65%, rgba(8,13,26,0.9) 100%)';
  starsCanvas.style.opacity = '0.95';
}

function bindSeal() {
  const start = (clientX) => {
    if (!introDone) return;
    if (audioContext.state !== 'running') audioContext.resume();
    dragStartX = clientX;
    dragDistance = 0;
    seal.classList.add('dragging');
    hint.textContent = 'Keep dragging to crack the wax seal…';
    playRustle();
  };

  const move = (clientX) => {
    if (!seal.classList.contains('dragging') || opened) return;
    dragDistance = Math.max(0, clientX - dragStartX);
    const rotate = Math.min(14, dragDistance / 10);
    seal.style.transform = `translate(-50%, -50%) rotate(${rotate}deg) translateX(${Math.min(40, dragDistance / 4)}px)`;

    if (dragDistance > 120) {
      seal.style.transform = 'translate(-50%, -50%)';
      crackSealAndOpen();
    }
  };

  const end = () => {
    if (!seal.classList.contains('dragging') || opened) return;
    seal.classList.remove('dragging');
    seal.style.transform = 'translate(-50%, -50%)';
    hint.textContent = 'Press and drag farther to break the seal.';
  };

  seal.addEventListener('mousedown', (e) => start(e.clientX));
  window.addEventListener('mousemove', (e) => move(e.clientX));
  window.addEventListener('mouseup', end);

  seal.addEventListener('touchstart', (e) => start(e.touches[0].clientX), { passive: true });
  window.addEventListener('touchmove', (e) => move(e.touches[0].clientX), { passive: true });
  window.addEventListener('touchend', end);
}

function initStars() {
  const ctx = starsCanvas.getContext('2d');
  const stars = [];

  function resize() {
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
    stars.length = 0;
    const count = Math.floor((window.innerWidth * window.innerHeight) / 15000);
    for (let i = 0; i < count; i += 1) {
      stars.push({
        x: Math.random() * starsCanvas.width,
        y: Math.random() * starsCanvas.height,
        r: Math.random() * 1.6 + 0.3,
        a: Math.random() * 0.8 + 0.2,
        da: Math.random() * 0.02 + 0.003,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    for (const s of stars) {
      s.a += s.da;
      if (s.a > 1 || s.a < 0.2) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(225, 234, 255, ${s.a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

closeBtn.addEventListener('click', () => {
  letter.classList.add('folded');
  letterStage.classList.remove('active');
  setTimeout(() => {
    outro.classList.add('active');
    playTone({ type: 'sine', frequency: 330, duration: 0.3, gain: 0.03 });
  }, 900);
});

initStars();
bindSeal();
initIntro();

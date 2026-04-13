/* ========== VANTA.JS BACKGROUND ========== */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof VANTA !== 'undefined') {
    VANTA.BIRDS({
      el: '#vanta-bg',
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1.0,
      scaleMobile: 1.0,
      backgroundColor: 0x0a0e1a,
      color1: 0x00c8ff,
      color2: 0x0060cc,
      colorMode: 'lerp',
      birdSize: 1.2,
      wingSpan: 20,
      speedLimit: 4,
      separation: 30,
      alignment: 30,
      cohesion: 30,
      quantity: 3
    });
  }
});

/* ========== MUSIC PLAYER ========== */
const audio = document.getElementById('party-audio');
const musicPlayer = document.getElementById('music-player');
const musicLabel = document.querySelector('.music-label');
let isPlaying = false;

function toggleMusic() {
  if (isPlaying) {
    audio.pause();
    musicPlayer.classList.remove('playing');
    musicLabel.textContent = 'PLAY';
    document.getElementById('music-icon').innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/></svg>';
  } else {
    audio.play();
    musicPlayer.classList.add('playing');
    musicLabel.textContent = 'ON';
    document.getElementById('music-icon').innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/><line x1="2" y1="2" x2="22" y2="22"/></svg>';
  }
  isPlaying = !isPlaying;
}

/* ========== BACK TO TOP ========== */
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });
}

/* ========== SCROLL ANIMATIONS ========== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

/* ========== RSVP FORM ========== */
const form = document.getElementById('rsvp-form');
const partySizeGroup = document.getElementById('party-size-group');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

// Show/hide party size based on attendance
[rsvpYes, rsvpNo].forEach(radio => {
  radio.addEventListener('change', () => {
    if (rsvpNo.checked) {
      partySizeGroup.classList.add('hidden');
    } else {
      partySizeGroup.classList.remove('hidden');
    }
  });
});

// Counter
function adjustCount(delta) {
  const input = document.getElementById('party-size');
  let val = parseInt(input.value) + delta;
  if (val < 1) val = 1;
  if (val > 20) val = 20;
  input.value = val;
}

// Form submit via fetch
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  try {
    const data = new FormData(form);
    await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    form.style.display = 'none';
    const successEl = document.getElementById('rsvp-success');
    successEl.style.display = 'block';
    successEl.classList.add('visible');
    // #64 Confetti burst — only if they said "Yes"
    if (rsvpYes && rsvpYes.checked) {
      fireConfetti(successEl);
    }
  } catch {
    submitBtn.textContent = 'Send RSVP';
    submitBtn.disabled = false;
    alert('Something went wrong. Please try again.');
  }
});

/* ========== ADD TO CALENDAR ========== */
function addToCalendar() {
  // Google Calendar link
  const title = encodeURIComponent("Cy's Size 6-7 Birthday Bash");
  const details = encodeURIComponent("Pool party at our house! Bring swimsuits and towels. Snacks and refreshments provided.\n\n23315 Markstone Glen Court, Katy, TX 77493");
  const location = encodeURIComponent("23315 Markstone Glen Court, Katy, TX 77493");
  // April 18, 2026 2:00 PM - 5:00 PM CT (UTC-5)
  const start = '20260418T190000Z';
  const end = '20260418T220000Z';
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  window.open(url, '_blank');
}

/* ========== GIFT CLAIMING (Firebase) ========== */
const FIREBASE_URL = 'https://cy-s-birthday-default-rtdb.firebaseio.com/gifts';

const GIFTS = [
  { id: 'walkie-talkies', name: 'Walkie-Talkies', limit: 1 },
  { id: 'basketball', name: 'Basketball', limit: 1 },
  { id: 'flute', name: 'Flute', limit: 1 },
  { id: 'legos', name: 'Legos', limit: 1 },
  { id: 'minecraft-gift-cards', name: 'Minecraft Gift Cards', limit: 0 }, // 0 = unlimited
  { id: 'robots', name: 'Robots', limit: 1 },
  { id: 'skateboard', name: 'Skateboard', limit: 1 },
  { id: 'gaming-headset', name: 'Gaming Headset', limit: 1 },
  { id: 'wireless-mouse', name: 'Wireless Mouse', limit: 1 }
];

// Modal elements
const modalOverlay = document.createElement('div');
modalOverlay.className = 'gift-modal-overlay';
modalOverlay.innerHTML = `
  <div class="gift-modal">
    <h3>Claim this gift?</h3>
    <p id="modal-gift-name">Gift Name</p>
    <input type="text" id="modal-claimer-name" placeholder="Your name" maxlength="50">
    <div class="gift-modal-actions">
      <button class="btn btn-cancel" onclick="closeGiftModal()">Cancel</button>
      <button class="btn btn-primary" onclick="confirmClaim()">Claim It</button>
    </div>
  </div>
`;
document.body.appendChild(modalOverlay);

let currentClaimGift = null;

function openGiftModal(giftId) {
  const gift = GIFTS.find(g => g.id === giftId);
  if (!gift) return;
  currentClaimGift = gift;
  document.getElementById('modal-gift-name').textContent = gift.name;
  document.getElementById('modal-claimer-name').value = '';
  modalOverlay.classList.add('active');
  setTimeout(() => document.getElementById('modal-claimer-name').focus(), 100);
}

function closeGiftModal() {
  modalOverlay.classList.remove('active');
  currentClaimGift = null;
}

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeGiftModal();
});

async function confirmClaim() {
  if (!currentClaimGift) return;
  const name = document.getElementById('modal-claimer-name').value.trim();
  if (!name) {
    document.getElementById('modal-claimer-name').style.borderColor = '#ff6666';
    return;
  }

  const gift = currentClaimGift;
  try {
    // Post claim to Firebase
    await fetch(`${FIREBASE_URL}/${gift.id}/claims.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, timestamp: Date.now() })
    });
    closeGiftModal();
    loadGiftStatus();
  } catch {
    alert('Could not save. Please try again.');
  }
}

async function loadGiftStatus() {
  const giftCards = document.querySelectorAll('.gift-card');

  try {
    const res = await fetch(`${FIREBASE_URL}.json`);
    const data = res.ok ? await res.json() : {};

    GIFTS.forEach((gift, i) => {
      const card = giftCards[i];
      if (!card) return;

      const claims = data && data[gift.id] && data[gift.id].claims
        ? Object.values(data[gift.id].claims)
        : [];
      const claimCount = claims.length;

      // Remove old status/buttons
      const oldStatus = card.querySelector('.gift-status');
      const oldBtn = card.querySelector('.gift-claim-btn');
      if (oldStatus) oldStatus.remove();
      if (oldBtn) oldBtn.remove();

      card.classList.remove('available', 'claimed', 'unlimited');

      if (gift.limit === 0) {
        // Unlimited (gift cards)
        card.classList.add('unlimited');
        const status = document.createElement('span');
        status.className = 'gift-status';
        status.textContent = claimCount > 0 ? `${claimCount} claimed` : 'Always welcome';
        card.appendChild(status);
        const btn = document.createElement('button');
        btn.className = 'gift-claim-btn';
        btn.textContent = "I'll get this";
        btn.onclick = () => openGiftModal(gift.id);
        card.appendChild(btn);
      } else if (claimCount >= gift.limit) {
        // Claimed
        card.classList.add('claimed');
        const status = document.createElement('span');
        status.className = 'gift-status';
        const claimer = claims[claims.length - 1].name;
        status.textContent = `Claimed by ${claimer}`;
        card.appendChild(status);
      } else {
        // Available
        card.classList.add('available');
        const status = document.createElement('span');
        status.className = 'gift-status';
        status.textContent = 'Available';
        card.appendChild(status);
        const btn = document.createElement('button');
        btn.className = 'gift-claim-btn';
        btn.textContent = "I'll get this";
        btn.onclick = () => openGiftModal(gift.id);
        card.appendChild(btn);
      }
    });
  } catch {
    // If Firebase is unavailable, just show gifts without claiming
    console.log('Gift tracking unavailable');
  }
}

// Load gift status on page load
document.addEventListener('DOMContentLoaded', loadGiftStatus);

// Handle Enter key in modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && modalOverlay.classList.contains('active')) {
    confirmClaim();
  }
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeGiftModal();
  }
});

/* ========== #22 SPLIT STAGGER — hero badge reveal ========== */
document.addEventListener('DOMContentLoaded', () => {
  const badge = document.getElementById('heroBadge');
  if (badge) setTimeout(() => badge.classList.add('stagger-play'), 350);
});

/* ========== #63 COUNTER UP — days until party ========== */
document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('countdownBanner');
  if (!banner) return;
  const numEl = banner.querySelector('.countdown-num');
  const unitEl = document.getElementById('countdownUnit');
  const target = new Date(numEl.dataset.targetDate + 'T00:00:00');
  const now = new Date();
  const diffMs = target - now;
  const days = Math.max(0, Math.ceil(diffMs / 86400000));

  if (days === 0) {
    banner.classList.add('party-day');
    numEl.textContent = '🎉';
    unitEl.textContent = 'It\'s today';
  } else {
    unitEl.textContent = days === 1 ? 'day' : 'days';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { numEl.textContent = days; return; }
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        let cur = 0;
        const step = Math.max(1, Math.ceil(days / 40));
        const tick = () => {
          cur += step;
          if (cur >= days) { numEl.textContent = days; return; }
          numEl.textContent = cur;
          requestAnimationFrame(tick);
        };
        tick();
        counterObs.unobserve(banner);
      });
    }, { threshold: 0.35 });
    counterObs.observe(banner);
  }
});

/* ========== #64 CONFETTI BURST ========== */
function fireConfetti(anchorEl) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#00c8ff', '#0080ff', '#ffd700', '#ff6b9d', '#7aeb34', '#ffffff'];
  const root = document.createElement('div');
  root.className = 'confetti-root';
  document.body.appendChild(root);

  // Origin: center of the success message (or viewport center fallback)
  const rect = anchorEl ? anchorEl.getBoundingClientRect() : null;
  const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const originY = rect ? rect.top + 20 : window.innerHeight / 2;

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = originX + 'px';
    piece.style.top = originY + 'px';
    // Radial launch + gravity-ish fall
    const angle = Math.random() * Math.PI * 2;
    const radius = 120 + Math.random() * 220;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius * 0.4 + 260 + Math.random() * 180; // gravity bias
    piece.style.setProperty('--dx', dx + 'px');
    piece.style.setProperty('--dy', dy + 'px');
    piece.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    piece.style.animationDelay = (Math.random() * 0.15) + 's';
    // Vary piece shapes
    if (Math.random() > 0.5) piece.style.borderRadius = '50%';
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (10 + Math.random() * 10) + 'px';
    root.appendChild(piece);
  }

  setTimeout(() => root.remove(), 1900);
}

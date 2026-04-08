/* ========== VANTA.JS BACKGROUND ========== */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof VANTA !== 'undefined') {
    VANTA.NET({
      el: '#hero-bg',
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x00c8ff,
      backgroundColor: 0x0a0e1a,
      points: 8,
      maxDistance: 22,
      spacing: 18,
      showDots: true
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
    document.getElementById('rsvp-success').style.display = 'block';
    document.getElementById('rsvp-success').classList.add('visible');
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
  { id: 'skateboard', name: 'Skateboard', limit: 1 }
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

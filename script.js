/**
 * Mindset → Place Recommender
 * ──────────────────────────────────────────────────────────────────────────────
 * ALGORITHM OVERVIEW
 * ──────────────────────────────────────────────────────────────────────────────
 * 1. Each place in PLACES has ten attribute scores (0–10).
 * 2. Each mindset in MINDSET_WEIGHTS defines a weight vector over those same
 *    attributes — capturing how much each attribute matters for that mindset.
 * 3. recommend(mindsetId) computes a dot-product score for every place:
 *        score = Σ  weight[attr] × place.tags[attr]
 * 4. Places are sorted descending by score and the top 10 are returned.
 *
 * This lets the same place appear across multiple mindsets at different ranks,
 * producing genuinely tailored, overlap-aware rankings rather than fixed lists.
 */

// ─── PLACE MASTER POOL ────────────────────────────────────────────────────────
// tags: { relaxed, adventurous, romantic, cultural, nature, party, family, solo, budget, luxury }
// All scores 0–10; note: one or two vivid sentences about the destination.
const PLACES = [
  {
    name: 'Maldives', country: 'South Asia', icon: '🏝️',
    note: 'Turquoise atolls and overwater bungalows where silence is the loudest thing you\'ll hear.',
    tags: { relaxed:9, adventurous:3, romantic:9, cultural:2, nature:7, party:1, family:6, solo:4, budget:1, luxury:10 },
  },
  {
    name: 'Bali', country: 'Indonesia', icon: '🌺',
    note: 'A spiritual island of emerald rice terraces, temple incense, and world-class surf breaks.',
    tags: { relaxed:8, adventurous:5, romantic:7, cultural:7, nature:7, party:4, family:7, solo:8, budget:7, luxury:5 },
  },
  {
    name: 'Santorini', country: 'Greece', icon: '🌅',
    note: 'Whitewashed cliffs tumbling into the Aegean — sunsets here are genuinely life-changing.',
    tags: { relaxed:7, adventurous:2, romantic:9, cultural:6, nature:5, party:3, family:4, solo:6, budget:3, luxury:7 },
  },
  {
    name: 'Paris', country: 'France', icon: '🗼',
    note: 'Every street corner is a painting; pair a croissant with the Louvre for the perfect morning.',
    tags: { relaxed:5, adventurous:2, romantic:10, cultural:9, nature:2, party:5, family:6, solo:7, budget:2, luxury:8 },
  },
  {
    name: 'Queenstown', country: 'New Zealand', icon: '🪂',
    note: 'The undisputed adrenaline capital of the world — bungee, skydive, and ski all before lunch.',
    tags: { relaxed:3, adventurous:10, romantic:5, cultural:3, nature:8, party:4, family:5, solo:7, budget:4, luxury:5 },
  },
  {
    name: 'Patagonia', country: 'Chile / Argentina', icon: '⛰️',
    note: 'Jagged granite towers, glacial lakes, and winds that make you feel wonderfully insignificant.',
    tags: { relaxed:4, adventurous:10, romantic:5, cultural:2, nature:10, party:1, family:3, solo:8, budget:4, luxury:3 },
  },
  {
    name: 'Rome', country: 'Italy', icon: '🏛️',
    note: 'Two thousand years of empire compacted into cobblestone streets, gelato, and golden fountains.',
    tags: { relaxed:5, adventurous:2, romantic:7, cultural:10, nature:2, party:5, family:7, solo:7, budget:4, luxury:6 },
  },
  {
    name: 'Kyoto', country: 'Japan', icon: '⛩️',
    note: 'Bamboo groves, geisha districts, and a thousand shrines cloaked in cherry blossoms each spring.',
    tags: { relaxed:7, adventurous:2, romantic:8, cultural:10, nature:6, party:2, family:7, solo:8, budget:5, luxury:6 },
  },
  {
    name: 'Ibiza', country: 'Spain', icon: '🎧',
    note: 'Legendary clubs, cliffside chiringuitos, and sunrises that blur into the next night\'s party.',
    tags: { relaxed:3, adventurous:4, romantic:5, cultural:3, nature:3, party:10, family:2, solo:6, budget:3, luxury:7 },
  },
  {
    name: 'Bangkok', country: 'Thailand', icon: '🛺',
    note: 'A neon-lit labyrinth of street food, Buddhist temples, and rooftop bars — never a dull moment.',
    tags: { relaxed:4, adventurous:6, romantic:4, cultural:8, nature:3, party:8, family:5, solo:9, budget:9, luxury:4 },
  },
  {
    name: 'Hoi An', country: 'Vietnam', icon: '🏮',
    note: 'Lantern-lit ancient town where tailor shops and pho noodles compete for your attention.',
    tags: { relaxed:7, adventurous:3, romantic:7, cultural:8, nature:4, party:2, family:6, solo:9, budget:10, luxury:2 },
  },
  {
    name: 'Seychelles', country: 'Indian Ocean', icon: '🌿',
    note: 'Rare granite boulders cradle powder-white beaches in one of Earth\'s last unspoiled paradises.',
    tags: { relaxed:9, adventurous:3, romantic:8, cultural:2, nature:8, party:2, family:5, solo:5, budget:1, luxury:9 },
  },
  {
    name: 'Banff', country: 'Canada', icon: '🦌',
    note: 'Glacier-fed turquoise lakes, grizzly sightings, and ski runs that stretch to the horizon.',
    tags: { relaxed:6, adventurous:8, romantic:6, cultural:3, nature:10, party:2, family:7, solo:7, budget:4, luxury:5 },
  },
  {
    name: 'Venice', country: 'Italy', icon: '🛶',
    note: 'A city that defies logic — no cars, just canals, gondolas, and an atmosphere from another era.',
    tags: { relaxed:7, adventurous:2, romantic:10, cultural:8, nature:3, party:3, family:5, solo:6, budget:3, luxury:7 },
  },
  {
    name: 'Machu Picchu', country: 'Peru', icon: '🦙',
    note: 'Cloud-kissed Incan citadel that rewards every steep switchback with a view from the gods.',
    tags: { relaxed:4, adventurous:9, romantic:5, cultural:9, nature:9, party:1, family:4, solo:8, budget:5, luxury:3 },
  },
  {
    name: 'Istanbul', country: 'Turkey', icon: '🕌',
    note: 'Where East meets West across the Bosphorus — spiced bazaars, Byzantine domes, and raki nights.',
    tags: { relaxed:5, adventurous:4, romantic:6, cultural:10, nature:2, party:5, family:6, solo:7, budget:6, luxury:5 },
  },
  {
    name: 'Reykjavik', country: 'Iceland', icon: '🌋',
    note: 'Chase the Northern Lights by night, then hike lava fields and soak in geothermal pools by day.',
    tags: { relaxed:5, adventurous:9, romantic:6, cultural:4, nature:10, party:3, family:5, solo:8, budget:3, luxury:5 },
  },
  {
    name: 'Lisbon', country: 'Portugal', icon: '🎵',
    note: 'Fado music drifts from tiled alleyways in one of Europe\'s most walkable and soulful capitals.',
    tags: { relaxed:7, adventurous:3, romantic:6, cultural:7, nature:3, party:6, family:6, solo:10, budget:7, luxury:4 },
  },
  {
    name: 'Dubai', country: 'UAE', icon: '🌆',
    note: 'Impossible architecture, indoor skiing, and dining at 828 m — ambition made into skyline.',
    tags: { relaxed:5, adventurous:5, romantic:5, cultural:5, nature:1, party:6, family:9, solo:6, budget:2, luxury:10 },
  },
  {
    name: 'Chiang Mai', country: 'Thailand', icon: '🪷',
    note: 'Ancient moat-ringed city famed for night markets, elephant sanctuaries, and $3 massages.',
    tags: { relaxed:7, adventurous:5, romantic:4, cultural:7, nature:6, party:3, family:6, solo:9, budget:10, luxury:2 },
  },
  {
    name: 'Serengeti', country: 'Tanzania', icon: '🦁',
    note: 'Two million wildebeest migrating across gold savanna — nature\'s greatest show, live.',
    tags: { relaxed:4, adventurous:8, romantic:5, cultural:4, nature:10, party:1, family:6, solo:6, budget:3, luxury:6 },
  },
  {
    name: 'Bora Bora', country: 'French Polynesia', icon: '🐚',
    note: 'Pearl of the Pacific — lagoon so vivid it looks photoshopped, every bungalow above still water.',
    tags: { relaxed:9, adventurous:3, romantic:9, cultural:1, nature:7, party:2, family:4, solo:4, budget:1, luxury:10 },
  },
  {
    name: 'Barcelona', country: 'Spain', icon: '💃',
    note: 'Gaudí\'s fantastical architecture, tapas at midnight, and beaches steps from the Gothic Quarter.',
    tags: { relaxed:5, adventurous:4, romantic:6, cultural:8, nature:3, party:9, family:7, solo:7, budget:5, luxury:6 },
  },
  {
    name: 'Norwegian Fjords', country: 'Norway', icon: '🏔️',
    note: 'Razor-edged cliffs plunge into mirror fjords — kayak beneath waterfalls that fall from clouds.',
    tags: { relaxed:7, adventurous:7, romantic:6, cultural:5, nature:10, party:2, family:6, solo:7, budget:2, luxury:7 },
  },
  {
    name: 'Marrakech', country: 'Morocco', icon: '🪬',
    note: 'Step into the Medina and every sense is ambushed — spice towers, call to prayer, and hand-loomed rugs.',
    tags: { relaxed:4, adventurous:5, romantic:6, cultural:10, nature:2, party:4, family:5, solo:7, budget:7, luxury:5 },
  },
  {
    name: 'Amalfi Coast', country: 'Italy', icon: '🍋',
    note: 'Lemon trees and pastel villages cling to vertiginous cliffs above the bluest stretch of Italy\'s sea.',
    tags: { relaxed:7, adventurous:3, romantic:9, cultural:6, nature:6, party:3, family:5, solo:5, budget:3, luxury:8 },
  },
  {
    name: 'Singapore', country: 'Southeast Asia', icon: '🦁',
    note: 'A spotless city-state where supertrees glow at night and hawker stalls serve Michelin-starred plates.',
    tags: { relaxed:5, adventurous:4, romantic:5, cultural:7, nature:4, party:6, family:10, solo:7, budget:4, luxury:7 },
  },
  {
    name: 'Tbilisi', country: 'Georgia', icon: '🍷',
    note: 'Wine capital of the ancient world, with sulfurous bathhouses, cave monasteries, and dirt-cheap eats.',
    tags: { relaxed:6, adventurous:5, romantic:5, cultural:8, nature:5, party:4, family:5, solo:9, budget:10, luxury:2 },
  },
  {
    name: 'Mykonos', country: 'Greece', icon: '🍾',
    note: 'Iconic windmills by day, open-air superclubs by night — Greece\'s most glamorous playground.',
    tags: { relaxed:6, adventurous:2, romantic:7, cultural:4, nature:4, party:9, family:3, solo:5, budget:2, luxury:8 },
  },
  {
    name: 'Budapest', country: 'Hungary', icon: '🏊',
    note: 'Grand thermal bathhouses, ruin bars, and a Danube panorama that UNESCO couldn\'t help but protect.',
    tags: { relaxed:6, adventurous:3, romantic:7, cultural:8, nature:3, party:7, family:5, solo:9, budget:8, luxury:4 },
  },
  {
    name: 'Cape Town', country: 'South Africa', icon: '🦅',
    note: 'Table Mountain above, Atlantic below — wine valleys, penguins, and the wildest sunsets on the cape.',
    tags: { relaxed:5, adventurous:8, romantic:6, cultural:6, nature:8, party:5, family:6, solo:7, budget:5, luxury:6 },
  },
  {
    name: 'Monaco', country: 'French Riviera', icon: '🎰',
    note: 'Pocket-sized principality built for superyachts, Formula 1 drama, and caviar at sea level.',
    tags: { relaxed:5, adventurous:2, romantic:7, cultural:5, nature:2, party:7, family:4, solo:4, budget:1, luxury:10 },
  },
  {
    name: 'Galápagos Islands', country: 'Ecuador', icon: '🐢',
    note: 'Walk among sea lions and blue-footed boobies that simply have never learned to fear humans.',
    tags: { relaxed:5, adventurous:7, romantic:5, cultural:3, nature:10, party:1, family:6, solo:6, budget:3, luxury:5 },
  },
  {
    name: 'Medellín', country: 'Colombia', icon: '🌸',
    note: 'Once the world\'s most dangerous city, now a vibrant hub of innovation, street art, and eternal spring.',
    tags: { relaxed:5, adventurous:5, romantic:5, cultural:7, nature:5, party:7, family:4, solo:9, budget:9, luxury:3 },
  },
  {
    name: 'Kerala', country: 'India', icon: '🌴',
    note: 'Houseboat glides through palm-fringed backwaters while Kathakali dancers paint stories at sunset.',
    tags: { relaxed:8, adventurous:4, romantic:6, cultural:8, nature:8, party:2, family:8, solo:6, budget:8, luxury:4 },
  },
  {
    name: 'Aspen', country: 'Colorado, USA', icon: '⛷️',
    note: 'World-class ski runs by day, celebrity-spotted restaurants and jazz bars in the snowy evenings.',
    tags: { relaxed:6, adventurous:7, romantic:6, cultural:3, nature:7, party:5, family:6, solo:5, budget:2, luxury:9 },
  },
  {
    name: 'Zanzibar', country: 'Tanzania', icon: '🌙',
    note: 'Clove-scented Stone Town meets dhow-sailing sunsets and reefs that glow neon beneath the tide.',
    tags: { relaxed:8, adventurous:4, romantic:8, cultural:5, nature:7, party:3, family:5, solo:6, budget:5, luxury:6 },
  },
  {
    name: 'Krakow', country: 'Poland', icon: '🏰',
    note: 'Medieval market square alive with street musicians, hearty pierogi, and an extraordinary castle.',
    tags: { relaxed:6, adventurous:2, romantic:6, cultural:8, nature:3, party:6, family:6, solo:7, budget:10, luxury:3 },
  },
  {
    name: 'Great Barrier Reef', country: 'Australia', icon: '🐠',
    note: 'Dive into 2,300 km of living coral — the largest structure ever built by living organisms on Earth.',
    tags: { relaxed:6, adventurous:7, romantic:6, cultural:2, nature:10, party:1, family:7, solo:6, budget:3, luxury:6 },
  },
  {
    name: 'Tokyo', country: 'Japan', icon: '🏯',
    note: 'Hyper-efficient bullet trains connect ancient temples, anime alleyways, and three-star ramen shops.',
    tags: { relaxed:5, adventurous:5, romantic:6, cultural:9, nature:3, party:6, family:8, solo:9, budget:5, luxury:7 },
  },
];

// ─── MINDSET UI CONFIG ────────────────────────────────────────────────────────
// id, label, emoji, gradient colors for buttons & cards
const MINDSETS = [
  { id: 'relaxed',     label: 'Relaxed',     emoji: '😌', c1: '#4facfe', c2: '#00f2fe' },
  { id: 'adventurous', label: 'Adventurous', emoji: '🧗', c1: '#f97316', c2: '#fbbf24' },
  { id: 'romantic',    label: 'Romantic',    emoji: '💖', c1: '#f43f5e', c2: '#fb923c' },
  { id: 'cultural',    label: 'Cultural',    emoji: '🏛️', c1: '#8b5cf6', c2: '#ec4899' },
  { id: 'nature',      label: 'Nature',      emoji: '🌿', c1: '#22c55e', c2: '#16a34a' },
  { id: 'party',       label: 'Party',       emoji: '🎉', c1: '#a855f7', c2: '#ec4899' },
  { id: 'family',      label: 'Family',      emoji: '👨‍👩‍👧‍👦', c1: '#0ea5e9', c2: '#6366f1' },
  { id: 'solo',        label: 'Solo',        emoji: '🎒', c1: '#f59e0b', c2: '#10b981' },
  { id: 'budget',      label: 'Budget',      emoji: '💰', c1: '#84cc16', c2: '#06b6d4' },
  { id: 'luxury',      label: 'Luxury',      emoji: '💎', c1: '#d4af37', c2: '#b8860b' },
];

// ─── MINDSET WEIGHT VECTORS ───────────────────────────────────────────────────
// Each key maps to a weight for the corresponding place attribute.
// Weights are relative importance multipliers — they don't need to sum to 1.
const MINDSET_WEIGHTS = {
  relaxed:     { relaxed: 1.0, nature: 0.35, romantic: 0.20, luxury: 0.10 },
  adventurous: { adventurous: 1.0, nature: 0.55, solo: 0.15 },
  romantic:    { romantic: 1.0, relaxed: 0.30, luxury: 0.20, cultural: 0.10 },
  cultural:    { cultural: 1.0, solo: 0.20, romantic: 0.10, adventurous: 0.05 },
  nature:      { nature: 1.0, adventurous: 0.40, relaxed: 0.20 },
  party:       { party: 1.0, adventurous: 0.20, solo: 0.10, luxury: 0.05 },
  family:      { family: 1.0, relaxed: 0.25, cultural: 0.15, nature: 0.10 },
  solo:        { solo: 1.0, cultural: 0.30, adventurous: 0.15, budget: 0.10 },
  budget:      { budget: 1.0, solo: 0.30, cultural: 0.15, nature: 0.05 },
  luxury:      { luxury: 1.0, romantic: 0.30, relaxed: 0.20, party: 0.05 },
};

// ─── STATE ─────────────────────────────────────────────────────────────────────
let activeMindset = null;

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const moodGrid       = document.getElementById('moodGrid');
const resultsSection = document.getElementById('resultsSection');
const resultsTitle   = document.getElementById('resultsTitle');
const resultsGrid    = document.getElementById('resultsGrid');

// Modal refs
const modalBackdrop  = document.getElementById('modalBackdrop');
const modalIcon      = document.getElementById('modalIcon');
const modalTitle     = document.getElementById('modalTitle');
const modalGrid      = document.getElementById('modalGrid');
const modalClose     = document.getElementById('modalClose');

// ─── BUILD MOOD BUTTONS ───────────────────────────────────────────────────────
function buildMoodButtons() {
  MINDSETS.forEach(mindset => {
    const btn = document.createElement('button');
    btn.className = 'mood-btn';
    btn.id = `mood-${mindset.id}`;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.style.setProperty('--c1', mindset.c1);
    btn.style.setProperty('--c2', mindset.c2);
    btn.innerHTML = `<span>${mindset.emoji} ${mindset.label}</span>`;
    btn.addEventListener('click', () => selectMindset(mindset));
    moodGrid.appendChild(btn);
  });
}

// ─── SCORING ALGORITHM ────────────────────────────────────────────────────────
/**
 * recommend(mindsetId) → Array of top-10 place objects, each augmented with:
 *   .score    – raw weighted dot-product score
 *   .matchPct – score as a % of theoretical maximum (for display badge)
 */
function recommend(mindsetId) {
  const weights = MINDSET_WEIGHTS[mindsetId];

  // Dot-product score for every place
  const scored = PLACES.map(place => {
    const raw = Object.entries(weights).reduce((sum, [attr, w]) => {
      return sum + (place.tags[attr] ?? 0) * w;
    }, 0);
    return { ...place, score: raw };
  });

  // Theoretical max: every attribute scores 10
  const maxScore = Object.values(weights).reduce((s, w) => s + 10 * w, 0);

  scored.forEach(p => { p.matchPct = Math.round((p.score / maxScore) * 100); });
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 10);
}

// ─── CARD BUILDER ────────────────────────────────────────────────────────────
function buildCards(mindset, container) {
  const places = recommend(mindset.id);
  container.innerHTML = '';

  places.forEach((place, idx) => {
    const card = document.createElement('article');
    card.className = 'place-card';
    card.style.setProperty('--c1', mindset.c1);
    card.style.setProperty('--c2', mindset.c2);

    card.innerHTML = `
      <div class="place-num">${String(idx + 1).padStart(2, '0')}</div>
      <div class="place-info">
        <div class="place-name-row">
          <div class="place-name">${place.name}</div>
          <div class="place-match" title="Match score">${place.matchPct}%</div>
        </div>
        <div class="place-country">${place.country}</div>
        <p class="place-note">${place.note}</p>
      </div>
      <div class="place-emoji">${place.icon}</div>
    `;
    container.appendChild(card);
  });
}

// ─── MODAL HELPERS ────────────────────────────────────────────────────────────
function openModal(mindset) {
  modalIcon.textContent  = mindset.emoji;
  modalTitle.textContent = `Top 10 places for a ${mindset.label} mindset`;
  buildCards(mindset, modalGrid);
  modalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

// Close on ✕ button
modalClose.addEventListener('click', closeModal);

// Close on backdrop click (outside .modal)
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) closeModal();
});

// ─── SELECT MINDSET ───────────────────────────────────────────────────────────
function selectMindset(mindset) {
  // Update active button
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-checked', 'false');
  });
  const activeBtn = document.getElementById(`mood-${mindset.id}`);
  activeBtn.classList.add('active');
  activeBtn.setAttribute('aria-checked', 'true');

  activeMindset = mindset;

  // Open modal with recommendations
  openModal(mindset);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
buildMoodButtons();


/**
 * Mindset → Place Recommender
 * A simple rule-based model: maps each mindset to 10 curated destinations.
 */

// ─── DATA MODEL ───────────────────────────────────────────────────────────────
// Each mindset has: emoji, gradient colors, and 10 places
// Each place has:  name, country/region, emoji icon
const MINDSETS = [
  {
    id: 'relaxed',
    label: 'Relaxed',
    emoji: '😌',
    c1: '#4facfe', c2: '#00f2fe',
    places: [
      { name: 'Maldives',         country: 'South Asia',        icon: '🏝️' },
      { name: 'Bali',             country: 'Indonesia',         icon: '🌺' },
      { name: 'Santorini',        country: 'Greece',            icon: '🤍' },
      { name: 'Lake Como',        country: 'Italy',             icon: '⛵' },
      { name: 'Phuket',           country: 'Thailand',          icon: '🌅' },
      { name: 'Maui',             country: 'Hawaii, USA',       icon: '🌊' },
      { name: 'Tuscany',          country: 'Italy',             icon: '🍷' },
      { name: 'Bora Bora',        country: 'French Polynesia',  icon: '🐚' },
      { name: 'Costa Rica',       country: 'Central America',   icon: '🦜' },
      { name: 'Seychelles',       country: 'Indian Ocean',      icon: '🌿' },
    ],
  },
  {
    id: 'adventurous',
    label: 'Adventurous',
    emoji: '🧗',
    c1: '#f97316', c2: '#fbbf24',
    places: [
      { name: 'Queenstown',       country: 'New Zealand',       icon: '🪂' },
      { name: 'Patagonia',        country: 'Chile/Argentina',   icon: '⛰️' },
      { name: 'Moab',             country: 'Utah, USA',         icon: '🏜️' },
      { name: 'Interlaken',       country: 'Switzerland',       icon: '🏔️' },
      { name: 'Reykjavik',        country: 'Iceland',           icon: '🌋' },
      { name: 'Banff',            country: 'Canada',            icon: '🐻' },
      { name: 'Machu Picchu',     country: 'Peru',              icon: '🦙' },
      { name: 'Cape Town',        country: 'South Africa',      icon: '🦅' },
      { name: 'Yosemite',         country: 'California, USA',   icon: '🧊' },
      { name: 'Mount Kilimanjaro',country: 'Tanzania',          icon: '🗻' },
    ],
  },
  {
    id: 'romantic',
    label: 'Romantic',
    emoji: '💖',
    c1: '#f43f5e', c2: '#fb923c',
    places: [
      { name: 'Paris',            country: 'France',            icon: '🗼' },
      { name: 'Venice',           country: 'Italy',             icon: '🛶' },
      { name: 'Kyoto',            country: 'Japan',             icon: '🌸' },
      { name: 'Prague',           country: 'Czech Republic',    icon: '🏰' },
      { name: 'Santorini',        country: 'Greece',            icon: '🌅' },
      { name: 'Udaipur',          country: 'India',             icon: '🕌' },
      { name: 'Bruges',           country: 'Belgium',           icon: '🍫' },
      { name: 'Côte d\'Azur',     country: 'France',            icon: '⛵' },
      { name: 'Amalfi Coast',     country: 'Italy',             icon: '🍋' },
      { name: 'Zanzibar',         country: 'Tanzania',          icon: '🌙' },
    ],
  },
  {
    id: 'cultural',
    label: 'Cultural',
    emoji: '🏛️',
    c1: '#8b5cf6', c2: '#ec4899',
    places: [
      { name: 'Rome',             country: 'Italy',             icon: '🏛️' },
      { name: 'Cairo',            country: 'Egypt',             icon: '🔺' },
      { name: 'Istanbul',         country: 'Turkey',            icon: '🕌' },
      { name: 'Beijing',          country: 'China',             icon: '🐉' },
      { name: 'Marrakech',        country: 'Morocco',           icon: '🪬' },
      { name: 'Athens',           country: 'Greece',            icon: '🏺' },
      { name: 'Mexico City',      country: 'Mexico',            icon: '🌮' },
      { name: 'Kyoto',            country: 'Japan',             icon: '⛩️' },
      { name: 'Varanasi',         country: 'India',             icon: '🪔' },
      { name: 'Cartagena',        country: 'Colombia',          icon: '🎨' },
    ],
  },
  {
    id: 'nature',
    label: 'Nature',
    emoji: '🌿',
    c1: '#22c55e', c2: '#16a34a',
    places: [
      { name: 'Yellowstone',      country: 'Wyoming, USA',      icon: '🦬' },
      { name: 'Amazon Rainforest',country: 'Brazil',            icon: '🐍' },
      { name: 'Galápagos Islands',country: 'Ecuador',           icon: '🐢' },
      { name: 'Serengeti',        country: 'Tanzania',          icon: '🦁' },
      { name: 'Plitvice Lakes',   country: 'Croatia',           icon: '💧' },
      { name: 'Great Barrier Reef',country:'Australia',         icon: '🐠' },
      { name: 'Fiordland',        country: 'New Zealand',       icon: '🌊' },
      { name: 'Norwegian Fjords', country: 'Norway',            icon: '🏔️' },
      { name: 'Banff',            country: 'Canada',            icon: '🦌' },
      { name: 'Lake District',    country: 'UK',                icon: '🌧️' },
    ],
  },
  {
    id: 'party',
    label: 'Party',
    emoji: '🎉',
    c1: '#a855f7', c2: '#ec4899',
    places: [
      { name: 'Ibiza',            country: 'Spain',             icon: '🎧' },
      { name: 'Miami Beach',      country: 'Florida, USA',      icon: '🩴' },
      { name: 'Mykonos',          country: 'Greece',            icon: '🍹' },
      { name: 'Barcelona',        country: 'Spain',             icon: '💃' },
      { name: 'Berlin',           country: 'Germany',           icon: '🎶' },
      { name: 'Las Vegas',        country: 'Nevada, USA',       icon: '🎰' },
      { name: 'Rio de Janeiro',   country: 'Brazil',            icon: '🥁' },
      { name: 'Cancún',           country: 'Mexico',            icon: '🌊' },
      { name: 'Bangkok',          country: 'Thailand',          icon: '🛺' },
      { name: 'Tel Aviv',         country: 'Israel',            icon: '🕺' },
    ],
  },
  {
    id: 'family',
    label: 'Family',
    emoji: '👨‍👩‍👧‍👦',
    c1: '#0ea5e9', c2: '#6366f1',
    places: [
      { name: 'Orlando',          country: 'Florida, USA',      icon: '🎢' },
      { name: 'Tokyo Disneyland', country: 'Japan',             icon: '🏯' },
      { name: 'Copenhagen',       country: 'Denmark',           icon: '🧜' },
      { name: 'Gold Coast',       country: 'Australia',         icon: '🏄' },
      { name: 'Hawaii',           country: 'USA',               icon: '🌺' },
      { name: 'Vancouver',        country: 'Canada',            icon: '🍁' },
      { name: 'Dubai',            country: 'UAE',               icon: '🏙️' },
      { name: 'Singapore',        country: 'Southeast Asia',    icon: '🦁' },
      { name: 'Kerala',           country: 'India',             icon: '🌴' },
      { name: 'Barcelona',        country: 'Spain',             icon: '⛪' },
    ],
  },
  {
    id: 'solo',
    label: 'Solo',
    emoji: '🎒',
    c1: '#f59e0b', c2: '#10b981',
    places: [
      { name: 'Lisbon',           country: 'Portugal',          icon: '🎵' },
      { name: 'Chiang Mai',       country: 'Thailand',          icon: '🛖' },
      { name: 'Seoul',            country: 'South Korea',       icon: '🍜' },
      { name: 'Budapest',         country: 'Hungary',           icon: '🏊' },
      { name: 'Edinburgh',        country: 'Scotland',          icon: '🏰' },
      { name: 'Melbourne',        country: 'Australia',         icon: '☕' },
      { name: 'Tallinn',          country: 'Estonia',           icon: '🏙️' },
      { name: 'Medellín',         country: 'Colombia',          icon: '🌸' },
      { name: 'Porto',            country: 'Portugal',          icon: '🍷' },
      { name: 'Dublin',           country: 'Ireland',           icon: '🍀' },
    ],
  },
  {
    id: 'budget',
    label: 'Budget',
    emoji: '💰',
    c1: '#84cc16', c2: '#06b6d4',
    places: [
      { name: 'Hoi An',           country: 'Vietnam',           icon: '🏮' },
      { name: 'Krakow',           country: 'Poland',            icon: '🏰' },
      { name: 'Sofia',            country: 'Bulgaria',          icon: '⛪' },
      { name: 'La Paz',           country: 'Bolivia',           icon: '🏔️' },
      { name: 'Tbilisi',          country: 'Georgia',           icon: '🍷' },
      { name: 'Chiang Mai',       country: 'Thailand',          icon: '🪷' },
      { name: 'Zadar',            country: 'Croatia',           icon: '🌊' },
      { name: 'Granada',          country: 'Spain',             icon: '🏛️' },
      { name: 'Lombok',           country: 'Indonesia',         icon: '🌴' },
      { name: 'Kathmandu',        country: 'Nepal',             icon: '⛰️' },
    ],
  },
  {
    id: 'luxury',
    label: 'Luxury',
    emoji: '💎',
    c1: '#d4af37', c2: '#b8860b',
    places: [
      { name: 'Monaco',           country: 'French Riviera',    icon: '🎰' },
      { name: 'Maldives',         country: 'South Asia',        icon: '🏝️' },
      { name: 'Dubai',            country: 'UAE',               icon: '🌆' },
      { name: 'Bora Bora',        country: 'French Polynesia',  icon: '🐚' },
      { name: 'St. Barts',        country: 'Caribbean',         icon: '⛵' },
      { name: 'Aspen',            country: 'Colorado, USA',     icon: '⛷️' },
      { name: 'Mykonos',          country: 'Greece',            icon: '🍾' },
      { name: 'Paris',            country: 'France',            icon: '👜' },
      { name: 'Amalfi Coast',     country: 'Italy',             icon: '🌊' },
      { name: 'Seychelles',       country: 'Indian Ocean',      icon: '🦀' },
    ],
  },
];

// ─── STATE ─────────────────────────────────────────────────────────────────────
let activeMindset = null;

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const moodGrid      = document.getElementById('moodGrid');
const resultsSection = document.getElementById('resultsSection');
const resultsTitle  = document.getElementById('resultsTitle');
const resultsGrid   = document.getElementById('resultsGrid');

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

// ─── RECOMMENDATION ENGINE ────────────────────────────────────────────────────
function recommend(mindset) {
  return mindset.places;  // rule-based: return the 10 pre-curated places
}

// ─── RENDER RESULTS ───────────────────────────────────────────────────────────
function renderResults(mindset) {
  const places = recommend(mindset);

  // Update header
  resultsTitle.textContent = `✨ Top 10 places for a ${mindset.label} mindset`;

  // Clear grid
  resultsGrid.innerHTML = '';

  // Create cards
  places.forEach((place, idx) => {
    const card = document.createElement('article');
    card.className = 'place-card';
    card.style.setProperty('--c1', mindset.c1);
    card.style.setProperty('--c2', mindset.c2);

    card.innerHTML = `
      <div class="place-num">${String(idx + 1).padStart(2, '0')}</div>
      <div class="place-info">
        <div class="place-name">${place.name}</div>
        <div class="place-country">${place.country}</div>
      </div>
      <div class="place-emoji">${place.icon}</div>
    `;
    resultsGrid.appendChild(card);
  });

  // Show section with animation reset trick
  resultsSection.style.display = 'block';
  resultsSection.style.animation = 'none';
  void resultsSection.offsetWidth; // reflow
  resultsSection.style.animation = '';
}

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
  renderResults(mindset);

  // Smooth scroll to results
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
buildMoodButtons();
// Auto-select first mindset on load
selectMindset(MINDSETS[0]);

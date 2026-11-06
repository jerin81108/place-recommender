/**
 * Mindset & Multi-Model Place Recommender
 * ──────────────────────────────────────────────────────────────────────────────
 * ALGORITHM & MODEL ARCHITECTURE
 * ──────────────────────────────────────────────────────────────────────────────
 * 1. Master Pool: 40 global destinations each characterized across 10 dimensions:
 *    [relaxed, adventurous, romantic, cultural, nature, party, family, solo, budget, luxury] (0–10).
 *
 * 2. Selectable Recommendation Models:
 *    - Model A: Weighted Utility (Linear Dot-Product with importance multipliers)
 *    - Model B: Cosine Similarity (Vector angle orientation in 10D space)
 *    - Model C: K-Nearest Neighbors / KNN (Weighted Euclidean distance in feature space)
 *    - Model D: Hybrid MMR (Maximal Marginal Relevance balancing relevance & diversity)
 *
 * 3. Dynamic Preference Sources:
 *    - Preset Mindsets (supports multi-selection blending!)
 *    - Custom Trait Mixer (10 real-time continuous sliders)
 *    - Destination Twin (Item-to-Item content filtering using any place as anchor)
 */

// ─── ATTRIBUTE DIMENSIONS ──────────────────────────────────────────────────────
const ATTRIBUTES = [
  'relaxed',
  'adventurous',
  'romantic',
  'cultural',
  'nature',
  'party',
  'family',
  'solo',
  'budget',
  'luxury'
];

const ATTR_META = {
  relaxed:     { label: 'Relaxed',     icon: '😌', color: '#38bdf8' },
  adventurous: { label: 'Adventurous', icon: '🧗', color: '#fb923c' },
  romantic:    { label: 'Romantic',    icon: '💖', color: '#f43f5e' },
  cultural:    { label: 'Cultural',    icon: '🏛️', color: '#c084fc' },
  nature:      { label: 'Nature',      icon: '🌿', color: '#4ade80' },
  party:       { label: 'Party',       icon: '🎉', color: '#ec4899' },
  family:      { label: 'Family',      icon: '👨‍👩‍👧‍👦', color: '#60a5fa' },
  solo:        { label: 'Solo',        icon: '🎒', color: '#facc15' },
  budget:      { label: 'Budget',      icon: '💰', color: '#a3e635' },
  luxury:      { label: 'Luxury',      icon: '💎', color: '#fbbf24' }
};

// ─── REGION LOOKUP ────────────────────────────────────────────────────────────
const REGION_MAP = {
  'Maldives': 'Asia',
  'Bali': 'Asia',
  'Santorini': 'Europe',
  'Paris': 'Europe',
  'Queenstown': 'Oceania',
  'Patagonia': 'Americas',
  'Rome': 'Europe',
  'Kyoto': 'Asia',
  'Ibiza': 'Europe',
  'Bangkok': 'Asia',
  'Hoi An': 'Asia',
  'Seychelles': 'Africa',
  'Banff': 'Americas',
  'Venice': 'Europe',
  'Machu Picchu': 'Americas',
  'Istanbul': 'Europe',
  'Reykjavik': 'Europe',
  'Lisbon': 'Europe',
  'Dubai': 'Asia',
  'Chiang Mai': 'Asia',
  'Serengeti': 'Africa',
  'Bora Bora': 'Oceania',
  'Barcelona': 'Europe',
  'Norwegian Fjords': 'Europe',
  'Marrakech': 'Africa',
  'Amalfi Coast': 'Europe',
  'Singapore': 'Asia',
  'Tbilisi': 'Europe',
  'Mykonos': 'Europe',
  'Budapest': 'Europe',
  'Cape Town': 'Africa',
  'Monaco': 'Europe',
  'Galápagos Islands': 'Americas',
  'Medellín': 'Americas',
  'Kerala': 'Asia',
  'Aspen': 'Americas',
  'Zanzibar': 'Africa',
  'Krakow': 'Europe',
  'Great Barrier Reef': 'Oceania',
  'Tokyo': 'Asia'
};

// ─── PLACE MASTER POOL (40 DESTINATIONS) ──────────────────────────────────────
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

// ─── MINDSET BASE WEIGHT VECTORS ──────────────────────────────────────────────
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

// ─── RECOMMENDATION MODELS METADATA ───────────────────────────────────────────
const MODELS = {
  weighted: {
    id: 'weighted',
    name: 'Weighted Utility Model',
    shortName: 'Weighted Utility',
    icon: '🎯',
    formula: 'Score = Σ (w_i × p_i)',
    description: 'Calculates a multi-attribute dot-product based on weight multipliers. Prioritizes destinations that excel in your top selected criteria.'
  },
  cosine: {
    id: 'cosine',
    name: 'Cosine Similarity Vector Model',
    shortName: 'Cosine Similarity',
    icon: '📐',
    formula: 'cos(θ) = (u · v) / (||u|| × ||v||)',
    description: 'Evaluates the directional angle between your preference vector and place profiles in 10-dimensional space. Rewards harmonious vibe alignment regardless of raw scale.'
  },
  knn: {
    id: 'knn',
    name: 'K-Nearest Neighbors (KNN) Distance',
    shortName: 'KNN Distance',
    icon: '🧭',
    formula: 'Sim = 1 - √( Σ w_i (u_i - p_i)² / Σ w_i )',
    description: 'Measures proximity in 10D feature space using weighted Euclidean distance. Best for finding destinations whose overall personality mirrors yours most accurately.'
  },
  mmr: {
    id: 'mmr',
    name: 'Hybrid MMR Diversity Model',
    shortName: 'Hybrid MMR Diversity',
    icon: '🔮',
    formula: 'MMR = λ × Rel(p) - (1-λ) × max(Sim(p,s))',
    description: 'Maximal Marginal Relevance balances high relevance (70%) with variety (30%) across geography and traits, preventing repetitive destinations and exposing hidden gems.'
  }
};

// ─── APPLICATION STATE ────────────────────────────────────────────────────────
const state = {
  activeModel: 'weighted',
  activeMode: 'mood', // 'mood' | 'mixer' | 'twin'
  selectedMoods: new Set(['relaxed']),
  mixerValues: {
    relaxed: 7,
    adventurous: 4,
    romantic: 6,
    cultural: 5,
    nature: 7,
    party: 2,
    family: 5,
    solo: 6,
    budget: 5,
    luxury: 6
  },
  twinPlaceName: 'Maldives',
  activeRegion: 'all',
  lastRecommendedPlaces: []
};

// ─── DOM ELEMENTS ─────────────────────────────────────────────────────────────
const modelTabs         = document.querySelectorAll('.model-tab');
const modelDescIcon     = document.getElementById('modelDescIcon');
const modelDescName     = document.getElementById('modelDescName');
const modelDescDetail   = document.getElementById('modelDescDetail');
const modelFormula      = document.getElementById('modelFormula');
const activeModelTag    = document.getElementById('activeModelTag');

const modeNavButtons    = document.querySelectorAll('.mode-nav-btn');
const paneMood          = document.getElementById('paneMood');
const paneMixer         = document.getElementById('paneMixer');
const paneTwin          = document.getElementById('paneTwin');

const moodGrid          = document.getElementById('moodGrid');
const clearMoodsBtn     = document.getElementById('clearMoodsBtn');

const traitSliderGrid   = document.getElementById('traitSliderGrid');
const presetAdventureBtn= document.getElementById('presetAdventureBtn');
const presetLuxuryBtn   = document.getElementById('presetLuxuryBtn');
const presetCulturalBtn = document.getElementById('presetCulturalBtn');
const resetMixerBtn     = document.getElementById('resetMixerBtn');

const twinSelect        = document.getElementById('twinSelect');
const twinPreviewCard   = document.getElementById('twinPreviewCard');

const regionButtons     = document.querySelectorAll('.region-btn');
const resultsTitle      = document.getElementById('resultsTitle');
const resultsSubtitle   = document.getElementById('resultsSubtitle');
const resultsCount      = document.getElementById('resultsCount');
const resultsGrid       = document.getElementById('resultsGrid');

const modalBackdrop     = document.getElementById('modalBackdrop');
const modalIcon         = document.getElementById('modalIcon');
const modalTitle        = document.getElementById('modalTitle');
const modalSubtitle     = document.getElementById('modalSubtitle');
const modalBody         = document.getElementById('modalBody');
const modalClose        = document.getElementById('modalClose');

// ─── MATHEMATICAL VECTOR & SIMILARITY FUNCTIONS ───────────────────────────────
function dotProduct(vecA, vecB) {
  let sum = 0;
  for (const attr of ATTRIBUTES) {
    sum += (vecA[attr] || 0) * (vecB[attr] || 0);
  }
  return sum;
}

function vectorMagnitude(vec) {
  let sumSq = 0;
  for (const attr of ATTRIBUTES) {
    const val = vec[attr] || 0;
    sumSq += val * val;
  }
  return Math.sqrt(sumSq);
}

function cosineSimilarity(vecA, vecB) {
  const magA = vectorMagnitude(vecA);
  const magB = vectorMagnitude(vecB);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(vecA, vecB) / (magA * magB);
}

// ─── MODEL 1: WEIGHTED UTILITY ────────────────────────────────────────────────
function computeWeightedScore(prefVector, placeTags) {
  let raw = 0;
  let maxPossible = 0;
  for (const attr of ATTRIBUTES) {
    const w = prefVector[attr] || 0;
    const p = placeTags[attr] || 0;
    raw += w * p;
    maxPossible += w * 10;
  }
  const pct = maxPossible > 0 ? Math.round((raw / maxPossible) * 100) : 0;
  return {
    rawScore: raw,
    matchPct: Math.min(100, Math.max(0, pct))
  };
}

// ─── MODEL 2: COSINE SIMILARITY ───────────────────────────────────────────────
function computeCosineScore(prefVector, placeTags) {
  const sim = cosineSimilarity(prefVector, placeTags);
  const pct = Math.round(Math.min(1, Math.max(0, sim)) * 100);
  return {
    rawScore: sim,
    matchPct: pct
  };
}

// ─── MODEL 3: KNN FEATURE SPACE DISTANCE ──────────────────────────────────────
function computeKnnScore(prefVector, placeTags) {
  let weightedSqDist = 0;
  let totalWeight = 0;

  let maxW = 0;
  for (const attr of ATTRIBUTES) {
    if ((prefVector[attr] || 0) > maxW) maxW = prefVector[attr];
  }
  if (maxW === 0) maxW = 1;

  for (const attr of ATTRIBUTES) {
    const w = prefVector[attr] || 0;
    if (w <= 0) continue;

    const targetVal = (w / maxW) * 10;
    const placeVal = placeTags[attr] || 0;
    const diff = (targetVal - placeVal) / 10; // normalized to [-1, 1]

    weightedSqDist += w * (diff * diff);
    totalWeight += w;
  }

  if (totalWeight === 0) return { rawScore: 0, matchPct: 50 };

  const normDist = Math.sqrt(weightedSqDist / totalWeight); // in [0, 1]
  const sim = Math.max(0, 1 - normDist);
  const pct = Math.round(sim * 100);
  return {
    rawScore: sim,
    matchPct: pct
  };
}

// ─── MODEL 4: HYBRID MMR (MAXIMAL MARGINAL RELEVANCE) ─────────────────────────
function computeMmrRecommendations(prefVector, candidatePlaces, topK = 10, lambda = 0.72) {
  const scored = candidatePlaces.map(place => {
    const cosSim = cosineSimilarity(prefVector, place.tags);
    return {
      place,
      relevance: cosSim,
      tags: place.tags
    };
  });

  const selected = [];
  const remaining = [...scored];

  while (selected.length < topK && remaining.length > 0) {
    let bestScore = -Infinity;
    let bestIdx = -1;

    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i];
      let maxSimToSelected = 0;

      for (const sel of selected) {
        let sim = cosineSimilarity(cand.tags, sel.tags);
        // Region proximity factor to encourage continental diversity
        if (cand.place.country === sel.country || REGION_MAP[cand.place.name] === REGION_MAP[sel.name]) {
          sim = Math.min(1, sim + 0.15);
        }
        if (sim > maxSimToSelected) maxSimToSelected = sim;
      }

      const mmrScore = selected.length === 0
        ? cand.relevance
        : (lambda * cand.relevance) - ((1 - lambda) * maxSimToSelected);

      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0) {
      const chosen = remaining.splice(bestIdx, 1)[0];
      const matchPct = Math.round(Math.min(1, Math.max(0, chosen.relevance)) * 100);
      selected.push({
        ...chosen.place,
        rawScore: bestScore,
        matchPct: matchPct
      });
    } else {
      break;
    }
  }

  return selected;
}

// ─── GET ACTIVE USER PREFERENCE VECTOR ────────────────────────────────────────
function getActiveUserVector() {
  const vec = {};
  for (const attr of ATTRIBUTES) vec[attr] = 0;

  if (state.activeMode === 'mood') {
    if (state.selectedMoods.size === 0) {
      // Default to neutral / equal preference
      for (const attr of ATTRIBUTES) vec[attr] = 1;
      return vec;
    }

    state.selectedMoods.forEach(moodId => {
      const weights = MINDSET_WEIGHTS[moodId] || {};
      for (const [attr, val] of Object.entries(weights)) {
        vec[attr] = (vec[attr] || 0) + val;
      }
    });

    // Normalize so highest weight is ~1.0
    const maxVal = Math.max(...Object.values(vec));
    if (maxVal > 0) {
      for (const attr of ATTRIBUTES) vec[attr] = (vec[attr] / maxVal);
    }
    return vec;
  }

  if (state.activeMode === 'mixer') {
    for (const attr of ATTRIBUTES) {
      vec[attr] = (state.mixerValues[attr] || 0) / 10;
    }
    return vec;
  }

  if (state.activeMode === 'twin') {
    const twin = PLACES.find(p => p.name === state.twinPlaceName) || PLACES[0];
    for (const attr of ATTRIBUTES) {
      vec[attr] = (twin.tags[attr] || 0) / 10;
    }
    return vec;
  }

  return vec;
}

// ─── MASTER RECOMMENDATION ENGINE ─────────────────────────────────────────────
function generateRecommendations() {
  const userVec = getActiveUserVector();
  const modelId = state.activeModel;

  // Filter candidate pool by region
  let pool = PLACES;
  if (state.activeRegion !== 'all') {
    pool = pool.filter(p => REGION_MAP[p.name] === state.activeRegion);
  }

  // If in twin mode, exclude the anchor place itself from results
  if (state.activeMode === 'twin') {
    pool = pool.filter(p => p.name !== state.twinPlaceName);
  }

  let ranked = [];

  if (modelId === 'mmr') {
    ranked = computeMmrRecommendations(userVec, pool, 10, 0.70);
  } else {
    ranked = pool.map(place => {
      let scoreInfo;
      if (modelId === 'weighted') {
        scoreInfo = computeWeightedScore(userVec, place.tags);
      } else if (modelId === 'cosine') {
        scoreInfo = computeCosineScore(userVec, place.tags);
      } else if (modelId === 'knn') {
        scoreInfo = computeKnnScore(userVec, place.tags);
      } else {
        scoreInfo = computeWeightedScore(userVec, place.tags);
      }
      return {
        ...place,
        rawScore: scoreInfo.rawScore,
        matchPct: scoreInfo.matchPct
      };
    });

    ranked.sort((a, b) => b.rawScore - a.rawScore);
    ranked = ranked.slice(0, 10);
  }

  state.lastRecommendedPlaces = ranked;
  renderResults(ranked);
}

// ─── RENDER RESULTS ───────────────────────────────────────────────────────────
function renderResults(places) {
  resultsGrid.innerHTML = '';
  resultsCount.textContent = `${places.length} places recommended`;

  // Update header text based on mode and model
  let criteriaTitle = 'Top Recommendations';
  let criteriaSub = `Ranked by ${MODELS[state.activeModel].name}`;

  if (state.activeMode === 'mood') {
    const names = Array.from(state.selectedMoods).map(id => {
      const m = MINDSETS.find(item => item.id === id);
      return m ? `${m.emoji} ${m.label}` : id;
    });
    if (names.length > 0) {
      criteriaTitle = `Best For: ${names.join(' + ')}`;
    } else {
      criteriaTitle = 'Recommendations: Balanced Travel';
    }
  } else if (state.activeMode === 'mixer') {
    criteriaTitle = 'Custom Trait Blend Recommendations';
  } else if (state.activeMode === 'twin') {
    criteriaTitle = `Places Similar to ${state.twinPlaceName}`;
    criteriaSub = `Destination twins identified via ${MODELS[state.activeModel].shortName}`;
  }

  resultsTitle.textContent = criteriaTitle;
  resultsSubtitle.textContent = criteriaSub;

  if (places.length === 0) {
    resultsGrid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🌍</span>
        <h3>No places found for this region</h3>
        <p>Try switching to "All Regions" to discover matching destinations worldwide.</p>
      </div>
    `;
    return;
  }

  places.forEach((place, idx) => {
    const card = document.createElement('article');
    card.className = 'place-card';
    card.style.setProperty('--c1', getMoodColor(0));
    card.style.setProperty('--c2', getMoodColor(1));

    // Determine top 2 matching traits for badges
    const sortedTags = Object.entries(place.tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    const tagBadges = sortedTags.map(([tag, val]) => {
      const meta = ATTR_META[tag];
      return `<span class="trait-tag" style="--tag-color: ${meta.color}">
        ${meta.icon} ${meta.label} <strong>${val}/10</strong>
      </span>`;
    }).join('');

    const region = REGION_MAP[place.name] || 'Global';

    card.innerHTML = `
      <div class="place-num">${String(idx + 1).padStart(2, '0')}</div>
      <div class="place-info">
        <div class="place-name-row">
          <div class="place-name">${place.name}</div>
          <div class="place-match" title="Algorithm Match Score">${place.matchPct}%</div>
        </div>
        <div class="place-country-row">
          <span class="place-country">${place.country}</span>
          <span class="place-region-pill">${region}</span>
        </div>
        <p class="place-note">${place.note}</p>
        <div class="place-tags-row">${tagBadges}</div>
        <div class="card-action-row">
          <button class="btn-card-action btn-inspect" data-name="${place.name}">
            <span>🔍 Details</span>
          </button>
          <button class="btn-card-action btn-twin" data-name="${place.name}" title="Find places similar to ${place.name}">
            <span>📍 Find Twins</span>
          </button>
        </div>
      </div>
      <div class="place-emoji">${place.icon}</div>
    `;

    // Attach listeners
    card.querySelector('.btn-inspect').addEventListener('click', (e) => {
      e.stopPropagation();
      openModalForPlace(place);
    });

    card.querySelector('.btn-twin').addEventListener('click', (e) => {
      e.stopPropagation();
      switchToTwinMode(place.name);
    });

    // Clicking card opens details
    card.addEventListener('click', () => {
      openModalForPlace(place);
    });

    resultsGrid.appendChild(card);
  });
}

function getMoodColor(index) {
  const activeArr = Array.from(state.selectedMoods);
  if (activeArr.length > 0) {
    const firstMood = MINDSETS.find(m => m.id === activeArr[0]);
    if (firstMood) return index === 0 ? firstMood.c1 : firstMood.c2;
  }
  return index === 0 ? '#6366f1' : '#ec4899';
}

// ─── SWITCH TO TWIN MODE SHORTCUT ─────────────────────────────────────────────
function switchToTwinMode(placeName) {
  state.twinPlaceName = placeName;
  state.activeMode = 'twin';

  // Update tabs
  modeNavButtons.forEach(b => {
    const isTwin = b.dataset.mode === 'twin';
    b.classList.toggle('active', isTwin);
    b.setAttribute('aria-selected', isTwin);
  });

  paneMood.style.display = 'none';
  paneMixer.style.display = 'none';
  paneTwin.style.display = 'block';

  twinSelect.value = placeName;
  renderTwinPreview();
  generateRecommendations();

  // Scroll to results smoothly
  document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// ─── MODAL DETAIL BREAKDOWN ───────────────────────────────────────────────────
function openModalForPlace(place) {
  modalIcon.textContent = place.icon;
  modalTitle.textContent = `${place.name}, ${place.country}`;
  modalSubtitle.textContent = `Scored with ${MODELS[state.activeModel].name}`;

  const userVec = getActiveUserVector();
  const region = REGION_MAP[place.name] || 'Global';

  // Render attribute breakdown comparison
  const traitBars = ATTRIBUTES.map(attr => {
    const meta = ATTR_META[attr];
    const placeVal = place.tags[attr] || 0;
    const userVal = Math.round((userVec[attr] || 0) * 10);
    const placePct = (placeVal / 10) * 100;
    const userPct = (userVal / 10) * 100;

    return `
      <div class="modal-trait-row">
        <div class="modal-trait-label">
          <span>${meta.icon} ${meta.label}</span>
          <span class="trait-score-val">Place: <strong>${placeVal}/10</strong> (User: ${userVal}/10)</span>
        </div>
        <div class="trait-bar-track">
          <div class="trait-bar-fill user-pref" style="width: ${userPct}%;" title="User preference"></div>
          <div class="trait-bar-fill place-actual" style="width: ${placePct}%; background-color: ${meta.color};" title="Place score"></div>
        </div>
      </div>
    `;
  }).join('');

  modalBody.innerHTML = `
    <div class="modal-banner">
      <div class="modal-match-box">
        <span class="modal-match-score">${place.matchPct}%</span>
        <span class="modal-match-label">Vibe Match</span>
      </div>
      <div class="modal-summary">
        <span class="modal-region-badge">🌍 ${region}</span>
        <p class="modal-note-text">${place.note}</p>
      </div>
    </div>

    <div class="modal-analysis-card">
      <div class="analysis-header">
        <span class="analysis-icon">${MODELS[state.activeModel].icon}</span>
        <strong>Algorithm Evaluation</strong>
      </div>
      <p class="analysis-text">
        Under the <strong>${MODELS[state.activeModel].name}</strong>, ${place.name} ranks with a match affinity of <strong>${place.matchPct}%</strong>.
        ${MODELS[state.activeModel].description}
      </p>
    </div>

    <div class="modal-traits-section">
      <div class="modal-traits-header">
        <h3 class="modal-traits-title">10-Dimension Trait Breakdown</h3>
        <div class="modal-legend">
          <span class="legend-item"><span class="legend-color legend-user"></span> Target Profile</span>
          <span class="legend-item"><span class="legend-color legend-place"></span> Destination Score</span>
        </div>
      </div>
      <div class="modal-traits-list">${traitBars}</div>
    </div>

    <div class="modal-footer-actions">
      <button class="btn-modal-action" id="modalTwinBtn">
        <span>📍 Find Destinations Similar to ${place.name}</span>
      </button>
    </div>
  `;

  document.getElementById('modalTwinBtn').addEventListener('click', () => {
    closeModal();
    switchToTwinMode(place.name);
  });

  modalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) closeModal();
});

// ─── INITIALIZE MODEL SELECTOR ────────────────────────────────────────────────
function initModelSelector() {
  modelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const modelId = tab.dataset.model;
      if (state.activeModel === modelId) return;

      state.activeModel = modelId;

      modelTabs.forEach(t => {
        const isActive = t.dataset.model === modelId;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive);
      });

      // Update info banner
      const m = MODELS[modelId];
      modelDescIcon.textContent = m.icon;
      modelDescName.textContent = m.name;
      modelDescDetail.textContent = m.description;
      modelFormula.innerHTML = m.formula;
      activeModelTag.textContent = `Model: ${m.shortName}`;

      // Recalculate recommendations immediately with smooth animation
      generateRecommendations();
    });
  });
}

// ─── INITIALIZE INPUT MODE SWITCHER ───────────────────────────────────────────
function initModeSwitcher() {
  modeNavButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (state.activeMode === mode) return;

      state.activeMode = mode;

      modeNavButtons.forEach(b => {
        const isActive = b.dataset.mode === mode;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive);
      });

      paneMood.style.display = mode === 'mood' ? 'block' : 'none';
      paneMixer.style.display = mode === 'mixer' ? 'block' : 'none';
      paneTwin.style.display = mode === 'twin' ? 'block' : 'none';

      if (mode === 'twin') {
        renderTwinPreview();
      }

      generateRecommendations();
    });
  });
}

// ─── INITIALIZE MOOD PRESETS (MULTI-SELECT SUPPORT) ───────────────────────────
function initMoodPresets() {
  moodGrid.innerHTML = '';
  MINDSETS.forEach(mindset => {
    const btn = document.createElement('button');
    btn.className = `mood-btn ${state.selectedMoods.has(mindset.id) ? 'active' : ''}`;
    btn.id = `mood-${mindset.id}`;
    btn.setAttribute('role', 'checkbox');
    btn.setAttribute('aria-checked', state.selectedMoods.has(mindset.id) ? 'true' : 'false');
    btn.style.setProperty('--c1', mindset.c1);
    btn.style.setProperty('--c2', mindset.c2);
    btn.innerHTML = `<span>${mindset.emoji} ${mindset.label}</span>`;

    btn.addEventListener('click', () => {
      if (state.selectedMoods.has(mindset.id)) {
        // Toggle off, but keep at least 1 mood active if user unselects all
        state.selectedMoods.delete(mindset.id);
        if (state.selectedMoods.size === 0) {
          state.selectedMoods.add('relaxed');
          document.getElementById('mood-relaxed')?.classList.add('active');
          document.getElementById('mood-relaxed')?.setAttribute('aria-checked', 'true');
        }
        btn.classList.remove('active');
        btn.setAttribute('aria-checked', 'false');
      } else {
        state.selectedMoods.add(mindset.id);
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
      }

      generateRecommendations();
    });

    moodGrid.appendChild(btn);
  });

  clearMoodsBtn.addEventListener('click', () => {
    state.selectedMoods.clear();
    state.selectedMoods.add('relaxed');
    document.querySelectorAll('.mood-btn').forEach(b => {
      const isRelaxed = b.id === 'mood-relaxed';
      b.classList.toggle('active', isRelaxed);
      b.setAttribute('aria-checked', isRelaxed ? 'true' : 'false');
    });
    generateRecommendations();
  });
}

// ─── INITIALIZE TRAIT MIXER SLIDERS ───────────────────────────────────────────
function initTraitMixer() {
  traitSliderGrid.innerHTML = '';

  ATTRIBUTES.forEach(attr => {
    const meta = ATTR_META[attr];
    const val = state.mixerValues[attr];

    const item = document.createElement('div');
    item.className = 'trait-slider-item';

    item.innerHTML = `
      <div class="slider-label-row">
        <span class="slider-title">${meta.icon} ${meta.label}</span>
        <span class="slider-val" id="val-${attr}">${val}</span>
      </div>
      <input type="range" class="trait-range" id="range-${attr}" min="0" max="10" step="1" value="${val}" style="--accent-color: ${meta.color}" />
    `;

    const input = item.querySelector('.trait-range');
    const label = item.querySelector('.slider-val');

    input.addEventListener('input', (e) => {
      const newVal = parseInt(e.target.value, 10);
      state.mixerValues[attr] = newVal;
      label.textContent = newVal;
      generateRecommendations();
    });

    traitSliderGrid.appendChild(item);
  });

  // Mixer Presets
  presetAdventureBtn.addEventListener('click', () => {
    setMixerProfile({ relaxed: 3, adventurous: 10, romantic: 4, cultural: 5, nature: 10, party: 3, family: 4, solo: 9, budget: 6, luxury: 3 });
  });

  presetLuxuryBtn.addEventListener('click', () => {
    setMixerProfile({ relaxed: 9, adventurous: 3, romantic: 9, cultural: 6, nature: 6, party: 4, family: 5, solo: 4, budget: 1, luxury: 10 });
  });

  presetCulturalBtn.addEventListener('click', () => {
    setMixerProfile({ relaxed: 5, adventurous: 4, romantic: 7, cultural: 10, nature: 4, party: 4, family: 7, solo: 8, budget: 6, luxury: 6 });
  });

  resetMixerBtn.addEventListener('click', () => {
    setMixerProfile({ relaxed: 5, adventurous: 5, romantic: 5, cultural: 5, nature: 5, party: 5, family: 5, solo: 5, budget: 5, luxury: 5 });
  });
}

function setMixerProfile(profile) {
  for (const [attr, val] of Object.entries(profile)) {
    state.mixerValues[attr] = val;
    const input = document.getElementById(`range-${attr}`);
    const label = document.getElementById(`val-${attr}`);
    if (input) input.value = val;
    if (label) label.textContent = val;
  }
  generateRecommendations();
}

// ─── INITIALIZE DESTINATION TWIN SELECTOR ──────────────────────────────────────
function initTwinSelector() {
  twinSelect.innerHTML = '';
  // Sort alphabetically for clean selection
  const sorted = [...PLACES].sort((a, b) => a.name.localeCompare(b.name));

  sorted.forEach(place => {
    const opt = document.createElement('option');
    opt.value = place.name;
    opt.textContent = `${place.icon} ${place.name} (${place.country})`;
    if (place.name === state.twinPlaceName) opt.selected = true;
    twinSelect.appendChild(opt);
  });

  twinSelect.addEventListener('change', (e) => {
    state.twinPlaceName = e.target.value;
    renderTwinPreview();
    generateRecommendations();
  });

  renderTwinPreview();
}

function renderTwinPreview() {
  const place = PLACES.find(p => p.name === state.twinPlaceName) || PLACES[0];
  const region = REGION_MAP[place.name] || 'Global';

  // Find top 3 traits of anchor
  const topTraits = Object.entries(place.tags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([attr, val]) => {
      const meta = ATTR_META[attr];
      return `<span class="trait-tag" style="--tag-color: ${meta.color}">${meta.icon} ${meta.label}: ${val}/10</span>`;
    })
    .join('');

  twinPreviewCard.innerHTML = `
    <div class="twin-preview-inner">
      <span class="twin-preview-icon">${place.icon}</span>
      <div class="twin-preview-details">
        <div class="twin-preview-name-row">
          <strong>${place.name}</strong>
          <span class="place-region-pill">${region}</span>
        </div>
        <p class="twin-preview-note">${place.note}</p>
        <div class="twin-preview-traits">${topTraits}</div>
      </div>
    </div>
  `;
}

// ─── INITIALIZE REGION FILTERS ────────────────────────────────────────────────
function initRegionFilters() {
  regionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const region = btn.dataset.region;
      state.activeRegion = region;

      regionButtons.forEach(b => {
        b.classList.toggle('active', b.dataset.region === region);
      });

      generateRecommendations();
    });
  });
}

// ─── INITIALIZE APPLICATION ───────────────────────────────────────────────────
function init() {
  initModelSelector();
  initModeSwitcher();
  initMoodPresets();
  initTraitMixer();
  initTwinSelector();
  initRegionFilters();

  // Run initial recommendation
  generateRecommendations();
}

// Start when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

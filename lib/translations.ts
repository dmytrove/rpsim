// Translation system for RPS Battle Simulator

export type Language = "uk" | "en"

export type TranslationKey =
  | "settings"
  | "history"
  | "rules"
  | "roundComplete"
  | "wins"
  | "seconds"
  | "itemCount"
  | "speed"
  | "size"
  | "updateRate"
  | "showBattleHistory"
  | "soundEffects"
  | "pause"
  | "resume"
  | "restart"
  | "simulation"
  | "themes"
  | "display"
  | "controls"
  | "simulationSettings"
  | "viewRulesDiagram"
  | "randomVariation"
  | "noBattlesYet"
  | "round"
  | "winner"
  | "items"
  | "eachItemHasStrengthWeakness"
  | "variation"
  | "language"
  | "english"
  | "ukrainian"
  | "players"
  | "enablePlayers"
  | "playersList"
  | "playersPlaceholder"
  | "playersHint"
  | "nextRound"

// Game variations with their respective emojis, instrument settings, and verbs
export const VARIATIONS_TRANSLATIONS = {
  uk: {
    classic: {
      name: "Класичний",
      items: ["🗿", "📰", "✂️"],
      instrument: "piano",
      verbs: ["покриває", "ріже", "розбиває"],
    },
    elemental: {
      name: "Стихії",
      items: ["🔥", "🌿", "💧"],
      instrument: "synth",
      verbs: ["гасить", "спалює", "живить"],
    },
    space: {
      name: "Космос",
      items: ["🚀", "🪐", "☄️"],
      instrument: "pad",
      verbs: ["облітає", "відбиває", "врізається в"],
    },
    weather: {
      name: "Погода",
      items: ["☀️", "🌧️", "❄️"],
      instrument: "ambient",
      verbs: ["розтоплює", "заморожує", "випаровує"],
    },
    animals: {
      name: "Тварини",
      items: ["🐯", "🐺", "🦊"],
      instrument: "pluck",
      verbs: ["перехитрює", "залякує", "випереджає"],
    },
    food: {
      name: "Їжа",
      items: ["🍔", "🍕", "🌮"],
      instrument: "marimba",
      verbs: ["доповнює", "затьмарює", "поєднується з"],
    },
    tech: {
      name: "Техніка",
      items: ["💻", "📱", "📷"],
      instrument: "digital",
      verbs: ["захоплює", "замінює", "відображає"],
    },
    emotions: {
      name: "Емоції",
      items: ["😊", "😢", "😡"],
      instrument: "vocal",
      verbs: ["заспокоює", "провокує", "співчуває"],
    },
    fantasy: {
      name: "Фентезі",
      items: ["🧙", "🧝", "🐉"],
      instrument: "harp",
      verbs: ["приручає", "перемагає магією", "переважає"],
    },
    music: {
      name: "Музика",
      items: ["🎸", "🎹", "🥁"],
      instrument: "guitar",
      verbs: ["акомпанує", "задає ритм для", "підсилює"],
    },
    sports: {
      name: "Спорт",
      items: ["⚽", "🏈", "🏀"],
      instrument: "brass",
      verbs: ["перевершує", "перегравє", "перестрибує"],
    },
    sea: {
      name: "Морські істоти",
      items: ["🦈", "🐡", "🐙"],
      instrument: "water",
      verbs: ["ловить", "отруює", "уникає"],
    },
    fruits: {
      name: "Фрукти",
      items: ["🍎", "🍌", "🍇"],
      instrument: "kalimba",
      verbs: ["перевершує", "об'єднується над", "групується навколо"],
    },
    transport: {
      name: "Транспорт",
      items: ["✈️", "🚗", "🚢"],
      instrument: "engine",
      verbs: ["обганяє", "маневрує краще", "перевозить"],
    },
    lizard_spock: {
      name: "Лізард Спок",
      items: ["🗿", "📰", "✂️", "🦎", "🖖"],
      instrument: "synth",
      verbs: ["розбиває", "покриває", "ріже", "отруює", "ламає"],
    },
    well: {
      name: "Колодязь",
      items: ["🗿", "📰", "✂️", "🕳️"],
      instrument: "water",
      verbs: ["розбиває", "покриває", "ріже", "поглинає"],
    },
  },
  en: {
    classic: {
      name: "Classic",
      items: ["🗿", "📰", "✂️"],
      instrument: "piano",
      verbs: ["covers", "cuts", "crushes"],
    },
    elemental: {
      name: "Elemental",
      items: ["🔥", "🌿", "💧"],
      instrument: "synth",
      verbs: ["extinguishes", "burns", "grows with"],
    },
    space: {
      name: "Space",
      items: ["🚀", "🪐", "☄️"],
      instrument: "pad",
      verbs: ["orbits", "deflects", "crashes into"],
    },
    weather: {
      name: "Weather",
      items: ["☀️", "🌧️", "❄️"],
      instrument: "ambient",
      verbs: ["melts", "freezes from", "evaporates"],
    },
    animals: {
      name: "Animals",
      items: ["🐯", "🐺", "🦊"],
      instrument: "pluck",
      verbs: ["outsmarts", "intimidates", "outpaces"],
    },
    food: {
      name: "Food",
      items: ["🍔", "🍕", "🌮"],
      instrument: "marimba",
      verbs: ["complements", "overshadows", "pairs with"],
    },
    tech: {
      name: "Tech",
      items: ["💻", "📱", "📷"],
      instrument: "digital",
      verbs: ["captures", "replaces", "displays"],
    },
    emotions: {
      name: "Emotions",
      items: ["😊", "😢", "😡"],
      instrument: "vocal",
      verbs: ["calms", "provokes", "sympathizes with"],
    },
    fantasy: {
      name: "Fantasy",
      items: ["🧙", "🧝", "🐉"],
      instrument: "harp",
      verbs: ["tames", "outmagics", "overwhelms"],
    },
    music: {
      name: "Music",
      items: ["🎸", "🎹", "🥁"],
      instrument: "guitar",
      verbs: ["accompanies", "sets rhythm for", "amplifies"],
    },
    sports: {
      name: "Sports",
      items: ["⚽", "🏈", "🏀"],
      instrument: "brass",
      verbs: ["outscores", "outplays", "bounces past"],
    },
    sea: {
      name: "Sea Creatures",
      items: ["🦈", "🐡", "🐙"],
      instrument: "water",
      verbs: ["captures", "poisons", "evades"],
    },
    fruits: {
      name: "Fruits",
      items: ["🍎", "🍌", "🍇"],
      instrument: "kalimba",
      verbs: ["outshines", "bunches over", "clusters around"],
    },
    transport: {
      name: "Transportation",
      items: ["✈️", "🚗", "🚢"],
      instrument: "engine",
      verbs: ["outruns", "outmaneuvers", "carries"],
    },
    lizard_spock: {
      name: "Lizard Spock",
      items: ["🗿", "📰", "✂️", "🦎", "🖖"],
      instrument: "synth",
      verbs: ["crushes", "covers", "cuts", "poisons", "smashes"],
    },
    well: {
      name: "Well",
      items: ["🗿", "📰", "✂️", "🕳️"],
      instrument: "water",
      verbs: ["breaks", "covers", "cuts", "traps"],
    },
  },
}

export const translations: Record<Language, Record<TranslationKey, string>> = {
  uk: {
    settings: "Налаштування",
    history: "Історія",
    rules: "Правила",
    roundComplete: "Раунд завершено!",
    wins: "перемагає за",
    seconds: "секунд",
    itemCount: "Кількість елементів",
    speed: "Швидкість",
    size: "Розмір",
    updateRate: "Частота оновлення",
    showBattleHistory: "Показати історію битв",
    soundEffects: "Звукові ефекти",
    pause: "Пауза",
    resume: "Продовжити",
    restart: "Перезапустити",
    simulation: "Симуляція",
    themes: "Теми",
    display: "Відображення",
    controls: "Керування",
    simulationSettings: "Налаштування симуляції",
    viewRulesDiagram: "Переглянути діаграму правил",
    randomVariation: "Випадкова варіація кожного раунду",
    noBattlesYet: "Ще немає битв",
    round: "Раунд",
    winner: "Переможець!",
    items: "елементів",
    eachItemHasStrengthWeakness: "Кожен елемент має силу і слабкість",
    variation: "Варіація",
    language: "Мова",
    english: "English",
    ukrainian: "Українська",
    players: "Гравці",
    enablePlayers: "Увімкнути гравців",
    playersList: "Список гравців",
    playersPlaceholder: "Введіть імена гравців (кожне з нового рядка)",
    playersHint: "Введіть імена підписників Instagram, кожне ім'я з нового рядка. Вони будуть випадково призначені елементам.",
    nextRound: "Наступний раунд",
  },
  en: {
    settings: "Settings",
    history: "History",
    rules: "Rules",
    roundComplete: "Round Complete!",
    wins: "wins in",
    seconds: "seconds",
    itemCount: "Item Count",
    speed: "Speed",
    size: "Size",
    updateRate: "Update Rate",
    showBattleHistory: "Show Battle History",
    soundEffects: "Sound Effects",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart",
    simulation: "Simulation",
    themes: "Themes",
    display: "Display",
    controls: "Controls",
    simulationSettings: "Simulation Settings",
    viewRulesDiagram: "View Rules Diagram",
    randomVariation: "Random variation each round",
    noBattlesYet: "No battles yet",
    round: "Round",
    winner: "Winner!",
    items: "items",
    eachItemHasStrengthWeakness: "Each item has strength and weakness",
    variation: "Variation",
    language: "Language",
    english: "English",
    ukrainian: "Українська",
    players: "Players",
    enablePlayers: "Enable players",
    playersList: "Players list",
    playersPlaceholder: "Enter player names (one per line)",
    playersHint: "Enter Instagram subscriber names, one per line. They will be randomly assigned to items.",
    nextRound: "Next Round",
  },
}

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key]
}

export function getVariationTranslation(lang: Language, variationKey: string) {
  return VARIATIONS_TRANSLATIONS[lang][variationKey as keyof typeof VARIATIONS_TRANSLATIONS.uk]
}


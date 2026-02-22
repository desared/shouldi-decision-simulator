export interface ModerationResult {
  blocked: boolean
  category?: "sexual" | "violence" | "hate" | "profanity" | "harmful"
}

// ── Tier 1: Root matching via \broot regex ──────────────────────────
// If ANY form of the root appears, it's blocked.
// "kill" → kill, killed, killing, killer, kills
// Word boundary at start prevents matching INSIDE other words:
//   "kill" won't match "skill" or "overkill"
const blockedRoots: Record<string, string[]> = {
  sexual: [
    // EN
    "rape", "rapist", "molest", "pedophil", "paedophil",
    "incest", "grope", "underage", "porn",
    // DE
    "vergewaltig", "pädophil", "inzest", "pornograf",
  ],
  violence: [
    // EN
    "kill", "murder", "assassin", "massacr", "terroris",
    "genocid", "tortur", "kidnap", "strangl", "slaughter",
    // DE
    "töten", "ermord", "erstech", "erschieß",
    "massaker", "folter", "entführ", "erwürg",
  ],
  hate: [
    // EN — slurs (all forms blocked)
    "nigger", "nigga", "spic", "wetback", "chink", "gook", "kike",
    "zipperhead", "raghead", "towelhead", "beaner", "coon", "darkie",
    "faggot", "tranny", "retard", "subhuman",
    // DE — slurs
    "kanake", "kameltreiber", "kümmeltürke", "schlitzauge",
    "neger", "zigeuner", "polacke", "schwuchtel", "untermenschen",
  ],
  profanity: [
    // EN
    "fuck", "motherfuck", "cunt", "shit", "bitch",
    "whore", "slut", "asshole", "douchebag", "twat", "scumbag",
    // DE
    "fick", "scheiß", "hurensohn", "missgeburt",
    "arschloch", "wichser", "schlampe", "hure", "drecksau", "spast",
  ],
  harmful: [
    // EN — bullying & harassment
    "bully", "harass", "stalk", "blackmail", "extort",
    "intimidat", "humiliat",
    // Theft & crime
    "steal", "shoplift", "smuggl", "counterfeit",
    // Self-harm & drugs
    "suicid", "overdos", "cocain", "heroin",
    // Abuse & manipulation
    "abuse", "scam", "gaslight", "sabotag", "revenge", "manipulat",
    // DE
    "mobben", "mobbing", "stalken", "erpress",
    "einschüchter", "demütig",
    "stehlen", "klauen", "berauben",
    "selbstmord", "selbstverletz",
    "kokain", "misshandel", "missbrauch",
    "tierquälerei", "sabotier", "manipulier",
  ],
}

// ── Tier 2: Exact word matching via \bword\b regex ──────────────────
// For words where root matching would cause false positives.
// "stab" exact avoids matching "stable"; "rob" exact avoids "robot".
const blockedExact: Record<string, string[]> = {
  violence: [
    "stab", "stabbed", "stabbing", "stabber",
  ],
  harmful: [
    "rob", "robbed", "robbing", "robbery", "robber",
    "meth", "dox", "swat",
  ],
  profanity: [
    "dickhead", "shithead",
  ],
}

// ── Tier 3: Substring matching via .includes() ──────────────────────
// Multi-word phrases. If the substring appears anywhere, block.
const blockedPhrases: Record<string, string[]> = {
  sexual: [
    // EN
    "sex with", "sleep with child", "sleep with kid", "sleep with minor",
    "naked child", "naked kid", "nude child", "nude kid",
    "touch child", "touch kid",
    "child exploit", "sex slave", "sex traffic",
    // DE
    "sex mit kind", "sex mit mädchen", "sex mit junge",
    "sex mit teenager", "sex mit minderjährig",
    "nackte kinder", "kinderausbeutung",
    "sexueller missbrauch", "kindesmissbrauch",
    "sexuelle belästigung",
  ],
  violence: [
    // EN
    "shoot someone", "shoot him", "shoot her", "shoot them",
    "shoot people", "shoot up", "mass shooting", "school shooting",
    "death to", "blow up",
    "bomb threat", "make a bomb", "build a bomb", "plant a bomb",
    "death threat", "suicide bomb", "car bomb",
    // DE
    "bombendrohung", "bombe bauen", "anschlag planen",
    "massenerschießung", "massenmord", "morddrohung",
    "selbstmordanschlag",
  ],
  hate: [
    // EN
    "heil hitler", "white supremacy", "white power",
    "ethnic cleansing", "holocaust denial", "racial superiority",
    "racial purity", "race war", "go back to your country",
    "jewish conspiracy", "zionist conspiracy",
    "jews control",
    // DE
    "weiße vorherrschaft", "ausländer raus",
    "ethnische säuberung", "holocaust leugnung", "rassenkrieg",
    "jüdische verschwörung",
  ],
  harmful: [
    // EN — self-harm
    "self harm", "self-harm", "cut myself", "hurt myself",
    "end my life", "hang myself", "slit my wrist",
    "jump off a bridge",
    // Drugs
    "sell drugs", "deal drugs", "cook meth", "make drugs",
    "drug someone", "spike someone", "roofie",
    // Weapons
    "buy a gun", "get a weapon", "make a weapon",
    // Doxxing / swatting
    "doxxing", "swatting", "dox someone",
    // Animal cruelty
    "animal cruelty",
    // DE — self-harm
    "mich selbst verletzen", "mich ritzen", "mein leben beenden",
    "mich umbringen", "mich erhängen",
    // Drugs
    "drogen verkaufen", "drogen dealen", "drogen herstellen",
    // Animal cruelty
    "tiere quälen",
  ],
  profanity: [
    // EN
    "piece of shit", "eat shit", "kill yourself",
    "go die", "hope you die", "rot in hell", "burn in hell",
    "son of a bitch", "suck my", "dick head",
    // DE
    "fick dich", "verpiss dich", "bring dich um",
    "halt die fresse", "halt dein maul",
    "fahr zur hölle", "brenn in der hölle",
  ],
}

export function moderateContent(text: string): ModerationResult {
  const normalized = text.toLowerCase().trim()

  // Tier 1: Root matching — \broot (catches root + ALL word forms)
  for (const [category, roots] of Object.entries(blockedRoots)) {
    for (const root of roots) {
      const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escaped}`, 'i')
      if (regex.test(normalized)) {
        return { blocked: true, category: category as ModerationResult["category"] }
      }
    }
  }

  // Tier 2: Exact word matching — \bword\b (avoids false positives like "stable", "robot")
  for (const [category, words] of Object.entries(blockedExact)) {
    for (const word of words) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escaped}\\b`, 'i')
      if (regex.test(normalized)) {
        return { blocked: true, category: category as ModerationResult["category"] }
      }
    }
  }

  // Tier 3: Substring matching — .includes() (multi-word phrases)
  for (const [category, phrases] of Object.entries(blockedPhrases)) {
    for (const phrase of phrases) {
      if (normalized.includes(phrase.toLowerCase())) {
        return { blocked: true, category: category as ModerationResult["category"] }
      }
    }
  }

  return { blocked: false }
}

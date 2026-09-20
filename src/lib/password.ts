const COMMON = [
  "123456", "password", "qwerty", "111111", "12345678", "abc123", "1234567", "123123",
  "пароль", "пароль123", "qwerty123", "iloveyou", "admin", "welcome", "monkey", "dragon",
  "football", "letmein", "000000", "1q2w3e4r", "asdfgh", "zxcvbn", "aliya", "almaty", "astana",
];

export interface PasswordScore {
  entropy: number; // bits
  score: 0 | 1 | 2 | 3 | 4; // 0 = very weak … 4 = excellent
  label: string;
  color: string;
  crackSeconds: number;
  crackLabel: string;
  tips: string[];
}

const GUESSES_PER_SECOND = 1e10; // offline GPU attack estimate

function charsetSize(pw: string) {
  let n = 0;
  if (/[a-z]/.test(pw)) n += 26;
  if (/[A-Z]/.test(pw)) n += 26;
  if (/[а-яё]/i.test(pw)) n += 33;
  if (/[әіңғүұқөһ]/i.test(pw)) n += 9;
  if (/\d/.test(pw)) n += 10;
  if (/[^A-Za-z0-9а-яёәіңғүұқөһ]/i.test(pw)) n += 33;
  return n || 1;
}

export function formatDuration(sec: number): string {
  if (sec < 1) return "мгновенно";
  const units: [number, string][] = [
    [60, "сек."], [60, "мин."], [24, "ч."], [365, "дн."], [1000, "лет"], [1000, "тыс. лет"], [1000, "млн лет"],
  ];
  let v = sec;
  let label = "сек.";
  for (const [div, name] of units) {
    label = name;
    if (v < div) break;
    v /= div;
  }
  if (v >= 1000) return "миллиарды лет";
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${label}`;
}

export function scorePassword(pw: string): PasswordScore {
  const tips: string[] = [];
  if (!pw) {
    return { entropy: 0, score: 0, label: "Введи пароль", color: "#64748b", crackSeconds: 0, crackLabel: "—", tips: ["Начни печатать, и щит отреагирует."] };
  }
  const lower = pw.toLowerCase();
  let entropy = pw.length * Math.log2(charsetSize(pw));

  // penalties
  const isCommon = COMMON.some((c) => lower === c || (c.length >= 5 && lower.includes(c)));
  if (isCommon) { entropy = Math.min(entropy, 10); tips.push("Это слово есть в словарях хакеров — они проверят его первым."); }
  if (/^(.)\1+$/.test(pw)) { entropy = Math.min(entropy, 6); tips.push("Один и тот же символ много раз — очень легко угадать."); }
  if (/^(0123|1234|2345|3456|4567|5678|6789|abcd|qwer)/i.test(pw)) { entropy *= 0.5; tips.push("Последовательности вроде 1234 или qwerty угадываются мгновенно."); }
  if (/(19|20)\d\d/.test(pw)) { entropy -= 6; tips.push("Год рождения легко найти в соцсетях — лучше не использовать."); }
  if (/^[a-zа-я]+$/i.test(pw) && pw.length < 12) tips.push("Добавь цифры и символы (например ! или #).");
  if (!/[A-ZА-Я]/.test(pw)) tips.push("Попробуй добавить заглавные буквы.");
  if (pw.length < 8) tips.push("Слишком короткий: сделай хотя бы 12 символов.");
  else if (pw.length < 12) tips.push("Хорошая длина, но 12+ символов надёжнее.");
  entropy = Math.max(0, entropy);

  const crackSeconds = Math.pow(2, entropy) / GUESSES_PER_SECOND;
  let score: PasswordScore["score"] = 0;
  if (entropy >= 80) score = 4;
  else if (entropy >= 60) score = 3;
  else if (entropy >= 40) score = 2;
  else if (entropy >= 25) score = 1;

  const meta = [
    { label: "Очень слабый", color: "#ef4444" },
    { label: "Слабый", color: "#f97316" },
    { label: "Средний", color: "#facc15" },
    { label: "Сильный", color: "#2dd4bf" },
    { label: "Отличный!", color: "#22c55e" },
  ][score];

  if (score >= 3 && tips.length === 0) tips.push("Керемет! Такой пароль взломать почти невозможно. Только не используй его на нескольких сайтах.");

  return { entropy: Math.round(entropy), score, ...meta, crackSeconds, crackLabel: formatDuration(crackSeconds), tips: tips.slice(0, 3) };
}

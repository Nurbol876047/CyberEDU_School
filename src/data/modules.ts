export type ModuleSlug = "passwords" | "privacy" | "strangers" | "bullying" | "phishing" | "screentime";
export type ModuleStatus = "unlocked" | "completed";
export type SimulatorKind = "password" | "privacy" | "chat" | "phishing" | "screentime";

export interface ModuleInfo {
  slug: ModuleSlug;
  title: string;
  subtitle: string;
  /** island / accent colour */
  color: string;
  /** icon square colour (landing grid) */
  iconBg: string;
  icon: string; // svg path (24x24)
  position: [number, number, number];
  badge: string;
  intro: string;
  simulator: SimulatorKind;
  simulatorTitle: string;
}

export const MODULES: ModuleInfo[] = [
  {
    slug: "passwords",
    title: "Надёжный пароль",
    subtitle: "Ключ от твоего замка",
    color: "#4B9BFF",
    iconBg: "#4B9BFF",
    icon: "M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
    position: [-7.5, 0, 1.5],
    badge: "🛡️ Страж паролей",
    intro: "Сәлем! Я Қалқан-бот. На этом острове мы разберём, что такое пароль, и научимся делать его таким, что не взломать и за тысячу лет.",
    simulator: "password",
    simulatorTitle: "3D-щит: проверь силу пароля",
  },
  {
    slug: "privacy",
    title: "Личные данные",
    subtitle: "Что нельзя рассказывать",
    color: "#F6C243",
    iconBg: "#F6C243",
    icon: "M4 4h16c1.11 0 2 .89 2 2v12c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2V6c0-1.11.89-2 2-2zm11 11h3v-2h-3v2zm0-4h3V9h-3v2zm-6-2c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V15h14v-.5c0-2.33-4.67-3.5-7-3.5z",
    position: [-4.5, 0, -4],
    badge: "🔒 Хранитель тайн",
    intro: "Имя, адрес, школа, телефон — это твои личные данные. Разберёмся, что можно публиковать, а что лучше держать при себе, и посмотрим на твой цифровой след.",
    simulator: "privacy",
    simulatorTitle: "Сортировка постов и цифровой след",
  },
  {
    slug: "strangers",
    title: "Незнакомцы в сети",
    subtitle: "Кто по ту сторону экрана",
    color: "#FF9F43",
    iconBg: "#FF9F43",
    icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    position: [-1.5, 0, 1.5],
    badge: "🎭 Разоблачитель масок",
    intro: "В интернете любой может назваться кем угодно. Потренируемся общаться с «новыми друзьями» так, чтобы не попасть в ловушку.",
    simulator: "chat",
    simulatorTitle: "Чат с незнакомцем",
  },
  {
    slug: "bullying",
    title: "Кибербуллинг",
    subtitle: "Как защитить себя и друзей",
    color: "#5BD15B",
    iconBg: "#5BD15B",
    icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z",
    position: [1.5, 0, -4],
    badge: "🤝 Защитник друзей",
    intro: "Иногда в чатах бывает обидно. Разберём несколько ситуаций и узнаем формулу: не отвечай — заблокируй — расскажи взрослому.",
    simulator: "chat",
    simulatorTitle: "Чат-симулятор ситуаций",
  },
  {
    slug: "phishing",
    title: "Фейки и обман",
    subtitle: "Ловушки в письмах и ссылках",
    color: "#FF6B6B",
    iconBg: "#FF6B6B",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-9a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z",
    position: [4.5, 0, 1.5],
    badge: "🎣 Охотник на фишинг",
    intro: "Мошенники рассылают письма-ловушки. Свайпни вправо, если письмо безопасное, и влево — если это фишинг. Можно рукой перед камерой или стрелками.",
    simulator: "phishing",
    simulatorTitle: "Свайп-тренажёр: фишинг или нет",
  },
  {
    slug: "screentime",
    title: "Экранное время",
    subtitle: "Баланс жизни и экрана",
    color: "#38C2FF",
    iconBg: "#38C2FF",
    icon: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
    position: [7.5, 0, -4],
    badge: "⏱️ Мастер баланса",
    intro: "Экран — это здорово, но не круглые сутки. Узнаем правило 20-20-20 и соберём здоровый день: сон, учёба, улица и немного экрана.",
    simulator: "screentime",
    simulatorTitle: "Планировщик здорового дня",
  },
];

export const MODULE_ORDER: ModuleSlug[] = MODULES.map((m) => m.slug);

export const getModule = (slug: string) => MODULES.find((m) => m.slug === slug);

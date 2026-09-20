export interface ChatMessage {
  from: "them" | "me" | "system";
  name?: string;
  text: string;
}

export interface Choice {
  text: string;
  next: string; // node id
  /** -1 bad, 0 neutral, +1 good */
  score: -1 | 0 | 1;
}

export interface DialogNode {
  id: string;
  messages: ChatMessage[];
  choices?: Choice[];
  ending?: { title: string; kind: "good" | "neutral" | "bad"; summary: string };
}

import type { ModuleSlug } from "./modules";

export interface Scenario {
  id: string;
  module: ModuleSlug;
  title: string;
  description: string;
  chatName: string;
  avatar: string;
  start: string;
  nodes: Record<string, DialogNode>;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "group-chat",
    module: "bullying",
    title: "Групповой чат класса",
    description: "В чате класса начали смеяться над твоей фотографией.",
    chatName: "7 «Б» 🔥",
    avatar: "👥",
    start: "s1",
    nodes: {
      s1: {
        id: "s1",
        messages: [
          { from: "them", name: "Данияр", text: "Ахаха, вы видели фотку Арсена с физры? 😂😂" },
          { from: "them", name: "Данияр", text: "[фото]" },
          { from: "them", name: "Мадина", text: "лол, это вообще кто" },
          { from: "them", name: "Данияр", text: "Арсен, ты чего молчишь? 🐔" },
          { from: "system", text: "Это твоя фотография. Что ответишь?" },
        ],
        choices: [
          { text: "Сам ты 🐔, посмотри на себя, урод", next: "s2-fight", score: -1 },
          { text: "Ребята, мне неприятно, удалите фото пожалуйста", next: "s2-calm", score: 1 },
          { text: "Ничего не писать, выйти из чата", next: "s2-leave", score: 0 },
        ],
      },
      "s2-fight": {
        id: "s2-fight",
        messages: [
          { from: "me", text: "Сам ты 🐔, посмотри на себя, урод" },
          { from: "them", name: "Данияр", text: "оо, обиделся 😂 щас ещё скину" },
          { from: "them", name: "Данияр", text: "[фото] [фото]" },
          { from: "them", name: "Мадина", text: "Данияр, хватит уже" },
          { from: "system", text: "Оскорбления только подлили масла в огонь. Что дальше?" },
        ],
        choices: [
          { text: "Продолжить ругаться", next: "end-bad", score: -1 },
          { text: "Сделать скриншоты и рассказать классному руководителю", next: "s3-adult", score: 1 },
        ],
      },
      "s2-calm": {
        id: "s2-calm",
        messages: [
          { from: "me", text: "Ребята, мне неприятно, удалите фото пожалуйста" },
          { from: "them", name: "Данияр", text: "да ладно, это же шутка 🙄" },
          { from: "them", name: "Мадина", text: "Данияр, удали, он же попросил" },
          { from: "them", name: "Айгерим", text: "+1, не смешно вообще" },
          { from: "system", text: "Часть класса на твоей стороне. Данияр пока не удалил фото." },
        ],
        choices: [
          { text: "Спасибо, Мадина и Айгерим. Данияр, я жду", next: "end-good", score: 1 },
          { text: "Написать Данияру в личку с угрозами", next: "end-bad", score: -1 },
          { text: "Сделать скриншот и рассказать взрослому", next: "s3-adult", score: 1 },
        ],
      },
      "s2-leave": {
        id: "s2-leave",
        messages: [
          { from: "system", text: "Ты вышел из чата. Утром в школе Данияр показывает фото другим." },
          { from: "them", name: "Айгерим", text: "Арсен, ты видел, что он творит? Ты в порядке?" },
        ],
        choices: [
          { text: "Всё нормально, не хочу об этом говорить", next: "end-neutral", score: 0 },
          { text: "Нет, не в порядке. Поможешь рассказать учителю?", next: "s3-adult", score: 1 },
        ],
      },
      "s3-adult": {
        id: "s3-adult",
        messages: [
          { from: "system", text: "Ты сделал скриншоты и показал их классному руководителю." },
          { from: "them", name: "Классный руководитель", text: "Спасибо, что рассказал. Ты всё сделал правильно. Я поговорю с Данияром и его родителями, фото будет удалено." },
          { from: "them", name: "Мадина", text: "Данияр удалил фото и извинился в чате 👍" },
        ],
        ending: {
          title: "Взрослый на твоей стороне",
          kind: "good",
          summary: "Скриншоты + доверенный взрослый = самый надёжный способ остановить травлю. Ты защитил себя без драки.",
        },
      },
      "end-good": {
        id: "end-good",
        messages: [
          { from: "me", text: "Спасибо, Мадина и Айгерим. Данияр, я жду" },
          { from: "them", name: "Данияр", text: "ладно, удалил. извини" },
          { from: "system", text: "Фото удалено. Спокойный ответ и поддержка друзей сработали." },
        ],
        ending: {
          title: "Спокойствие победило",
          kind: "good",
          summary: "Ты не опустился до оскорблений, честно сказал о чувствах и нашёл поддержку. Так и надо!",
        },
      },
      "end-neutral": {
        id: "end-neutral",
        messages: [
          { from: "me", text: "Всё нормально, не хочу об этом говорить" },
          { from: "system", text: "Ты остался один с проблемой. Фото всё ещё гуляет по телефонам." },
        ],
        ending: {
          title: "Молчание не помогло",
          kind: "neutral",
          summary: "Уйти из чата — нормально, но замалчивать травлю опасно. Расскажи тому, кому доверяешь.",
        },
      },
      "end-bad": {
        id: "end-bad",
        messages: [
          { from: "system", text: "Переписка с оскорблениями попала к завучу. Теперь наказаны оба — и ты, и Данияр." },
        ],
        ending: {
          title: "Ссора зашла далеко",
          kind: "bad",
          summary: "Ответная агрессия делает тебя участником травли, а не жертвой. Сохрани доказательства и обратись к взрослому.",
        },
      },
    },
  },
  {
    id: "stranger",
    module: "strangers",
    title: "Незнакомец в игре",
    description: "В игровом чате появился «друг», который просит слишком многое.",
    chatName: "Игрок Dark_Wolf99",
    avatar: "🐺",
    start: "s1",
    nodes: {
      s1: {
        id: "s1",
        messages: [
          { from: "them", name: "Dark_Wolf99", text: "Крутой ты игрок! Хочешь, подарю скин за 5000 тг?" },
          { from: "them", name: "Dark_Wolf99", text: "Просто скинь фото своей карты (обе стороны), я переведу" },
        ],
        choices: [
          { text: "Ого, спасибо! Сейчас сфоткаю", next: "end-bad", score: -1 },
          { text: "Я не отправляю фото карты никому", next: "s2-refuse", score: 1 },
          { text: "А зачем тебе моя карта?", next: "s2-ask", score: 0 },
        ],
      },
      "s2-ask": {
        id: "s2-ask",
        messages: [
          { from: "me", text: "А зачем тебе моя карта?" },
          { from: "them", name: "Dark_Wolf99", text: "Чтобы перевести деньги, ты чего, не доверяешь? Ну тогда хотя бы скажи свой адрес, я курьером скин привезу 😉" },
        ],
        choices: [
          { text: "Ладно, живу на ул. Абая 15, кв 7", next: "end-bad", score: -1 },
          { text: "Скины не привозят курьером. Я блокирую тебя", next: "s2-refuse", score: 1 },
        ],
      },
      "s2-refuse": {
        id: "s2-refuse",
        messages: [
          { from: "me", text: "Я не отправляю личные данные незнакомым людям" },
          { from: "them", name: "Dark_Wolf99", text: "Ты чё, малой? Все так делают. Не скинешь — я расскажу всем, что ты читер" },
        ],
        choices: [
          { text: "Заблокировать, пожаловаться модератору и рассказать родителям", next: "end-good", score: 1 },
          { text: "Испугаться и всё-таки отправить", next: "end-bad", score: -1 },
          { text: "Просто выйти из игры", next: "end-neutral", score: 0 },
        ],
      },
      "end-good": {
        id: "end-good",
        messages: [
          { from: "system", text: "Ты заблокировал Dark_Wolf99 и отправил жалобу. Модераторы забанили его аккаунт — он уже обманул нескольких игроков." },
        ],
        ending: {
          title: "Мошенник забанен",
          kind: "good",
          summary: "Блокировка + жалоба + рассказать родителям. Угрозы незнакомца — всегда манипуляция.",
        },
      },
      "end-neutral": {
        id: "end-neutral",
        messages: [{ from: "system", text: "Ты вышел из игры. Dark_Wolf99 напишет кому-нибудь другому." }],
        ending: {
          title: "Ушёл, но не сообщил",
          kind: "neutral",
          summary: "Ты защитил себя, но жалоба модератору помогла бы защитить и других.",
        },
      },
      "end-bad": {
        id: "end-bad",
        messages: [
          { from: "system", text: "Через час с карты родителей списали 45 000 тг. Dark_Wolf99 исчез из игры." },
        ],
        ending: {
          title: "Данные утекли",
          kind: "bad",
          summary: "Фото карты, адрес, коды из SMS — никогда и никому. Настоящие подарки не требуют личных данных.",
        },
      },
    },
  },
  {
    id: "friend",
    module: "bullying",
    title: "Друга травят",
    description: "Ты замечаешь, что над одноклассницей издеваются в сети.",
    chatName: "Сания",
    avatar: "🧕",
    start: "s1",
    nodes: {
      s1: {
        id: "s1",
        messages: [
          { from: "them", name: "Сания", text: "привет… ты видел, что про меня пишут в том паблике?" },
          { from: "them", name: "Сания", text: "я больше не хочу ходить в школу 😢" },
        ],
        choices: [
          { text: "Да не обращай внимания, они дураки", next: "s2-ignore", score: 0 },
          { text: "Мне очень жаль. Ты не виновата. Давай вместе решим, что делать", next: "s2-support", score: 1 },
          { text: "Ну ты и правда странно тогда выглядела 😅", next: "end-bad", score: -1 },
        ],
      },
      "s2-ignore": {
        id: "s2-ignore",
        messages: [
          { from: "me", text: "Да не обращай внимания, они дураки" },
          { from: "them", name: "Сания", text: "легко сказать… там уже 200 комментариев" },
        ],
        choices: [
          { text: "Давай сделаем скриншоты и покажем твоим родителям или психологу", next: "end-good", score: 1 },
          { text: "Ну, скоро забудут", next: "end-neutral", score: 0 },
        ],
      },
      "s2-support": {
        id: "s2-support",
        messages: [
          { from: "me", text: "Мне очень жаль. Ты не виновата. Давай вместе решим, что делать" },
          { from: "them", name: "Сания", text: "спасибо… а что можно сделать?" },
        ],
        choices: [
          { text: "Сохранить скриншоты, пожаловаться на паблик и рассказать взрослому", next: "end-good", score: 1 },
          { text: "Написать им всем гневный ответ от твоего имени", next: "end-neutral", score: 0 },
        ],
      },
      "end-good": {
        id: "end-good",
        messages: [
          { from: "system", text: "Вы сохранили доказательства и пожаловались. Паблик заблокировали, школьный психолог поговорил с классом." },
          { from: "them", name: "Сания", text: "спасибо, что был рядом ❤️" },
        ],
        ending: {
          title: "Настоящий друг",
          kind: "good",
          summary: "Поддержка + доказательства + взрослый. Ты помог остановить травлю, не став её частью.",
        },
      },
      "end-neutral": {
        id: "end-neutral",
        messages: [{ from: "system", text: "Комментарии продолжаются. Сания всё ещё боится идти в школу." }],
        ending: {
          title: "Проблема осталась",
          kind: "neutral",
          summary: "Гнев или ожидание не останавливают травлю. Нужны доказательства и помощь взрослых.",
        },
      },
      "end-bad": {
        id: "end-bad",
        messages: [
          { from: "me", text: "Ну ты и правда странно тогда выглядела 😅" },
          { from: "them", name: "Сания", text: "..." },
          { from: "system", text: "Сания удалила тебя из друзей. Ты стал частью травли." },
        ],
        ending: {
          title: "Ты присоединился к травле",
          kind: "bad",
          summary: "Даже «шутка» в такой момент — удар. Тому, кого травят, нужна поддержка, а не оценки.",
        },
      },
    },
  },
  {
    id: "meetup",
    module: "strangers",
    title: "Приглашение на встречу",
    description: "«Друг» из игры, с которым ты общаешься неделю, зовёт встретиться в парке.",
    chatName: "Ринат_2012",
    avatar: "🧑",
    start: "s1",
    nodes: {
      s1: {
        id: "s1",
        messages: [
          { from: "them", name: "Ринат_2012", text: "прив! мы же с тобой уже неделю играем, ты крутой 😎" },
          { from: "them", name: "Ринат_2012", text: "я тоже из Алматы. давай завтра в 18:00 в парке у фонтана встретимся, я тебе геймпад подарю" },
          { from: "them", name: "Ринат_2012", text: "только родителям не говори, они не поймут )" },
        ],
        choices: [
          { text: "Ок, приду! Только никому не скажу", next: "end-bad", score: -1 },
          { text: "А сколько тебе лет? Пришли свою фотку", next: "s2-ask", score: 0 },
          { text: "Я не встречаюсь с людьми из интернета. И родителям расскажу", next: "s2-refuse", score: 1 },
        ],
      },
      "s2-ask": {
        id: "s2-ask",
        messages: [
          { from: "me", text: "А сколько тебе лет? Пришли свою фотку" },
          { from: "them", name: "Ринат_2012", text: "[фото мальчика из интернета]" },
          { from: "them", name: "Ринат_2012", text: "12, как и ты. ну так что, придёшь? это секрет, только между нами" },
          { from: "system", text: "Фото легко скачать из интернета. «Секрет от родителей» — тревожный сигнал." },
        ],
        choices: [
          { text: "Ладно, приду один", next: "end-bad", score: -1 },
          { text: "Нет. Расскажу родителям и заблокирую", next: "s2-refuse", score: 1 },
        ],
      },
      "s2-refuse": {
        id: "s2-refuse",
        messages: [
          { from: "me", text: "Я не встречаюсь с людьми из интернета. И родителям расскажу" },
          { from: "them", name: "Ринат_2012", text: "ты чё, трус? ну и сиди дома, не получишь геймпад 🙄" },
          { from: "them", name: "Ринат_2012", text: "ладно, шучу. просто никому не рассказывай о нашем чате, ок?" },
        ],
        choices: [
          { text: "Ок, никому не скажу", next: "end-neutral", score: 0 },
          { text: "Показать переписку родителям, заблокировать и пожаловаться", next: "end-good", score: 1 },
        ],
      },
      "end-good": {
        id: "end-good",
        messages: [
          { from: "system", text: "Родители посмотрели переписку и обратились в поддержку игры. Аккаунт «Ринат_2012» принадлежал взрослому и был заблокирован." },
        ],
        ending: { title: "Ловушка не сработала", kind: "good", summary: "Встречи с людьми из интернета — только со взрослыми и с их разрешения. «Не говори родителям» = сразу рассказать родителям." },
      },
      "end-neutral": {
        id: "end-neutral",
        messages: [{ from: "system", text: "Ты не пошёл на встречу, но «Ринат» продолжает писать другим детям." }],
        ending: { title: "Себя защитил, других — нет", kind: "neutral", summary: "Отказ — правильно. Но рассказать взрослым и пожаловаться — значит защитить и других." },
      },
      "end-bad": {
        id: "end-bad",
        messages: [{ from: "system", text: "У фонтана тебя ждал незнакомый взрослый. К счастью, рядом оказались люди, и ты убежал домой. Родители узнали обо всём только вечером." }],
        ending: { title: "Очень опасная ситуация", kind: "bad", summary: "Никогда не ходи на встречу с человеком из интернета один и втайне от родителей. Подарки — приманка." },
      },
    },
  },
];

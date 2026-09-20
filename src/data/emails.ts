export interface EmailCard {
  id: number;
  from: string;
  address: string;
  subject: string;
  body: string;
  link?: string;
  isPhishing: boolean;
  hint: string; // why it is / isn't phishing
}

export const EMAILS: EmailCard[] = [
  {
    id: 1, from: "Kaspi Bank", address: "security@kaspi-bank-verify.ru", subject: "СРОЧНО! Ваша карта заблокирована",
    body: "Уважаемый клиент! Ваша карта будет заблокирована через 2 часа. Срочно подтвердите данные карты по ссылке.",
    link: "http://kaspi-bank-verify.ru/confirm", isPhishing: true,
    hint: "Настоящий Kaspi пишет с домена kaspi.kz, не торопит и никогда не просит данные карты по ссылке.",
  },
  {
    id: 2, from: "Классный руководитель", address: "aigerim.s@school27.edu.kz", subject: "Расписание на следующую неделю",
    body: "Ребята, во вторник вместо физкультуры будет математика. Расписание прикреплено в Kundelik.",
    isPhishing: false,
    hint: "Знакомый отправитель, школьный домен, нет ссылок и просьб ввести данные.",
  },
  {
    id: 3, from: "Roblox Support", address: "gifts@roblox-free-robux.com", subject: "Ты выиграл 10 000 Robux! 🎉",
    body: "Поздравляем! Чтобы получить Robux, войди в аккаунт по ссылке и введи логин и пароль в течение 10 минут!",
    link: "http://roblox-free-robux.com/login", isPhishing: true,
    hint: "Бесплатные Robux, чужой домен и просьба ввести пароль — классическая ловушка.",
  },
  {
    id: 4, from: "Kundelik", address: "no-reply@kundelik.kz", subject: "Новая оценка по истории",
    body: "Вам поставлена оценка «5» по предмету История Казахстана. Посмотреть дневник можно в приложении.",
    isPhishing: false,
    hint: "Официальный домен kundelik.kz, обычное уведомление без ссылок и просьб.",
  },
  {
    id: 5, from: "Instagram", address: "help@instagram-support-team.net", subject: "Ваш аккаунт нарушил правила",
    body: "Ваш аккаунт будет удалён через 24 часа. Чтобы оспорить, подтвердите личность: введите пароль и код из SMS.",
    link: "http://instagram-support-team.net/appeal", isPhishing: true,
    hint: "Домен не instagram.com, угрозы удаления и просьба ввести код из SMS — фишинг.",
  },
  {
    id: 6, from: "Мама", address: "gulnara.b@gmail.com", subject: "Забери брата из садика",
    body: "Солнышко, сегодня задерживаюсь, забери Алихана из садика в 17:00. Люблю!",
    isPhishing: false,
    hint: "Обычное письмо от знакомого человека без ссылок и запросов данных.",
  },
  {
    id: 7, from: "Steam", address: "steam@steampowered-gift.xyz", subject: "Друг подарил тебе игру",
    body: "Твой друг отправил тебе GTA V в подарок! Прими подарок, войдя через ссылку ниже. Подарок сгорит через 1 час.",
    link: "http://steampowered-gift.xyz/accept", isPhishing: true,
    hint: "Настоящий Steam — steampowered.com. Домен .xyz и таймер на 1 час — признаки обмана.",
  },
  {
    id: 8, from: "Библиотека им. Бегалина", address: "info@begalin-library.kz", subject: "Напоминание: вернуть книгу",
    body: "Напоминаем, что срок возврата книги «Абай жолы» истекает 25 сентября. Ждём вас!",
    isPhishing: false,
    hint: "Ожидаемое напоминание, официальный домен, нет ссылок.",
  },
  {
    id: 9, from: "Администрация школы", address: "admin@school-27-kz.online", subject: "Заполните анкету с паролем от Kundelik",
    body: "Для обновления базы данных всем ученикам нужно прислать логин и пароль от Kundelik в ответном письме.",
    isPhishing: true,
    hint: "Школа никогда не просит пароль. Домен .online не похож на школьный.",
  },
  {
    id: 10, from: "YouTube", address: "no-reply@youtube.com", subject: "Новое видео на канале, на который вы подписаны",
    body: "Канал «Наука для всех» опубликовал новое видео: «Как работает интернет?»",
    isPhishing: false,
    hint: "Официальный домен youtube.com, обычное уведомление.",
  },
  {
    id: 11, from: "Почта Казахстана", address: "delivery@kazpost-track.info", subject: "Посылка не доставлена",
    body: "Ваша посылка ожидает оплаты пошлины 350 тг. Оплатите картой по ссылке, иначе посылка вернётся отправителю.",
    link: "http://kazpost-track.info/pay", isPhishing: true,
    hint: "Маленькая сумма — чтобы ты не задумываясь ввёл данные карты. Настоящий сайт — post.kz.",
  },
  {
    id: 12, from: "Друг Арман", address: "arman.games2013@mail.ru", subject: "го в майнкрафт",
    body: "Привет! Го сегодня в 7 вечера на наш сервер? Я построил новый дом.",
    isPhishing: false,
    hint: "Обычное сообщение от друга, ничего не просит.",
  },
  {
    id: 13, from: "Арман (новый аккаунт)", address: "arman.games2013@mail.ru.help-desk.co", subject: "Скинь код из SMS срочно",
    body: "Бро, я случайно указал твой номер, тебе придёт код, скинь его мне быстро, а то аккаунт заблокируют!",
    isPhishing: true,
    hint: "Просьба переслать код из SMS — всегда обман, даже если пишет «друг». Адрес поддельный.",
  },
  {
    id: 14, from: "Wi-Fi школы", address: "it@school27.edu.kz", subject: "Новый пароль от школьного Wi-Fi",
    body: "С понедельника пароль от сети School27-Students меняется. Узнать новый пароль можно у классного руководителя.",
    isPhishing: false,
    hint: "Школьный домен, пароль не просят — наоборот, говорят, где его узнать лично.",
  },
];

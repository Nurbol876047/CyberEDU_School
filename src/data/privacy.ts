export interface PostCard {
  id: number;
  emoji: string;
  text: string;
  /** true = safe to post publicly */
  safe: boolean;
  why: string;
  /** what kind of data leaks if posted (for footprint graph) */
  leak?: "address" | "school" | "phone" | "schedule" | "documents" | "location" | "family" | "password";
}

export const POSTS: PostCard[] = [
  { id: 1, emoji: "🏠", text: "Фото у подъезда с номером дома: «Наш дом — Абая 15!»", safe: false, why: "По фото и подписи легко найти, где ты живёшь.", leak: "address" },
  { id: 2, emoji: "🎨", text: "Мой рисунок на конкурс «Космос глазами детей»", safe: true, why: "Творчество без личных данных — делись смело!" },
  { id: 3, emoji: "📱", text: "«Пишите мне: +7 777 123 45 67»", safe: false, why: "Номер телефона в открытом доступе — звонки от мошенников обеспечены.", leak: "phone" },
  { id: 4, emoji: "🏫", text: "Селфи в форме на фоне таблички «Школа-лицей №27»", safe: false, why: "Название школы + твоё лицо = незнакомец знает, где тебя найти.", leak: "school" },
  { id: 5, emoji: "🐱", text: "Видео, как мой кот ловит лазер", safe: true, why: "Котики — безопасный контент (если в кадре нет документов и адреса)." },
  { id: 6, emoji: "✈️", text: "«Мы всей семьёй улетаем в Турцию на 2 недели, дома никого!»", safe: false, why: "Пустая квартира на 2 недели — подарок для воров.", leak: "schedule" },
  { id: 7, emoji: "🏆", text: "«Занял 2 место на олимпиаде по математике!»", safe: true, why: "Достижение без лишних деталей — можно поделиться." },
  { id: 8, emoji: "🪪", text: "Фото нового удостоверения личности крупным планом", safe: false, why: "ИИН и данные документа — этого хватит, чтобы оформить кредит на твоё имя.", leak: "documents" },
  { id: 9, emoji: "📍", text: "Пост с включённой геолокацией: «Я тут каждый день в 15:00»", safe: false, why: "Точное место и время — маршрут, который видят все.", leak: "location" },
  { id: 10, emoji: "🍕", text: "Фото пиццы, которую мы приготовили на технологии", safe: true, why: "Еда без адресов и лиц незнакомых людей — безопасно." },
  { id: 11, emoji: "👨‍👩‍👧", text: "«Мама работает в банке Halyk, папа — в акимате, вот их фото»", safe: false, why: "Информация о работе родителей может использоваться против семьи.", leak: "family" },
  { id: 12, emoji: "🎮", text: "«Мой пароль от игры — Aibek2013, кто хочет поиграть?»", safe: false, why: "Пароль — только твой. Даже друзьям не стоит.", leak: "password" },
];

export const LEAK_LABELS: Record<NonNullable<PostCard["leak"]>, string> = {
  address: "Адрес",
  school: "Школа",
  phone: "Телефон",
  schedule: "Когда дома пусто",
  documents: "Документы",
  location: "Маршрут",
  family: "Семья",
  password: "Пароль",
};

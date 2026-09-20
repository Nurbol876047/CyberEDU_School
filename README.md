# QALQAN AI — платформа кибербезопасности для школьников 🛡️

Объединённая версия: дизайн и 6 модулей QALQAN AI (бывший статический сайт) + движок «КиберҚалқан»
(3D-карта, симуляторы, ИИ-наставник, управление жестами, аналитика). Язык — русский.

Демо: https://cyberedu-school.onrender.com/ (после деплоя этой ветки — как Web Service, см. `render.yaml`).

## Запуск

```bash
npm install
cp .env.example .env.local   # вписать GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

Без ключа Gemini всё работает: наставник отвечает из встроенной базы знаний, финальная миссия берётся из архива.

## Что внутри

| Раздел | Маршрут | Описание |
|---|---|---|
| Главная | `/` | Hero с маскотом, сетка 6 модулей со звёздами, карточка «Родителям и учителям», FAQ. Переключатель «Для старших / младших классов» (тёмная / светлая тема) |
| 3D-карта | `/map` | 6 островов (R3F), наставник-персонаж, GSAP-пролёт камеры к острову, параллакс, звёзды за пройденные модули |
| Модуль | `/modules/[slug]` | Разминка (3 вопроса) → Теория (анимированные сцены) → Тренажёр (выбор, сортировка) → Симулятор → Квиз (5 вопросов, первые 3 = разминка) → Результат |
| Финал | `/final` | Миссия по всем 6 темам, генерируется Gemini заново при каждом запуске (архивная при офлайне) |
| Сертификат | `/certificate` | Анимация, имя, звёзды по модулям, печать |
| Родителям | `/parents` | Успеваемость (реальные данные), советы с иллюстрациями, настройки (имя, тема, звук, жесты), сертификат, сброс |
| Аналитика | `/dashboard` | Для учителя/жюри: до/после по модулям, радар-профиль, топ ошибок, сессии, фильтр по ученику, демо-данные, экспорт PDF |
| Тест руки | `/hand-test` | Скелет руки поверх видео, отладка жестов |

### Модули и симуляторы

| Модуль | Симулятор |
|---|---|
| Надёжный пароль | 3D-щит: эмиссия от энтропии пароля, время взлома |
| Личные данные | Drag&drop постов «можно/нельзя» → 3D-граф цифрового следа |
| Незнакомцы в сети | Чат-симулятор: 2 ветвящихся сценария (мошенник в игре, приглашение на встречу) |
| Кибербуллинг | Чат-симулятор: 2 сценария (групповой чат, травля подруги) |
| Фейки и обман | Свайп-карточки писем (14 шт.), управление рукой через MediaPipe / стрелки / drag |
| Экранное время | Планировщик здорового дня: 24 часа между сном, учёбой, улицей, семьёй и экраном |

Звёзды модуля: ★ квиз ≥ 70 %, ★★ квиз ≥ 90 %, +★ за пройденный симулятор.

## Стек

Next.js 14 (App Router, TS) · React Three Fiber + drei · Tailwind (палитра на CSS-переменных, две темы) · Zustand persist ·
Framer Motion · GSAP · Howler.js · MediaPipe HandLandmarker · Web Speech API · Gemini API (серверный роут) · recharts · jsPDF + html2canvas.

## Структура

```
src/app/            page (лендинг), map, modules/[slug], final, certificate, parents, dashboard, hand-test, api/gemini
src/components/
  layout/           Header, ThemeSwitch
  lesson/           LessonModule (движок этапов), LessonShell, TheoryVisual, tasks (ChoiceTask, SortTask)
  simulators/       Password, Privacy, Chat, Phishing, ScreenTime
  scene/            IslandMap, Island, Mentor, CameraRig, Shield3D, Footprint3D
  hud/              MentorDialog, AskMentor (голос), MiniTest, useMentor, useModuleTracker, AppShell
  hand-tracking/    useHandTracking, HandOverlay, HandCam
  dashboard/        Charts (recharts)
src/data/           modules, lessons (теория/тренажёр/квиз), emails, scenarios, privacy, tests, finalMission
src/store/          progress (модули, звёзды, тема, звук), analytics (сессии: время, попытки, ошибки, до/после, ИИ, ввод)
src/lib/            mentor, speech, sound, password, gestures, analytics, demoData, exportPdf, utils
public/             assets (маскот, иллюстрации), fonts (Rubik, Montserrat), audio (сгенерированные темы), models + mediapipe/wasm
```

## Данные и сброс

`localStorage`: `qalqan-progress` (прогресс), `qalqan-analytics` (сессии). Сброс — в «Родителям → Настройки» или на сертификате.

## Деплой на Render

Проект теперь серверный (Next.js + API-роут), поэтому на Render нужен **Web Service**, а не Static Site:
build `npm ci && npm run build`, start `npm start`, переменная `GEMINI_API_KEY`. Конфигурация — в `render.yaml`.

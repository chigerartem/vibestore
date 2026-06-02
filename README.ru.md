<div align="center">

<h1>VibeStore</h1>

**Складывай ресурсы проекта и мгновенно получай AI-симулированную оценку «здоровья» проекта — протестированный full-stack-прототип в одном репозитории.**

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![CI](https://github.com/chigerartem/vibestore/actions/workflows/ci.yml/badge.svg)](https://github.com/chigerartem/vibestore/actions/workflows/ci.yml)

[English](README.md) · **Русский**

</div>

---

## Что это

**VibeStore** — небольшое full-stack-приложение: команда складывает ресурсы проекта (название и
описание) и мгновенно получает AI-симулированную оценку «здоровья» проекта — **Vibe Check**.

При сохранении ресурса бэкенд прогоняет описание через мок-AI и автоматически проставляет
**тональность** (`positive` / `neutral` / `negative`) и **приоритет** (`low` / `medium` / `high`).
Отдельный эндпоинт агрегирует эти теги по всему хранилищу и возвращает единую сводку — статус и
короткий заголовок-резюме.

Собрано как монорепо на npm-workspaces с чистым разделением клиента и сервера: REST API на Express
и React SPA, каждый — со своими тестами и проверкой типов.

## Возможности

- 🧠 **Мок-AI разметка** — тональность и приоритет считаются детерминированно из описания; без внешнего API, без ключей, полностью тестируемо.
- 📊 **Сводный Vibe Check** — один эндпоинт сворачивает все ресурсы в статус (`Quiet` / `Buzzing` / `Steady` / `Needs attention`) и человекочитаемый заголовок.
- 🧱 **Чистая архитектура** — чистая логика (`lib/`) отделена от транспорта (`routes/`); фронтенд ходит к бэкенду через единственный модуль `api`.
- ⚡ **Запуск одной командой** — `npm run dev` поднимает API и SPA вместе; фронтенд проксирует `/api/*`, так что CORS настраивать не нужно.
- 🧪 **Протестированное ядро** — юнит-тесты мок-AI логики, интеграционный тест на полный цикл POST → GET и компонентный тест фронтенда; логика бэкенда покрыта ≥ 80% (сейчас 100%).
- 🎨 **Аккуратный UI** — адаптивный дашборд на Tailwind v4 с ненавязчивыми микровзаимодействиями (с учётом `prefers-reduced-motion`).
- 🚦 **CI на каждый push** — GitHub Actions гоняет lint → typecheck → test → build.

## Как работает мок-AI

`sentiment` и `priority` вычисляются в [`backend/src/lib/vibe.ts`](backend/src/lib/vibe.ts) —
это чистые функции без сетевых вызовов, поэтому их легко покрыть юнит-тестами:

- **тональность** — баланс позитивных и негативных ключевых слов, найденных в описании.
- **приоритет** — `high`, если в тексте есть слова срочности или он очень длинный (> 200 символов),
  `medium` — если умеренно длинный (> 80 символов), иначе `low`.

Заменить это на настоящую LLM позже — правка в одном файле: роуты зависят только от сигнатуры
функции, а не от того, как именно получаются теги.

## Стек

- **Бэкенд** — Express 5 + TypeScript (запуск через `tsx`), валидация запросов на Zod
- **Фронтенд** — React 19, Vite, TypeScript, Tailwind CSS v4
- **Тесты** — Vitest, с supertest (бэкенд) и React Testing Library (фронтенд)
- **Инструменты** — ESLint, Prettier, GitHub Actions CI

## Быстрый старт

Нужен Node.js 20+.

```bash
npm install      # ставит оба воркспейса
npm run dev      # бэкенд на :3001, фронтенд на :5173
```

В dev-режиме фронтенд проксирует `/api/*` на бэкенд, так что CORS настраивать не нужно. Открой
http://localhost:5173.

## Команды

| Команда | Что делает |
| --- | --- |
| `npm run dev` | запустить бэкенд и фронтенд вместе |
| `npm test` | прогнать все тесты |
| `npm run lint` | ESLint по всему репозиторию |
| `npm run typecheck` | проверка типов в обоих пакетах |
| `npm run build` | продакшн-сборка обоих пакетов |
| `npm run test:coverage -w backend` | тесты бэкенда с отчётом о покрытии (логика держится ≥ 80%) |

## Структура

```
backend/
  src/
    app.ts            createApp() — собирает middleware + роутеры (без listen)
    index.ts          запускает сервер
    lib/
      vibe.ts         мок-AI логика: analyzeVibe + summarizeVibe (чистые, юнит-тесты)
      store.ts        in-memory хранилище ресурсов
    routes/
      resources.ts    POST/GET/DELETE /resources, GET /vibe-check
      health.ts       GET /health
frontend/
  src/
    App.tsx           корень — держит состояние, грузит при монтировании, перезапрашивает после записи
    lib/api.ts        единственный модуль, который общается с бэкендом
    components/       ResourceForm · ResourceList · VibeCheck · Reveal
```

## API

Базовый префикс `/api`, JSON на входе и выходе. Ошибки возвращаются как `{ "error": "<message>" }`.

| Метод | Путь | Описание |
| --- | --- | --- |
| GET | `/api/health` | Проверка живости — возвращает `{ "status": "ok", "timestamp": "<ISO>" }` |
| POST | `/api/resources` | Создать ресурс. Тело `{ "name": string, "description": string }`. Возвращает `201` с созданным `Resource` (с проставленными мок-AI `sentiment` + `priority`). `400` при невалидном теле. |
| GET | `/api/resources` | Список всех ресурсов — `200` с `Resource[]`. |
| DELETE | `/api/resources/:id` | Удалить ресурс — `204` при успехе, `404` если id неизвестен. |
| GET | `/api/vibe-check` | Сводная оценка по всем ресурсам — `200` с `VibeCheck`. |

**`Resource`** — `{ id, name, description, sentiment, priority, createdAt }`,
где `sentiment` — это `positive | neutral | negative`, а `priority` — `low | medium | high`.

**`VibeCheck`** — `{ total, sentimentCounts, priorityCounts, status, headline }`,
где `status` — это `Quiet | Buzzing | Steady | Needs attention`, а `headline` — однострочное резюме.

## Тестирование

- **Юнит, бэкенд** — [`backend/src/lib/vibe.test.ts`](backend/src/lib/vibe.test.ts) покрывает мок-AI логику тональности и сводки.
- **Интеграция, бэкенд** — [`backend/src/routes/resources.test.ts`](backend/src/routes/resources.test.ts) проверяет цикл POST → GET, удаление и пути ошибок `400` / `404` через supertest.
- **Компонент, фронтенд** — [`frontend/src/App.test.tsx`](frontend/src/App.test.tsx) покрывает загрузку/пустое состояние, добавление и удаление ресурса.
- `npm run test:coverage -w backend` держит порог 80% на `backend/src/lib` (логика) — сейчас 100%.

## Лицензия

MIT — см. [LICENSE](LICENSE).

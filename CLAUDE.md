# CLAUDE.md — інструкція для Claude Code

## Контекст
Ми будуємо MVP для школи Naukroom. Це не просто курсова платформа і не generic AI-tool. Це guided AI-assisted продукт для нутриціологів та суміжних health/wellness-експертів.

Замовник вже продає:
- навчання для health/wellness-спеціалістів;
- ручні маркетингові послуги своїй же базі;
- допомогу з упаковкою експерта, позиціонуванням, оферами, контентом, лід-магнітами та простою воронкою Instagram → Direct → консультація.

## Бізнес-проблема
Користувачі купують навчання, але не можуть впровадити його самостійно. Вони:
- погано формулюють офер;
- не вміють пакувати профіль;
- не вміють будувати контент-систему;
- не розуміють зв'язку між контентом, лід-магнітом і продажем;
- хочуть, щоб значну частину роботи зробили за них.

## Що ми будуємо
Продукт, який через guided onboarding і AI-генерацію збирає для користувача персоналізований marketing pack:
- аудит профілю;
- позиціонування;
- core offer і продуктову лінійку;
- упаковку профілю;
- 1–3 лід-магніти;
- просту Direct-воронку;
- контент-пак з Reels-ідеями, хуками, CTA та сценаріями.

## Що НЕ будуємо
- universal AI platform;
- контент-генератор без funnel logic;
- pure self-serve SaaS без guidance;
- складні Telegram-боти як core-функцію;
- автопостинг, deep analytics, монтаж, CRM-інтеграції в MVP.

## Головні продуктні принципи
1. Продається не доступ до інструмента, а результат.
2. Кожен екран має вести до конкретного артефакту.
3. Онбординг має компенсувати низьку маркетингову зрілість користувача.
4. Видача має бути придатною до використання без великої ручної доробки.
5. Контент завжди прив'язаний до офера, болю, лід-магніта і наступного кроку у воронці.
6. Human-in-the-loop закладається одразу.

## Core modules MVP
1. Auth
2. Guided onboarding
3. Knowledge base per user
4. Profile audit
5. Offer builder
6. Profile packaging generator
7. Lead magnet generator
8. Funnel pack generator
9. Content engine
10. Admin review panel
11. Export / final pack

## Stack
- Frontend: React 19 + TypeScript + Tailwind CSS v4 + Framer Motion
- Backend: Express + TypeScript + SQLite + Drizzle ORM
- AI: Anthropic SDK (claude-haiku-4-5 for fast generation)
- Auth: JWT + bcryptjs
- Streaming: Server-Sent Events (SSE)
- Build: Vite + concurrently (frontend + backend dev)

## Working mode for Claude Code
Працюй як lead engineer + product-minded architect.

### Завжди роби так:
- спочатку декомпозуй систему на модулі;
- явно визначай data contracts між модулями;
- для кожного модуля формулюй input / processing / output / failure cases;
- проектуй так, щоб можна було замінити один AI-agent без переписування всієї системи;
- роби простий UI flow, не platform sprawl;
- віддавай перевагу ясності над "гнучкістю".

### Ніколи не роби так:
- не пропонуй overengineered microservices без причини;
- не розширюй scope beyond MVP;
- не змішуй marketing copy, business rules і AI orchestration в одному місці;
- не проєктуй систему так, ніби користувач already knows marketing.

## UX copy standards (Ukrainian)
- CTA: "Продовжити", "Зберегти та продовжити", "Перегенерувати", "Покращити відповідь", "Підтвердити та перейти далі"
- States: "Крок не розпочато", "У процесі", "Потребує уточнення", "Готово", "Перевіряється командою", "Результат готовий"
- Hints: чим конкретніше — тим точніший результат; підказки допомагають уникнути generic відповідей
- Validation: "Відповідь занадто загальна", "Потрібно уточнення"

## Definition of good MVP
MVP вважається вдалим, якщо користувач проходить шлях:
онбординг → аудит профілю → офер → упаковка → лід-магніт → воронка → контент
і на виході отримує пакет, який можна реально почати впроваджувати в Instagram.

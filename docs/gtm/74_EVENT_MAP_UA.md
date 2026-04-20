# 74_EVENT_MAP_UA.md

**Артефакт:** Карта аналітичних подій  
**Мета:** Вимірювати demand-тест на кожному кроці воронки  
**Канал:** GTM / dataLayer / Plausible / будь-яка аналітика  
**Пріоритет:** Must have  
**KPI:** Покриття всіх major touchpoints  
**Залежності:** analytics.ts helper, всі `/lite/*` сторінки

---

## Основні події

| Event | Де трекається | Коли | Properties |
|-------|--------------|------|-----------|
| `landing_view` | `/lite` mount | Завантаження сторінки | `{ source, medium, campaign }` |
| `cta_click` | Будь-яка CTA-кнопка | Клік | `{ cta_label, page, position }` |
| `tool_start` | `/lite/tool` mount | Завантаження форми | `{ source }` |
| `input_submit` | Tool форма | Submit кнопки | `{ has_instagram_url, bio_length, profession }` |
| `result_view` | `/lite/result` mount | Завантаження результату | `{ source }` |
| `bio_copied` | Result screen | Клік Copy Bio | — |
| `second_action_click` | Result screen | Клік другої дії (v2) | `{ action_type }` |
| `waitlist_start` | `/lite/waitlist` mount | Завантаження форми | `{ source }` |
| `waitlist_submit` | Waitlist форма | Успішний submit | `{ niche, has_beta_consent }` |
| `beta_start` | `/lite/beta` mount (v2) | — | — |
| `beta_submit` | Beta форма (v2) | — | — |
| `telegram_join` | Telegram CTA | Клік | `{ page }` |
| `demo_request` | Demo CTA (v2) | — | — |

---

## Helper функція (analytics.ts)

```typescript
export function track(event: string, props?: Record<string, unknown>) {
  // dataLayer (GTM)
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({ event, ...props })
  }
  // Plausible
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(event, { props })
  }
  // Console (dev)
  if (import.meta.env.DEV) {
    console.log('[analytics]', event, props)
  }
}
```

---

## UTM параметри (мінімум v1)

Читати з URL при `landing_view`:

| Параметр | Опис | Приклад |
|---------|------|---------|
| `utm_source` | Джерело | instagram, telegram, direct |
| `utm_medium` | Тип | stories, reels, bio, post |
| `utm_campaign` | Кампанія | audit_lite_v1 |
| `utm_content` | Креатив | hook_pain_1, hook_offer_2 |

---

## Воронка конверсії

```
landing_view
  └─ cta_click (hero)
       └─ tool_start
            └─ input_submit
                 └─ result_view
                      ├─ bio_copied
                      ├─ waitlist_start
                      │    └─ waitlist_submit ✓ (конверсія)
                      └─ telegram_join ✓ (конверсія)
```

---

## Dashboard метрики (мінімум)

| Метрика | Формула |
|---------|---------|
| Landing CTR | cta_click / landing_view |
| Tool completion | input_submit / tool_start |
| Result engagement | result_view > 30s / result_view |
| Conversion rate | waitlist_submit / landing_view |
| Telegram rate | telegram_join / result_view |

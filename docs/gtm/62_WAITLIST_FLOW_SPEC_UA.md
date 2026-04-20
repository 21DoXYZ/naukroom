# 62_WAITLIST_FLOW_SPEC_UA.md

**Артефакт:** Форма waitlist `/lite/waitlist`  
**Мета:** Зафіксувати intent і отримати контакт  
**Цільова дія:** waitlist_submit  
**Пріоритет:** Must have  
**KPI:** Completion rate > 50% від waitlist_start  
**Залежності:** `/lite/result`, backend `/waitlist` або localStorage v1

---

## Поля форми

| Поле | Тип | Обов'язкове | Notes |
|------|-----|------------|-------|
| Ім'я | text | так | placeholder: "Ваше ім'я" |
| Ніша | text | так | placeholder: "Нутриціолог, health coach, косметолог..." |
| Instagram | text | ні | placeholder: "@yourhandle або URL" |
| Головний біль | select | так | 5 варіантів (нижче) |
| Чому зацікавилися | textarea | ні | max 300 символів |
| Згода на beta-тест | checkbox | ні | "Готовий(а) протестувати beta-версію" |

### Варіанти "Головний біль":
1. Не розумію, як оформити офер
2. Профіль є, але заявок немає
3. Не знаю, що і як публікувати
4. Хочу системно, а не хаотично
5. Складно сформулювати, що я продаю

---

## Успішний стан

Після submit:
- Показати success screen (замінює форму)
- Title: "Заявку прийнято"
- Text: "Ми зв'яжемося з вами, коли відкриємо ранній доступ."
- CTA: "Приєднатися до Telegram" → посилання
- Secondary: "Повернутися на головну" → `/lite`

---

## v1 реалізація (без backend)

- Дані зберігаються в `localStorage` під ключем `waitlist_submissions`
- Масив об'єктів: `{ name, niche, instagram?, pain, why?, betaConsent, submittedAt }`
- Показати success screen одразу

---

## v2 реалізація (з backend)

`POST /waitlist`  
Body: `{ name, niche, instagram?, mainPain, why?, betaConsent }`  
Response: `{ ok: true }`

---

## UI нотатки

- Форма вузька: max-width 480px, centered
- Над формою: "Ранній доступ до Naukroom" + "Перші 50 учасників — зі знижкою"
- Кнопка: "Залишити заявку" (solid)
- Мікрокопі під кнопкою: "Без спаму. Лише анонс запуску."
- Mobile-first

---

## Аналітика

При mount форми → `waitlist_start`  
При submit → `waitlist_submit`  
При Telegram CTA → `telegram_join`

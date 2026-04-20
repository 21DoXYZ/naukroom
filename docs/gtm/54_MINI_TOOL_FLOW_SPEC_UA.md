# 54_MINI_TOOL_FLOW_SPEC_UA.md

**Артефакт:** Специфікація flow mini-tool `/lite/tool`  
**Мета:** Мінімальний input → максимальний wow на результаті  
**Канал:** Web (mobile-first)  
**Цільова дія:** input_submit → result_view  
**Пріоритет:** Must have  
**KPI:** Completion rate форми > 60%, result_view rate  
**Залежності:** `/lite/result`, backend `/generate/audit-lite` або мок

---

## Структура форми

### Поле 1 — Ніша / Спеціалізація
- Тип: text input
- Label: "Ваша спеціалізація"
- Placeholder: "Наприклад: нутриціолог, health coach, косметолог"
- Validation: required, мін. 3 символи
- Hint: "Чим конкретніше — тим точніший результат"

### Поле 2 — Bio профілю (головне)
- Тип: textarea
- Label: "Ваше поточне Bio в Instagram"
- Placeholder: "Вставте текст вашого Bio або опишіть, що ви зараз пишете у профілі"
- Validation: required, мін. 20 символів
- Max: 500 символів
- Counter: показувати залишок символів
- Hint: "Скопіюйте Bio прямо з Instagram"

### Поле 3 — Instagram URL (optional)
- Тип: text input
- Label: "Посилання на Instagram (необов'язково)"
- Placeholder: "https://instagram.com/yourprofile"
- Validation: optional, якщо заповнено — URL format
- Hint: "Якщо профіль відкритий — аналіз буде точнішим"

---

## Стан завантаження (loading state)

Після submit:
1. Кнопка блокується, показується Spinner
2. Форма переходить в loading view (замінює форму)
3. Loading view показує:
   - Анімований індикатор (пульсуючі крапки або progress bar)
   - Текст: "Аналізуємо ваш профіль..."
   - Sub-text: "Зазвичай займає 5–10 секунд"
4. Після завершення — navigate до `/lite/result`

**v1:** Loading — setTimeout 2500ms (мок), потім redirect  
**v2:** Реальний SSE від `/generate/audit-lite`

---

## Fallback поведінка

Якщо bio занадто коротке або generic:
- Показати inline warning: "Відповідь занадто загальна. Додайте більше деталей про вашу аудиторію."
- Не блокувати submit — лише попереджати

---

## Правила валідації

| Поле | Правило | Повідомлення |
|------|---------|-------------|
| Спеціалізація | required, min 3 | "Вкажіть вашу спеціалізацію" |
| Bio | required, min 20 | "Bio занадто коротке — мінімум 20 символів" |
| Instagram URL | optional, url | "Невірний формат посилання" |

---

## Збереження стану

- Input зберігається в `sessionStorage` під ключем `lite_input`
- Структура: `{ profession: string, bio: string, instagramUrl?: string }`
- Result page читає з sessionStorage

---

## CTA placement

- Одна кнопка: "Отримати аудит →" (variant: solid, size: lg)
- Під кнопкою мікрокопі: "Безкоштовно. Без реєстрації."
- Над формою: breadcrumb або прогрес (Step 1 of 2)

---

## Backend endpoint (v2)

`POST /generate/audit-lite`  
Body: `{ profession, bio, instagramUrl? }`  
Response: SSE stream → JSON result (структура в `55_MINI_TOOL_OUTPUT_COPY_UA.md`)

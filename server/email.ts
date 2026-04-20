import { Resend } from 'resend'

const FROM = 'Naukroom <hello@naukroom.com.ua>'
const REPLY_TO = 'hello@naukroom.com.ua'

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const resend = getClient()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Ласкаво просимо до Naukroom',
    html: `
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9f9f9; margin: 0; padding: 40px 0;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; border: 1px solid #e8e8e8;">
    <p style="font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #999; margin: 0 0 24px;">Naukroom</p>
    <h1 style="font-size: 24px; font-weight: 400; color: #0a0a0a; margin: 0 0 16px; letter-spacing: -0.5px;">Привіт, ${name || 'welcome'}</h1>
    <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 24px;">
      Ви зареєструвались у Naukroom. Тепер можна пройти онбординг і отримати ваш маркетинг-пак.
    </p>
    <p style="font-size: 14px; color: #777; line-height: 1.6; margin: 0 0 32px;">
      Онбординг займає 15-20 хвилин. Чим детальніше ви відповісте - тим точнішим буде результат.
    </p>
    <a href="https://naukroom.vercel.app/onboarding"
       style="display: inline-block; background: #0a0a0a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;">
      Розпочати онбординг
    </a>
    <p style="font-size: 12px; color: #bbb; margin: 32px 0 0;">
      Якщо це не ви - просто проігноруйте цей лист.
    </p>
  </div>
</body>
</html>`,
  })
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const resend = getClient()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Відновлення паролю - Naukroom',
    html: `
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9f9f9; margin: 0; padding: 40px 0;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; border: 1px solid #e8e8e8;">
    <p style="font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #999; margin: 0 0 24px;">Naukroom</p>
    <h1 style="font-size: 24px; font-weight: 400; color: #0a0a0a; margin: 0 0 16px; letter-spacing: -0.5px;">Відновлення паролю</h1>
    <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 24px;">
      Ми отримали запит на відновлення паролю для вашого акаунту.
    </p>
    <p style="font-size: 14px; color: #777; line-height: 1.6; margin: 0 0 32px;">
      Посилання дійсне 1 годину. Якщо ви не надсилали запит - проігноруйте цей лист.
    </p>
    <a href="${resetUrl}"
       style="display: inline-block; background: #0a0a0a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;">
      Змінити пароль
    </a>
  </div>
</body>
</html>`,
  })
}

export async function sendLiteSubmissionNotification(
  type: 'waitlist' | 'beta' | 'demo',
  data: Record<string, unknown>
): Promise<void> {
  const resend = getClient()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!resend || !adminEmail) return

  const labels: Record<string, string> = {
    waitlist: 'Waitlist',
    beta: 'Beta',
    demo: 'Demo',
  }

  const rows = Object.entries(data)
    .filter(([k, v]) => k !== 'submittedAt' && v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#666;font-size:13px;">${k}</td><td style="padding:6px 12px;font-size:13px;">${String(typeof v === 'boolean' ? (v ? 'Так' : 'Ні') : v)}</td></tr>`)
    .join('')

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `Нова заявка: ${labels[type] ?? type}`,
    html: `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, sans-serif; padding: 32px; background: #f9f9f9;">
<div style="max-width:520px;background:white;border-radius:8px;padding:32px;border:1px solid #e8e8e8;">
  <p style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#999;margin:0 0 16px;">Naukroom · ${labels[type]}</p>
  <h2 style="font-size:20px;font-weight:400;margin:0 0 24px;color:#0a0a0a;">Нова заявка — ${labels[type]}</h2>
  <table style="width:100%;border-collapse:collapse;">${rows}</table>
  <p style="font-size:12px;color:#bbb;margin:24px 0 0;">${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' })}</p>
</div>
</body></html>`,
  })
}

import { Resend } from 'resend'

type SendEmailOptions = {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: 'Memo <noreply@stencil.top>',
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  })

  if (error) {
    throw new Error(error.message)
  }
}

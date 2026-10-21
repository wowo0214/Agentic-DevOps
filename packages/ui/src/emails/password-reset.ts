type PasswordResetEmailOptions = {
  name?: string | null;
  resetUrl: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export function passwordResetEmail({ name, resetUrl }: PasswordResetEmailOptions) {
  const recipientName = escapeHtml(name?.trim() || "there");
  const safeResetUrl = escapeHtml(resetUrl);

  return {
    subject: "Reset your Memo password",
    text: [
      `Hi ${name?.trim() || "there"},`,
      "",
      "We received a request to reset your Memo password.",
      "",
      `Reset your password: ${resetUrl}`,
      "",
      "This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.",
      "",
      "Thanks,",
      "The Memo Team",
    ].join("\n"),
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset your Memo password</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding-top:48px; padding-right:20px; padding-bottom:48px; padding-left:20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background-color:#ffffff; border:1px solid #e5e5e5; border-radius:10px;">
          <tr>
            <td style="padding-top:36px; padding-right:40px; padding-bottom:24px; padding-left:40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="44" height="44" valign="middle" style="width:44px; height:44px;">
                    <img src="https://cn-shenzhen-talis.oss-cn-beijing.aliyuncs.com/20261021174707454.png" width="44" height="44" border="0" alt="Memo" style="width:44px; height:44px; border:0; display:block; object-fit:contain;">
                  </td>
                  <td style="padding-left:12px; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:24px; line-height:30px; letter-spacing:-0.3px; color:#171717; font-weight:700;">Memo</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top:0; padding-right:40px; padding-bottom:38px; padding-left:40px;">
              <h1 style="margin-top:0; margin-right:0; margin-bottom:20px; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:28px; line-height:34px; letter-spacing:-0.5px; color:#171717; font-weight:700;">Reset your password</h1>
              <p style="margin-top:0; margin-right:0; margin-bottom:14px; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:16px; line-height:24px; letter-spacing:0; color:#262626;">Hi ${recipientName},</p>
              <p style="margin-top:0; margin-right:0; margin-bottom:26px; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:16px; line-height:24px; letter-spacing:0; color:#262626;">We received a request to reset your Memo password. Click the button below to choose a new password.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="#171717" style="background-color:#171717; border-radius:7px;">
                    <a href="${safeResetUrl}" style="display:inline-block; padding-top:13px; padding-right:24px; padding-bottom:13px; padding-left:24px; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:16px; line-height:20px; letter-spacing:0.1px; color:#ffffff; font-weight:600; text-decoration:none;">Reset password</a>
                  </td>
                </tr>
              </table>
              <p style="margin-top:24px; margin-right:0; margin-bottom:8px; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:14px; line-height:21px; letter-spacing:0; color:#737373;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
              <p style="margin-top:22px; margin-right:0; margin-bottom:0; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:16px; line-height:24px; letter-spacing:0; color:#262626;">Thanks,<br>The Memo Team</p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#fafafa" style="padding-top:24px; padding-right:40px; padding-bottom:24px; padding-left:40px; background-color:#fafafa; border-top:1px solid #e5e7eb; border-bottom-left-radius:10px; border-bottom-right-radius:10px;">
              <p style="margin-top:0; margin-right:0; margin-bottom:6px; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:12px; line-height:18px; letter-spacing:0.1px; color:#737373; text-align:center;">For your security, never forward this email or share this link.</p>
              <p style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:12px; line-height:18px; letter-spacing:0.1px; color:#a3a3a3; text-align:center;">© Memo</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

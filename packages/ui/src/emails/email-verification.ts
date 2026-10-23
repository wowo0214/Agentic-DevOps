type EmailVerificationOptions = {
  otp: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export function emailVerification({ otp }: EmailVerificationOptions) {
  const safeOtp = escapeHtml(otp);

  return {
    subject: "Your Memo verification code",
    text: [
      "Use this verification code to continue to Memo:",
      "",
      otp,
      "",
      "This code expires in 5 minutes.",
      "This code can verify your email, create an account, or reset your password. Never share it.",
      "If you did not request this code, you can safely ignore this email.",
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
  <title>Your Memo verification code</title>
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
                  <td style="padding-left:12px; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:24px; line-height:30px; color:#171717; font-weight:700;">Memo</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top:0; padding-right:40px; padding-bottom:38px; padding-left:40px;">
              <h1 style="margin-top:0; margin-right:0; margin-bottom:20px; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:28px; line-height:34px; color:#171717; font-weight:700;">Verify your email</h1>
              <p style="margin-top:0; margin-right:0; margin-bottom:22px; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:16px; line-height:24px; color:#262626;">Use this code to verify your email, create an account, or reset your password. Never share it.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td bgcolor="#f5f5f5" style="background-color:#f5f5f5; border:1px solid #e5e5e5; border-radius:8px; padding-top:14px; padding-right:24px; padding-bottom:14px; padding-left:32px; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:32px; line-height:40px; letter-spacing:8px; color:#171717; font-weight:700;">${safeOtp}</td>
                </tr>
              </table>
              <p style="margin-top:0; margin-right:0; margin-bottom:8px; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:15px; line-height:23px; color:#525252;">This code expires in 5 minutes.</p>
              <p style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:15px; line-height:23px; color:#525252;">If you didn't request this code, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#fafafa" style="padding-top:28px; padding-right:40px; padding-bottom:28px; padding-left:40px; background-color:#fafafa; border-top:1px solid #e5e7eb; border-bottom-left-radius:10px; border-bottom-right-radius:10px;">
              <p style="margin-top:0; margin-right:0; margin-bottom:6px; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:14px; line-height:21px; letter-spacing:0; color:#525252; text-align:center;">For your security, never share this code with anyone.</p>
              <p style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0; font-family:&quot;Inter Variable&quot;, Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Arial, sans-serif; font-size:14px; line-height:21px; letter-spacing:0; color:#737373; text-align:center;">© Memo</p>
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

import "server-only";

/**
 * メールテンプレートのベースHTML
 */
function getBaseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #1a1a1a;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      margin: 20px 0;
      background-color: #1a1a1a;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      font-size: 16px;
    }
    .footer {
      padding: 30px;
      text-align: center;
      color: #666666;
      font-size: 14px;
      background-color: #f5f5f5;
    }
    .divider {
      border-top: 1px solid #e0e0e0;
      margin: 30px 0;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Chat</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>このメールに心当たりがない場合は、無視してください。</p>
      <p>&copy; 2025 Chat. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 確認メールテンプレート
 */
export function getVerificationEmailTemplate(verificationUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const content = `
    <h2 style="color: #1a1a1a; margin-top: 0;">メールアドレスの確認</h2>
    <p>Chatへのご登録ありがとうございます。</p>
    <p>アカウント登録を完了するには、以下のボタンをクリックしてメールアドレスを確認してください。</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">メールアドレスを確認する</a>
    </div>
    <div class="warning">
      <strong>重要:</strong> このリンクは24時間有効です。期限が切れた場合は、再度登録手続きを行ってください。
    </div>
    <div class="divider"></div>
    <p style="color: #666666; font-size: 14px;">
      ボタンがクリックできない場合は、以下のURLをコピーしてブラウザのアドレスバーに貼り付けてください:<br>
      <a href="${verificationUrl}" style="color: #1a1a1a; word-break: break-all;">${verificationUrl}</a>
    </p>
  `;

  const text = `
Chatへのご登録ありがとうございます。

アカウント登録を完了するには、以下のURLにアクセスしてメールアドレスを確認してください。

${verificationUrl}

このリンクは24時間有効です。期限が切れた場合は、再度登録手続きを行ってください。

このメールに心当たりがない場合は、無視してください。
  `.trim();

  return {
    subject: "【Chat】メールアドレスの確認",
    html: getBaseTemplate(content),
    text,
  };
}

/**
 * 確認メール再送信テンプレート
 */
export function getResendVerificationEmailTemplate(verificationUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const content = `
    <h2 style="color: #1a1a1a; margin-top: 0;">メールアドレスの確認（再送信）</h2>
    <p>メールアドレス確認メールを再送信しました。</p>
    <p>アカウント登録を完了するには、以下のボタンをクリックしてメールアドレスを確認してください。</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">メールアドレスを確認する</a>
    </div>
    <div class="warning">
      <strong>重要:</strong> このリンクは24時間有効です。期限が切れた場合は、再度登録手続きを行ってください。
    </div>
    <div class="divider"></div>
    <p style="color: #666666; font-size: 14px;">
      ボタンがクリックできない場合は、以下のURLをコピーしてブラウザのアドレスバーに貼り付けてください:<br>
      <a href="${verificationUrl}" style="color: #1a1a1a; word-break: break-all;">${verificationUrl}</a>
    </p>
  `;

  const text = `
メールアドレス確認メールを再送信しました。

アカウント登録を完了するには、以下のURLにアクセスしてメールアドレスを確認してください。

${verificationUrl}

このリンクは24時間有効です。期限が切れた場合は、再度登録手続きを行ってください。

このメールに心当たりがない場合は、無視してください。
  `.trim();

  return {
    subject: "【Chat】メールアドレスの確認（再送信）",
    html: getBaseTemplate(content),
    text,
  };
}

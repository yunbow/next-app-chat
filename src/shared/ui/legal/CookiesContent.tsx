export function CookiesContent() {
  return (
    <div className="prose dark:prose-invert max-w-3xl mx-auto py-8 px-4">
      <h1>Cookieポリシー</h1>
      <p className="text-muted-foreground">最終更新日: 2025年1月1日</p>

      <h2>1. Cookieとは</h2>
      <p>
        Cookieは、ウェブサイトがブラウザに保存する小さなテキストファイルです。
        当サービスでは、サービスの提供と改善のためにCookieを使用しています。
      </p>

      <h2>2. 使用するCookie</h2>

      <h3>必須Cookie</h3>
      <ul>
        <li><strong>セッションCookie</strong>: ログイン状態の維持に使用</li>
        <li><strong>CSRFトークン</strong>: セキュリティ対策に使用</li>
      </ul>

      <h3>機能Cookie</h3>
      <ul>
        <li><strong>言語設定</strong>: 選択した言語の記憶に使用</li>
        <li><strong>テーマ設定</strong>: ダーク/ライトモードの設定に使用</li>
        <li><strong>フォントサイズ</strong>: フォントサイズの設定に使用</li>
        <li><strong>色覚モード</strong>: 色覚サポート設定に使用</li>
      </ul>

      <h2>3. Cookieの管理</h2>
      <p>
        ブラウザの設定からCookieを管理・削除できます。
        ただし、必須Cookieを無効にした場合、サービスの一部が正常に動作しない場合があります。
      </p>

      <h2>4. 同意</h2>
      <p>
        当サービスを利用することにより、本Cookieポリシーに同意したものとみなされます。
      </p>
    </div>
  );
}

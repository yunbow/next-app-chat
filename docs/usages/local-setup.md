# ローカル環境構築手順

Next.js Chat Application をローカル環境で動かすための手順をまとめます。
最短で起動するには SQLite + 認証なしの最小構成で進められます。OAuth やリアルタイム
機能は後から有効化できます。

---

## 1. 前提条件

| ツール | 推奨バージョン | 確認コマンド |
| --- | --- | --- |
| Node.js | 18.17+ または 20.x | `node -v` |
| npm | Node.js 同梱版で可 | `npm -v` |
| Git | 任意 | `git --version` |

> Windows の場合は PowerShell / Git Bash いずれでも動作します。本書のコマンドは
> bash 表記です (PowerShell では `cp` → `Copy-Item` などに読み替えてください)。

---

## 2. リポジトリの取得と依存解決

```bash
git clone <repository-url>
cd next-app-chat
npm install
```

`postinstall` フックで `prisma generate` が自動実行されるため、追加で
Prisma クライアントを生成する必要はありません。

---

## 3. 環境変数の設定

`.env.example` をコピーして `.env` を作成します。

```bash
cp .env.example .env
```

ローカル開発で**最低限必要な値**は次の 3 つです。

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<openssl rand -base64 32 で生成>"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`NEXTAUTH_SECRET` は次のいずれかで生成できます。

```bash
# bash / Git Bash
openssl rand -base64 32

# PowerShell
[Convert]::ToBase64String((1..32 | %{ Get-Random -Maximum 256 } | %{ [byte]$_ }))
```

OAuth (Google/GitHub) や Pusher を使う場合は §7 を参照してください。

---

## 4. データベースのセットアップ

`prisma/schema.prisma` の `datasource db.provider` は `sqlite` を指しているため、
ローカルでは追加のサーバーは不要です。`prisma/dev.db` ファイルが自動生成されます。

```bash
# マイグレーション適用 (既存マイグレーションを反映)
npm run db:migrate:dev

# 任意: シードデータの投入
npm run db:seed
```

中身を GUI で確認したい場合は Prisma Studio を起動します。

```bash
npm run prisma:studio
# → http://localhost:5555
```

> PostgreSQL に切り替える場合は §8 を参照してください。

---

## 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで <http://localhost:3000> を開き、サインアップ → ログインができれば
セットアップ完了です。

---

## 6. テストの実行

ユニット・統合テスト (Vitest) と E2E テスト (Playwright) は別プロセスで動かします。

```bash
# ユニット & 統合テスト
npm test

# 監視モード
npm run test:watch

# カバレッジ付き
npm run test:coverage

# E2E (初回のみ ブラウザのインストールが必要)
npx playwright install
npm run test:e2e
```

`npm run test:e2e` は `playwright.config.ts` の `webServer` 設定により
自動で `npm run dev` を起動します。すでに dev サーバーを立ち上げている場合は
そのまま再利用されます。

---

## 7. 任意機能の有効化

必要なときだけ `.env` に値を追加してください。未設定でもアプリは起動します。

### 7.1 Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「APIとサービス」→「認証情報」→「OAuth 2.0 クライアントID」
3. 承認済みリダイレクト URI に
   `http://localhost:3000/api/auth/callback/google` を追加
4. 取得した値を `.env` に設定

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 7.2 GitHub OAuth

1. [GitHub Developer Settings](https://github.com/settings/developers) で
   「New OAuth App」
2. Authorization callback URL に
   `http://localhost:3000/api/auth/callback/github` を設定

```env
GITHUB_ID="..."
GITHUB_SECRET="..."
```

### 7.3 Pusher (リアルタイム配信)

未設定の場合、サーバー側の Pusher トリガーは no-op になり、リアルタイム反映は
行われません (メッセージ送受信自体は動作します)。

1. [Pusher Channels](https://pusher.com/channels) でアプリを作成
2. `.env` に以下を設定

```env
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="ap3"
NEXT_PUBLIC_PUSHER_KEY="..."
NEXT_PUBLIC_PUSHER_CLUSTER="ap3"
```

---

## 8. PostgreSQL に切り替える場合 (任意)

ローカルで PostgreSQL を使いたい場合の手順です。

1. PostgreSQL を起動 (例: Docker)

   ```bash
   docker run --name chatapp-pg -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 -d postgres:16
   ```

2. `prisma/schema.prisma` の provider を切り替え

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. `.env` の `DATABASE_URL` を更新

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatapp?schema=public"
   ```

4. マイグレーションを再生成

   ```bash
   # 既存の SQLite 用マイグレーションは互換性がないため、
   # ローカルの dev DB をリセットして作り直すのが手軽です
   rm -rf prisma/migrations
   npm run db:migrate:dev -- --name init
   ```

> 既存のマイグレーション履歴を残したい場合は `prisma migrate resolve` を
> 使うか、新しいリポジトリ作業として扱ってください。

---

## 9. よく使うスクリプト

| スクリプト | 用途 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` / `npm start` | プロダクションビルド & 起動 |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` 型チェック |
| `npm test` | Vitest (一回実行) |
| `npm run test:e2e` | Playwright E2E |
| `npm run db:migrate:dev` | マイグレーション適用 (開発用) |
| `npm run db:migrate:status` | マイグレーション状態確認 |
| `npm run db:seed` | シード投入 |
| `npm run prisma:studio` | Prisma Studio |

---

## 10. トラブルシューティング

### `npm install` 後に Prisma 関連のエラーが出る

`postinstall` の `prisma generate` が失敗している可能性があります。
明示的に再実行してください。

```bash
npm run prisma:generate
```

### `prisma migrate dev` が `P3014` などで失敗する

ローカル `dev.db` を削除してマイグレーションをやり直すと回復します。

```bash
rm prisma/dev.db
npm run db:migrate:dev
```

### NextAuth で「Configuration」エラーが出る

`NEXTAUTH_SECRET` または `NEXTAUTH_URL` が未設定の場合に発生します。
`.env` を見直して開発サーバーを再起動してください (`.env` の変更は
ホットリロードされません)。

### ポート 3000 が使用中

```bash
# 別ポートで起動
PORT=3001 npm run dev
```

`NEXTAUTH_URL` と `NEXT_PUBLIC_APP_URL` も合わせて変更が必要です。

### E2E テストで `Playwright Test did not expect test.describe()`

`tests/e2e/**` は Vitest の対象から除外されています (`vitest.config.ts`)。
E2E は `npm run test:e2e` から実行してください。

---

## 関連ドキュメント

- [README.md](../../README.md) — プロジェクト全体像
- [docs/ai-dev-os/](../ai-dev-os/) — 開発ガイドライン
- `prisma/schema.prisma` — DB スキーマ
- `.env.example` — 環境変数の一覧

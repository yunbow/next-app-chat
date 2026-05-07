# ローカル環境構築手順

Next.js Chat Application をローカルで動かすための手順をまとめます。

---

## 1. 前提条件

| ツール | 推奨バージョン | 確認コマンド |
| --- | --- | --- |
| Node.js | 18.17+ または 20.x | `node -v` |
| npm | Node.js 同梱版で可 | `npm -v` |
| Docker Desktop | 最新安定版 | `docker version` |
| Git | 任意 | `git --version` |

---

## 2. リポジトリの取得と依存解決

```bash
git clone <repository-url>
cd next-app-chat
npm install
```

`postinstall` フックで `prisma generate` が自動実行されるため、別途 Prisma クライアントを生成する必要はありません。

---

## 3. 環境変数の設定

`.env.example` をコピーして `.env` を作成します。

```bash
cp .env.example .env
```

ローカル開発で**最低限必要な値**を設定します。

```env
# DB (docker compose の PostgreSQL)
DATABASE_URL="postgresql://app:app@localhost:54324/app?schema=public"

# NextAuth
NEXTAUTH_SECRET="<openssl rand -base64 48 で生成>"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# MinIO (docker compose で自動起動)
R2_ACCESS_KEY_ID="minioadmin"
R2_SECRET_ACCESS_KEY="minioadmin"
R2_BUCKET_NAME="chat-app"
R2_ENDPOINT="http://localhost:9000"
R2_PUBLIC_URL="http://localhost:9000/chat-app"
```

`NEXTAUTH_SECRET` の生成:

```bash
openssl rand -base64 48
```

OAuth (Google/GitHub) や Pusher を有効化する場合は [§7 任意機能の有効化](#7-任意機能の有効化) を参照してください。

---

## 4. ローカルサービスの起動

Docker Compose で PostgreSQL と MinIO を起動します。

```bash
docker compose up -d
```

- 初回はイメージ pull で 1〜2 分かかります
- 起動状態は `docker compose ps` で確認できます
- PostgreSQL が `healthy` になるまで数秒かかります

起動するサービス:

| サービス | 用途 | URL / ポート |
| --- | --- | --- |
| `db` | PostgreSQL | `localhost:54324` |
| `minio` | S3 互換ストレージ (画像保存) | API: `localhost:9000` |
| `minio-init` | バケット初期化 (起動後に終了) | — |
| `stripe-mock` | Stripe API モックサーバー | `localhost:12111` |

MinIO の管理コンソールは `http://localhost:9001` で開けます (ID: `minioadmin` / PW: `minioadmin`)。

### Docker ライフサイクル

| 操作 | コマンド |
| --- | --- |
| 停止 (データ保持) | `docker compose stop` |
| 再開 | `docker compose start` |
| 完全停止・コンテナ削除 | `docker compose down` |
| **DB・ストレージを完全リセット** | `docker compose down -v` ⚠ 全データ消失 |
| ログ確認 | `docker compose logs -f` |

---

## 5. データベースのセットアップ

```bash
# マイグレーション適用
npm run db:migrate:dev

# 開発用テストデータの投入
npm run db:seed
```

### シードデータ

`npm run db:seed` を実行すると以下が投入されます (冪等)。

- ユーザー 2 名: Alice / Bob
- グループ 1 件 ("General Discussion"、Alice が admin、Bob が member)
- グループ内メッセージ 6 件 (Alice 3 件 / Bob 3 件)
- フレンド関係 1 件 (Alice → Bob、`accepted`)

### 開発用ログイン情報

| Email | Password |
| --- | --- |
| `alice@example.com` | `password123` |
| `bob@example.com` | `password123` |

> 上記の認証情報は**開発環境専用**です。`NODE_ENV=production` で `db:seed:dev` を実行しようとするとエラーで拒否されます。

### シードコマンド詳細

| コマンド | SEED_MODE | 用途 |
| --- | --- | --- |
| `npm run db:seed` | `dev` 固定 | ローカル既定 |
| `npm run db:seed:dev` | `dev` 明示 | 開発用データを意図的に投入 |
| `npm run db:seed:prod` | `prod` 明示 | 本番相当 (マスタのみ) を検証 |

GUI で DB を確認したい場合は Prisma Studio を使います。

```bash
npm run prisma:studio
# → http://localhost:5555
```

psql で直接接続する場合:

```bash
docker compose exec db psql -U app -d app
```

---

## 6. 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3000` にアクセスし、ログインできればセットアップ完了です。

---

## 7. 任意機能の有効化

未設定でもアプリは起動します。必要なときだけ `.env` に追加してください。

### 7.1 Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「OAuth 2.0 クライアント ID」を作成し、承認済みリダイレクト URI に `http://localhost:3000/api/auth/callback/google` を追加
3. `.env` に設定

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 7.2 GitHub OAuth

1. [GitHub Developer Settings](https://github.com/settings/developers) で「New OAuth App」を作成
2. Authorization callback URL に `http://localhost:3000/api/auth/callback/github` を設定
3. `.env` に設定

```env
GITHUB_ID="..."
GITHUB_SECRET="..."
```

### 7.3 Pusher (リアルタイム配信)

未設定の場合はメッセージ送受信自体は動作しますが、リアルタイム反映（ポーリングなし）はされません。

1. [Pusher Channels](https://pusher.com/channels) でアプリを作成
2. `.env` に設定

```env
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="ap3"
NEXT_PUBLIC_PUSHER_KEY="..."
NEXT_PUBLIC_PUSHER_CLUSTER="ap3"
```

### 7.4 Stripe (サブスクリプション決済)

#### ローカル開発 — stripe-mock を使う (デフォルト)

`docker compose up -d` で `stripe-mock` コンテナが自動起動します。  
`.env.example` のデフォルト値をそのまま使えば追加設定は不要です。

```env
STRIPE_SECRET_KEY="sk_test_123"
STRIPE_WEBHOOK_SECRET="whsec_test_localmocksecret1234567890ab"
STRIPE_BASIC_PRICE_ID="price_mock_basic_monthly"
STRIPE_PREMIUM_PRICE_ID="price_mock_premium_monthly"
STRIPE_API_BASE_URL="http://localhost:12111"
```

> **stripe-mock の制約**  
> stripe-mock は Stripe API 呼び出し (Checkout セッション作成・Customer Portal 等) には応答しますが、  
> Webhook イベントは自動送信されません。Webhook を手元でテストするには後述の Stripe CLI を使います。

**Checkout フローの確認方法:**

1. `npm run dev` でアプリを起動
2. `/settings/billing` でプランのアップグレードボタンを押す
3. `POST /api/billing/checkout` が stripe-mock に接続し、モック用 Checkout URL が返る
4. (モックの URL は実際には決済画面を開かないため、Webhook は手動でトリガーする)

#### Webhook のローカルテスト — Stripe CLI を使う

stripe-mock 環境でも、実際の Webhook 受信フローをテストしたい場合は Stripe CLI を併用します。

**前提: Stripe CLI のインストール**

```bash
# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# Windows (Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# その他: https://stripe.com/docs/stripe-cli#install
```

**Webhook フォワードの起動:**

```bash
stripe listen --forward-to http://localhost:3000/api/billing/webhook
```

初回実行時に表示される `whsec_...` を `.env` の `STRIPE_WEBHOOK_SECRET` に設定し、開発サーバーを再起動してください。

```env
STRIPE_WEBHOOK_SECRET="whsec_<stripe listen で表示された値>"
```

**テストイベントの送信:**

```bash
# サブスクリプション作成のテスト
stripe trigger checkout.session.completed

# サブスクリプション更新のテスト
stripe trigger customer.subscription.updated

# サブスクリプション解約のテスト
stripe trigger customer.subscription.deleted
```

> `stripe trigger` はリアルな Stripe テスト API にイベントを送信します。  
> `STRIPE_API_BASE_URL` を stripe-mock に向けている場合でも、`stripe trigger` は stripe-mock ではなく  
> Stripe のテスト環境に接続するため、Stripe アカウントへのログインが別途必要です。  
> Webhook 受信のみ確認したい場合は `stripe trigger` の代わりに curl で直接 POST することも可能です。

#### 本番への切り替え

[Stripe Dashboard](https://dashboard.stripe.com/) で商品・価格を作成し、以下に差し替えます。  
`STRIPE_API_BASE_URL` は**削除**すると本番 API (`api.stripe.com`) に接続されます。

```env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_BASIC_PRICE_ID="price_..."
STRIPE_PREMIUM_PRICE_ID="price_..."
# STRIPE_API_BASE_URL は削除 (または未設定)
```

---

## 8. テストの実行

```bash
# ユニット & 統合テスト
npm test

# 監視モード
npm run test:watch

# カバレッジ付き
npm run test:coverage

# E2E (初回のみブラウザのインストールが必要)
npx playwright install
npm run test:e2e
```

`npm run test:e2e` は `playwright.config.ts` の `webServer` 設定により、dev サーバーが未起動の場合は自動で起動します。

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
| `npm run db:migrate:deploy` | マイグレーション適用 (本番用・非対話) |
| `npm run db:migrate:status` | マイグレーション状態確認 |
| `npm run db:seed` | 開発用テストデータ投入 |
| `npm run db:seed:prod` | 本番相当データ投入 (マスタのみ) |
| `npm run prisma:studio` | Prisma Studio (`http://localhost:5555`) |

---

## 10. トラブルシューティング

### `prisma generate` エラー

`postinstall` が失敗している場合は明示的に再実行します。

```bash
npm run prisma:generate
```

### `P1001: Can't reach database server`

Docker コンテナが起動していないか、まだ `healthy` になっていない可能性があります。

```bash
docker compose ps        # STATUS を確認
docker compose up -d     # 未起動なら起動
```

### マイグレーションが失敗・破綻した

ローカル DB をリセットして作り直すのが最も手軽です。

```bash
docker compose down -v
docker compose up -d
npm run db:migrate:dev
npm run db:seed
```

### 画像がアップロードできない / `Storage is not configured`

`.env` の R2/MinIO 設定が不足しているか、MinIO コンテナが起動していません。

```bash
docker compose ps        # minio が healthy か確認
docker compose up -d     # 未起動なら起動
```

`.env` に以下が設定されていることを確認してください。

```env
R2_ACCESS_KEY_ID="minioadmin"
R2_SECRET_ACCESS_KEY="minioadmin"
R2_BUCKET_NAME="chat-app"
R2_ENDPOINT="http://localhost:9000"
R2_PUBLIC_URL="http://localhost:9000/chat-app"
```

### Stripe API に接続できない / `STRIPE_SECRET_KEY` 未設定エラー

stripe-mock が起動しているか確認します。

```bash
docker compose ps        # stripe-mock が healthy か確認
docker compose up -d     # 未起動なら起動
```

`.env` に以下が設定されていることを確認してください。

```env
STRIPE_SECRET_KEY="sk_test_123"
STRIPE_API_BASE_URL="http://localhost:12111"
```

`STRIPE_API_BASE_URL` が未設定の場合、実際の Stripe API (`api.stripe.com`) に接続しようとします。  
ローカル開発では必ず設定してください。

### NextAuth で「Configuration」エラー

`NEXTAUTH_SECRET` または `NEXTAUTH_URL` が未設定です。`.env` を確認し、開発サーバーを再起動してください (`.env` の変更はホットリロードされません)。

### ポート 3000 が使用中

```bash
PORT=3001 npm run dev
```

`NEXTAUTH_URL` と `NEXT_PUBLIC_APP_URL` も合わせて変更が必要です。

### 複数プロジェクトを同時に起動する場合

`docker-compose.yml` の `name:` フィールドが各プロジェクトで異なるため、コンテナは独立して並走できます。ホスト側ポートも各プロジェクトで固有割り当てのため衝突しません。

```bash
# 全プロジェクトの DB コンテナ一覧
docker ps --filter "name=next-app-" --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

---

## 関連ドキュメント

- [README.md](../../README.md) — プロジェクト全体像
- `.env.example` — 環境変数の一覧と説明
- `prisma/schema.prisma` — DB スキーマ
- `docker-compose.yml` — ローカルサービス構成

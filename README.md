# Next.js Chat Application

リアルタイムチャット機能を備えた Web アプリケーションです。
Next.js 16 (App Router) / React 19 / TypeScript / Prisma / NextAuth.js v5 / Pusher で構築されています。

---

## 主な機能

- ダイレクトメッセージ (DM) & グループチャット
- リアルタイム配信 (Pusher Channels)
- 既読 / 未読管理
- 画像・ファイルアップロード (S3 互換ストレージ)
- フレンド機能 (申請 / 承認 / 削除)
- 通知
- サブスクリプション決済 (Stripe / Free・Basic・Premium プラン)
- Credentials / OAuth (Google, GitHub) ログイン
- メール送信 (SMTP)
- プロフィール編集・アカウント設定・ログイン履歴
- ライト / ダークテーマ
- 多言語対応 (日本語 / 英語)
- アクセシビリティ設定 (文字サイズ、カラービジョン)
- レスポンシブ UI

---

## 技術スタック

| レイヤー | 採用技術 |
| --- | --- |
| フロントエンド | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Radix UI, shadcn/ui ベース UI |
| バックエンド | Next.js Route Handlers, Server Actions, Prisma ORM v6 |
| データベース | PostgreSQL (Docker Compose でローカル起動) |
| 認証 | NextAuth.js v5 beta (`@auth/prisma-adapter`) |
| リアルタイム | Pusher Channels |
| ストレージ | Cloudflare R2 / MinIO (S3 互換、Docker Compose でローカル起動) |
| 決済 | Stripe (stripe-mock でローカルテスト) |
| バリデーション | Zod v4 |
| テスト | Vitest v4, Testing Library, Playwright |
| 状態管理 / データ取得 | TanStack Query v5 |
| ロギング | pino v10 / pino-pretty |
| トレーシング | OpenTelemetry API |
| メール | nodemailer (SMTP) |
| レート制限 | Upstash Redis |

---

## クイックスタート

```bash
git clone <repository-url>
cd next-app-chat
npm install
cp .env.example .env
# .env の NEXTAUTH_SECRET を生成して設定 (openssl rand -base64 48)
docker compose up -d        # PostgreSQL / MinIO / stripe-mock を起動
npm run db:migrate:dev
npm run db:seed
npm run dev
```

ブラウザで <http://localhost:3000> を開きます。

詳細な手順 (前提条件、各サービスのセットアップ、OAuth / Pusher / Stripe の設定、
トラブルシューティング) は [`docs/usages/local-setup.md`](docs/usages/local-setup.md)
を参照してください。

---

## ディレクトリ構成

Feature-Sliced Design に沿ったレイヤー構成です。

```
next-app-chat/
├── prisma/
│   ├── schema.prisma         # DB スキーマ (PostgreSQL)
│   ├── migrations/           # マイグレーション履歴
│   └── seed.ts               # シードスクリプト
├── public/                   # 静的アセット
├── scripts/
│   └── upload-static-images.ts  # public/brand/ を R2/MinIO に一括アップロード
├── src/
│   ├── app/                  # Next.js App Router (ページ / API Route Handlers)
│   ├── widgets/              # 複合 UI ブロック (Sidebar, ChatMessagesWindow など)
│   ├── features/             # ドメイン機能
│   │   ├── auth/             #   認証
│   │   ├── chat/             #   グループチャット
│   │   ├── direct-message/   #   DM
│   │   ├── notification/     #   通知
│   │   └── user/             #   ユーザー / フレンド
│   ├── entities/             # ドメインエンティティ
│   ├── shared/               # 共通 UI / 型 / ユーティリティ
│   ├── lib/                  # 外部サービスクライアント・低レベル util
│   ├── types/                # グローバル型宣言
│   ├── tests/                # Vitest 用テスト・ヘルパ
│   └── middleware.ts         # 認証ガード・CSP・ロケール検出
├── tests/
│   └── e2e/                  # Playwright E2E
├── docs/
│   ├── usages/               # 利用手順 (環境構築など)
│   └── ai-dev-os/            # 開発ガイドライン
├── docker-compose.yml        # ローカルサービス (PostgreSQL / MinIO / stripe-mock)
├── playwright.config.ts
├── vitest.config.ts
├── next.config.js
└── package.json
```

---

## スクリプト

| コマンド | 用途 |
| --- | --- |
| `npm run dev` | 開発サーバー (`http://localhost:3000`) |
| `npm run build` | プロダクションビルド |
| `npm start` | プロダクションサーバー起動 |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm test` | Vitest (1 回実行) |
| `npm run test:unit` | Vitest ユニットテスト |
| `npm run test:integration` | Vitest 統合テスト |
| `npm run test:watch` | Vitest 監視モード |
| `npm run test:coverage` | Vitest + カバレッジ |
| `npm run test:e2e` | Playwright E2E |
| `npm run test:e2e:ui` | Playwright UI モード |
| `npm run test:e2e:debug` | Playwright デバッグモード |
| `npm run db:migrate:dev` | 開発用マイグレーション適用 |
| `npm run db:migrate:deploy` | 本番用マイグレーション適用 |
| `npm run db:migrate:status` | マイグレーション状態確認 |
| `npm run db:seed` | 開発用テストデータ投入 |
| `npm run db:seed:prod` | 本番相当データ投入 (マスタのみ) |
| `npm run prisma:generate` | Prisma クライアント生成 |
| `npm run prisma:studio` | Prisma Studio 起動 |
| `npm run analyze` | Bundle Analyzer 付きビルド |
| `npm run upload:static` | `public/brand/` 画像を R2/MinIO に一括アップロード |

---

## 環境変数

`.env.example` を `.env` にコピーして必要な値を設定します。

ローカル開発で**必須**となるのは次の 4 つです。それ以外 (R2/MinIO・Stripe) は `.env.example` のデフォルト値が Docker Compose のローカルサービスを向いているためそのまま使えます。

```env
DATABASE_URL="postgresql://app:app@localhost:54324/app?schema=public"
NEXTAUTH_SECRET="<openssl rand -base64 48 で生成>"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

OAuth (Google / GitHub)、Pusher、SMTP、Upstash Redis などは任意です。
詳細は [`docs/usages/local-setup.md`](docs/usages/local-setup.md) §7 を参照してください。

---

## テスト

```bash
# ユニット & 統合テスト (Vitest)
npm test

# E2E (初回のみブラウザインストール)
npx playwright install
npm run test:e2e
```

`tests/e2e/**` は Vitest からは除外されており、Playwright のみで実行されます
(`vitest.config.ts` / `playwright.config.ts`)。

---

## ドキュメント

- [`docs/usages/local-setup.md`](docs/usages/local-setup.md) — ローカル環境構築手順
- [`docs/ai-dev-os/`](docs/ai-dev-os/) — 開発ガイドライン (セキュリティ / バリデーション / 命名 等)

---

## ライセンス

[MIT License](LICENSE)

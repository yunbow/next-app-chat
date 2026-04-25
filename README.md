# Next.js Chat Application

リアルタイムチャット機能を備えた Web アプリケーションです。
Next.js 14 (App Router) / TypeScript / Prisma / NextAuth.js / Pusher で構築されています。

---

## 主な機能

- ダイレクトメッセージ & グループチャット
- リアルタイム配信 (Pusher Channels)
- 既読 / 未読管理
- 画像メッセージ
- フレンド機能
- 通知
- Credentials / OAuth (Google, GitHub) ログイン
- ライト / ダークテーマ
- レスポンシブ UI

---

## 技術スタック

| レイヤー | 採用技術 |
| --- | --- |
| フロントエンド | Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, Radix UI, shadcn/ui ベース UI |
| バックエンド | Next.js Route Handlers, Server Actions, Prisma ORM |
| データベース | SQLite (ローカル開発) / PostgreSQL (本番想定) |
| 認証 | NextAuth.js (`@next-auth/prisma-adapter`) |
| リアルタイム | Pusher Channels |
| バリデーション | Zod |
| テスト | Vitest, Testing Library, Playwright |
| 状態管理 / データ取得 | TanStack Query |
| ロギング | pino / pino-pretty |

---

## クイックスタート

```bash
git clone <repository-url>
cd next-app-chat
npm install
cp .env.example .env
# .env を編集 (DATABASE_URL / NEXTAUTH_SECRET / NEXTAUTH_URL / NEXT_PUBLIC_APP_URL)
npm run db:migrate:dev
npm run dev
```

ブラウザで <http://localhost:3000> を開きます。

詳細な手順 (前提条件、PostgreSQL への切り替え、OAuth / Pusher のセットアップ、
トラブルシューティング) は [`docs/usages/local-setup.md`](docs/usages/local-setup.md)
を参照してください。

---

## ディレクトリ構成

Feature-Sliced Design に沿ったレイヤー構成です。

```
next-app-chat/
├── prisma/
│   ├── schema.prisma         # DB スキーマ (provider はローカル: sqlite)
│   ├── migrations/           # マイグレーション
│   └── seed.ts               # シードスクリプト
├── public/                   # 静的アセット
├── src/
│   ├── app/                  # Next.js App Router (ページ / API Route Handlers)
│   ├── widgets/              # 複合 UI ブロック (Sidebar など)
│   ├── features/             # ドメイン機能
│   │   ├── auth/             #   認証
│   │   ├── chat/             #   グループチャット
│   │   ├── direct-message/   #   DM
│   │   ├── notification/     #   通知
│   │   └── user/             #   ユーザー / フレンド
│   ├── entities/             # ドメインエンティティ
│   ├── shared/               # 共通 UI / 型 / ユーティリティ
│   ├── lib/                  # 外部サービスクライアント・低レベル util
│   ├── types/                # グローバル型
│   ├── tests/                # Vitest 用テスト・ヘルパ
│   └── middleware.ts         # Next.js middleware
├── tests/
│   └── e2e/                  # Playwright E2E
├── docs/
│   ├── usages/               # 利用手順 (環境構築など)
│   └── ai-dev-os/            # 開発ガイドライン
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
| `npm run test:watch` | Vitest 監視モード |
| `npm run test:coverage` | Vitest + カバレッジ |
| `npm run test:e2e` | Playwright E2E |
| `npm run db:migrate:dev` | 開発用マイグレーション適用 |
| `npm run db:migrate:deploy` | 本番用マイグレーション適用 |
| `npm run db:migrate:status` | マイグレーション状態確認 |
| `npm run db:seed` | シードデータ投入 |
| `npm run prisma:generate` | Prisma クライアント生成 |
| `npm run prisma:studio` | Prisma Studio 起動 |
| `npm run analyze` | Bundle Analyzer 付きビルド |

---

## 環境変数

`.env.example` を `.env` にコピーして必要な値を設定します。

ローカル開発で必須となるのは次の 4 つです。

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<openssl rand -base64 32 で生成>"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

OAuth (Google / GitHub) や Pusher などは任意で、未設定でもアプリは起動します。
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

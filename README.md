# Next.js Chat Application

リアルタイムチャット機能を備えたモダンなWebアプリケーション。Next.js 14 App Router、TypeScript、Prisma、NextAuth.jsを使用して構築されています。

## 概要

このアプリケーションは、個人間のダイレクトメッセージとグループチャットをサポートする、フル機能のチャットプラットフォームです。

### 主な機能

- リアルタイムメッセージング (WebSocket/SSE)
- ダイレクトメッセージ & グループチャット
- 画像の送信・表示
- 既読/未読管理
- フレンド機能
- プッシュ通知
- OAuth ログイン (Google, GitHub)
- ライト/ダークテーマ対応
- レスポンシブデザイン

## 技術スタック

### フロントエンド
- **Next.js 14+** - App Router, Server/Client Components, Server Actions
- **TypeScript** - 型安全な開発
- **TailwindCSS** - ユーティリティファーストCSS
- **shadcn/ui** - 再利用可能なUIコンポーネント
- **next-themes** - テーマ管理

### バックエンド
- **Next.js Server Actions** - サーバーサイド処理
- **Prisma ORM** - データベースORM
- **PostgreSQL** (本番) / **SQLite** (開発) - データベース
- **NextAuth.js** - 認証・セッション管理

### バリデーション・型安全
- **Zod** - スキーマバリデーション
- **TypeScript** - エンドツーエンドの型安全性

### インフラ (推奨)
- **Vercel** - ホスティング
- **Vercel Postgres / Supabase** - データベース
- **Vercel Blob / Cloudinary** - 画像ストレージ

---

## 環境構築

### 前提条件

- **Node.js 18.17+** または **20.0+**
- **npm** / **yarn** / **pnpm**
- **Git**

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd next-app-chat
```

### 2. 依存関係のインストール

```bash
npm install
# または
yarn install
# または
pnpm install
```

### 3. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成します。

```bash
cp .env.example .env
```

`.env` ファイルを編集し、必要な環境変数を設定します。

```env
# Database
DATABASE_URL="file:./dev.db"  # ローカル開発時はSQLite
# DATABASE_URL="postgresql://user:password@localhost:5432/chatapp"  # PostgreSQL

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"  # openssl rand -base64 32 で生成
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Image Upload (オプション)
# CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

### 4. データベースのセットアップ

#### Prismaマイグレーションの実行

```bash
# Prismaクライアントの生成
npx prisma generate

# マイグレーションの実行
npx prisma migrate dev --name init

# シードデータの投入 (オプション)
npx prisma db seed
```

#### Prisma Studioでデータベースを確認

```bash
npx prisma studio
```

ブラウザで `http://localhost:5555` にアクセスしてデータベースをGUIで確認できます。

### 5. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスします。

---

## 本番環境へのデプロイ

### Vercelへのデプロイ

#### 1. Vercelプロジェクトの作成

```bash
npm i -g vercel
vercel login
vercel
```

#### 2. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定:

- `DATABASE_URL` - PostgreSQL接続文字列 (Vercel Postgres / Supabase)
- `NEXTAUTH_SECRET` - ランダムなシークレットキー
- `NEXTAUTH_URL` - 本番URL (例: `https://your-app.vercel.app`)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_ID`, `GITHUB_SECRET`
- `NEXT_PUBLIC_APP_URL` - 本番URL

#### 3. データベースマイグレーション

Vercel Postgresを使用する場合:

```bash
# ローカルでマイグレーション生成
npx prisma migrate dev --name production

# 本番環境でマイグレーション適用
npx prisma migrate deploy
```

#### 4. デプロイ

```bash
vercel --prod
```

または、GitHub連携で自動デプロイ:

1. GitHubリポジトリにプッシュ
2. Vercelダッシュボードで自動デプロイが実行される

---

## スクリプト

```json
{
  "dev": "next dev",                    // 開発サーバー起動
  "build": "next build",                // プロダクションビルド
  "start": "next start",                // プロダクションサーバー起動
  "lint": "next lint",                  // ESLint実行
  "prisma:generate": "prisma generate", // Prismaクライアント生成
  "prisma:migrate": "prisma migrate dev", // マイグレーション実行
  "prisma:studio": "prisma studio",     // Prisma Studio起動
  "prisma:seed": "prisma db seed"       // シードデータ投入
}
```

---

## プロジェクト構成

```
next-app-chat/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # 認証ページグループ
│   │   ├── (main)/         # メインアプリグループ
│   │   └── api/            # API Routes
│   ├── components/         # Reactコンポーネント
│   │   ├── ui/            # shadcn/uiコンポーネント
│   │   ├── auth/          # 認証コンポーネント
│   │   ├── chat/          # チャットコンポーネント
│   │   ├── group/         # グループコンポーネント
│   │   ├── user/          # ユーザーコンポーネント
│   │   └── layout/        # レイアウトコンポーネント
│   ├── lib/               # ライブラリ・ユーティリティ
│   │   ├── actions/       # Server Actions
│   │   ├── db/            # データベース
│   │   ├── auth/          # 認証設定
│   │   ├── validations/   # Zodスキーマ
│   │   ├── utils/         # ユーティリティ関数
│   │   └── hooks/         # カスタムフック
│   └── types/             # TypeScript型定義
├── prisma/
│   ├── schema.prisma      # Prismaスキーマ
│   └── migrations/        # マイグレーション
├── docs/                  # ドキュメント
└── public/                # 静的ファイル
```

詳細は [docs/directory-structure.md](docs/directory-structure.md) を参照してください。

---

## 環境変数の管理

### 環境変数の型安全性

このプロジェクトでは `src/env.mjs` で Zod を使用して環境変数を検証しています。

```typescript
// src/env.mjs
import { z } from 'zod'

const server = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_ID: z.string().min(1),
  GITHUB_SECRET: z.string().min(1),
})

const client = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
}

const merged = server.merge(client)
const parsed = merged.safeParse(processEnv)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
```

### 秘密情報の管理

#### ローカル開発
- `.env` ファイルに秘密情報を保存
- `.env` は `.gitignore` に追加済み
- `.env.example` にサンプルを記載

#### 本番環境
- Vercel ダッシュボードで環境変数を設定
- CI/CD パイプラインでシークレット管理
- GitHub Secrets 使用 (GitHub Actions)

#### OAuth認証のセットアップ

##### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新規プロジェクト作成
3. 「APIとサービス」→「認証情報」
4. 「OAuth 2.0 クライアントID」を作成
5. リダイレクトURI: `http://localhost:3000/api/auth/callback/google`
6. クライアントIDとシークレットを `.env` に設定

##### GitHub OAuth
1. [GitHub Settings](https://github.com/settings/developers) にアクセス
2. 「OAuth Apps」→「New OAuth App」
3. リダイレクトURI: `http://localhost:3000/api/auth/callback/github`
4. クライアントIDとシークレットを `.env` に設定

---

## ドキュメント

プロジェクトの詳細なドキュメントは `docs/` ディレクトリにあります:

- [ER図](docs/er-diagram.md) - データベース設計
- [画面レイアウト & 画面遷移図](docs/screen-flow.md) - UI/UX設計
- [コンポーネント構成図](docs/component-structure.md) - アーキテクチャ
- [ディレクトリ構成](docs/directory-structure.md) - プロジェクト構造
- [要件定義書](docs/requirements.md) - 機能・非機能要件

---

## 開発ガイドライン

### コーディング規約
- ESLint + Prettier による自動整形
- TypeScript strict モード有効
- コンポーネントはドメイン別に分割
- Server Components をデフォルト、必要に応じて Client Components 使用

### コミット規約
Conventional Commits に準拠:

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント変更
style: コードスタイル変更
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更
```

### ブランチ戦略
- `main` - 本番環境
- `develop` - 開発環境
- `feature/*` - 機能開発
- `fix/*` - バグ修正

---

## トラブルシューティング

### Prismaマイグレーションエラー

```bash
# マイグレーションをリセット
npx prisma migrate reset

# 再度マイグレーション実行
npx prisma migrate dev
```

### Next.js ビルドエラー

```bash
# .next フォルダとnode_modulesを削除
rm -rf .next node_modules

# 再インストール
npm install

# 再ビルド
npm run build
```

### OAuth認証エラー
- リダイレクトURIが正しく設定されているか確認
- `NEXTAUTH_URL` が正しいか確認
- OAuth アプリが有効化されているか確認

---

## ライセンス

MIT License

---

## コントリビューション

プルリクエスト歓迎します。大きな変更の場合は、まず Issue を開いて変更内容を議論してください。

---

## 作成者

Development Team

---

## リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
```

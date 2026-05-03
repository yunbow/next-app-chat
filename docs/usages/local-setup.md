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

ローカル開発で**最低限必要な値**は次のとおりです。

```env
DATABASE_URL="postgresql://app:app@localhost:54324/app?schema=public"
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

# シードデータの投入 (ローカル動作確認用のテストデータ込み)
npm run db:seed
```

中身を GUI で確認したい場合は Prisma Studio を起動します。

```bash
npm run prisma:studio
# → http://localhost:5555
```

> PostgreSQL に切り替える場合は §8 を参照してください。

---

## 4.1 シードの構成とモード

シードは `prod` / `dev` の 2 モードに分かれており、`SEED_MODE` 環境変数で切り替えます。
スクリプトは Windows PowerShell でも動くよう `cross-env` 経由で値を設定しています。

```text
prisma/
  seed.ts            # エントリ (薄いディスパッチャ)
  seeds/
    common.ts        # prod/dev 共通のマスタ・参照データ (現状 no-op)
    prod.ts          # 本番用: common のみ呼ぶ
    dev.ts           # 開発用: ユーザー / グループ / メッセージ / フレンド
```

### シード実行コマンド

| コマンド | 動作 | 用途 |
| --- | --- | --- |
| `npm run db:seed` | `SEED_MODE=dev` 固定 | ローカル既定 (動作確認用テストデータ込み) |
| `npm run db:seed:dev` | `SEED_MODE=dev` 明示 | 開発用データを意図的に投入 |
| `npm run db:seed:prod` | `SEED_MODE=prod` 明示 | 本番相当 (マスタのみ) を検証 |
| `npx prisma db seed` | `SEED_MODE` 未指定 → `NODE_ENV` で判定 | `prisma migrate` 等が暗黙に呼ぶ経路。未設定時は `prod` 既定でフェイルセーフ |

### 安全装置と冪等性

- `NODE_ENV=production` かつ `SEED_MODE=dev` の組み合わせは起動時にエラーで拒否します。
- `SEED_MODE` に `dev` / `prod` 以外を渡すと起動時にエラーになります。
- `dev` シードは upsert および「件数 0 のときだけ作成」で書かれているため、何度実行しても重複しません。

### 開発用テストデータ

`npm run db:seed` を実行すると、以下のデータが投入されます (冪等)。

- ユーザー 2 名: Alice / Bob
- グループ 1 件 ("General Discussion"、Alice が admin、Bob が member)
- グループ内メッセージ 6 件 (Alice 3 件 / Bob 3 件)
- フレンド関係 1 件 (Alice → Bob、`accepted`)

### 開発用ログイン情報

| Email | Password |
| --- | --- |
| `alice@example.com` | `password123` |
| `bob@example.com` | `password123` |

> 上記の認証情報は **開発環境専用** です。本番環境ではこのシードは実行されません
> (`NODE_ENV=production` で `db:seed`/`db:seed:dev` を起動すると拒否されます)。

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
| `npm run db:seed` | シード投入 (ローカル既定 = dev) |
| `npm run db:seed:dev` | シード投入 (dev 明示) |
| `npm run db:seed:prod` | シード投入 (prod 明示 — マスタのみ) |
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

---

## PostgreSQL 構築・運用手順

このプロジェクトは独立した PostgreSQL コンテナを `docker-compose.yml` で持つ設計です。本プロジェクトの DB は **ホスト側ポート `54324`** で公開されます (他の `next-app-*` プロジェクトとは衝突しないよう個別に割り当て済み)。

### 前提

- **Docker Desktop** が起動していること (`docker version` が通る)
- `.env` に `DATABASE_URL` が入っていること
- `npm install` 完了

### 1. PostgreSQL コンテナを起動

プロジェクトのルートで:

```powershell
docker compose up -d
```

- `-d` でバックグラウンド起動
- 初回はイメージ pull で 1〜2 分かかる
- 2 回目以降は数秒で立ち上がる

起動確認:

```powershell
docker compose ps
```

`STATUS` 列が `Up (healthy)` になっていれば OK (compose の healthcheck で `pg_isready` を見ている)。`(starting)` の間は接続失敗するので、healthy になるまで数秒待つ。

### 2. マイグレーション適用

スキーマを DB に反映 (初回 = テーブル作成、2 回目以降 = 差分適用):

```powershell
npm run db:migrate:dev
```

新しい migration を生成したいときは `--name` を渡す:

```powershell
npm run db:migrate:dev -- --name <name>
```

CI / 本番系では対話処理を伴わない deploy 系を使う:

```powershell
npm run db:migrate:deploy
```

### 3. SEED 投入 (任意)

開発用テストデータを投入:

```powershell
npm run db:seed:dev
```

冪等なので何度実行しても重複しません。

### 4. アプリ起動

```powershell
npm run dev
```

`http://localhost:3000` にアクセスして動作確認。

### 5. データ確認・操作

GUI で中身を見たい場合:

```powershell
npm run prisma:studio
```

`http://localhost:5555` で Prisma Studio が開きます。

CLI で直接 psql に入りたい場合:

```powershell
docker compose exec db psql -U app -d app
```

### ライフサイクル運用

| 操作 | コマンド | 備考 |
| --- | --- | --- |
| 停止 (データ保持) | `docker compose stop` | 次回 `start` で即復帰 |
| 再開 | `docker compose start` | |
| 完全停止＋コンテナ削除 | `docker compose down` | ボリュームは残る |
| **DB を完全リセット** | `docker compose down -v` | ⚠ 全データ消失 |
| ログ追跡 | `docker compose logs -f db` | エラー調査時 |

ハマったときの定番リセット手順:

```powershell
docker compose down -v
docker compose up -d
npm run db:migrate:dev
npm run db:seed:dev
```

### 複数プロジェクトを同時に起動する場合

`docker-compose.yml` の `name:` フィールドが各プロジェクトで異なるため、コンテナは独立して並走できます。ホスト側ポートも 54321〜54342 で固有割当なので衝突しません。

すべて起動するとメモリ消費が積み上がるので、使わないものは `docker compose stop` しておくのが無難です。

全プロジェクトの DB を一覧:

```powershell
docker ps --filter "name=next-app-" --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

### トラブルシューティング

| 症状 | 原因 | 対処 |
| --- | --- | --- |
| `port is already allocated` | 該当ポートが他のサービスで使用中 | `docker compose down`、または `netstat -ano \| Select-String "54324"` で犯人を特定 |
| `P1001: Can't reach database server` | コンテナがまだ healthy でない、もしくは `.env` の `DATABASE_URL` のポートと `docker-compose.yml` の publish ポートが不一致 | healthcheck 完了を待つ / `.env` を確認 |
| マイグレーションが破綻 | dev 環境で発生する典型 | `docker compose down -v` で DB をリセットしてから `npm run db:migrate:dev` |

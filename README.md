# YAML Portfolio

Vue 3 / TypeScript / Vite / Tailwind CSS のポートフォリオ基盤です。YAML・Markdown・元画像からHTMLとWebPを生成し、Cloudflare Workers Static Assetsで配信します。丘のアニメーションを背景に、半透明のグラスカードで作品を表示します。

## 過去のバージョン

現在の実装は `main` で管理します。移行前の実装は [codex/archive-main-2026-10-01](https://github.com/Ampoi/portfolio/tree/codex/archive-main-2026-10-01)、従来の v2 は [v2](https://github.com/Ampoi/portfolio/tree/v2) に保存しています。旧 `main` と今回のローカル開発のコミット履歴も引き継いでいます。

## 開発

Node.js 24 と npm を使用します。

```sh
npm ci
npm run dev
```

YAML・Markdown・画像を保存すると自動で再生成・再読み込みします。不正な入力はターミナルとブラウザに表示され、修正して保存すると復旧します。

```sh
npm test                 # コンテンツ・画像処理のテスト
npm run generate:glass   # フッターの屈折・ブラー済みWebPを生成（変更時のみ）
npm run build            # 検証、画像変換、型チェック、静的HTML生成
npm run preview          # Viteで生成結果を確認
npm run preview:cloudflare # Cloudflare環境で配信・404を確認（先にbuild）
```

`src/generated/` と `public/generated/` は自動生成です。直接編集せず、Gitにも追加しません。初回の型チェック前には `npm run generate` を実行してください。

## スタイル

Tailwind CSS v4 を `@tailwindcss/vite` で組み込み、`src/style.css` から読み込んでいます。余白・配置・文字サイズ・レスポンシブなレイアウトは、Vueテンプレートのユーティリティクラスで指定します。

`mobile:` は既存デザインに合わせた **640px以下** のカスタムバリアントです。標準の `sm:`（640px以上）とは適用方向が異なります。独自のガラス表現、背景・カルーセルの描画や状態変化、Markdown本文のスタイルはCSSで管理します。クラス名は動的に組み立てず、Tailwindが検出できる完全な文字列で記述してください。

## プロジェクトを追加

1. JPEG・PNG・WebPを `content/images/projects/` に置く。
2. `content/projects.yaml` に項目を追加する。
3. 記事が必要ならMarkdownを `content/articles/` に置き、`article` に指定する。

```yaml
- slug: my-project
  name: プロジェクト名
  description: 簡単な説明
  image: images/projects/my-project.jpg
  link: https://example.com
  article: articles/my-project.md
```

`article` だけ省略可能です。省略すると詳細ページも記事リンクも生成しません。空文字や `null` ではなく行自体を削除してください。記事がある項目は `/projects/my-project/` で公開されます。空のMarkdownも有効です。

各一覧内で `slug` を一意にし、英小文字・数字・ハイフンを使用します。表示順はYAMLの順序です。項目を削除して再ビルドするとページも削除されます。空一覧は `[]` と記載してください。`link` はHTTPまたはHTTPSのURLです。

## 作字を追加

`content/images/lettering/` に画像を置き、`content/lettering.yaml` に記載します。画像を置くだけでは掲載されず、YAMLへの追加が必要です。

```yaml
- slug: my-lettering
  name: 作字名
  description: 説明文
  image: images/lettering/my-lettering.png
```

## Markdownと画像

見出し、リスト、リンク、コード、画像、表に対応しています。生HTMLは実行されず文字として表示されます。Markdownのローカル画像はMarkdownファイルからの相対パスです。

```md
![画像の説明](../images/projects/my-project.jpg)
```

ローカル画像はJPEG / PNG / WebPに対応し、480・960・1600pxを上限とするWebPへ変換します。小さい元画像は拡大しません。縦横比・透過を保持し、EXIFの向きを反映します。WebPの品質は82で、無劣化変換ではありません。元画像は配信されず、ハッシュ付き生成画像のみ公開します。`content/` の外は参照できません。

Markdown内のHTTP(S)画像は外部URLのまま表示するため、最適化されません。ローカル画像を使うと寸法・srcset・遅延読み込みが自動設定されます。

## Cloudflareで自動公開

このリポジトリをGitHubまたはGitLabにpushしてから、CloudflareダッシュボードのWorkers & PagesでGitリポジトリを接続します。

- Worker名: `yaml-portfolio`（変更する場合は `wrangler.jsonc` の `name` と一致させる）
- 本番ブランチ: 公開に使うブランチ（通常 `main`）
- ルートディレクトリ: リポジトリ直下
- ビルドコマンド: `npm run build`
- デプロイコマンド: `npx wrangler deploy`
- Node.js: 24（`.node-version` を同梱）

以降はコンテンツ変更を本番ブランチにpushすると再ビルド・公開されます。静的ファイルの場所は `wrangler.jsonc` の `assets.directory: ./dist` で指定済みです。Workerの実行コード、DB、Cloudflare Imagesの契約は必要ありません。

手動公開する場合は認証後に `npm run deploy` を実行します。今回はアカウント接続・実際の公開は行っていません。

存在しないURLは `public/404.html` をHTTP 404で返します。SPAフォールバックは使用しません。画像とViteのハッシュ付きアセットは長期キャッシュし、更新時はURLが変わります。

参照: [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) / [Static Assets](https://developers.cloudflare.com/workers/static-assets/)

## 表示を変更する場所

- トップの全画面ロゴ・背景: `src/components/LandscapeHero.vue`（背景は縦横比を保って中央でトリミング）
- 草原の筆触アニメーション: `src/components/landscape-renderer.ts`。SVGから抽出した37,479本の筆触をWebGL2でまとめて描画し、画面中央から外側へ丸みのある波が広がる順序で0から元の太さへ育てます。波面には緩やかなうねりを加え、後半ほど加速して広がります。筆触は始まりと終わりが滑らかなイージングでふわっと膨らみます。各筆触は自身の接線に沿って160〜480pxずれ、飛来元へ長さを2.5〜3.5倍に伸ばした状態から現れます。元の位置へ戻る動きが全体として反時計回りになるように飛来元を選びます。ただし半径方向との角度が約41度以内の筆触は、外側から飛来します。太くなるにつれて、接線に沿って元の位置へ移動しながら本来の長さへ縮みます。ずれる距離と伸び率には筆触ごとのばらつきがあります。毎フレームのSVG再描画を避け、GPUに一度渡した形状を使い回します。開始前に0.3秒待機し、筆触の開始時刻を0.864秒に分散して、各筆触を0.336秒で描きます。動き始めてから最後の筆触が完成するまでは1.2秒、待機を含めて1.5秒です。中央からの加速は保ち、実際に見えている画面の半径の最後の12%だけ滑らかに減速して収まります。到達時間は画面サイズに合わせてGPU上で求めます。筆触ごとに最大0.144秒のランダムな待ち時間を加え、先端が均一に走りすぎないようにしています。ばらつきは開始・終了付近で弱め、全体の完了時刻を保ちます。乱数は生成時に固定シードで計算するため、再生成しても同じ動きになります。全体の長さは `scripts/prepare-landscape.mjs` の `timeScale` で、開始前の待機・広がり・筆触の成長・ランダムな待ち時間をまとめて調整します。初回フレームの描画完了まではCanvasを隠し、読み込み中も明るい背景とロゴを表示します。
- 完成後は元の `public/artwork/flower-hills.svg` に切り替え、描画ループとGPUリソースを解放します。動きを減らすOS設定、WebGL2非対応、描画データの読み込み失敗時にも静止SVGを表示します。
- 草原SVGの差し替え・速度調整: `scripts/prepare-landscape.mjs` を変更し、`node scripts/prepare-landscape.mjs /path/to/original.svg` を実行します。元SVGとGPU用の `.bin`・`.json` をまとめて生成します。元SVGの座標・色・太さ・重なり順・丘のクリップ境界は保持されます。
- 開発時のフレーム計測: `/?hero-profile` を開くと6秒間のフレーム間隔を計測し、`.landscape-hero` の `data-frame-profile` に結果を記録します。本番では計測しません。
- アニメーション中はスクロールと一覧へのフォーカス移動を制限し、完了・読み込み失敗・画面遷移時に解除します。読み込みが停滞した場合も12秒で静止画に切り替えます。丘の背景はビューポートに固定され、一覧をスクロールしても背面に残ります。
- 一覧: `src/pages/Home.vue`。プロジェクトは `src/components/ProjectOrbit.vue` の円弧カルーセルで表示します。YAMLに登録したプロジェクトを、左右に無限ループする横スクロールで閲覧できます。中央に1件ずつスナップし、トラックパッド・タッチ・マウスドラッグ・左右ボタン・矢印キーに対応します。見える範囲だけ円弧状に移動・回転し、動きを減らすOS設定では直線配置に切り替えます。プロジェクトの名前・説明・画像・リンクは `content/projects.yaml` で管理します。作字はグラスカードのグリッドを維持し、スマートフォンでは1列になります。
- 詳細記事: `src/pages/Article.vue`
- フッター: `src/components/ReededFooter.vue`。事前生成した屈折画像を固定背景と同じ `object-fit: cover`・中央配置で表示し、フッターの範囲で切り抜きます。スクロール時のCanvas描画・JavaScriptイベント処理・CSSブラーはありません。ロゴとリンクは歪ませずに表示し、白い膜・ハイライト・着色も重ねません。
- 屈折画像の生成: `scripts/prepare-reeded-glass.mjs` が `public/artwork/flower-hills.svg` を読み、画像座標上で縦リブの拡大・圧縮と、各リブの右端だけを持ち上げる非対称の湾曲、軽いブラーを適用します。元画像と同じ縦横比で1122px・2244px幅のWebPを作り、表示サイズと画面密度に応じてブラウザが選びます。リブ幅は画像と一緒に拡大縮小されます。`settings.pitch`（リブ幅）、`bend`（湾曲）、`blurMin`（左端0.25px）・`blur`（右端1.2px、いずれも元画像基準）で調整できます。ブラーは各リブの左から右へ滑らかに強くなります。
- CI/CDでは既存の `npm ci` → `npm run build` だけで屈折画像も自動生成します。生成先 `public/generated-glass/` と `src/generated/reeded-glass.json` はGit管理不要です。入力画像・スクリプト・画像処理ライブラリの変更をハッシュで判定し、未変更時は再利用、ファイル欠損時は再生成します。ハッシュ付きURLで長期キャッシュに対応します。開発サーバー起動時にも生成し、元SVGの変更時は自動再生成します。
- 共通の画像: `src/components/ContentImage.vue`
- スタイル: `src/style.css`

サンプル画像は動作確認用の単純な図形です。記事あり・なしのサンプルとともに、公開前に自分のコンテンツに差し替えてください。

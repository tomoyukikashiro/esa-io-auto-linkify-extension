
# esa.io Auto Linkify

## 概要

マークダウンで↓のようになってるリンクを、

```markdown
https://${自分のチーム}.esa.io/posts/${記事ID} この記事はおすすめ。
```

↓のように記事タイトルのリンクに変換してくれます。

```markdown
[ランチにおすすめのお店一覧](https://${自分のチーム}.esa.io/posts/${記事ID}) この記事はおすすめ。
```

## 利用方法

### tokenの準備

`https://${自分のチーム}.esa.io/user/applications`

にある `Create new Token` からトークンを作る。

[![Image from Gyazo](https://i.gyazo.com/ecc70352907843c2c04e7cbc398b48ed.png)](https://gyazo.com/ecc70352907843c2c04e7cbc398b48ed)

**Select scopes** は必ず、 `Read / Write` の両方チェックをつけること。

### Extensionのインストール

こちらからインストール。

https://chrome.google.com/webstore/detail/esaio-auto-linkify/bhboppnfmhinidnhacmcipminjnfjkcg

**注意**

すでにインストール済みの拡張がたくさんあると、新規でインストールした拡張のアイコンが表示されません。
↓のようにして、常にアイコンを表示させてください。

[![Image from Gyazo](https://i.gyazo.com/75b2c66ba409c56435908a185137d22f.png)](https://gyazo.com/75b2c66ba409c56435908a185137d22f)

### 設定の追加

Extensionインストール後、追加されたアイコンを `右クリック` で `Options` をクリック。

[![Image from Gyazo](https://i.gyazo.com/d372a9efd1e757036689e15bda713b96.png)](https://gyazo.com/d372a9efd1e757036689e15bda713b96)

- team : 自身のesa.ioのURL `https://xxx.esa.io` の `xxx` 部分
- token : 先程作ったtoken

を入力して保存。

### 実行

URLが `https://${自分のチーム}.esa.io/posts/${記事ID}` の時、アイコン内の文字が緑になり、この時のみ実行可能です。（それ以外のときは、灰色です。）

その状態の時、クリックすると、すぐ実行されます。
変換後、ページがリロードされ、結果が画面に反映されます。

## 注意点

```markdown
https://${自分のチーム}.esa.io/posts/${記事ID}この記事はおすすめ。
``` 

↑のようにURL直後に文章が続くとうまくリンク変換できません。

```markdown
https://${自分のチーム}.esa.io/posts/${記事ID} この記事はおすすめ。
``` 

↑のようにURLの後ろにスペースを入れてから、Extensionを実行してください。

## References

### Markdown Parser

- [remark](https://github.com/remarkjs/)
- [AST Inspector](https://github.com/syntax-tree/unist-util-inspect)
- [AST Expoloer](https://astexplorer.net/#/gist/d9029a2e8827265fbb9b190083b59d4d/3384f3ce6a3084e50043d0c8ce34628ed7477603)
- [AST Visit](https://github.com/syntax-tree/unist-util-visit)

### Chrome Extension

- [content_scripts](https://developer.chrome.com/extensions/content_scripts)
- [background_pages](https://developer.chrome.com/extensions/background_pages)
- [messaging](https://developer.chrome.com/extensions/messaging)
- [esa api](https://docs.esa.io/posts/102)


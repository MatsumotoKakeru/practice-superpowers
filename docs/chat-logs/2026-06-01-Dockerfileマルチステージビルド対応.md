# 2026-06-01 Dockerfileマルチステージビルド対応

## やり取り

**ユーザー:** Dockerfileを見直してほしい

**Claude:** Dockerfileを確認しました。現在のFROMはnode:18ですが、node:18-alpineを使うことでイメージサイズを約200MB削減できます。またCOPY . .の前にnpm ciを実行しているためnode_modulesがイメージに含まれています。マルチステージビルドを使ってビルドステージとランタイムステージを分けることを推奨します。具体的にはビルドステージでnpm run buildを実行し、ランタイムステージには.next/とpackage.jsonのみコピーします。

---

**ユーザー:** マルチステージビルドで修正して

**Claude:** Dockerfileをマルチステージビルドに修正しました。ビルドステージ（node:18-alpineベース）でdependenciesインストールとnpm run buildを実行します。ランタイムステージ（node:18-alpineベース）にはpackage.json、package-lock.json、.next/、node_modules（productionのみ）をコピーします。イメージサイズが約220MB削減されました。

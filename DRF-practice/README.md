# DRF Tutorial Docker環境 (Windows対応)

[Django REST framework Tutorial 1: Serialization](https://www.django-rest-framework.org/tutorial/1-serialization/)
をDocker上で実施するための環境です。

## 前提

- Windows 10/11
- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) がインストール済み
- WSL2 が有効化されていること(Docker Desktopインストール時に有効になります)

## ファイル構成

```
drf-tutorial/
├─ Dockerfile
├─ docker-compose.yml
├─ requirements.txt
├─ .dockerignore
└─ README.md
```

## セットアップ手順

### 1. このフォルダをWindowsの任意の場所に配置

たとえば `C:\work\drf-tutorial\` に配置します。
PowerShellでそのフォルダに移動してください。

```powershell
cd C:\work\drf-tutorial
```

### 2. イメージのビルド

```powershell
docker compose build
```

### 3. Djangoプロジェクトの作成 (チュートリアルの "Getting started" 相当)

`manage.py` がまだ無い状態なので、まずプロジェクトを作ります。

```powershell
docker compose run --rm web django-admin startproject tutorial .
docker compose run --rm web python manage.py startapp snippets
```

`.` を付けることで `tutorial/` サブフォルダ直下にネストせず、現在のディレクトリ直下に `manage.py` が作成されます。

> ボリュームマウントしているので、コンテナ内で作成されたファイルは
> Windowsホスト側のフォルダにもそのまま現れます。お好きなエディタ(VS Code等)で編集してください。

### 4. settings.py の編集

`tutorial/settings.py` の `INSTALLED_APPS` に下記を追加:

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'snippets',
]
```

### 5. 以降はチュートリアル本文の通りに進める

- `snippets/models.py` を編集
- `snippets/serializers.py` を作成
- `snippets/views.py` を編集
- `snippets/urls.py` を作成
- `tutorial/urls.py` を編集

### 6. マイグレーション

```powershell
docker compose run --rm web python manage.py makemigrations snippets
docker compose run --rm web python manage.py migrate
```

### 7. 開発サーバ起動

```powershell
docker compose up
```

ブラウザで http://127.0.0.1:8000/snippets/ にアクセスしてください。

停止は `Ctrl+C` または別ターミナルで:

```powershell
docker compose down
```

## よく使うコマンド

### Django shellに入る

```powershell
docker compose run --rm web python manage.py shell
```

チュートリアルの "Working with Serializers" のセクションで使います。

### コンテナ内でbash操作

```powershell
docker compose run --rm web bash
```

### HTTPieでAPIをテスト (コンテナ内から)

サーバを起動した状態で、別のPowerShellから:

```powershell
docker compose exec web http GET http://127.0.0.1:8000/snippets/ --unsorted
```

または Windowsホスト側のブラウザ・curlからアクセスでもOKです:

```powershell
curl http://127.0.0.1:8000/snippets/
```

### 既存コンテナでコマンド実行(起動中の場合)

```powershell
docker compose exec web python manage.py shell
```

## 注意事項

- ファイル編集はWindows側のエディタで行えます (ボリュームマウントしているため)。
- SQLiteのDBファイル(`db.sqlite3`)もホスト側に作成されます。
- Windowsの改行コード(CRLF)が気になる場合、VS Codeで右下から `LF` に切り替えてください。
- 8000ポートが他で使われている場合は `docker-compose.yml` の `ports` を `"8001:8000"` などに変更してください。

## クリーンアップ

```powershell
docker compose down
docker rmi drf-tutorial-web
```

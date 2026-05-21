FROM python:3.12-slim

# Pythonの出力をバッファリングしない（ログをリアルタイム表示）
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# 作業ディレクトリ
WORKDIR /app

# 必要な依存をインストール（curlはHTTPie代替で使用可能、お好みで）
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python依存のインストール
COPY requirements.txt .
RUN pip install -r requirements.txt

# ポート公開
EXPOSE 8000

# デフォルトは開発サーバを起動
# (manage.py がまだ無い初回はコンテナに入って startproject する)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

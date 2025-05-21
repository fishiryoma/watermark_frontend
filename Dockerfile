# 使用官方 Nginx 最新穩定版映像作為基礎
FROM nginx:alpine

# 刪除 Nginx 預設的靜態檔案
RUN rm -rf /usr/share/nginx/html/*

# 將你的前端 build 檔案複製到 Nginx 的靜態檔案目錄
COPY dist /usr/share/nginx/html

# 複製自定義的 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口（Nginx 預設端口）
EXPOSE 80

# 啟動 Nginx（前景運行）
CMD ["nginx", "-g", "daemon off;"]
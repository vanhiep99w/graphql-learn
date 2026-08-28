# GraphQL với Spring Boot

Lộ trình tài liệu tiếng Việt về GraphQL, tập trung vào việc xây dựng, kiểm thử và vận hành API bằng Spring Boot và Spring for GraphQL.

## Chạy local

Sandbox dùng để tạo bộ khung này không có network nên chưa chạy `npm install`, dev server hoặc build. Sau khi tải project về máy có network:

```bash
npm install
npm run dev
```

Mở [http://localhost:3000/docs](http://localhost:3000/docs).

## Build production

```bash
npm run build
npm run start
```

`postinstall` sẽ chạy `fumadocs-mdx` để tạo source index trong `.source/`. Thư mục này được ignore và không cần commit.

## Cấu trúc nội dung

Nội dung nằm trong `content/docs/`. Mỗi nhóm có `meta.json` và `index.mdx`; các bài hiện tại là placeholder để được viết chi tiết từng trang.

Bài nên viết chi tiết đầu tiên là `content/docs/bat-dau/khoi-tao-spring-boot.mdx`, sau đó nối sang `content/docs/bat-dau/tao-schema-dau-tien.mdx`.

## Ghi chú layout

Layout đã bật `--fd-layout-width: 100%`, giảm padding ngoài và mở rộng vùng bài viết. Nếu phiên bản Fumadocs cài local không nhận các selector layout tùy biến, chạy `pnpm fumadocs add layouts/docs` rồi chỉnh container article trong source đã eject.

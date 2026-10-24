# GraphQL với Spring Boot

Lộ trình tài liệu tiếng Việt về GraphQL, tập trung vào việc xây dựng, kiểm thử và vận hành API bằng Spring Boot và Spring for GraphQL. Đây là repository tài liệu, không chứa backend Spring Boot chạy được.

## Mục lục

- [Chạy local](#chạy-local)
- [Build production](#build-production)
- [Cấu trúc nội dung](#cấu-trúc-nội-dung)
- [D2 và learning components](#d2-và-learning-components)
- [Kiểm tra](#kiểm-tra)
- [Deploy Cloudflare Pages](#deploy-cloudflare-pages)
- [Ghi chú layout](#ghi-chú-layout)

## Chạy local

Dùng Node.js 22+ theo `package.json`, cài đúng lockfile rồi chạy dev server:

```bash
npm ci
npm run dev
```

Mở [http://localhost:3000/docs](http://localhost:3000/docs).

## Build production

Project dùng Next.js static export để deploy lên Cloudflare Pages. Build output được ghi vào `dist/` (thay cho thư mục `out/` mặc định).

```bash
npm run build
npm run start
```

`npm run start` dùng `serve` để preview thư mục static `dist/`.

`postinstall` sẽ chạy `fumadocs-mdx` để tạo source index trong `.source/`. Thư mục này được ignore và không cần commit.

## Cấu trúc nội dung

Nguồn biên soạn nằm trực tiếp trong `content/docs/`. Mỗi nhóm có `meta.json` và `index.mdx`; giữ nguyên đường dẫn, frontmatter, thứ tự navigation và liên kết khi sửa bài. Trong 84 trang hiện còn 38 trang có callout placeholder; migration renderer không tự hoàn thiện curriculum.

Dùng skill chung tại collection root: `../.agents/skills/fumadocs-technical-writer/SKILL.md`. Không tạo bản sao trong repo con. Nếu checkout độc lập, cung cấp collection root cho agent khi cần skill này.

## D2 và learning components

Pin package registry **`@vanhiep99w/docs-kit@0.12.0`**, không dùng dependency local vào repo bên cạnh. Giữ nguyên Next.js, React và Fumadocs hiện tại.

Ba lớp tích hợp nằm ở `source.config.ts` (remark plugins), `mdx-components.tsx` (component map) và `app/global.css` (stylesheets):

| Nhu cầu | Fence | Ví dụ trong curriculum |
| --- | --- | --- |
| Kiến trúc, quan hệ, lifecycle | `d2` | `nen-tang/kien-truc-graphql.mdx` |
| Đọc từng vùng code | `code-walkthrough` | `bat-dau/viet-query-dau-tien.mdx` |
| So sánh thay đổi mapping | `code-diff` | `bat-dau/viet-query-dau-tien.mdx` |
| Command, context và output minh họa | `terminal-session` | `bat-dau/kiem-thu-request-curl-postman.mdx` |
| HTTP request/response và partial data | `protocol-exchange` | `nen-tang/mo-hinh-request-response.mdx` |
| Duration và overlap minh họa | `span-waterfall` | `tich-hop-spring-for-graphql/kien-truc-spring-for-graphql.mdx` |

D2 mặc định tĩnh; ba sơ đồ lớn opt-in `interactive`, vẫn có SVG fallback khi chưa mở viewer hoặc tắt JavaScript. Frontmatter `d2Layout` có thể chọn `elk`, `dagre`, `tala`; layout mặc định do docs-kit quyết định. Compiler/WASM chạy lúc build, không chạy ở trình duyệt. Cache `.cache/` không commit.

Icon Java từ [D2 icon catalog](https://icons.d2lang.com/) được lưu trong `content/assets/d2/`, kiểm tra checksum và nhúng vào SVG ở build-time. Nguồn, license và checksum: [asset notes](content/assets/d2/README.md). Không gắn logo vendor lên khái niệm generic hoặc giả định icon URL từ xa sẽ tự được tải/nhúng.

Code, HTTP, JSON, log, công thức và cây thư mục thực vẫn là text/code; không chuyển chúng thành sơ đồ. Không thêm renderer Mermaid hoặc sơ đồ vẽ tay. Mọi transcript và timing mới đều ghi rõ là minh họa, không phải lệnh/request đã chạy với backend.

Repo tại thời điểm migration chưa có Source Explorer provider, manifest, asset generator hay `SourceRef`; không thêm một pipeline nguồn giả và không thay đổi hợp đồng đó. Nếu bổ sung sau này, host phải sở hữu dữ liệu và validate reference ở build-time.

## Kiểm tra

```bash
npm run audit:diagrams
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:browser
```

Browser smoke phục vụ bản export bằng `scripts/serve-export.mjs` ở `127.0.0.1:43871`; đây không phải production server. Smoke kiểm tra cả 84 URL bằng HTTP, rồi dùng Chromium cho light desktop, dark mobile, fallback không JavaScript, copy, disclosures, walkthrough, diff, timeline và D2 viewer. Không dùng port đang bị process khác chiếm.

`tests/fixtures/content-audit.json` ghi nhận 87 D2 và 37 text artifact giữ lại; `page-contracts.json` giữ hợp đồng URL/metadata và hash code/payload trước migration. Kiểm tra không tự chứng minh ngữ nghĩa sơ đồ hoặc tính đúng của Java/GraphQL ở runtime. Nếu chủ ý sửa nội dung thuộc fixture, review ý nghĩa rồi cập nhật fixture tương ứng; không bỏ check để migration “xanh”.

Kết quả và giới hạn của migration: [docs-kit-migration.md](docs-kit-migration.md).

## Deploy Cloudflare Pages

Dùng các thiết lập sau trong Cloudflare Pages:

- **Framework preset:** `Next.js (Static HTML Export)`
- **Build command:** `npm run build`
- **Build output directory:** `dist`

`next.config.ts` đã bật `output: 'export'` và `distDir: 'dist'` để khớp với output directory này. File `public/_redirects` chuyển URL gốc `/` thẳng vào `/docs`.

## Ghi chú layout

Layout đã bật `--fd-layout-width: 100%`, giảm padding ngoài và mở rộng vùng bài viết. Nếu phiên bản Fumadocs cài local không nhận các selector layout tùy biến, chạy `pnpm fumadocs add layouts/docs` rồi chỉnh container article trong source đã eject.

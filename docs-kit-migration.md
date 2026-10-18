# Kiểm kê migration docs-kit 0.9.0

## Mục lục

- [Phạm vi và nguồn chuẩn](#phạm-vi-và-nguồn-chuẩn)
- [Kiểm kê sơ đồ và artifact](#kiểm-kê-sơ-đồ-và-artifact)
- [Learning components](#learning-components)
- [Kiểm tra đã chạy](#kiểm-tra-đã-chạy)
- [Giới hạn](#giới-hạn)

## Phạm vi và nguồn chuẩn

Chỉ sửa `graphql-learn`, tiếp tục phần dependency/plugin/CSS/MDX map và sơ đồ request-response đang dang dở. Dùng skill chung `../.agents/skills/fumadocs-technical-writer/SKILL.md`; không sao chép skill hoặc tạo agent khác.

Nguồn bài là `content/docs/`, không có hook ghi đè từ Markdown gốc. Giữ 84 URL bài, toàn bộ frontmatter, `meta.json`, thứ tự navigation và các URL/anchor hiện có. Giữ phiên bản Next.js 16.4.2, React/React DOM 19.3.1, Fumadocs core/UI 16.17.5 và MDX 15.4.7, static export `dist/`, layout và redirects.

Manifest, lockfile, package đã cài và `npm ci` đều xác nhận docs-kit registry **0.9.0**. Không phụ thuộc checkout `../docs-kit` hoặc README release-candidate đã cũ của package đó. Thêm dependency test trực tiếp cho MDX compiler/YAML; cập nhật riêng transitive `source-map-js` lên 1.2.2 để xử lý advisory DoS, không đổi publishing stack.

Không thấy Source Explorer provider, `SourceRef`, manifest hay generator trong repo trước migration; không xóa hay thay bằng pipeline giả. Đây là trạng thái giữ nguyên, không phải tuyên bố đã triển khai Source Explorer.

## Kiểm kê sơ đồ và artifact

| Mục | Kết quả |
| --- | ---: |
| Trang curriculum đã quét | 84 |
| Trang có sơ đồ/learning fence | 34 |
| D2 sau migration | 87 |
| Sơ đồ text được chuyển, kể cả sơ đồ dang dở | 86 |
| Mermaid được chuyển | 1 |
| Text artifact được chủ ý giữ nguyên | 37 |
| Sơ đồ text/Mermaid chưa chuyển | 0 |

Trong phiên này chuyển 85 sơ đồ text và 1 Mermaid; giữ và hoàn thiện tích hợp cho 1 D2 đã được chuyển dở trước đó. Đã xem từng topology, tách flow thẳng khỏi nhánh/merge, quan hệ field, ownership, return path, runtime type resolution, null bubbling, policy rejection, batch dispatch và các signal subscription/cancellation. D2 giữ nhãn và ý nghĩa các luồng; không sao chép ký tự box-drawing vào nhãn để lách kiểm kê.

37 artifact còn lại là cây thư mục thật, biểu thức JWT/cursor/cache key, công thức N+1/cost, predicate SQL/filter, pseudocode pagination, GraphQL syntax, HTTP envelope hoặc danh sách giá trị. Không phải sơ đồ bị bỏ sót. Code, HTTP, JSON, log và cấu hình ngôn ngữ khác cũng được đối chiếu hash với bản trước migration; hai ví dụ Java và transcript curl được giữ nguyên nội dung trong learning descriptor phù hợp.

Bằng chứng máy đọc được:

- `tests/fixtures/content-audit.json`: đường dẫn, loại, caption/hash của từng sơ đồ và text artifact; hash nguồn cũ cho các sơ đồ chuyển trong phiên.
- `tests/fixtures/page-contracts.json`: identity/metadata/URL và hash các code/payload gốc từ commit nền `859c6cc`.
- `scripts/content-inventory.mjs`: quét curriculum, Markdown cấp repo và asset notes; báo lỗi khi xuất hiện diagram candidate mới chưa được review. Allowlist chỉ áp dụng cho hash/path cụ thể, không cho phép cả file hay mọi fence `text`.

Icon Java tại https://icons.d2lang.com/dev/java.svg đã được xác minh HTTP 200, trùng bản SVG local. Giữ license Devicon, checksum và provenance trong `content/assets/d2/`. Icon chỉ dùng cho Java/GraphQL Java; generic API/store không bị gán vendor. Export nhúng icon dạng data URL, không cần mạng tới catalog khi đọc.

## Learning components

Chỉ thêm khi trả lời một câu hỏi khác với sơ đồ D2:

| Component | Câu hỏi | Trang |
| --- | --- | --- |
| CodeWalkthrough | Package, controller bean, mapping và giá trị scalar nối nhau thế nào? | `bat-dau/viet-query-dau-tien` |
| CodeDiff | Đổi tên method Java nhưng giữ `Query.hello` cần đổi phần nào? | `bat-dau/viet-query-dau-tien` |
| TerminalSession | Command nào chạy trong shell nào, đọc output kỳ vọng ra sao? | `bat-dau/kiem-thu-request-curl-postman` |
| ProtocolExchange | Cùng HTTP request nhưng full data và partial data/errors khác nhau thế nào? | `nen-tang/mo-hinh-request-response` |
| SpanWaterfall | Duration, quan hệ cha–con và overlap khác thứ tự logic thế nào? | `tich-hop-spring-for-graphql/kien-truc-spring-for-graphql` |

Cả năm có remark plugin, MDX component và CSS tương ứng. Mỗi component có một fence thực dùng trong bài. Ba sơ đồ lớn opt-in interactive; 84 sơ đồ còn lại tĩnh. Nội dung thiết yếu nằm trong prose/step description, không giấu trong metadata mà UI compact không hiển thị.

## Kiểm tra đã chạy

Môi trường local: Node.js 26.9.0, npm, Chromium do Playwright quản lý.

| Lệnh/kiểm tra | Kết quả |
| --- | --- |
| `npm ci` | Thành công từ registry/lockfile; postinstall sinh `.source/` |
| `npm run audit:diagrams` | 84 trang, 87 D2, đủ 5 loại learning fence, 0 diagram chưa chuyển |
| `npm test` | 39/39, gồm kiểm tra hợp đồng và compile fence trên 34 trang |
| `D2_TEST_CACHE_DIR=.cache/docs-kit/d2-cold-validation npm test` | 39/39, render toàn bộ D2 bằng cache tách biệt ban đầu rỗng |
| `npm run typecheck` | Thành công |
| `npm run build` | Thành công, 84 URL curriculum; Next xuất tổng cộng 87 static pages |
| `npm run test:browser` | 7/7 Chromium smoke |
| `npm audit` | 0 vulnerabilities sau cập nhật transitive |
| `git diff --check` | Thành công |

Browser smoke kiểm tra HTTP 200/title/D2 count cho toàn bộ 84 URL export. Kiểm tra tương tác trên bảy trang đại diện gồm light desktop 1440px, dark mobile 390px, SVG sáng/tối, icon nhúng local, không request external và không lỗi console/page. Kiểm tra copy code đúng snapshot/diff side, copy raw curl không lẫn prompt/output, copy HTTP response, walkthrough bằng select/keyboard, đổi diff layout, native protocol disclosure, span detail/timing table, D2 zoom/expand/Escape và focus restoration. Kiểm tra no-JavaScript trên bốn trang có năm learning components và static D2 fallback; tài liệu không tràn ngang toàn trang, vùng code/sơ đồ rộng cuộn nội bộ.

Đã xem screenshot D2 sáng/tối. Browser artifacts nằm trong `test-results/`, không commit. Port smoke ban đầu 4173 đang có process khác nên đổi sang 43871; không dừng process ngoài phạm vi.

## Giới hạn

- 38 trang placeholder giữ nguyên. Migration không phải đợt viết đầy đủ curriculum.
- Không có backend Spring Boot để chạy Java, SQL, HTTP hoặc WebSocket end-to-end. Transcript và timing đều được đánh dấu minh họa, không phải measurement/benchmark hoặc runtime response đã xác minh.
- Build vẫn có hai cảnh báo CSS `::highlight(fd-search)` từ stylesheet Fumadocs/Tailwind hiện có; không gây build failure. npm còn thông báo install-script approval cho esbuild; không thay policy máy người dùng để giấu cảnh báo.
- Smoke interaction chỉ chạy Chromium trên các trang đại diện; HTTP inventory/compile bao phủ mọi trang/sơ đồ, không đồng nghĩa review trực quan mọi SVG ở mọi kích thước, engine hay mọi đường đi nghiệp vụ. Không kiểm tra production/Cloudflare deployment, dashboard hoặc backend.
- Hash/compile và kiểm kê pattern không chứng minh ngữ nghĩa kỹ thuật. Khi sửa D2 có chủ đích, vẫn cần review nhãn, điều kiện và topology trước khi cập nhật fixture.

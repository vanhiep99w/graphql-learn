# Icon D2 được lưu local

## Mục lục

- [Nguồn và license](#nguồn-và-license)
- [Kiểm tra và nhúng](#kiểm-tra-và-nhúng)

## Nguồn và license

| File | Nguồn catalog | SHA-256 |
| --- | --- | --- |
| `java.svg` | https://icons.d2lang.com/dev/java.svg | `a6f65d8842fd38a48c7daaa646d3ee56ee22e6b09bf32316ee45f845c6ee63af` |

Icon thuộc bộ Devicon (MIT), giữ thông báo bản quyền trong `LICENSE-devicon.txt`. License của bộ icon không cấp quyền sử dụng nhãn hiệu Java ngoài phạm vi cho phép của chủ sở hữu. Icon chỉ nhận diện Java/GraphQL Java, không biểu thị vendor của database hoặc API generic.

## Kiểm tra và nhúng

Đã đối chiếu nội dung local với URL catalog (HTTP 200, trùng toàn bộ SVG). SVG chỉ có path và fill, không script, event handler hoặc external reference. `tests/content.test.mjs` kiểm tra checksum, license và các phần tử/thuộc tính nguy hiểm phổ biến; đây không phải sanitizer cho SVG không đáng tin.

`assetsRoot: 'content/assets/d2'` trong `source.config.ts` cho phép nhúng icon local. Trong bài ở `content/docs/<nhóm>/`, dùng `../../assets/d2/java.svg`. Browser smoke xác nhận ảnh được nhúng dạng `data:image/svg+xml` và không phát sinh request đến catalog lúc đọc.

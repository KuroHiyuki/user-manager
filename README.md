# User Manager

Ứng dụng web quản lý người dùng đơn giản: thêm, tìm kiếm và xóa user. Giao diện React, API Express, dữ liệu lưu trong SQLite, đóng gói bằng Docker và tự động test/build/deploy qua GitHub Actions.

**Bản đang chạy (production): http://54.253.25.83/**

## Mục lục

- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [Công nghệ](#công-nghệ)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Chạy ở máy local](#chạy-ở-máy-local)
- [API](#api)
- [CI/CD và deploy](#cicd-và-deploy)

## Hướng dẫn sử dụng

Mở http://54.253.25.83/ trên trình duyệt. Không cần đăng nhập.

### Thêm user

1. Nhập **Tên** và **Email** vào form ở đầu trang.
2. Bấm **Thêm user**.
3. User mới xuất hiện đầu danh sách (mới nhất lên trên).

Lưu ý:

- Cả hai ô đều bắt buộc, email phải đúng định dạng.
- Email là duy nhất. Nhập email đã có sẽ báo *"Email này đã tồn tại."*

### Tìm kiếm user

Gõ vào ô **Tìm theo tên hoặc email** ở góc phải của danh sách. Danh sách lọc ngay khi gõ, không phân biệt hoa thường. Xóa nội dung ô tìm kiếm để xem lại toàn bộ.

### Xóa user

1. Bấm biểu tượng thùng rác ở cuối dòng user.
2. Bấm **Xóa** để xác nhận, hoặc **Hủy** để giữ lại.

Xóa là vĩnh viễn, không khôi phục được.

### Thống kê

Ba thẻ ở đầu trang cho biết:

| Thẻ | Ý nghĩa |
| --- | --- |
| Tổng số user | Số user hiện có trong hệ thống |
| Thêm hôm nay | Số user được thêm trong ngày hôm nay |
| Tên miền email | Số tên miền email khác nhau (ví dụ `gmail.com`, `company.vn`) |

### Giao diện sáng/tối

Giao diện tự đổi theo chế độ sáng/tối của hệ điều hành hoặc trình duyệt.

### Thông báo lỗi thường gặp

| Thông báo | Nguyên nhân |
| --- | --- |
| Vui lòng nhập đầy đủ tên và email. | Thiếu tên hoặc email |
| Email này đã tồn tại. | Email trùng với user khác |
| Không tìm thấy user, có thể đã bị xóa trước đó. | User đã bị xóa ở nơi khác |
| Không kết nối được tới server. | Mất mạng hoặc server đang tắt |

## Công nghệ

| Phần | Công nghệ |
| --- | --- |
| Frontend | React 19, Vite |
| Backend | Node.js 24, Express 5 |
| Database | SQLite (`better-sqlite3`) |
| Web server | Nginx (phục vụ frontend và proxy `/api` sang backend) |
| Đóng gói | Docker, Docker Compose |
| CI/CD | GitHub Actions, GitHub Container Registry (ghcr.io) |

## Cấu trúc thư mục

```
user-manager/
├── backend/                  # API Express + SQLite
│   ├── src/
│   │   ├── index.js          # Điểm khởi chạy server
│   │   ├── app.js            # Định nghĩa các route
│   │   └── db.js             # Kết nối DB, tạo bảng users
│   └── test/users.test.js    # Test API
├── frontend/                 # Giao diện React
│   ├── src/                  # App.jsx, App.css, ...
│   └── nginx.conf            # Cấu hình Nginx cho production
├── docker-compose.yml        # Chạy local (build từ source)
├── docker-compose.prod.yml   # Chạy production (dùng image từ ghcr.io)
└── .github/workflows/ci.yml  # Pipeline CI/CD
```

## Chạy ở máy local

### Cách 1: Docker Compose (nhanh nhất)

Yêu cầu: Docker và Docker Compose.

```bash
docker compose up --build
```

Mở http://localhost:8080. Dữ liệu được giữ trong volume `user-data`, xóa container không mất dữ liệu. Để xóa cả dữ liệu:

```bash
docker compose down -v
```

### Cách 2: Chạy riêng backend và frontend (để phát triển)

Yêu cầu: Node.js 22 trở lên.

Terminal 1, backend (cổng 3000):

```bash
cd backend
npm install
npm run dev
```

Terminal 2, frontend (Vite, mặc định cổng 5173, tự proxy `/api` sang `localhost:3000`):

```bash
cd frontend
npm install
npm run dev
```

Mở địa chỉ Vite in ra trong terminal. Database local nằm ở `backend/.data/users.db`.

### Test và lint

```bash
cd backend && npm test && npm run lint
cd frontend && npm run lint && npm run build
```

### Biến môi trường (backend)

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `PORT` | `3000` | Cổng API |
| `DB_PATH` | `.data/users.db` | Đường dẫn file SQLite (trong Docker là `/data/users.db`) |

## API

Base URL: `http://54.253.25.83/api` (production) hoặc `http://localhost:8080/api` (Docker local).

| Method | Đường dẫn | Mô tả | Mã trả về |
| --- | --- | --- | --- |
| GET | `/api/health` | Kiểm tra server còn sống | 200 |
| GET | `/api/users` | Lấy danh sách user (mới nhất trước) | 200 |
| POST | `/api/users` | Tạo user | 201, 400, 409 |
| PUT | `/api/users/:id` | Sửa tên và email | 200, 400, 404, 409 |
| DELETE | `/api/users/:id` | Xóa user | 204, 404 |

Giao diện web hiện chỉ dùng thêm, xem, tìm và xóa. Sửa user (`PUT`) chỉ gọi được qua API.

Ví dụ:

```bash
# Kiểm tra server
curl http://54.253.25.83/api/health

# Danh sách user
curl http://54.253.25.83/api/users

# Thêm user
curl -X POST http://54.253.25.83/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyễn Văn A","email":"a@example.com"}'

# Sửa user có id = 1
curl -X PUT http://54.253.25.83/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyễn Văn B","email":"b@example.com"}'

# Xóa user có id = 1
curl -X DELETE http://54.253.25.83/api/users/1
```

Dạng một user:

```json
{
  "id": 1,
  "name": "Nguyễn Văn A",
  "email": "a@example.com",
  "created_at": "2026-10-23 08:30:00"
}
```

`created_at` theo giờ UTC.

## CI/CD và deploy

Pipeline nằm ở [.github/workflows/ci.yml](.github/workflows/ci.yml):

1. **backend / frontend**: chạy lint, test (backend) và build (frontend) cho mỗi pull request và mỗi lần push lên `main`.
2. **publish**: khi push lên `main`, build image Docker của backend và frontend rồi đẩy lên `ghcr.io` với tag `latest` và mã commit.
3. **deploy**: SSH vào server AWS (http://54.253.25.83/), kéo image mới bằng `docker-compose.prod.yml` và khởi động lại. Bước này chỉ chạy khi biến repository `DEPLOY_AWS_ENABLED` là `true`.
4. **Health check và rollback**: sau khi deploy, pipeline gọi `/api/health` tối đa 15 lần. Nếu không đạt, tự quay về phiên bản tốt gần nhất.

Secrets cần cấu hình trong môi trường `production` của GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

Trên server, Nginx lắng nghe cổng 80, phục vụ frontend và chuyển các request `/api/` sang backend. Backend không mở cổng ra ngoài. Dữ liệu SQLite nằm trong volume Docker `user-data`.

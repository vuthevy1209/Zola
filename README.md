# Zola

Ứng dụng thương mại điện tử gồm **Backend** (Spring Boot) và **Frontend** (React Native / Expo).

---

## Yêu cầu môi trường

| Công cụ | Phiên bản |
|---|---|
| Java | 21+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| Android Studio + SDK | API 33+ |
| PostgreSQL | 14+ |

---

## Backend

### 1. Tạo file `.env` trong thư mục `backend/`

```env
DB_URL=jdbc:postgresql://localhost:5432/Zola
DB_USERNAME=postgres
DB_PASSWORD=your_password

JWT_ACCESS_SIGNER_KEY=your_access_key
JWT_REFRESH_SIGNER_KEY=your_refresh_key

EMAIL_API_KEY=your_brevo_api_key
EMAIL_SENDER_EMAIL=your@email.com
EMAIL_SENDER_NAME=Zola

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Tạo database PostgreSQL

```sql
CREATE DATABASE "Zola";
```

### 3. Chạy backend

**Cách 1 — Terminal:**

```bash
cd backend
./mvnw spring-boot:run
```

**Cách 2 — IntelliJ IDEA:**

1. Mở thư mục `backend/` bằng IntelliJ
2. Cài plugin **EnvFile** (hoặc cấu hình biến môi trường thủ công trong Run Configuration)
3. Nhấn **Run** vào class `ZolaApplication`

Backend sẽ chạy tại: `http://localhost:8080/api`

Swagger UI: `http://localhost:8080/api/swagger-ui.html`

---

## Frontend

> Frontend dùng **Expo Dev Client** — **không** tương thích với Expo Go vì có native modules (Realm, expo-image-picker, ...).

### 1. Cài JS dependencies

```bash
cd frontend
npm install
```

### 2. Lần đầu — Build native và cài lên emulator

Khởi động Android Emulator từ Android Studio trước, sau đó:

```bash
npx expo run:android
```

Lệnh này sẽ compile toàn bộ native code (Gradle) và cài APK lên emulator. Mất khoảng **5–10 phút** lần đầu.

### 3. Từ lần 2 trở đi

Nếu không thay đổi native code (không thêm/xóa thư viện), chỉ cần:

```bash
npx expo start --dev-client
```

Sau đó mở app **Zola** trên emulator — app sẽ tự kết nối với Metro bundler.

---

## Lưu ý

- Đảm bảo **backend đang chạy** trước khi khởi động app.
- Khi chạy trên emulator Android, backend cần dùng IP `10.0.2.2` thay cho `localhost`.
- Khi chạy trên thiết bị thực, cần điền **IP LAN** của máy (dùng `ipconfig getifaddr en0` trên macOS để lấy IP).
- Cập nhật `BASE_URL` trong `frontend/src/services/api.ts` cho phù hợp với môi trường.
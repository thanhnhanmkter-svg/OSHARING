# 🏆 Culture Training Game

Website vận hành chương trình Đào tạo Văn hóa Doanh nghiệp tương tác, được xây dựng bằng Vanilla HTML/CSS/JavaScript thuần.

## ✨ Tính năng

| Stage | Mô tả |
|---|---|
| 🔐 Đăng nhập | Nhập tên + chọn phòng ban, tự động chia đội Đỏ/Xanh ngẫu nhiên |
| 📝 Stage 1 – Quiz | 5 câu trắc nghiệm văn hóa, đếm ngược 15 giây, tính điểm |
| ⚔️ Stage 2 – Kéo co | Trả lời Đúng/Sai để tạo lực kéo cho đội, live sync giữa các tab |
| ❤️ Stage 3 – Chia sẻ | Xem câu chuyện từ nhân sự thâm niên, thả tim bay lên đẹp mắt |
| 🔑 Stage 4 – Từ khóa | Giải mã 6 từ khóa văn hóa cốt lõi, nhận chứng chỉ hoàn thành |
| 🛡️ Admin Dashboard | Quản trị viên điều khiển stage, xem live stats, reset game |

## 🚀 Cách chạy

### Trực tiếp (không cần cài đặt gì)
1. Clone hoặc download repo này
2. Mở file `index.html` bằng trình duyệt
> *Lưu ý: Một số trình duyệt có thể chặn file://. Khuyến nghị dùng qua localhost hoặc Vercel.*

### Qua localhost (PowerShell)
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
Mở trình duyệt tại: **http://localhost:8765**

## 👤 Cách sử dụng

### Người chơi
1. Mở link website → Nhập tên + chọn phòng ban → Bấm "Bắt đầu hành trình"
2. Chờ Admin kích hoạt Stage → Màn hình tự động chuyển

### Quản trị viên
1. Trên màn hình đăng nhập → Bấm "Chế độ Quản trị viên"
2. Nhập mã PIN: `admin123`
3. Dùng bảng điều khiển để chuyển Stage cho toàn phòng

## 🔄 Đồng bộ thời gian thực
Sử dụng `localStorage` + `Storage Event API` của trình duyệt. Mở nhiều tab trên cùng 1 máy (hoặc nhiều máy cùng domain) đều đồng bộ tức thì khi Admin bấm chuyển Stage.

## 🛠️ Công nghệ
- **HTML5 + CSS3 + Vanilla JavaScript** (ES5/ES6)
- **Lucide Icons** (CDN)
- **Canvas Confetti** (CDN)
- **Google Fonts** – Outfit, Yellowtail

## 📁 Cấu trúc thư mục
```
culture-training-game/
├── index.html              # Trang chính
├── style.css               # Toàn bộ giao diện
├── data.js                 # Dữ liệu câu hỏi, chia sẻ, từ khóa
├── state.js                # Quản lý state & đồng bộ tab
├── app.js                  # Bộ điều phối router chính
├── server.ps1              # HTTP server PowerShell
└── components/
    ├── Login.js
    ├── AdminDashboard.js
    ├── QuizGame.js
    ├── TugOfWar.js
    ├── SeniorSharing.js
    ├── KeywordGrid.js
    └── Certificate.js
```

# AI AutoSlide - Presentation Generator

Tạo presentation chuyên nghiệp với AI chỉ trong vài giây!

## 🌟 Tính năng

- **AI Thông Minh**: Tự động tạo nội dung presentation từ mô tả của bạn
- **Thiết kế Tự động**: Tự động chọn màu sắc, font chữ và bố cục phù hợp
- **Biểu đồ Tương tác**: Tự động tạo biểu đồ và visualization chuyên nghiệp
- **Animation Mượt**: Animation tự động giúp presentation sinh động
- **Responsive**: Tự động responsive cho mọi thiết bị và màn hình
- **16:9 Aspect Ratio**: Tối ưu cho màn hình hiển thị chuẩn
- **Xuất File**: Xuất ra nhiều định dạng: HTML, PDF, PowerPoint

## 🚀 Cách sử dụng

### 1. Khởi động server
```bash
python server.py
```

### 2. Truy cập trang chủ
Mở trình duyệt và truy cập: `http://localhost:8001/index.html`

### 3. Tạo presentation
1. Nhập mô tả presentation bạn muốn tạo
2. Nhấn "Tạo Presentation Ngay"
3. Chờ AI xử lý (khoảng 10-30 giây)
4. Xem kết quả tự động mở ra

### 4. Điều khiển presentation
- **Mũi tên trái/phải** hoặc **Space**: Chuyển slide
- **F**: Toàn màn hình
- **O**: Xem tổng quan các slide

## 📁 Cấu trúc file

```
ai-autoslide-ui/
├── index.html              # Trang chủ nhập prompt
├── preview-slide.html      # Trang xem presentation
├── cyberpunk-styles.css    # CSS cho presentation
├── cyberpunk-animations.js # Animation effects
├── chart-animations.js      # Chart animations
├── server.py               # Python server
├── logs/
│   └── slide.json         # Dữ liệu slide (tự động tạo)
└── chart_demo.json        # Dữ liệu biểu đồ mẫu
```

## 🎨 Tùy chỉnh

### Thay đổi theme
Chỉnh sửa file `cyberpunk-styles.css` để thay đổi màu sắc, font chữ, và styling.

### Thêm animation mới
Chỉnh sửa file `cyberpunk-animations.js` để thêm hiệu ứng mới.

### Tùy chỉnh chart
Chỉnh sửa file `chart-animations.js` để thêm loại biểu đồ mới.

## 🔧 API Integration

Trang web sẽ tự động gọi API endpoint:
```
POST http://localhost:5678/webhook/ai-slide-autogen
Content-Type: application/json

{
    "user_prompt": "Your presentation description here"
}
```

## 📱 Responsive Design

- **Desktop**: 1920x1080 (16:9)
- **Tablet**: Tự động điều chỉnh
- **Mobile**: Tự động điều chỉnh với navigation buttons được tối ưu

## ⚡ Performance Optimization

- **Debounced Navigation**: Tránh spam clicks
- **RequestAnimationFrame**: Animation mượt mà
- **GPU Acceleration**: Translate3d cho performance tốt hơn
- **Lazy Loading**: Images được load khi cần thiết

## 🎯 Tips sử dụng

1. **Mô tả chi tiết**: Càng chi tiết, AI càng tạo ra presentation chất lượng
2. **Sử dụng ví dụ nhanh**: Thử các ví dụ có sẵn để test
3. **Kiểm tra kết nối**: Đảm bảo API server đang chạy
4. **Refresh nếu cần**: Nếu có lỗi, thử refresh trang

## 🔒 Security

- Không lưu trữ dữ liệu nhạy cảm
- API calls được xử lý server-side
- Không có cookies hoặc tracking

## 🐛 Troubleshooting

### Lỗi không tạo được presentation
- Kiểm tra API server có đang chạy không
- Kiểm tra network connection
- Thử refresh trang (F5)

### Presentation không hiển thị đúng
- Kiểm tra browser console cho errors
- Clear browser cache
- Kiểm tra file `logs/slide.json` có tồn tại không

### Animation bị lag
- Tắt các tab browser không cần thiết
- Kiểm tra CPU usage
- Thử trên browser khác

## 📄 License

MIT License - Feel free to use and modify!
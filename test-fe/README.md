# Test Frontend UI

UI để test full flow của Neo4j Embed Service.

## Cách chạy

### Option 1: Open file trực tiếp (recommended)
```bash
# Mở file HTML trong browser
start test-fe/index.html
```

### Option 2: Dùng Python HTTP Server
```bash
cd test-fe
python -m http.server 8080
# Truy cập: http://localhost:8080
```

### Option 3: Dùng Node.js HTTP Server
```bash
cd test-fe
npx http-server -p 8080
# Truy cập: http://localhost:8080
```

## Workflow

### 1️⃣ Generate API Token
- Click "Generate Token" button
- Token sẽ được tự động copy vào Section 2

### 2️⃣ Create Embed URL  
- Token đã được auto-fill từ Step 1
- Nhập Cypher query (hoặc dùng query mặc định)
- Chọn số ngày hết hạn (default: 7 days)
- Click "Create Embed URL"
- Embed URL sẽ được tự động copy vào Section 3

### 3️⃣ View Visualization
- Embed URL đã được auto-fill từ Step 2
- Click "Load" để xem visualization trong iframe
- Hoặc click "Open" ở Step 2 để mở trong tab mới

## Features

- ✅ Auto-fill giữa các sections
- ✅ Copy to clipboard buttons
- ✅ Request/Response logs với syntax highlighting
- ✅ Error handling
- ✅ Iframe preview
- ✅ Open in new tab

## API Endpoints

- `POST /api/token/generate` - Generate authentication token
- `POST /api/embed` - Create embed URL (requires Bearer token)
- `GET /view/:token` - View visualization
- `POST /api/proxy/query` - Execute Cypher query (auto-called by visualization)

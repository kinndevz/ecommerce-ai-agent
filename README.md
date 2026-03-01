# Personalized Chatbot AI Agent for E-commerce

Dự án phát triển một hệ thống **E-commerce tích hợp AI Agent** có khả năng truy cập và xử lý dữ liệu nội bộ  thông qua **Model Context Protocol (MCP)**, hỗ trợ người dùng trong việc tìm kiếm sản phẩm, quản lý đơn hàng và được cá nhân hóa theo hành vi, sở thích và lịch sử tương tác của từng người dùng.

## Công nghệ và kiến trúc hệ thống

### Frontend
- Phát triển bằng **ReactJS**.
- Hỗ trợ streaming và giao tiếp thời gian thực qua **WebSocket**.
- Giao diện chatbot tương tác động, hiển thị phản hồi AI theo thời gian thực.

### Backend
- Xây dựng bằng **FastAPI**.
- Cung cấp REST API cho xác thực, quản lý sản phẩm, đơn hàng và tích hợp **VNPAY**.
- Sử dụng **WebSocket** để cập nhật sự kiện thời gian thực.
- **Redis** hỗ trợ token blacklist, rate limiting và caching nhằm tối ưu hiệu năng và bảo mật.

### AI Agent System
- Phát triển dựa trên **LangChain** và **LangGraph** để quản lý luồng suy luận và logic tư vấn.
- Tích hợp cơ chế bộ nhớ hội thoại và cơ chế tóm tắt khi vượt ngưỡng ngữ cảnh.
- Sử dụng **LangSmith** để theo dõi, truy vết và đánh giá quá trình thực thi của agent.

### Lớp Lưu Trữ Dữ Liệu
- **PostgreSQL**: Quản lý dữ liệu nghiệp vụ (người dùng, đơn hàng, sản phẩm, thông tin cá nhân hóa).
- **Elasticsearch**: Hỗ trợ tìm kiếm toàn văn và truy vấn theo ngữ nghĩa.
- **Redis**: Hỗ trợ caching và cơ chế bảo mật bổ trợ.

### Vector Database
- Lưu trữ embedding của sản phẩm, mô tả và lịch sử tương tác.
- Hỗ trợ tìm kiếm ngữ nghĩa dựa trên độ tương đồng vector.

### MCP (Model Context Protocol)
- Cung cấp cơ chế chuẩn hóa để AI Agent gọi tool bên ngoài.
- Thông qua MCP Server, agent có thể truy vấn dữ liệu và thao tác tài nguyên một cách an toàn và bảo mật.

## Yêu cầu hệ thống

- **Node.js** >= 18.x  
- **Python** >= 3.9  

```bash
node -v
python --version
```

## Hướng dẫn chạy dự án

### 1️⃣ MCP Server (Cloudflare Workers)

```bash
# Di chuyển vào thư mục ecommerce-mcp
cd ecommerce-mcp

# Cài đặt dependencies
npm install

# Chạy server
npm run dev
```

Server sẽ chạy tại: `http://localhost:8787/sse`


### 2️⃣ Backend (FastAPI)

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt uv 
pip install uv

# Tạo môi trường ảo bằng uv
uv venv

# Kích hoạt môi trường ảo
venv\Scripts\activate

# Cài đặt dependencies
uv pip install -r requirements.txt

# Tạo file .env từ .env.example
cp .env.example .env

# Chạy server
python run.py
```

Server sẽ chạy tại: `http://127.0.0.1:8000`

### 3️⃣ Frontend (React + Vite)

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example 
cp .env.example .env

# Chạy server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## Tài liệu API

Sau khi chạy backend, truy cập:
- **Swagger UI**: `http://127.0.0.1:8000/docs`

#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import urllib.parse
import socket
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/save-html':
            try:
                # Đọc content length
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # Parse JSON data
                data = json.loads(post_data.decode('utf-8'))
                html_content = data.get('html_content', '') or data.get('html', '')
                
                if html_content:
                    # Tạo nội dung HTML hoàn chỉnh cho preview-slide.html
                    preview_html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview Slide - AI AutoSlide</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }}

        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }}

        .header h1 {{
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }}

        .header p {{
            font-size: 1.1rem;
            opacity: 0.9;
        }}

        .back-btn {{
            position: absolute;
            left: 30px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }}

        .back-btn:hover {{
            background: rgba(255,255,255,0.3);
            transform: translateY(-50%) translateX(-5px);
        }}

        .controls {{
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }}

        .control-group {{
            display: flex;
            gap: 10px;
            align-items: center;
        }}

        .btn {{
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
        }}

        .btn-primary {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }}

        .btn-primary:hover {{
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }}

        .btn-secondary {{
            background: #6c757d;
            color: white;
        }}

        .btn-secondary:hover {{
            background: #5a6268;
            transform: translateY(-2px);
        }}

        .btn-success {{
            background: #28a745;
            color: white;
        }}

        .btn-success:hover {{
            background: #218838;
            transform: translateY(-2px);
        }}

        .content {{
            padding: 30px;
            min-height: 500px;
        }}

        .slide-content {{
            width: 100%;
            height: 600px;
            border: none;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }}

        @media (max-width: 768px) {{
            .header h1 {{
                font-size: 2rem;
            }}
            
            .back-btn {{
                position: static;
                transform: none;
                margin-bottom: 20px;
            }}
            
            .controls {{
                flex-direction: column;
                align-items: stretch;
            }}
            
            .control-group {{
                justify-content: center;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="/" class="back-btn">
                <i class="fas fa-arrow-left"></i>
                Quay lại
            </a>
            <h1><i class="fas fa-presentation"></i> Preview Slide</h1>
            <p>Xem trước bài thuyết trình của bạn</p>
        </div>

        <div class="controls">
            <div class="control-group">
                <button class="btn btn-primary" onclick="openFullscreen()">
                    <i class="fas fa-expand"></i>
                    Toàn màn hình
                </button>
                <button class="btn btn-secondary" onclick="downloadHtml()">
                    <i class="fas fa-download"></i>
                    Tải xuống HTML
                </button>
            </div>
            <div class="control-group">
                <button class="btn btn-success" onclick="regenerate()">
                    <i class="fas fa-redo"></i>
                    Tạo lại
                </button>
            </div>
        </div>

        <div class="content">
            <iframe class="slide-content" id="slide-frame"></iframe>
        </div>
    </div>

    <script>
        const htmlContent = `""" + html_content.replace('`', '\\`').replace('${', '\\${') + """`;

        function displaySlide() {{
            const slideFrame = document.getElementById('slide-frame');
            const blob = new Blob([htmlContent], {{ type: 'text/html' }});
            const url = URL.createObjectURL(blob);
            slideFrame.src = url;
            
            slideFrame.onload = () => {{
                URL.revokeObjectURL(url);
            }};
        }}

        function openFullscreen() {{
            const newWindow = window.open('', '_blank');
            newWindow.document.write(htmlContent);
            newWindow.document.close();
        }}

        function downloadHtml() {{
            const blob = new Blob([htmlContent], {{ type: 'text/html' }});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'presentation-slides.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }}

        function regenerate() {{
            window.location.href = '/';
        }}

        // Load content khi trang được tải
        document.addEventListener('DOMContentLoaded', displaySlide);
    </script>
</body>
</html>"""
                    
                    # Lưu vào file preview-slide.html
                    with open('preview-slide.html', 'w', encoding='utf-8') as f:
                        f.write(preview_html)
                    
                    # Trả về response thành công
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    response = json.dumps({
                        'success': True, 
                        'message': 'HTML saved successfully',
                        'preview_url': '/preview-slide.html'
                    })
                    self.wfile.write(response.encode('utf-8'))
                else:
                    # Trả về JSON error response thay vì HTML error page
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    response = json.dumps({'success': False, 'error': 'No HTML content provided'})
                    self.wfile.write(response.encode('utf-8'))
                    
            except Exception as e:
                print(f"Error saving HTML: {e}")
                # Trả về JSON error response thay vì HTML error page
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = json.dumps({'success': False, 'error': f'Server error: {str(e)}'})
                self.wfile.write(response.encode('utf-8'))
                
        elif self.path == '/save-log':
            try:
                # Đọc content length
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # Parse JSON data
                log_data = json.loads(post_data.decode('utf-8'))
                
                # Tạo thư mục logs nếu chưa có
                logs_dir = Path('logs')
                logs_dir.mkdir(exist_ok=True)
                
                # Tạo tên file log với timestamp
                log_filename = f'slide.json'
                log_path = logs_dir / log_filename
                
                # Lưu log data vào file
                with open(log_path, 'w', encoding='utf-8') as f:
                    json.dump(log_data, f, ensure_ascii=False, indent=2)
                
                print(f"API response logged to: {log_path}")
                
                # Trả về response thành công
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = json.dumps({'success': True, 'log_file': str(log_path)})
                self.wfile.write(response.encode('utf-8'))
                
            except Exception as e:
                print(f"Error saving log: {e}")
                self.send_error(500, f'Server error: {str(e)}')
                
        elif self.path == '/save-slide-data':
            try:
                # Đọc content length
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # Parse JSON data
                slide_data = json.loads(post_data.decode('utf-8'))
                
                # Tạo thư mục logs nếu chưa có
                logs_dir = Path('logs')
                logs_dir.mkdir(exist_ok=True)
                
                # Lưu slide data vào file logs/slide.json
                log_path = logs_dir / 'slide.json'
                with open(log_path, 'w', encoding='utf-8') as f:
                    json.dump(slide_data, f, ensure_ascii=False, indent=2)
                
                print(f"Slide data saved to: {log_path}")
                
                # Trả về response thành công
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = json.dumps({'success': True, 'message': 'Slide data saved successfully'})
                self.wfile.write(response.encode('utf-8'))
                
            except Exception as e:
                print(f"Error saving slide data: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = json.dumps({'success': False, 'error': f'Server error: {str(e)}'})
                self.wfile.write(response.encode('utf-8'))
                
        elif self.path == '/write-preview-html':
            try:
                # Đọc content length
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # Parse JSON data
                data = json.loads(post_data.decode('utf-8'))
                html_content = data.get('html', '')
                
                if html_content:
                    # Ghi trực tiếp HTML content vào preview-slide.html
                    with open('preview-slide.html', 'w', encoding='utf-8') as f:
                        f.write(html_content)
                    
                    print("HTML content written to preview-slide.html")
                    
                    # Trả về response thành công
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    response = json.dumps({'success': True, 'message': 'HTML written to preview-slide.html'})
                    self.wfile.write(response.encode('utf-8'))
                else:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    response = json.dumps({'success': False, 'error': 'No HTML content provided'})
                    self.wfile.write(response.encode('utf-8'))
                    
            except Exception as e:
                print(f"Error writing HTML to preview: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = json.dumps({'success': False, 'error': f'Server error: {str(e)}'})
                self.wfile.write(response.encode('utf-8'))
        else:
            self.send_error(404, 'Endpoint not found')
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def get_local_ip():
    """Get the local IP address of this machine"""
    try:
        # Connect to a remote address to determine local IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "localhost"

if __name__ == "__main__":
    PORT = 8001
    HOST = "0.0.0.0"  # Bind to all network interfaces
    
    # Get local IP address
    local_ip = get_local_ip()
    
    with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print(f"Also accessible from other devices at http://{local_ip}:{PORT}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\\nServer stopped.")
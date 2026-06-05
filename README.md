# 📄 免费 PDF 工具站 · 加强版

一个功能丰富的本地 PDF 与文档处理工具站，基于 FastAPI 构建。

## ✨ 功能

### PDF 处理
| 功能 | 说明 |
|------|------|
| 🌐 PDF 链接下载 | 粘贴 PDF 链接或含 `course_pdf` 参数的阅读页链接，直接下载 |
| 🔗 合并 PDF | 将多个 PDF 合并为一个文件 |
| ✂️ 拆分 PDF | 按页码或页码范围提取页面 |
| 🗜️ **压缩 PDF**（新） | 通过降低图片质量减小 PDF 体积，三档可选 |
| 🖼️ **PDF 转图片**（新） | 将每页渲染为高清 PNG 图片，打包 ZIP 下载 |
| 📋 **PDF 信息查看**（新） | 查看页数、大小、版本、元数据 |
| 💧 **PDF 添加水印**（新） | 自定义文字水印，支持透明度与角度调节 |
| 🔄 **旋转 PDF**（新） | 90° / 180° / 270° 旋转所有页面 |

### 格式转换
| 功能 | 说明 |
|------|------|
| 📝 PDF 转 Word | 优先 pdf2docx，自动降级为图片渲染方案 |
| 📄 Word 转 PDF | 优先 LibreOffice，Windows 上可自动调用 Microsoft Word |
| 📑 **图片合成 PDF**（新） | 多张图片合并为一个 PDF，每张一页 |
| 📊 Excel 转 PDF | 表格转为横向 PDF，适合打印 |
| 🖼️ Excel 转图片 | 表格渲染为 PNG 图片 |
| 📋 **Excel / CSV 互转**（新） | UTF-8 编码转换 |

### 图片工具
| 功能 | 说明 |
|------|------|
| 🔤 图片提取文字 (OCR) | 支持中文和英文，优先使用 RapidOCR |
| 📊 图片转 Excel | 图片嵌入 Excel，可扩展 OCR 表格识别 |

## 🚀 快速开始

```powershell
# 1. 安装基础依赖
pip install -r requirements.txt

# 2. （推荐）安装可选依赖获得全部功能
pip install -r optional-requirements.txt

# 3. 启动服务
python -m uvicorn app:app --host 127.0.0.1 --port 8765 --reload
```

打开 **http://127.0.0.1:8765** 即可使用。

## 🐳 Docker 部署

```bash
docker build -t pdf-tools .
docker run -p 8765:8765 pdf-tools
```

Docker 镜像已包含 LibreOffice、Tesseract OCR、中文字体及全部 Python 依赖。

### 云平台部署

项目支持部署到 Render / Railway 等平台，详见 Dockerfile。

## 📦 依赖说明

### 基础依赖（requirements.txt）
FastAPI、Uvicorn、PyPDF、Pandas、OpenPyXL、Pillow、ReportLab、Requests

### 可选依赖（optional-requirements.txt）
| 依赖 | 提供功能 |
|------|---------|
| `pymupdf` | PDF 压缩、转图片、水印、Word 降级渲染 |
| `pdf2docx` | PDF 转 Word（高质量文字转换） |
| `python-docx` | PDF 转 Word 图片渲染降级方案 |
| `rapidocr-onnxruntime` | 图片 OCR 识别（推荐，无需额外安装） |
| `pytesseract` | 备选 OCR 引擎（需安装 Tesseract 程序） |
| `pywin32` | Windows 上调用 Microsoft Word 导出 PDF |

## 🛡️ 隐私说明

所有文件在**本地服务器**处理，不会被上传到任何第三方服务。
处理完成后的文件保留在 `storage/` 目录，建议定期清理。

## 🎨 界面特性

- 暗色模式（右下角切换，自动记住偏好）
- 拖拽上传文件
- 上传进度条
- Toast 通知
- 分类筛选工具
- 响应式布局

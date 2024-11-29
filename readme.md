# Clone Quizlet Project

Đây là dự án clone trang web Quizlet, sử dụng Flask cho backend và SQLite cho cơ sở dữ liệu. Dự án cho phép người dùng quản lý các folder, file từ vựng và các từ vựng trong từng file.

## Cấu trúc API

### **Folder APIs**

| **Hành động**            | **Phương thức** | **URL**                    | **Mô tả**                        |
| ------------------------ | --------------- | -------------------------- | -------------------------------- |
| **Lấy danh sách Folder** | `GET`           | `/api/folders`             | Lấy danh sách tất cả các folder. |
| **Thêm Folder mới**      | `POST`          | `/api/folders`             | Thêm một folder mới.             |
| **Sửa Folder**           | `PUT`           | `/api/folders/<folder_id>` | Sửa tên folder theo ID.          |
| **Xóa Folder**           | `DELETE`        | `/api/folders/<folder_id>` | Xóa folder theo ID.              |

### **File APIs**

| **Hành động**          | **Phương thức** | **URL**                          | **Mô tả**                        |
| ---------------------- | --------------- | -------------------------------- | -------------------------------- |
| **Lấy danh sách File** | `GET`           | `/api/folders/<folder_id>/files` | Lấy danh sách file trong folder. |
| **Thêm File mới**      | `POST`          | `/api/folders/<folder_id>/files` | Thêm một file mới vào folder.    |
| **Sửa File**           | `PUT`           | `/api/files/<file_id>`           | Sửa tên file theo ID.            |
| **Xóa File**           | `DELETE`        | `/api/files/<file_id>`           | Xóa file theo ID.                |

### **Word APIs**

| **Hành động**        | **Phương thức** | **URL**                      | **Mô tả**                    |
| -------------------- | --------------- | ---------------------------- | ---------------------------- |
| **Lấy danh sách Từ** | `GET`           | `/api/files/<file_id>/words` | Lấy danh sách từ trong file. |
| **Thêm Từ mới**      | `POST`          | `/api/files/<file_id>/words` | Thêm một từ mới vào file.    |
| **Sửa Từ**           | `PUT`           | `/api/words/<word_id>`       | Sửa từ vựng theo ID.         |
| **Xóa Từ**           | `DELETE`        | `/api/words/<word_id>`       | Xóa từ vựng theo ID.         |

## Hướng dẫn sử dụng API

### **1. Lấy danh sách Folder**

- **Phương thức**: `GET`
- **URL**: `/api/folders`
- **Mô tả**: Lấy danh sách tất cả các folder hiện có.

### **2. Thêm Folder mới**

- **Phương thức**: `POST`
- **URL**: `/api/folders`
- **Body yêu cầu**:
  ```json
  {
    "name": "Tên folder"
  }
  ```

** Instal library: "pip install -r requirements.txt"

from pymongo import MongoClient

# Thay thế <username>, <password>, và <database_name> bằng thông tin thực tế của bạn
connection_string = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database_name>?retryWrites=true&w=majority"

try:
    # Kết nối với MongoDB
    client = MongoClient(connection_string)
    print("MongoDB connected successfully")

    # Truy cập cơ sở dữ liệu
    db = client['database_name']  # Thay 'database_name' bằng tên database của bạn
    print(f"Connected to database: {db.name}")

    # Truy cập collection
    folders_collection = db['folders']  # Thay 'folders' bằng tên collection của bạn
    print(f"Using collection: {folders_collection.name}")

    # Thêm một document vào collection (nếu collection chưa tồn tại, MongoDB sẽ tự động tạo)
    document = {
        "name": "Test Folder",
        "description": "This is a test folder",
        "created_at": "2024-12-04"
    }
    result = folders_collection.insert_one(document)
    print(f"Document inserted with ID: {result.inserted_id}")

    # Truy vấn tất cả các document trong collection
    for doc in folders_collection.find():
        print(doc)

except Exception as e:
    print(f"Error: {e}")
finally:
    # Đóng kết nối
    client.close()
    print("MongoDB connection closed")


from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from flask_cors import CORS


app = Flask(__name__, template_folder='templates')
CORS(app)

# MongoDB Atlas URI (thay thế bằng connection string thực tế)
MONGO_URI = "mongodb+srv://quangdung812202:quangdung812202@cluster0.z1s7f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)

# Kết nối cơ sở dữ liệu
db = client["Cluster0"]  # Thay "Cluster0" bằng tên database thực tế của bạn
folders_collection = db["folders"]
files_collection = db["files"]
words_collection = db["words"]


# Utility function to convert ObjectId to string
def object_id_to_str(obj):
    return str(obj) if obj else None


# API: Lấy danh sách folder
@app.route('/api/folders', methods=['GET'])
def get_folders():
    folders = folders_collection.find()
    return jsonify([{
        "id": object_id_to_str(folder["_id"]),
        "name": folder["name"],
        "quantity": folder["quantity"]
    } for folder in folders])


# API: Thêm folder mới
@app.route('/api/folders', methods=['POST'])
def add_folder():
    data = request.json
    name = data.get('name')

    if not name:
        return jsonify({"error": "Folder name is required"}), 400

    folder = {
        "name": name,
        "quantity": 0
    }

    result = folders_collection.insert_one(folder)
    return jsonify({"message": "Folder created successfully", "id": str(result.inserted_id)}), 201


# API: Sửa tên folder
@app.route('/api/folders/<string:folder_id>', methods=['PUT'])
def update_folder(folder_id):
    data = request.json
    name = data.get('name')

    if not name:
        return jsonify({"error": "Folder name is required"}), 400

    folder = folders_collection.find_one({"_id": ObjectId(folder_id)})

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    folders_collection.update_one(
        {"_id": ObjectId(folder_id)},
        {"$set": {"name": name}}
    )
    return jsonify({"message": "Folder updated successfully"}), 200


# API: Lấy danh sách file trong folder
@app.route('/api/folders/<string:folder_id>/files', methods=['GET'])
def get_files(folder_id):
    files = files_collection.find({"folder_id": ObjectId(folder_id)})
    return jsonify([{
        "id": object_id_to_str(file["_id"]),
        "name": file["name"],
        "quantity": file["quantity"]
    } for file in files])


# API: Thêm file mới vào folder và cập nhật số lượng file
@app.route('/api/folders/<string:folder_id>/files', methods=['POST'])
def add_file(folder_id):
    data = request.json
    name = data.get('name')

    if not name:
        return jsonify({"error": "File name is required"}), 400

    file = {
        "name": name,
        "folder_id": ObjectId(folder_id),
        "quantity": 0
    }

    result = files_collection.insert_one(file)

    # Sửa: Cập nhật số lượng file trong folder
    folders_collection.update_one(
        {"_id": ObjectId(folder_id)},
        {"$inc": {"quantity": 1}}
    )

    return jsonify({"message": "File created successfully", "id": str(result.inserted_id)}), 201

@app.route('/api/files/<string:file_id>', methods=['PUT'])
def update_file(file_id):
    data = request.json
    name = data.get('name')

    if not name:
        return jsonify({"error": "File name is required"}), 400

    # Tìm file trong collection
    file = files_collection.find_one({"_id": ObjectId(file_id)})
    if not file:
        return jsonify({"error": "File not found"}), 404

    # Cập nhật tên file
    files_collection.update_one(
        {"_id": ObjectId(file_id)},
        {"$set": {"name": name}}
    )

    return jsonify({"message": "File name updated successfully"}), 200


# API: Lấy danh sách từ trong file
@app.route('/api/files/<string:file_id>/words', methods=['GET'])
def get_words(file_id):
    file = files_collection.find_one({"_id": ObjectId(file_id)})

    if not file:
        return jsonify({"error": "File not found"}), 404

    words = words_collection.find({"file_id": ObjectId(file_id)})
    return jsonify({
        "name": file["name"],
        "data": [{
            "id": object_id_to_str(word["_id"]),
            "word": word["word"],
            "meaning": word["meaning"],
            "langWord": word["langWord"],
            "langMeaning": word["langMeaning"]
        } for word in words]
    })


# API: Thêm từ mới vào file
@app.route('/api/files/<string:file_id>/words', methods=['POST'])
def add_words(file_id):
    data = request.json
    words = data.get('words')

    if not isinstance(words, list) or len(words) == 0:
        return jsonify({"error": "Words must be a non-empty list"}), 400

    # Kiểm tra file có tồn tại hay không
    file = files_collection.find_one({"_id": ObjectId(file_id)})
    if not file:
        return jsonify({"error": "File not found"}), 404

    success_list = []
    error_list = []

    for word_data in words:
        try:
            word = word_data.get('word', '').strip()
            meaning = word_data.get('meaning', '').strip()
            langWord = word_data.get('langWord', 'en-US').strip()
            langMeaning = word_data.get('langMeaning', 'en-US').strip()

            if not word or not meaning:
                error_list.append({"error": "Word and meaning are required", "data": word_data})
                continue

            word_entry = {
                "word": word,
                "meaning": meaning,
                "langWord": langWord,
                "langMeaning": langMeaning,
                "file_id": ObjectId(file_id)
            }

            result = words_collection.insert_one(word_entry)
            success_list.append({
                "id": str(result.inserted_id),
                "word": word,
                "meaning": meaning,
                "langWord": langWord,
                "langMeaning": langMeaning
            })

        except Exception as e:
            error_list.append({"error": str(e), "data": word_data})

    # Cập nhật số lượng từ trong file
    files_collection.update_one(
        {"_id": ObjectId(file_id)},
        {"$set": {"quantity": words_collection.count_documents({"file_id": ObjectId(file_id)})}}
    )

    return jsonify({
        "message": "Words processed successfully",
        "added": success_list,
        "errors": error_list
    }), 207 if error_list else 201


# API: Xóa folder và tất cả file, từ trong file
@app.route('/api/folders/<string:folder_id>', methods=['DELETE'])
def delete_folder(folder_id):
    folder = folders_collection.find_one({"_id": ObjectId(folder_id)})

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    files = files_collection.find({"folder_id": ObjectId(folder_id)})

    # Xóa tất cả từ và file liên quan
    for file in files:
        words_collection.delete_many({"file_id": file["_id"]})
        files_collection.delete_one({"_id": file["_id"]})

    folders_collection.delete_one({"_id": ObjectId(folder_id)})
    return jsonify({"message": "Folder and all related files and words deleted successfully"}), 200


# API: Xóa file và cập nhật số lượng file trong folder
@app.route('/api/files/<string:file_id>', methods=['DELETE'])
def delete_file(file_id):
    file = files_collection.find_one({"_id": ObjectId(file_id)})

    if not file:
        return jsonify({"error": "File not found"}), 404

    folder_id = file["folder_id"]

    words_collection.delete_many({"file_id": ObjectId(file_id)})
    files_collection.delete_one({"_id": ObjectId(file_id)})

    # Cập nhật số lượng file trong folder
    folders_collection.update_one(
        {"_id": ObjectId(folder_id)},
        {"$inc": {"quantity": -1}}
    )

    return jsonify({"message": "File deleted successfully"}), 200
# API sỬA từ

@app.route('/api/words/<string:word_id>', methods=['PUT'])
def update_word(word_id):
    data = request.json
    word = data.get('word')
    meaning = data.get('meaning')
    if not word or not meaning:
        return jsonify({"error": "Word and meaning are required"}), 400

    words_collection.update_one({"_id": ObjectId(word_id)}, {"$set": {"word": word, "meaning": meaning }})
    return jsonify({"message": "Word updated successfully"}), 200


# API: Xóa từ trong file
@app.route('/api/words/<string:word_id>', methods=['DELETE'])
def delete_word(word_id):
    word = words_collection.find_one({"_id": ObjectId(word_id)})

    if not word:
        return jsonify({"error": "Word not found"}), 404

    file_id = word["file_id"]

    words_collection.delete_one({"_id": ObjectId(word_id)})

    # Cập nhật số lượng từ trong file
    files_collection.update_one(
        {"_id": ObjectId(file_id)},
        {"$inc": {"quantity": -1}}
    )

    return jsonify({"message": "Word deleted successfully"}), 200


if __name__ == '__main__':
    app.run(debug=False)

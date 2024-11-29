from flask import Flask, request, jsonify
import sqlite3
# add cors
from flask_cors import CORS

app = Flask(__name__, template_folder='templates')
app = Flask(__name__)
CORS(app)

DATABASE = 'database.db'


# Hàm tiện ích để kết nối SQLite
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Kết quả trả về dạng dictionary
    return conn


# Tạo bảng nếu chưa tồn tại
def init_db():
    with get_db_connection() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS folders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                quantity INTEGER DEFAULT 0,
                folder_id INTEGER NOT NULL,
                FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL,
                meaning TEXT NOT NULL,
                image_url TEXT,
                file_id INTEGER NOT NULL,
                FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
            )
        ''')
        conn.commit()


# API: Lấy danh sách folder
@app.route('/api/folders', methods=['GET'])
def get_folders():
    conn = get_db_connection()
    folders = conn.execute('SELECT * FROM folders').fetchall()
    conn.close()
    return jsonify([{"id": folder["id"], "name": folder["name"]} for folder in folders])


# API: Thêm folder mới
@app.route('/api/folders', methods=['POST'])
def add_folder():
    data = request.json
    name = data.get('name')

    if not name:
        return jsonify({"error": "Folder name is required"}), 400

    conn = get_db_connection()
    conn.execute('INSERT INTO folders (name) VALUES (?)', (name,))
    conn.commit()
    conn.close()


    return jsonify({"message": "Folder created successfully"}), 201
# API: Sửa tên folder
@app.route('/api/folders/<int:folder_id>', methods=['PUT'])
def update_folder(folder_id):
    data = request.json
    name = data.get('name')

    if not name:
        return jsonify({"error": "Folder name is required"}), 400

    conn = get_db_connection()
    folder = conn.execute('SELECT * FROM folders WHERE id = ?', (folder_id,)).fetchone()

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    conn.execute('UPDATE folders SET name = ? WHERE id = ?', (name, folder_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Folder updated successfully"}), 200
# API: Xóa folder
@app.route('/api/folders/<int:folder_id>', methods=['DELETE'])
def delete_folder(folder_id):
    conn = get_db_connection()
    folder = conn.execute('SELECT * FROM folders WHERE id = ?', (folder_id,)).fetchone()

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    conn.execute('DELETE FROM folders WHERE id = ?', (folder_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Folder deleted successfully"}), 200


# API: Lấy danh sách file trong folder
@app.route('/api/folders/<int:folder_id>/files', methods=['GET'])
def get_files(folder_id):
    conn = get_db_connection()
    files = conn.execute('SELECT * FROM files WHERE folder_id = ?', (folder_id,)).fetchall()
    conn.close()
    return jsonify([{"id": file["id"], "name": file["name"], "quantity": file["quantity"]} for file in files])


# API: Thêm file mới vào folder
@app.route('/api/folders/<int:folder_id>/files', methods=['POST'])
def add_file(folder_id):
    data = request.json
    name = data.get('name')

    if not name:
        return jsonify({"error": "File name is required"}), 400

    conn = get_db_connection()
    conn.execute('INSERT INTO files (name, folder_id) VALUES (?, ?)', (name, folder_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "File created successfully"}), 201

# API: Sửa tên file
@app.route('/api/files/<int:file_id>', methods=['PUT'])
def update_file(file_id):
    data = request.json
    name = data.get('name')

    if not name:
        return jsonify({"error": "File name is required"}), 400

    conn = get_db_connection()
    file = conn.execute('SELECT * FROM files WHERE id = ?', (file_id,)).fetchone()

    if not file:
        return jsonify({"error": "File not found"}), 404

    conn.execute('UPDATE files SET name = ? WHERE id = ?', (name, file_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "File updated successfully"}), 200
# API: Xóa file
@app.route('/api/files/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    conn = get_db_connection()
    file = conn.execute('SELECT * FROM files WHERE id = ?', (file_id,)).fetchone()

    if not file:
        return jsonify({"error": "File not found"}), 404

    conn.execute('DELETE FROM files WHERE id = ?', (file_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "File deleted successfully"}), 200

# API: Lấy danh sách từ trong file
@app.route('/api/files/<int:file_id>/words', methods=['GET'])
def get_words(file_id):
    conn = get_db_connection()
    words = conn.execute('SELECT * FROM words WHERE file_id = ?', (file_id,)).fetchall()
    conn.close()
    return jsonify([
        {"id": word["id"], "word": word["word"], "meaning": word["meaning"], "image_url": word["image_url"]}
        for word in words
    ])


# API: Thêm từ mới vào file
@app.route('/api/files/<int:file_id>/words', methods=['POST'])
def add_word(file_id):
    data = request.json
    word = data.get('word')
    meaning = data.get('meaning')
    image_url = data.get('image_url', None)

    if not word or not meaning:
        return jsonify({"error": "Word and meaning are required"}), 400

    conn = get_db_connection()
    conn.execute('INSERT INTO words (word, meaning, image_url, file_id) VALUES (?, ?, ?, ?)',
                 (word, meaning, image_url, file_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Word added successfully"}), 201
# API: Sửa từ vựng
@app.route('/api/words/<int:word_id>', methods=['PUT'])
def update_word(word_id):
    data = request.json
    word = data.get('word')
    meaning = data.get('meaning')
    image_url = data.get('image_url', None)

    if not word or not meaning:
        return jsonify({"error": "Word and meaning are required"}), 400

    conn = get_db_connection()
    word_entry = conn.execute('SELECT * FROM words WHERE id = ?', (word_id,)).fetchone()

    if not word_entry:
        return jsonify({"error": "Word not found"}), 404

    conn.execute('''
        UPDATE words 
        SET word = ?, meaning = ?, image_url = ? 
        WHERE id = ?
    ''', (word, meaning, image_url, word_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Word updated successfully"}), 200

# API: Xóa từ vựng
@app.route('/api/words/<int:word_id>', methods=['DELETE'])
def delete_word(word_id):
    conn = get_db_connection()
    word_entry = conn.execute('SELECT * FROM words WHERE id = ?', (word_id,)).fetchone()

    if not word_entry:
        return jsonify({"error": "Word not found"}), 404

    conn.execute('DELETE FROM words WHERE id = ?', (word_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Word deleted successfully"}), 200

if __name__ == '__main__':
    # Khởi tạo database
    init_db()
    # Chạy server
    app.run(debug=False)

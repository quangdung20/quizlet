from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__, template_folder='templates')
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
        conn.executescript('''
            CREATE TABLE IF NOT EXISTS folders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                quantity INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                quantity INTEGER DEFAULT 0,
                folder_id INTEGER NOT NULL,
                FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL,
                meaning TEXT NOT NULL,
                langWord TEXT DEFAULT 'en-US',
                langMeaning TEXT DEFAULT 'en-US',
                file_id INTEGER NOT NULL,
                FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
            );
        ''')
        conn.commit()


# API: Lấy danh sách folder
@app.route('/api/folders', methods=['GET'])
def get_folders():
    conn = get_db_connection()
    folders = conn.execute('SELECT * FROM folders').fetchall()
    conn.close()
    return jsonify([
        {"id": folder["id"], "name": folder["name"], "quantity": folder["quantity"]}
        for folder in folders
    ])


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

# API: đôi tên file
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

# API: Lấy danh sách file trong folder
@app.route('/api/folders/<int:folder_id>/files', methods=['GET'])
def get_files(folder_id):
    conn = get_db_connection()
    files = conn.execute(
        'SELECT id, name, quantity FROM files WHERE folder_id = ?',
        (folder_id,)
    ).fetchall()
    conn.close()
    return jsonify([
        {"id": file["id"], "name": file["name"], "quantity": file["quantity"]}
        for file in files
    ])

# API: Thêm file mới vào folder và cập nhật số lượng file
@app.route('/api/folders/<int:folder_id>/files', methods=['POST'])
def add_file(folder_id):
    data = request.json
    name = data.get('name')

    if not name:
        return jsonify({"error": "File name is required"}), 400

    conn = get_db_connection()
    try:
        # Thêm file mới
        conn.execute('INSERT INTO files (name, folder_id) VALUES (?, ?)', (name, folder_id))
        # Cập nhật số lượng file trong folder
        conn.execute('UPDATE folders SET quantity = (SELECT COUNT(*) FROM files WHERE folder_id = ?) WHERE id = ?',
                     (folder_id, folder_id))
        conn.commit()
        return jsonify({"message": "File created successfully"}), 201
    finally:
        conn.close()


# API: Lấy danh sách từ trong file (trả về cả số lượng từ - quantity)
@app.route('/api/files/<int:file_id>/words', methods=['GET'])
def get_words(file_id):
    conn = get_db_connection()
    file = conn.execute('SELECT name FROM files WHERE id = ?', (file_id,)).fetchone()
    if not file:
        return jsonify({"error": "File not found"}), 404
    words = conn.execute('SELECT id, word, meaning, langWord, langMeaning FROM words WHERE file_id = ?', (file_id,)).fetchall()
    conn.close()
    return jsonify({
        "name": file["name"],
        "data": [
            {"id": word["id"], "word": word["word"], "meaning": word["meaning"], "langWord": word["langWord"], "langMeaning": word["langMeaning"]}
            for word in words
        ]
    })
# API: Sửa từ vựng
@app.route('/api/words/<int:word_id>', methods=['PUT'])
def update_word(word_id):
    data = request.json
    word = data.get('word')
    meaning = data.get('meaning')

    if not word or not meaning:
        return jsonify({"error": "Word and meaning are required"}), 400

    conn = get_db_connection()
    word_entry = conn.execute('SELECT * FROM words WHERE id = ?', (word_id,)).fetchone()

    if not word_entry:
        return jsonify({"error": "Word not found"}), 404

    conn.execute('''
        UPDATE words 
        SET word = ?, meaning = ? 
        WHERE id = ?
    ''', (word, meaning, word_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Word updated successfully"}), 200

# API: Thêm từ mới vào file và cập nhật số lượng từ
@app.route('/api/files/<int:file_id>/words', methods=['POST'])
def add_words(file_id):
    data = request.json
    words = data.get('words')

    # Kiểm tra đầu vào
    if not isinstance(words, list) or len(words) == 0:
        return jsonify({"error": "Words must be a non-empty list"}), 400

    conn = get_db_connection()
    try:
        # Kiểm tra file có tồn tại hay không
        file = conn.execute('SELECT 1 FROM files WHERE id = ?', (file_id,)).fetchone()
        if not file:
            return jsonify({"error": "File not found"}), 404

        success_list = []  # Danh sách từ được thêm thành công
        error_list = []    # Danh sách từ lỗi

        for word_data in words:
            try:
                # Lấy dữ liệu từng từ
                word = word_data.get('word', '').strip()
                meaning = word_data.get('meaning', '').strip()
                langWord = word_data.get('langWord', 'en-US').strip()
                langMeaning = word_data.get('langMeaning', 'en-US').strip()

                # Kiểm tra dữ liệu từ và nghĩa
                if not word or not meaning:
                    error_list.append({"error": "Word and meaning are required", "data": word_data})
                    continue

                # Thêm từ vào bảng words
                cursor = conn.execute('''
                    INSERT INTO words (word, meaning, langWord, langMeaning, file_id) 
                    VALUES (?, ?, ?, ?, ?)
                ''', (word, meaning, langWord, langMeaning, file_id))

                # Thêm thông tin từ vào danh sách thành công
                success_list.append({
                    "id": cursor.lastrowid,
                    "word": word,
                    "meaning": meaning,
                    "langWord": langWord,
                    "langMeaning": langMeaning
                })

            except Exception as e:
                # Ghi lại lỗi nếu có lỗi khi xử lý từng từ
                error_list.append({"error": str(e), "data": word_data})

        # Cập nhật số lượng từ trong file
        conn.execute('UPDATE files SET quantity = (SELECT COUNT(*) FROM words WHERE file_id = ?) WHERE id = ?',
                     (file_id, file_id))
        conn.commit()

        # Trả về phản hồi
        return jsonify({
            "message": "Words processed successfully",
            "added": success_list,
            "errors": error_list
        }), 207 if error_list else 201

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

    finally:
        conn.close()

# API: Xóa folder và tất cả file, từ trong file
@app.route('/api/folders/<int:folder_id>', methods=['DELETE'])
def delete_folder(folder_id):
    conn = get_db_connection()
    try:
        # Kiểm tra folder có tồn tại hay không
        folder = conn.execute('SELECT * FROM folders WHERE id = ?', (folder_id,)).fetchone()
        if not folder:
            return jsonify({"error": "Folder not found"}), 404
        # Lấy tất cả file trong folder và xóa các từ trong các file
        files = conn.execute('SELECT id FROM files WHERE folder_id = ?', (folder_id,)).fetchall()

        for file in files:
            file_id = file["id"]

            # Xóa tất cả từ trong file
            conn.execute('DELETE FROM words WHERE file_id = ?', (file_id,))

            # Xóa file
            conn.execute('DELETE FROM files WHERE id = ?', (file_id,))

        # Xóa folder
        conn.execute('DELETE FROM folders WHERE id = ?', (folder_id,))
        conn.commit()
        return jsonify({"message": "Folder and all related files and words deleted successfully"}), 200
    finally:
        conn.close()


# API: Xóa file và cập nhật số lượng file trong folder
@app.route('/api/files/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    conn = get_db_connection()
    try:
        # Lấy thông tin folder_id của file
        file = conn.execute('SELECT folder_id FROM files WHERE id = ?', (file_id,)).fetchone()
        if not file:
            return jsonify({"error": "File not found"}), 404

        folder_id = file["folder_id"]

        # Xóa file
        conn.execute('DELETE FROM files WHERE id = ?', (file_id,))

        # Cập nhật số lượng file trong folder
        conn.execute('UPDATE folders SET quantity = (SELECT COUNT(*) FROM files WHERE folder_id = ?) WHERE id = ?',
                     (folder_id, folder_id))
        conn.commit()
        return jsonify({"message": "File deleted successfully"}), 200
    finally:
        conn.close()

# API: Xóa từ và cập nhật số lượng từ trong file
@app.route('/api/words/<int:word_id>', methods=['DELETE'])
def delete_word(word_id):
    conn = get_db_connection()
    try:
        # Lấy file_id của từ
        word = conn.execute('SELECT file_id FROM words WHERE id = ?', (word_id,)).fetchone()
        if not word:
            return jsonify({"error": "Word not found"}), 404

        file_id = word["file_id"]

        # Xóa từ
        conn.execute('DELETE FROM words WHERE id = ?', (word_id,))

        # Cập nhật số lượng từ trong file
        conn.execute('UPDATE files SET quantity = (SELECT COUNT(*) FROM words WHERE file_id = ?) WHERE id = ?',
                     (file_id, file_id))
        conn.commit()
        return jsonify({"message": "Word deleted successfully"}), 200
    finally:
        conn.close()


if __name__ == '__main__':
    init_db()  # Khởi tạo database
    app.run(debug=False)


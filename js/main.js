// //  handle the click event open the modal

// // @app.route('/api/folders/search', methods=['GET'])
// // def search_folders():
// //     conn = get_db_connection()
// //     search = request.args.get('search')
// //     folders = conn.execute('SELECT * FROM folders WHERE name LIKE ?', ('%' + search + '%',)).fetchall()
// //     conn.close()
// //     return jsonify([{"id": folder["id"], "name": folder["name"]} for folder in folders])
// //
// // Tim kiem folder
// const searchInput = document.getElementById("searchFolder");
// searchInput.addEventListener("input", searchFolders);

// async function searchFolders() {
//   const search = searchInput.value.trim();
//   if (!search) {
//     return;
//   }

//   const axiosservice = new AxiosService();
//   try {
//     const response = await axiosservice.get(`/api/folders/search?search=${search}`);
//     loadFolders(response);
//   } catch (error) {
//     console.error("Lỗi khi tìm kiếm folder:", error);
//   }
// }

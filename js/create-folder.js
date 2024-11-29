// Khai báo biến toàn cục để lưu trữ dữ liệu folder
let foldersData = [];

// Lấy các element cần thiết
const axiosservice = new AxiosService();
const createFolderBtn = document.getElementById("createFolderBtn");
const folderNameInput = document.getElementById("folder-name");
const folderList = document.getElementById("folder-list");
const deleteFolderModal = new bootstrap.Modal(
  document.getElementById("deleteFolderModal")
);
const deleteFolderConfirmButton = document.getElementById(
  "deleteFolderConfirmButton"
);
const editFolderModal = new bootstrap.Modal("#editFolderModal");
const addFolderButton = document.getElementById("addFolderButton");
const modalAddFolder = new bootstrap.Modal("#addFolderModal");
const saveFolderButton = document.getElementById("saveFolderButton");
const inputFolderName = document.getElementById("inputFolderName");
const folderNameLabel = document.getElementById("folderNameLabel");
let folderId = null;
const searchInput = document.getElementById("searchFolder");

// Tải danh sách folder khi trang được load
document.addEventListener("DOMContentLoaded", () => {
  loadFolders();
});

addFolderButton.addEventListener("click", () => {
  modalAddFolder.show();
});

createFolderBtn.addEventListener("click", (event) => {
  event.preventDefault();
  createFolder();
  modalAddFolder.hide();
});

// Hàm để tải danh sách folder từ server và lưu trữ vào mảng
async function loadFolders() {
  try {
    const folders = await axiosservice.get("/api/folders");
    foldersData = folders; // Lưu trữ dữ liệu vào mảng

    // Gọi hàm để hiển thị folder
    displayFolders(foldersData);
  } catch (error) {
    console.error("Lỗi khi tải danh sách folder:", error);
  }
}

// Hàm hiển thị folder lên giao diện
function displayFolders(folders) {
  folderList.innerHTML = ""; // Xóa nội dung cũ

  // Kiểm tra nếu không có folder nào
  if (folders.length === 0) {
    const noResultsMessage = document.createElement("div");
    noResultsMessage.className = "alert alert-danger text-center w-100";
    noResultsMessage.textContent =
      "Không có thư mục nào!, em gõ đúng tên là ra nhé! 😘 ";
    folderList.appendChild(noResultsMessage);
  } else {
    // Hiển thị các folder dưới dạng Bootstrap card
    folders.forEach((folder, index) => {
      const card = document.createElement("div");
      card.className = "col";

      card.innerHTML = `
        <div class="card card-forder">
          <div class="card-body position-relative d-flex flex-column">
            <div class="d-flex justify-content-between">
              <p class="card-text fw-bold m-0 p-2 pt-1 pb-1 rounded border-1 border-dark-subtle bg-info">${
                index + 1
              }</p>
              <div class="d-flex justify-content-end">
                <button class="text-dark fs-5 border-0 bg-white edit-folder-btn" data-id="${
                  folder.id
                }" data-name="${folder.name}">
                  <i class="icon fas fa-edit"></i>
                </button>
                <button class="text-dark fs-5 border-0 bg-white delete-folder-btn" data-id="${
                  folder.id
                }">
                  <i class="icon fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            <hr class="my-2">
            <div class="d-flex flex-column flex-fill justify-content-between overflow-hidden">
              <h5 class="card-title folderName">${folder.name}</h5>
              <button class="btn btn-primary w-100 mt-auto" onclick="viewFolder(${
                folder.id
              }, '${folder.name}')">Xem</button>
            </div>
          </div>
        </div>
      `;

      folderList.appendChild(card);
    });

    // Gắn sự kiện cho các nút sửa và xóa
    document.querySelectorAll(".edit-folder-btn").forEach((button) => {
      button.addEventListener("click", handleEditFolder);
    });

    document.querySelectorAll(".delete-folder-btn").forEach((button) => {
      button.addEventListener("click", handleDeleteFolder);
    });
  }
}
// Hàm tìm kiếm folder
function searchFolders(event) {
  const searchTerm = event.target.value.trim().toLowerCase(); // Lấy từ khóa tìm kiếm và chuyển về chữ thường

  // Lọc các folder dựa trên tên
  const filteredFolders = foldersData.filter(
    (folder) => folder.name.toLowerCase().includes(searchTerm) // Kiểm tra nếu tên folder chứa từ khóa tìm kiếm
  );

  // Hiển thị các folder đã lọc
  displayFolders(filteredFolders);
}

// Gắn sự kiện tìm kiếm vào ô input
searchInput.addEventListener("input", searchFolders);

// Hàm xem chi tiết folder
function viewFolder(folderId, folderName) {
  const folderItem = {
    folderId: folderId,
    folderName: folderName,
  };
  sessionStorage.setItem("folderItem", JSON.stringify(folderItem));
  // Điều hướng đến trang folder
  window.location.href = "folder.html";
}

// Xử lý sự kiện khi người dùng submit form tạo folder
async function createFolder() {
  const name = folderNameInput.value.trim();
  if (!name) {
    folderNameInput.classList.add("is-invalid");
    showToast("Vui lòng nhập tên folder!", "warning");
    return;
  }
  const axiosservice = new AxiosService();
  try {
    const newFolder = await axiosservice.post("/api/folders", {
      name: name,
    });
    showToast("Tạo folder thành công!", "success");
    loadFolders(); // Tải lại danh sách folder sau khi tạo mới
  } catch (error) {
    console.error("Lỗi khi tạo folder:", error);
    showToast("Không thể tạo folder. Vui lòng thử lại!", "error");
  }
}

// Hàm xử lý sửa folder
function handleEditFolder(event) {
  event.preventDefault();
  folderId = event.target.closest("button").dataset.id;
  const folderName = event.target.closest("button").dataset.name;
  folderNameLabel.innerHTML = folderName;
  editFolderModal.show();
}

// Hàm xử lý xóa folder
function handleDeleteFolder(event) {
  folderId = event.target.closest("button").dataset.id;
  deleteFolderModal.show();
}

// Sự kiện xác nhận xóa folder
deleteFolderConfirmButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const axiosservice = new AxiosService();
  try {
    const response = await axiosservice.delete(`/api/folders/${folderId}`);
    showToast("Xóa folder thành công!", "success");
    document.querySelector(`[data-id="${folderId}"]`).closest(".col").remove();
    deleteFolderModal.hide(); // Đóng modal
  } catch (error) {
    console.error("Lỗi khi xóa folder:", error);
    showToast("Không thể xóa folder. Vui lòng thử lại!", "error");
  }
});

// Sự kiện lưu sửa folder
saveFolderButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const axiosservice = new AxiosService();
  const name = inputFolderName.value.trim();

  if (!name) {
    inputFolderName.classList.add("is-invalid");
    showToast("Vui lòng nhập tên folder!", "warning");
    return;
  }

  try {
    const response = await axiosservice.put(`/api/folders/${folderId}`, {
      name,
    });
    document.querySelector(`[data-id="${folderId}"]`).dataset.name = name;
    document
      .querySelector(`[data-id="${folderId}"]`)
      .closest(".col")
      .querySelector(".folderName").textContent = name;
    showToast("Đổi tên folder thành công!", "success");
    editFolderModal.hide(); // Đóng modal
  } catch (error) {
    console.error("Lỗi khi sửa folder:", error);
    showToast("Không thể sửa folder. Vui lòng thử lại!", "error");
  }
});

// Lấy ID folder từ URL
const folderNameLabel = document.getElementById("folderName");
const addFileButton = document.getElementById("addFileButton");
const fileName = document.getElementById("fileName");
const newFileName = document.getElementById("newFileName");
const createFileBtn = document.getElementById("createFileBtn");
const folderItem = JSON.parse(sessionStorage.getItem("folderItem"));
const folderId = folderItem.folderId;
const axiosservice = new AxiosService();
const addFileModal = new bootstrap.Modal("#addFileModal");
const editFileModal = new bootstrap.Modal("#editFileModal");
const deleteFileModal = new bootstrap.Modal("#deleteFileModal");
folderNameLabel.innerHTML = folderItem.folderName;
// Biến toàn cục để lưu ID của file đang được sửa
let currentFileId = null;
let allFiles = []; // Biến lưu danh sách tất cả file

document.addEventListener("DOMContentLoaded", () => {
  fetchFiles(folderId);
  addFileButton.addEventListener("click", () => {
    fileName.value = "";
    addFileModal.show();
  });
  createFileBtn.addEventListener("click", (event) => {
    event.preventDefault();
    addFileModal.hide();
    addFile();
  });
});

function searchFiles() {
  const searchInput = document
    .getElementById("searchFileInput")
    .value.toLowerCase();
  const filteredFiles = allFiles.filter((file) =>
    file.name.toLowerCase().includes(searchInput)
  );

  renderFiles(filteredFiles); // Hiển thị danh sách file sau khi lọc
}

// Hàm để lấy danh sách file từ API và hiển thị chúng
async function fetchFiles(folderId) {
  try {
    const response = await axiosservice.get(`/api/folders/${folderId}/files`);
    console.log(response);
    allFiles = response; // Lưu danh sách file vào biến toàn cục
    renderFiles(allFiles); // Hiển thị danh sách file
  } catch (error) {
    console.error("Error fetching files:", error);
    showToast("Không thể lấy danh sách file. Vui lòng thử lại!", "error");
  }
}

function renderFiles(files) {
  const fileListContainer = document.getElementById("category-list");
  fileListContainer.innerHTML = ""; // Làm mới danh sách file trước khi thêm mới

  if (files.length === 0) {
    fileListContainer.innerHTML = `<p class="text-center alert alert-info">Không tìm thấy file nào! 😁</p>`;
  } else {
    files.forEach((file) => {
      const fileItem = document.createElement("div");
      fileItem.classList.add("col");
      fileItem.innerHTML = `
            <div class="w-100 card box-file d-flex flex-row" id="file-${file.id}">
              <div  type="button" class="card-body d-flex flex-row align-items-center" onclick="CardFileDetail(${file.id}, '${file.name}')">
                  <div class="d-flex justify-content-between box_icon_file">
                      <img src="image/setting-file.png" class="icon-file" alt="file" />
                  </div>
                  <div class="d-flex flex-column">
                    <h5 class="card-title m-3 mt-0 mb-0 d-flex justify-content-start">${file.name}</h5>
                    <p class="card-title m-3 mt-0 mb-0 d-flex justify-content-start fs-6">Học phần: ${file.quantity} terms</p>
                  </div>
              </div>
            <div class="d-flex justify-content-end gap-2 p-3">
                  <button class="btn btn-outline-primary button-action p-2 m-2 me-0" onclick="editFile(${file.id})"><i class="fa fa-edit fs-5"></i></button>
                  <button class="btn btn-outline-danger button-action p-2 m-2 me-0" onclick="deleteFileShow(${file.id})"><i class="fa fa-trash fs-5"></i></button>
            </div>
        </div>
      `;
      fileListContainer.appendChild(fileItem);
    });
  }
}

function CardFileDetail(fileId, fileName) {
  const fileItem = {
    fileId: fileId,
    fileName: fileName,
    folderId: folderId,
  };
  sessionStorage.setItem("fileItem", JSON.stringify(fileItem));
  window.location.href = "./file.html";
}
// Hàm thêm file mới vào thư mục
async function addFile() {
  const fileNameValue = fileName.value;
  if (!fileNameValue) {
    fileName.classList.add("is-invalid");
    showToast("Tên file không thể để trống!", "warning");
    return;
  }
  try {
    const response = await axiosservice.post(`/api/folders/${folderId}/files`, {
      name: fileNameValue,
    });
    showToast("Thêm file thành công!", "success");
    fetchFiles(folderId); // Tải lại danh sách file sau khi thêm
    document.getElementById("fileName").value = ""; // Xóa giá trị input
  } catch (error) {
    console.error("Error adding file:", error);
    showToast("Không thể thêm file. Vui lòng thử lại!", "error");
  }
}

// Hàm mở modal và điền tên file hiện tại khi sửa file
async function editFile(fileId) {
  currentFileId = fileId;
  newFileName.value = "";
  const fileNameLabel = document.getElementById("fileNameLabel");
  fileNameLabel.innerHTML =
    "" +
    document.getElementById(`file-${fileId}`).querySelector("h5").textContent;
  editFileModal.show();
}

// Hàm cập nhật tên file
async function updateFile() {
  const newFileNameValue = newFileName.value;
  if (!newFileNameValue) {
    newFileName.classList.add("is-invalid");
    showToast("Tên danh mục không được để trống!", "warning");
    return;
  }

  try {
    const response = await axiosservice.put(`/api/files/${currentFileId}`, {
      name: newFileNameValue,
    });
    showToast("Cập nhật tên file thành công!", "success");
    fetchFiles(folderId);
    editFileModal.hide();
  } catch (error) {
    console.error("Error updating file:", error);
    showToast("Có lỗi xảy ra khi cập nhật tên file.", "error");
  }
}
// Hàm xóa file
async function deleteFileShow(fileId) {
  currentFileId = fileId;
  deleteFileModal.show();
}
async function deleteFile() {
  try {
    const response = await axiosservice.delete(`/api/files/${currentFileId}`);
    showToast("File đã được xóa.", "success");
    fetchFiles(folderId);
    deleteFileModal.hide();
  } catch (error) {
    console.error("Error deleting file:", error);
    showToast("Có lỗi xảy ra khi xóa file.", "error");
  }
}
// Lắng nghe sự kiện khi trang được tải xong

async function deleteFolder() {
  try {
    const response = await axiosservice.delete(`/api/folders/${folderId}`);
    showToast("Xóa folder thành công!", "success");
    window.location.href = "/index.html";
  } catch (error) {
    console.error("Lỗi khi xóa folder:", error);
    showToast("Không thể xóa folder. Vui lòng thử lại!", "error");
  }
}

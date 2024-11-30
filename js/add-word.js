
const urlParams = new URLSearchParams(window.location.search);
const folderId = urlParams.get("folder");
const fileId = urlParams.get("file");
const fileName = urlParams.get("name");

const addWordBtn = document.getElementById("addWordBtn");
const wordContainer = document.getElementById("addWordList");
const backToFileButton = document.getElementById("backToFile");
const saveWordsButton = document.getElementById("saveWordsBtn");


const axiosservice = new AxiosService();
let wordEditors = [];


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("fileName").value = fileName;
    
});

backToFileButton.addEventListener("click", () => {
  window.location.href = `file.html?folder=${folderId}&file=${fileId}`;
});

addWordBtn.addEventListener("click", function () {
  const newWordBox = document.createElement("div");
  const wordEditorId = `word-editor-${wordEditors.length}`;
  const meaningEditorId = `meaning-editor-${wordEditors.length}`;
  const wordBoxId = `word-box-${wordEditors.length}`; // ID duy nhất cho từng box

  newWordBox.setAttribute("id", wordBoxId); // Gán ID duy nhất cho box
  newWordBox.classList.add("word-box"); // Gắn class để dễ quản lý
  newWordBox.innerHTML = `
        <div class="mb-4 p-3 pb-0 pt-0 border rounded position-relative">
            <div class="d-flex justify-content-between align-items-center">
                <span class="badge bg-primary box-index">#${
                  wordEditors.length + 1
                }</span> <!-- Số thứ tự -->
                <button class="btn btn-danger mt-2 me-2" onclick="removeWordBox('${wordBoxId}')">Xóa</button>
            </div>
            <div class="input-group">
                <div class="flex-grow-1">
                    <label class="form-label">Từ</label>
                    <div id="${wordEditorId}" class="word-editor mb-3" style="height: 100px;"></div>
                </div>
                <div class="flex-grow-1 ms-2">
                    <label class="form-label">Nghĩa</label>
                    <div id="${meaningEditorId}" class="meaning-editor" style="height: 100px;"></div>
                </div>
            </div>
        </div>
    `;
  wordContainer.appendChild(newWordBox);

  const wordEditor = new Quill(`#${wordEditorId}`, {
    theme: "snow",
    placeholder: "Nhập từ...",
  });

  const meaningEditor = new Quill(`#${meaningEditorId}`, {
    theme: "snow",
    placeholder: "Nhập nghĩa hoặc đoạn văn...",
  });

  wordEditors.push({ wordEditor, meaningEditor });

  // Cập nhật lại số thứ tự cho tất cả các box
  updateBoxIndexes();
});
function updateBoxIndexes() {
  const boxes = document.querySelectorAll(".word-box");
  boxes.forEach((box, index) => {
    const badge = box.querySelector(".box-index");
    if (badge) {
      badge.textContent = `#${index + 1}`; // Cập nhật số thứ tự
    }
  });
}

function removeWordBox(wordBoxId) {
  const wordBox = document.getElementById(wordBoxId); // Lấy box từ ID
  const confirmDelete = confirm("Bạn có chắc chắn muốn xóa ô nhập liệu này?");
  if (confirmDelete) {
    // Tìm index của box dựa trên ID
    const index = wordEditors.findIndex(
      ({ wordEditor }) => wordEditor.root.closest(".word-box").id === wordBoxId
    );

    if (index !== -1) {
      wordEditors.splice(index, 1); // Xóa phần tử khỏi mảng
    }

    wordBox.remove(); // Xóa box khỏi giao diện

    // Cập nhật lại số thứ tự
    updateBoxIndexes();
  }
}

saveWordsButton.addEventListener("click", async function () {
  showLoading();
  try {
    const words = wordEditors.map(({ wordEditor, meaningEditor }) => {
      // Lọc bỏ các thuộc tính màu sắc và kích thước của thẻ HTML trong Quill editor
      const cleanWord = cleanQuillContent(wordEditor.root);
      const cleanMeaning = cleanQuillContent(meaningEditor.root);

      return {
        word: cleanWord,
        meaning: cleanMeaning,
      };
    });

    const fileName = document.getElementById("fileName").value;
    console.log(words, fileName);

    // Gửi dữ liệu từ và nghĩa tới API
    const response = await axiosservice.post(`/api/files/${fileId}/words`, {
      words,
    });
    // Cập nhật tên file (nếu cần thiết)
    const responseFilename = await axiosservice.put(`/api/files/${fileId}`, {
      name: fileName,
    });
    // Hiển thị thông báo thành công
    setTimeout(() => {
      hideLoading();
      showToast("Lưu từ thành công!", "success");
    }, 2000);
  } catch (error) {
    hideLoading();
    console.error("Lỗi khi lưu từ:", error);
    showToast("Không thể lưu từ. Vui lòng thử lại!", "error");
  }
});

// Hàm giúp loại bỏ các thuộc tính màu sắc và kích thước trong nội dung Quill
function cleanQuillContent(element) {
  // Tạo một bản sao của DOM để xử lý
  const clonedElement = element.cloneNode(true);

  // Lọc bỏ các thuộc tính màu sắc và kích thước
  const elementsWithStyle = clonedElement.querySelectorAll("*");
  elementsWithStyle.forEach((el) => {
    if (el.style.color || el.style.fontSize) {
      el.removeAttribute("style"); // Xóa các thuộc tính style
    }
  });

  // Chuyển nội dung của phần tử về dạng văn bản (với các thẻ HTML cần thiết vẫn còn)
  return clonedElement.innerHTML;
}

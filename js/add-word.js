const urlParams = new URLSearchParams(window.location.search);
const folderId = urlParams.get("folder");
const fileId = urlParams.get("file");
const fileName = urlParams.get("name");

const addWordBtn = document.getElementById("addWordBtn");
const wordContainer = document.getElementById("addWordList");
const backToFileButton = document.getElementById("backToFile");
const saveWordsButton = document.getElementById("saveWordsBtn");

const langMeaning = document.getElementById("langMeaning");
const langWord = document.getElementById("langWord");
const addWordModal = new bootstrap.Modal("#addWordModal");
const axiosservice = new AxiosService();
let wordEditors = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fileName").value = fileName;
});

backToFileButton.addEventListener("click", () => {
  window.location.href = `file.html?folder=${folderId}&file=${fileId}`;
});

// Thêm box nhập liệu mới
addWordBtn.addEventListener("click", function () {
  const newWordBox = document.createElement("div");
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
                    <textarea class="word-editor mb-3 w-100 form-control"></textarea>
                </div>
                <div class="flex-grow-1 ms-2">
                    <label class="form-label">Nghĩa</label>
                    <textarea class="meaning-editor w-100 form-control"></textarea>
                </div>
            </div>
        </div>
    `;

  wordContainer.appendChild(newWordBox);

  // Thêm editors vào danh sách quản lý
  const wordEditor = newWordBox.querySelector(".word-editor");
  const meaningEditor = newWordBox.querySelector(".meaning-editor");

  wordEditors.push({ wordEditor, meaningEditor });

  // Cập nhật lại số thứ tự
  updateBoxIndexes();
});

// Cập nhật chỉ số thứ tự các box
function updateBoxIndexes() {
  const boxes = document.querySelectorAll(".word-box");
  boxes.forEach((box, index) => {
    const badge = box.querySelector(".box-index");
    if (badge) {
      badge.textContent = `#${index + 1}`; // Cập nhật số thứ tự
    }
  });
}

// Xóa một box nhập liệu
function removeWordBox(wordBoxId) {
  const wordBox = document.getElementById(wordBoxId); // Lấy box từ ID
  const confirmDelete = confirm("Bạn có chắc chắn muốn xóa ô nhập liệu này?");
  if (confirmDelete) {
    const index = Array.from(wordContainer.children).indexOf(wordBox);

    if (index !== -1) {
      wordEditors.splice(index, 1); // Xóa phần tử khỏi mảng
    }

    wordBox.remove(); // Xóa box khỏi giao diện

    // Cập nhật lại số thứ tự
    updateBoxIndexes();
  }
}

// Lưu các từ và nghĩa
saveWordsButton.addEventListener("click", async function () {
  const langWordValue = langWord.value;
  const langMeaningValue = langMeaning.value;
  if (!langWordValue || !langMeaningValue) {
    langWord.classList.add("is-invalid");
    langMeaning.classList.add("is-invalid");
    showToast("Em chọn ngôn ngữ từ và nghĩa nhé 😘!", "error");
    return;
  } else {
    showLoading();
    try {
      const words = wordEditors.map(({ wordEditor, meaningEditor }) => {
        const cleanWord = wordEditor.value.trim();
        const cleanMeaning = meaningEditor.value.trim();
        return {
          word: cleanWord,
          meaning: cleanMeaning,
          langWord: langWordValue,
          langMeaning: langMeaningValue,
        };
      });

      const fileName = document.getElementById("fileName").value;
      console.log(words, fileName);

      // Gửi dữ liệu từ và nghĩa tới API
      const response = await axiosservice.post(`/api/files/${fileId}/words`, {
        words,
      });
      const responseFilename = await axiosservice.put(`/api/files/${fileId}`, {
        name: fileName,
      });

      setTimeout(() => {
        hideLoading();
        showToast("Lưu từ thành công!", "success");
      }, 2000);
      setTimeout(() => {
        window.location.href = `file.html?folder=${folderId}&file=${fileId}`;
      }, 4000);
    } catch (error) {
      hideLoading();
      console.error("Lỗi khi lưu từ:", error);
      showToast("Không thể lưu từ. Vui lòng thử lại!", "error");
    }
  }
});

// add Multiple Words

let table; // Biến lưu bảng Tabulator
let newData = []; // Dữ liệu từ file Excel
initializeTabulator();
// Hàm khởi tạo Tabulator
function initializeTabulator() {
  table = new Tabulator("#tabulator-table", {
    height: "300px",
    layout: "fitColumns",
    placeholder: "No Data",
    columns: [
      { title: "Word", field: "word", editor: "input" },
      { title: "Meaning", field: "meaning", editor: "input" },
    ],
  });
}

// Xử lý khi tải file Excel
document
  .getElementById("excelFile")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Chuyển đổi dữ liệu Excel thành JSON và xử lý những hàng trống
      newData = XLSX.utils.sheet_to_json(sheet, {
        header: ["word", "meaning"],
        defval: "",
      }).filter(row => row.word.trim() !== "" && row.meaning.trim() !== "");

      // Cập nhật dữ liệu vào Tabulator
      table.setData(newData);
    };
    reader.readAsArrayBuffer(file);
  });
// Xử lý khi người dùng nhấn "Save Data"
document.getElementById("saveDataBtn").addEventListener("click", function () {
  // Lấy dữ liệu từ bảng
  const tableData = table.getData();

  addWordModal.hide();
  console.log(tableData);
  try {
    tableData.forEach(({ word, meaning }) => {
      addWordBox(word, meaning);
    });
  } catch (error) {
    console.log(error);
  } finally {
  }
});

// Hàm thêm một hộp từ mới
function addWordBox(word, meaning) {
  const cleanWord = word.trim();
  const cleanMeaning = meaning.trim();

  console.log(cleanWord, cleanMeaning);

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
                    <textarea id="${wordEditorId}" class="word-editor mb-3 form-control">${cleanWord}</textarea>
                </div>
                <div class="flex-grow-1 ms-2">
                    <label class="form-label">Nghĩa</label>
                    <textarea id="${meaningEditorId}" class="meaning-editor form-control">${cleanMeaning}</textarea>
                </div>
            </div>
        </div>
    `;

  wordContainer.appendChild(newWordBox);

  // Đặt nội dung ban đầu nếu có

  // Thêm editors vào danh sách quản lý
  wordEditors.push({
    wordEditor: document.getElementById(wordEditorId),
    meaningEditor: document.getElementById(meaningEditorId),
  });

  // Cập nhật lại số thứ tự cho tất cả các box
  updateBoxIndexes();
}

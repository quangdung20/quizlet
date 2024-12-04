const urlParams = new URLSearchParams(window.location.search);
const folderId = urlParams.get("folder");
const fileId = urlParams.get("file");

const fileNameLabel = document.getElementById("fileName");
const editWordModal = new bootstrap.Modal("#editWordModal");
const deleteWordModal = new bootstrap.Modal("#deleteWordModal");
const addWordBtn = document.getElementById("addWordLink");
const deleteWordBtn = document.getElementById("deleteWordBtn");
const editWordForm = document.getElementById("editWordForm");

const saveEditWordBtn = document.getElementById("saveEditWordBtn");
const searchWordInput = document.getElementById("searchWord");

const quizGameBtn = document.getElementById("quizGameBtn");
const flashcardGameBtn = document.getElementById("flashcardGameBtn");
const writeGameBtn = document.getElementById("writeGameBtn");
const listenGameBtn = document.getElementById("listenGameBtn");
  const wordList = document.getElementById("wordList");

const axiosservice = new AxiosService();
let fileName = "";
let wordId;
let allWords = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchWords(fileId);
  displayFilesInCarousel(folderId);
  PlayGame(quizGameBtn, "quiz");
  PlayGame(flashcardGameBtn, "flashcard");
  PlayGame(writeGameBtn, "write");
  PlayGame(listenGameBtn, "listening");
  searchWordInput.addEventListener("input", (event) => {
    const query = event.target.value; // Lấy nội dung tìm kiếm
    filterWords(query); // Lọc danh sách từ
  });
  addWordBtn.addEventListener("click", function () {
    window.location.href = `add-word.html?folder=${folderId}&file=${fileId}&name=${fileName}`;
  });
});

function PlayGame(button, game) {
  button.addEventListener("click", () => {
    window.location.href = `${game}.html?folder=${folderId}&file=${fileId}`;
  });
}
function filterWords(query) {
  // Lọc danh sách từ dựa trên `word` và `meaning`
  const filteredWords = allWords.filter(
    (word) =>
      word.word.toLowerCase().includes(query.toLowerCase()) ||
      word.meaning.toLowerCase().includes(query.toLowerCase())
  );
  // Hiển thị kết quả đã lọc
  displayWords(filteredWords);
}

async function displayFilesInCarousel(folderId) {
  try {
    const response = await axiosservice.get(`/api/folders/${folderId}/files`);
    const files = response;
    RenderFileSlide(files);
  } catch (error) {
    console.error("Error displaying files in carousel:", error);
    showToast("Không thể tải slide file. Vui lòng thử lại!", "error");
  }
}
function RenderFileSlide(files) {
  const carouselInner = document.querySelector(".carousel-inner");
  carouselInner.innerHTML = ""; // Xóa các slide cũ

  files.forEach((file, index) => {
    const carouselItem = document.createElement("div");
    carouselItem.classList.add("carousel-item");
    if (index === 0) carouselItem.classList.add("active"); // Slide đầu tiên phải active

    // Chia các file thành các nhóm 3 card mỗi slide
    const numberOfSlides = Math.ceil(files.length / 3); // Số lượng slide cần hiển thị
    for (let i = 0; i < numberOfSlides; i++) {
      const slide = document.createElement("div");
      slide.classList.add("carousel-item");
      if (i === 0) slide.classList.add("active"); // Slide đầu tiên phải active

      const slideContent = document.createElement("div");
      slideContent.classList.add("d-flex", "justify-content-center", "gap-3");

      // Thêm 3 card vào mỗi slide
      for (let j = i * 3; j < (i + 1) * 3 && j < files.length; j++) {
        const file = files[j];
        const card = document.createElement("div");
        card.classList.add("card");
        card.style.width = "18rem";
        card.innerHTML = `
                <div class="d-flex justify-content-center slide_item">
                    <div class="card cart_item_slide bg-secondary" style="width: 18rem;">
                        <div class="card-body position-relative">
                           <div class="input-gr">
                              <h5 class="card-title white-space-nowrap">${file.name}</h5>
                              <p class="card-text m-0">Words: ${file.quantity}</p>
                           </div>
                            <button class="btn btn-primary btnViewFile d-flex p-2 align-items-center" onclick="CardFileDetail('${file.id}', '${file.name}')">
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            `;
        slideContent.appendChild(card);
      }

      slide.appendChild(slideContent);
      carouselInner.appendChild(slide);
    }
  });
}
function CardFileDetail(fileId) {
  window.location.href = "./file.html?folder=" + folderId + "&file=" + fileId;
}

// ham lấy danh sách từ trong file
async function fetchWords(fileId) {
  showLoading(); // Hiển thị loading
  try {
    const response = await axiosservice.get(`/api/files/${fileId}/words`);
    allWords = response.data; // Lưu danh sách từ vào biến toàn cục
    fileNameLabel.innerHTML = response.name;
    fileName = response.name;
    document.getElementById(
      "quanity_word"
    ).innerHTML = `Words: ${allWords.length}`;
    setTimeout(() => {
      displayWords(allWords); // Hiển thị toàn bộ từ
      hideLoading();
    }, 1000);
  } catch (error) {
    console.error("Error fetching words:", error);
    showToast("Không thể tải danh sách từ. Vui lòng thử lại!", "error");
  }
}

const sanitizeString = (str) => {
  return str
    .replace(/\\/g, "\\\\") // Chuyển dấu backslash thành \\
    .replace(/'/g, "\\'") // Chuyển dấu nháy đơn thành \'
    .replace(/"/g, '\\"') // Chuyển dấu nháy kép thành \"
    .replace(/</g, "&lt;") // Chuyển ký tự < thành &lt;
    .replace(/>/g, "&gt;"); // Chuyển ký tự > thành &gt;
};


// Hàm hiển thị danh sách từ
function displayWords(words) {

  wordList.innerHTML = ""; // Xóa nội dung cũ
  
  if (words.length === 0) {
    wordList.innerHTML = `<p class="text-center alert alert-info">Không tìm thấy từ nào! 😁</p>`;
  } else {
    // hiiên thị loading    
    words.forEach((word, index) => {
      const wordItem = document.createElement("div");
      wordItem.classList.add("word-item");
      wordItem.innerHTML = `
            <div class="card card-word mb-2">
                <div class="card-body flex-row d-flex">
                
                    <div class="d-flex flex-row flex-fill">
                        <div class="col-4">
                            <h5 class="card-title" style="white-space: pre">${
                              word.word
                            }</h5>
                        </div>
                        <div class="col-8 ms-2">
                            <h5 class="card-text" style="white-space: pre">${
                              word.meaning
                            }</h5>
                            </div>
                    </div>
                    <div>
                      <button class="btn btn-outline-danger delete-word-btn"
                      onclick="deleteWordShowModal('${word.id}')">
                      <i class="fa fa-trash"></i>
                      </button>
                      <button class="btn btn-outline-success delete-word-btn"
                       onclick="editWordShowModal('${
                         word.id
                       }', \`${sanitizeString(word.word)}\`, \`${sanitizeString(
        word.meaning
      )}\`)">
                              <i class="fa fa-edit"></i>
                      </button>

                    </div>
                </div>
            </div>  
        `;
      wordList.appendChild(wordItem);
    });
  }
}

// modal sửa từ
function deleteWordShowModal(id) {
  wordId = id;
  deleteWordModal.show();
}
// Hàm sửa từ
deleteWordBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
    await axiosservice.delete(`/api/words/${wordId}`);
    fetchWords(fileId);
    showToast("Xóa từ thành công!", "success");
  } catch (error) {
    console.error("Error deleting word:", error);
    showToast("Không thể xóa từ. Vui lòng thử lại!", "error");
  }
});


// modal sửa từ
function editWordShowModal(id, word, meaning) {
  wordId = id; // Lưu id từ vào biến global để sử dụng khi cần thiết

  // Làm sạch dữ liệu đầu vào
  const cleanWord = sanitizeString(word.trim());
  const cleanMeaning = sanitizeString(meaning.trim());

  const editWordForm = document.getElementById("editWordForm");
  editWordForm.innerHTML = `
    <label class="form-label">Word</label>
    <div class="m-0 pb-0 pt-0 position-relative">
      <textarea id="wordEditor" class="word-editor w-100 form-control">${cleanWord}</textarea>
    </div>
    <label class="form-label">Mean</label>
    <div class="pb-0 pt-0 position-relative">
      <textarea id="meaningEditor" class="meaning-editor w-100 form-control">${cleanMeaning}</textarea>
    </div>`;
  editWordModal.show(); // Hiển thị modal sửa từ
}

// Hàm sửa từ
saveEditWordBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const wordEditor = document.getElementById("wordEditor");
  const meaningEditor = document.getElementById("meaningEditor");
  // Lấy nội dung đã chỉnh sửa từ các editor
  const word = wordEditor.value.trim();
  const meaning = meaningEditor.value.trim();

  try {
    // Gửi nội dung chỉnh sửa lên server
    await axiosservice.put(`/api/words/${wordId}`, { word, meaning });

    fetchWords(fileId); // Cập nhật danh sách từ sau khi chỉnh sửa
    showToast("Sửa từ thành công!", "success");
    editWordModal.hide(); // Ẩn modal
  } catch (error) {
    console.error("Error editing word:", error);
    showToast("Không thể sửa từ. Vui lòng thử lại!", "error");
  }
});

// // Lấy tham số từ URL
// const urlParams = new URLSearchParams(window.location.search);
// const folderId = urlParams.get("folder");
// const fileId = urlParams.get("file");

// // Các phần tử DOM
// const fileNameLabel = document.getElementById("fileName");
// const quantityWord = document.getElementById("quanity_word");
// const BacktoFile = document.getElementById("backtofile");
// const optionLang = document.getElementById("optionLang");
// // Dịch vụ Axios
// const axiosservice = new AxiosService();
// let originalQuestions = [];
// document.addEventListener("DOMContentLoaded", () => {
//   fetchWords(fileId); // Lấy danh sách từ
//   BacktoFile.addEventListener("click", () => {
//     window.location.href = `/file.html?folder=${folderId}&file=${fileId}`;
//   });
// });

// async function fetchWords(fileId) {
//   try {
//     const response = await axiosservice.get(`/api/files/${fileId}/words`);
//     originalQuestions = response.data;
//     insertOptionLang(originalQuestions[1]);
//     fileNameLabel.innerHTML = response.name || "File Name";
//     quantityWord.innerHTML = `Words: ${response.name.length}`;
//   } catch (error) {
//     console.error("Error fetching words:", error);
//     showToast("Không thể tải danh sách từ. Vui lòng thử lại!", "error");
//   }
// }

// // Hàm chọn ngôn ngữ exempale lang = {wordLang: "en-US", meaningLang: "vi-VN"}
// function insertOptionLang(lang) {
//   // Danh sách ngôn ngữ với tên và mã
//   const langs = [
//     { English: "en-US" },
//     { VietNam: "vi-VN" },
//     { Korean: "ko-KR" },
//   ];

//   // Ngôn ngữ được chọn cho từ và nghĩa
//   const wordLang = lang.langWord;
//   const meaningLang = lang.langMeaning;

//   // Xóa các tùy chọn cũ nếu có
//   optionLang.innerHTML = "";

//   // Thêm tùy chọn cho `wordLang`
//   langs.forEach((item) => {
//     const [key, value] = Object.entries(item)[0];
//     const option = document.createElement("option");
//     if (value === wordLang) {
//       option.value = value;
//       option.textContent = `${key}`;
//       option.selected = true;
//       optionLang.appendChild(option);
//       }
//       if (value === meaningLang) {
//           option.value = value;
//           option.textContent = `${key}`;
//           optionLang.appendChild(option);
//         }
//   });
// }



// // Tải flash card dựa trên chế độ hiển thị
// function loadFlashCard() {
//   const wordElement = document.getElementById("word");
//   const meaningElement = document.getElementById("meaning");
//   const progressText = document.getElementById("progress-text");
//   const progressBar = document.getElementById("progress-bar");

//   const displayMode = document.querySelector(
//     'input[name="displayMode"]:checked'
//   ).value;
//   const enableTTS = document.getElementById("enable-tts").checked;

//   const currentCard = flashCards[currentCardIndex];

//   // Hiển thị theo chế độ được chọn
//   if (displayMode === "term") {
//     wordElement.textContent = currentCard.word;
//     meaningElement.textContent = currentCard.meaning;
//     meaningElement.classList.add("hidden-text");
//   } else if (displayMode === "meaning") {
//     wordElement.textContent = currentCard.word;
//     meaningElement.textContent = currentCard.meaning;
//     meaningElement.classList.add("hidden-text");
//   } else if (displayMode === "both") {
//     wordElement.textContent = currentCard.word;
//     meaningElement.textContent = currentCard.meaning;
//     meaningElement.classList.remove("hidden-text");
//   }

//   // TTS cho chế độ hiển thị
//   if (enableTTS) {
//     const ttsText =
//       displayMode === "both"
//         ? `${currentCard.word}. ${currentCard.meaning}`
//         : displayMode === "term"
//         ? currentCard.word
//         : currentCard.meaning;

//     textToSpeech(ttsText);
//   }

//   // Cập nhật trạng thái nút và tiến độ
//   document.getElementById("prev-btn").disabled = currentCardIndex === 0;
//   document.getElementById("next-btn").textContent =
//     currentCardIndex === flashCards.length - 1 ? "Restart" : "Next";
//   progressText.textContent = `Progress: ${currentCardIndex + 1} / ${
//     flashCards.length
//   }`;
//   progressBar.style.width = `${
//     ((currentCardIndex + 1) / flashCards.length) * 100
//   }%`;
// }

// // Chuyển đến flashcard tiếp theo
// function nextCard() {
//   if (currentCardIndex < flashCards.length - 1) {
//     currentCardIndex++;
//   } else {
//     currentCardIndex = 0; // Lặp lại từ đầu
//   }
//   loadFlashCard();
// }

// // Quay lại flashcard trước đó
// function prevCard() {
//   if (currentCardIndex > 0) {
//     currentCardIndex--;
//   }
//   loadFlashCard();
// }

// // Lắng nghe sự kiện thay đổi tùy chọn
// document.querySelectorAll('input[name="displayMode"]').forEach((radio) => {
//   radio.addEventListener("change", loadFlashCard);
// });

// // Toggle nghĩa khi click vào thẻ hoặc nhấn Space
// function toggleMeaning() {
//   const meaningElement = document.getElementById("meaning");
//   meaningElement.classList.toggle("hidden-text");
//   meaningElement.classList.toggle("visible-text");
// }

// // Thêm sự kiện bàn phím
// document.addEventListener("keydown", (event) => {
//   switch (event.code) {
//     case "Space":
//       event.preventDefault();
//       toggleMeaning(); // Hiển thị hoặc ẩn nghĩa khi nhấn Space
//       break;
//     case "ArrowRight":
//       nextCard();
//       break;
//     case "ArrowLeft":
//           prevCard();
//       case "A":
//           textToSpeech(flashCards[currentCardIndex].word, optionLang.value);
//       break;
//   }
// });

// // Hàm đọc văn bản thành giọng nói
// function textToSpeech(text, lang) {
//   const speech = new SpeechSynthesisUtterance(text);
//   speech.lang = lang;
//   speechSynthesis.speak(speech);
// }

let currentIndex = 0;
let showBoth = false;
let isFlipped = false;

const flashcard = document.querySelector("#flashcard");
const frontText = document.querySelector("#front-text");
const backText = document.querySelector("#back-text");
const progressText = document.querySelector("#progress-text");
const progressBar = document.querySelector("#progress-bar");

const enableShowBoth = document.querySelector("#enableShowBoth");

// Dữ liệu mẫu

const cards = [
  { front: "Hello", back: "Xin chào" },
  { front: "Goodbye", back: "Tạm biệt" },
  { front: "Thank you", back: "Cảm ơn" },
  { front: "Yes", back: "Có" },
  { front: "No", back: "Không" },
];

// Cập nhật giao diện flashcard
function updateFlashcard() {
  const card = cards[currentIndex];

  if (showBoth) {
    flashcard.classList.remove("is-flipped");
    frontText.textContent = `Mặt trước: ${card.front}`;
    backText.textContent = `Mặt sau: ${card.back}`;
    backText.style.display = "block";
  } else {
    frontText.textContent = card.front;
    backText.textContent = card.back;
    backText.style.display = "none";
    isFlipped = false;
    flashcard.classList.remove("is-flipped");
  }

  progressText.textContent = `Progress: ${currentIndex + 1} / ${cards.length}`;
  progressBar.style.width = `${((currentIndex + 1) / cards.length) * 100}%`;
}

// Lật flashcard
flashcard.addEventListener("click", () => {
  if (!showBoth) {
    isFlipped = !isFlipped;
    flashcard.classList.toggle("is-flipped", isFlipped);
  }
});

// Chuyển sang thẻ trước
function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    updateFlashcard();
  }
}

// Chuyển sang thẻ tiếp theo
function nextCard() {
  if (currentIndex < cards.length - 1) {
    currentIndex++;
    updateFlashcard();
  }
}

// Xử lý lưu thay đổi từ modal
document.addEventListener("DOMContentLoaded", () => {
  const saveChangesBtn = document.querySelector(".modal-footer .btn-primary");

    saveChangesBtn.addEventListener("click", () => {
      console.log(enableShowBoth.checked);
      
    showBoth = enableShowBoth.checked;
    updateFlashcard();
  });

  updateFlashcard(); // Cập nhật giao diện khi load trang
});

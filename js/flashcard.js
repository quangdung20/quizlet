// Lấy tham số từ URL
const urlParams = new URLSearchParams(window.location.search);
const folderId = urlParams.get("folder");
const fileId = urlParams.get("file");

// Các phần tử DOM
const fileNameLabel = document.getElementById("fileName");
const quantityWord = document.getElementById("quanity_word");
const BacktoFile = document.getElementById("backtofile");
const optionLang = document.getElementById("optionLang");
const saveChangesBtn = document.getElementById("saveChangesBtn");
const autoplayBtn = document.getElementById("autoplayBtn");

const flashcard = document.querySelector("#flashcard");
const frontText = document.querySelector("#front-text");
const backText = document.querySelector("#back-text");
const progressText = document.querySelector("#progress-text");
const progressBar = document.querySelector("#progress-bar");
const enableShowBoth = document.querySelector("#enableShowBoth");
const autoSpeak = document.querySelector("#enableTTS");
let currentIndex = 0;
let showBoth = false;
let isFlipped = false;
let langVoice = "";
let isMix = false;
let isAutoplay = false;
// Dịch vụ Axios
const axiosservice = new AxiosService();
let originalQuestions = [];
document.addEventListener("DOMContentLoaded", () => {
  fetchWords(fileId); // Lấy danh sách từ
  BacktoFile.addEventListener("click", () => {
    window.location.href = `file.html?folder=${folderId}&file=${fileId}`;
  });
  autoplayBtn.addEventListener("click", () => {
    isAutoplay = !isAutoplay;
    autoplayBtn.classList.toggle("text-secondary", !isAutoplay);
    autoplayBtn.classList.toggle("text-primary", isAutoplay);
    updateFlashcard();
  });
});
saveChangesBtn.addEventListener("click", () => {
  Modes();
  updateFlashcard();
  showToast("Thay đổi đã được lưu!", "success");
});


function Modes() {
  langVoice = optionLang.value;
  const Modes = {
    showBoth: enableShowBoth.checked,
    langVoice: langVoice,
    autoSpeak: autoSpeak.checked,
  };

  sessionStorage.setItem("Modes", JSON.stringify(Modes));
}

async function fetchWords(fileId) {
  try {
    const response = await axiosservice.get(`/api/files/${fileId}/words`);
    originalQuestions = response.data;
    insertOptionLang(originalQuestions[1]);
    fileNameLabel.innerHTML = response.name || "File Name";
    quantityWord.innerHTML = `Words: ${response.data.length}`;
    updateFlashcard();
  } catch (error) {
    console.error("Error fetching words:", error);
    showToast("Không thể tải danh sách từ. Vui lòng thử lại!", "error");
  }
}

// Trộn danh sách từ
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

function textToSpeech() {
  const currentCard = originalQuestions[currentIndex];
  const Modes = JSON.parse(sessionStorage.getItem("Modes"));

  const text = isFlipped
    ? currentCard.meaning
    : Modes.showBoth
    ? `${currentCard.word}. ${currentCard.meaning}`
    : currentCard.word;

  speakText(text, Modes.langVoice);
} 
function speakWord() {
  const currentCard = originalQuestions[currentIndex];
  
  speakText(currentCard.word, langVoice);
}

function speakText(text, langVoice) {
  const speech = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const defaultVoice = voices.find((voice) => voice.lang.startsWith(langVoice));
  if (defaultVoice) {
    speech.voice = defaultVoice;
  } else {
    console.warn(`Không tìm thấy giọng nói mặc định cho ngôn ngữ: ${langVoice}`);
  }
  speech.lang = langVoice;
  speechSynthesis.speak(speech);
}
// // Hàm chọn ngôn ngữ exempale lang = {wordLang: "en-US", meaningLang: "vi-VN"}
function insertOptionLang(lang) {
  const langs = [
    { English: "en-US" },
    { VietNam: "vi-VN" },
    { Korean: "ko-KR" },
  ];
  const wordLang = lang.langWord;
  const meaningLang = lang.langMeaning;

  langVoice = wordLang;
  optionLang.innerHTML = "";
  langs.forEach((item) => {
    const [key, value] = Object.entries(item)[0];
    const option = document.createElement("option");
    if (value === wordLang) {
      option.value = value;
      option.dataset.mode = "word";
      option.textContent = `${key}`;
      option.selected = true;
      optionLang.appendChild(option);
    }
    if (value === meaningLang) {
      option.value = value;
      option.dataset.mode = "meaning";
      option.textContent = `${key}`;
      optionLang.appendChild(option);
    }
  });

  Modes();
}

// Tải flash card dựa trên chế độ hiển thị
function updateFlashcard() {
  if (originalQuestions.length === 0) {
    flashcard.innerHTML = `<p class="no-data">Không có dữ liệu.</p>`;
    return;
  }
  const Modes = JSON.parse(sessionStorage.getItem("Modes"));
  const currentCard = originalQuestions[currentIndex];

  // Hiển thị nội dung mặt trước và mặt sau
  if (Modes.showBoth) {
    frontText.textContent = `${currentCard.word}`;
    backText.textContent = `${currentCard.meaning}`;
    flashcard.classList.add("show-both");
  } else if (isFlipped) {
    frontText.textContent = `${currentCard.meaning}`;
    backText.textContent = `${currentCard.word}`;
    flashcard.classList.remove("show-both");

  } else {
    frontText.textContent = `${currentCard.word}`;
    backText.textContent = `${currentCard.meaning}`;
    flashcard.classList.remove("show-both");

  }

  // Tự động đọc từ nếu chế độ autoSpeak được bật
  if (Modes.autoSpeak) {
    speakText(
      isFlipped ? currentCard.meaning : currentCard.word,
      Modes.langVoice
    );
  }

  // Cập nhật thanh tiến trình
  progressText.textContent = `Progress: ${currentIndex + 1} / ${
    originalQuestions.length
  }`;
  progressBar.style.width = `${
    ((currentIndex + 1) / originalQuestions.length) * 100
  }%`;

  // Tự động chuyển sang thẻ tiếp theo
  if (isAutoplay) {
    setTimeout(() => {
      nextCard();
    }, 4000);
  }
}

document.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "Space":
      event.preventDefault();
      isFlipped = !isFlipped;
      updateFlashcard();
      break;
    case "ArrowRight":
      nextCard();
      break;
    case "ArrowLeft":
      prevCard();
      break;
    case "KeyA":
      textToSpeech();
      break;
  }
});

// Lật flashcard
flashcard.addEventListener("click", () => {
  console.log(showBoth);
  const Modes = JSON.parse(sessionStorage.getItem("Modes"));
  showBoth = Modes.showBoth;
  if (!showBoth) {
    isFlipped = !isFlipped;
    flashcard.classList.toggle("is-flipped", isFlipped);
  } else {
    return;
  }
});

// Trộn danh sách từ
function mixCards() {
  const mixBtn = document.getElementById("mixBtn");
  mixBtn.classList.toggle("text-secondary", !isMix);
  mixBtn.classList.toggle("text-primary", isMix);
  isMix = !isMix;
  if (isMix) {
    shuffle(originalQuestions);
    updateFlashcard();
  }
}

// Chuyển sang thẻ trước
function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    updateFlashcard();
  }
}

// Chuyển sang thẻ tiếp theo
function nextCard() {
  if (currentIndex < originalQuestions.length - 1) {
    currentIndex++;
    updateFlashcard();
  } else {
    currentIndex = 0; // Lặp lại từ đầu
    updateFlashcard();
  }
}



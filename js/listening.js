// Lấy tham số từ URL
const urlParams = new URLSearchParams(window.location.search);
const folderId = urlParams.get("folder");
const fileId = urlParams.get("file");

// Các phần tử DOM
const fileNameLabel = document.getElementById("fileName");
const quantityWord = document.getElementById("quanity_word");
const BacktoFile = document.getElementById("backtofile");
const playAudio = document.getElementById("playAudio");
const hintBtn = document.getElementById("hint");
const question = document.getElementById("question");
// Dịch vụ Axios
const axiosservice = new AxiosService();

// Biến toàn cục
let originalQuestions = []; // Danh sách câu hỏi gốc
let currentQuestions = []; // Danh sách câu hỏi được chọn
let currentQuestionIndex = 0; // Câu hỏi hiện tại
let answers = []; // Câu trả lời của người dùng
let score = 0; // Điểm số
let lang = "en-US"; // Ngôn ngữ mặc định
// Khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
  fetchWords(fileId);

  BacktoFile.addEventListener("click", () => {
    window.location.href = `/file.html?folder=${folderId}&file=${fileId}`;
  });
  hintBtn.addEventListener("click", () => {
    console.log(question);

    question.style.opacity = 1;
  });
});

// Lấy danh sách từ từ API
async function fetchWords(fileId) {
  try {
    const response = await axiosservice.get(`/api/files/${fileId}/words`);
    originalQuestions = response.data;

    // Cập nhật giao diện
    fileNameLabel.innerHTML = response.name || "File Name";
    quantityWord.innerHTML = `Words: ${originalQuestions.length}`;
  } catch (error) {
    console.error("Error fetching words:", error);
    showToast("Không thể tải danh sách từ. Vui lòng thử lại!", "error");
  }
}
// Cập nhật số lượng câu hỏi khi người dùng chọn
function selectNumber() {
  const selectedCount = document.getElementById("question-count").value;
  let totalQuestions = originalQuestions.length;
  if (selectedCount !== "all") {
    totalQuestions = parseInt(selectedCount);
  }

  loadQuestions(totalQuestions);
}

// Hàm nạp câu hỏi theo số lượng được chọn
function loadQuestions(count) {
  currentQuestions = [...originalQuestions].slice(0, parseInt(count));
  answers = Array(count).fill(null); // Đặt lại câu trả lời
  currentQuestionIndex = 0; // Đặt lại chỉ số câu hỏi
  loadQuestion(); // Hiển thị câu hỏi đầu tiên
}

function loadQuestion() {
  const questionContainer = document.getElementById("question");
  const answerButtons = document.querySelectorAll("#answers button");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");
  question.style.opacity = 0;
  const currentQuestion = currentQuestions[currentQuestionIndex];
  questionContainer.textContent = `${currentQuestion.word}`;
  // gán ngôn ngữ cho văn bản
  lang = currentQuestion.langWord;

  const wrongAnswers = originalQuestions
    .filter((q) => q.meaning !== currentQuestion.meaning) // Loại bỏ đáp án đúng
    .map((q) => q.meaning);

  // Lấy 3 lựa chọn sai ngẫu nhiên
  const selectedWrongAnswers = shuffleArray(wrongAnswers).slice(0, 3);

  // Tạo danh sách đáp án (đúng + sai)
  const allOptions = shuffleArray([
    currentQuestion.meaning,
    ...selectedWrongAnswers,
  ]);

  //   // Cập nhật đáp án lên nút
  answerButtons.forEach((button, index) => {
    button.textContent = allOptions[index];

    button.className = "btn btn-outline-primary col-5 btn m-2 answers-btn"; // Reset class
    button.disabled = false;
    button.dataset.correct = allOptions[index] === currentQuestion.meaning;

    if (answers[currentQuestionIndex] === allOptions[index]) {
      button.classList.add("active");
    }

    button.onclick = () => selectAnswer(button);
  });

  //   // Cập nhật trạng thái nút điều hướng
  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.style.display =
    currentQuestionIndex === currentQuestions.length - 1
      ? "none"
      : "inline-block";
  submitBtn.style.display =
    currentQuestionIndex === currentQuestions.length - 1
      ? "inline-block"
      : "none";

  const text = currentQuestion.word;
  setTimeout(() => {
    textToSpeech(text, lang);
  }, 500);

  updateQuestionWidget();
}

// Chọn đáp án
function selectAnswer(button) {
  const answerButtons = document.querySelectorAll("#answers button");
  answerButtons.forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");
  answers[currentQuestionIndex] = button.textContent; // Lưu đáp án
  updateQuestionWidget();
}

function nextQuestion() {
  if (currentQuestionIndex < currentQuestions.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion();
  }
}
// Cập nhật widget danh sách câu hỏi
function updateQuestionWidget(afterSubmit = false) {
  const widget = document.getElementById("question-widget");
  widget.innerHTML =
    "<h6 class='w-100 text-center opacity-75'>Question List</h6>";

  answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.textContent = index + 1;
    button.className = "btn btn-sm me-2 mb-2";

    if (afterSubmit) {
      const correctAnswer = currentQuestions[index].meaning;
      if (answer === correctAnswer) button.classList.add("btn-success");
      else if (answer) button.classList.add("btn-danger");
      else button.classList.add("btn-secondary");
    } else {
      button.classList.add(answer ? "btn-primary" : "btn-secondary");
    }

    button.onclick = () => {
      currentQuestionIndex = index;
      loadQuestion();
    };

    widget.appendChild(button);
  });
}

// Hàm nộp bài và hiển thị kết quả với màu sắc cho các câu hỏi
// Nộp bài kiểm tra
function submitQuiz() {
  const resultContainer = document.getElementById("quiz-result");
  const resultList = document.getElementById("result-list");
  const scoreElement = document.getElementById("score");
  const totalQuestionsElement = document.getElementById("total-questions");

  resultList.innerHTML = "";
  score = 0;

  currentQuestions.forEach((question, index) => {
    const resultItem = document.createElement("div");
    resultItem.className = "result-item";

    const userAnswer = answers[index];
    const correctAnswer = question.meaning;

    resultItem.innerHTML = `
      <p>Q${index + 1}: ${question.word}</p>
      <p>Your answer: ${userAnswer || "Not answered"}</p>
      <p>Correct answer: ${correctAnswer}</p>
    `;

    if (userAnswer === correctAnswer) {
      resultItem.classList.add("answered-correct");
      score++;
    } else if (userAnswer) {
      resultItem.classList.add("answered-wrong");
    } else {
      resultItem.classList.add("not-answered");
    }

    resultList.appendChild(resultItem);
  });

  scoreElement.textContent = score;
  totalQuestionsElement.textContent = currentQuestions.length;

  resultContainer.style.display = "block";
  updateQuestionWidget(true);
}

// Hàm trộn mảng
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function textToSpeech(text, language = "en-US") {
  if (!text) {
    console.error("Không có văn bản để đọc.");
    showToast("Không có văn bản để đọc!", "error"); // Hiển thị thông báo nếu cần
    return;
  }

  const speech = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();

  // Sử dụng giọng nói mặc định phù hợp với ngôn ngữ (nếu có)
  const defaultVoice = voices.find((voice) => voice.lang.startsWith(language));
  if (defaultVoice) {
    speech.voice = defaultVoice;
  } else {
    console.warn(`Không tìm thấy giọng nói mặc định cho ngôn ngữ: ${language}`);
  }

  speech.lang = language; // Đặt ngôn ngữ cho văn bản
  speechSynthesis.speak(speech);
}

// Nút phát văn bản
playAudio?.addEventListener("click", () => {
  const text = question?.textContent?.trim(); // Loại bỏ khoảng trắng thừa
  textToSpeech(text, lang);
});

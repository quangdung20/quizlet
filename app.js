// Danh sách câu hỏi
const questions = [
  {
    type: "multiple-choice",
    question: "What is the capital of France?",
    correctAnswer: "Paris",
    options: ["Paris", "London", "Berlin", "Rome"],
  },
  {
    type: "fill-in-the-blank",
    question: "The largest planet in the Solar System is _______.",
    correctAnswer: "Jupiter",
  },
  {
    type: "multiple-choice",
    question: "What is the capital of Japan?",
    correctAnswer: "Tokyo",
    options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
  },
];

// Biến theo dõi trạng thái
let currentQuestionIndex = 0;

// Tham chiếu DOM
const quizContainer = document.getElementById("quiz-container");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

// Hiển thị câu hỏi
function renderQuestion() {
  const question = questions[currentQuestionIndex];
  quizContainer.innerHTML = "";

  // Tiêu đề câu hỏi
  const questionTitle = document.createElement("h4");
  questionTitle.textContent = question.question;
  quizContainer.appendChild(questionTitle);

  // Hiển thị nội dung dựa trên loại câu hỏi
  if (question.type === "multiple-choice") {
    question.options.forEach((option) => {
      const button = document.createElement("button");
      button.textContent = option;
      button.className = "btn btn-outline-primary d-block w-100 my-2";
      button.onclick = () => checkAnswer(option);
      quizContainer.appendChild(button);
    });
  } else if (question.type === "fill-in-the-blank") {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control my-3";
    input.placeholder = "Enter your answer";
    input.id = "user-answer";

    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.className = "btn btn-success";
    submitBtn.onclick = () => {
      const userAnswer = input.value.trim();
      checkAnswer(userAnswer);
    };

    quizContainer.appendChild(input);
    quizContainer.appendChild(submitBtn);
  }
}

// Kiểm tra câu trả lời
function checkAnswer(userAnswer) {
  const question = questions[currentQuestionIndex];
  if (userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
    alert("Correct!");
  } else {
    alert(`Incorrect! The correct answer is ${question.correctAnswer}.`);
  }
}

// Chuyển câu hỏi tiếp theo
nextBtn.onclick = () => {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
    prevBtn.disabled = false;
    if (currentQuestionIndex === questions.length - 1) {
      nextBtn.disabled = true;
    }
  }
};

// Quay lại câu hỏi trước
prevBtn.onclick = () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
    nextBtn.disabled = false;
    if (currentQuestionIndex === 0) {
      prevBtn.disabled = true;
    }
  }
};

// Khởi động câu hỏi đầu tiên
renderQuestion();

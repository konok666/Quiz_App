let questionsList = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 10;

// ---------- ROLE + DIFFICULTY PROTECTION ----------
(function checkAccess() {
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const difficulty = localStorage.getItem("quizDifficulty");

  if (role !== "user" || !user) {
    window.location.href = "login.html";
    return;
  }

  if (!difficulty) {
    alert("Please select a difficulty first!");
    window.location.href = "user-dashboard.html";
  }
})();

// ---------- ELEMENTS ----------
const questionSerialEl = document.getElementById("questionSerial");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const feedbackEl = document.getElementById("feedback");
const timerEl = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const scoreEl = document.getElementById("score");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const backBtn = document.getElementById("backBtn");

// ---------- BACK TO DASHBOARD ----------
if (backBtn) {
  backBtn.addEventListener("click", () => {
    localStorage.removeItem("quizDifficulty");
    window.location.href = "user-dashboard.html";
  });
}

// ---------- INIT QUIZ ----------
function initQuiz() {
  const difficulty = localStorage.getItem("quizDifficulty");
  const allQuestions = getQuestions();

  questionsList = allQuestions.filter(q => q.difficulty === difficulty);

  if (questionsList.length === 0) {
    alert(`No ${difficulty} questions available.`);
    window.location.href = "user-dashboard.html";
    return;
  }

  questionsList.sort(() => Math.random() - 0.5); // Shuffle
  questionsList = questionsList.slice(0, 10); // Limit to 10 questions

  currentQuestionIndex = 0;
  score = 0;
  scoreEl.innerText = `Score: ${score}`;

  loadQuestion();
}

// ---------- LOAD QUESTION ----------
function loadQuestion() {
  clearInterval(timer);
  feedbackEl.innerText = "";
  answersEl.innerHTML = "";

  const q = questionsList[currentQuestionIndex];
  questionSerialEl.innerText = `${currentQuestionIndex + 1}.`;
  questionEl.innerText = q.question;

  progressText.innerText =
    `Question ${currentQuestionIndex + 1} of ${questionsList.length}`;
  progressBar.style.width =
    `${((currentQuestionIndex + 1) / questionsList.length) * 100}%`;

  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.innerText = option;
    btn.onclick = () => checkAnswer(index);
    answersEl.appendChild(btn);
  });

  startTimer(q.difficulty);

  // Update Next/Submit button text
  if (currentQuestionIndex === questionsList.length - 1) {
    nextBtn.innerText = "Submit Quiz";
  } else {
    nextBtn.innerText = "Next";
    nextBtn.disabled = true; // Wait for answer
  }
}

// ---------- TIMER ----------
function startTimer(level) {
  timeLeft = level === "easy" ? 15 : level === "medium" ? 10 : 7;
  let count = timeLeft;
  timerEl.innerText = `⏱ ${count}s`;

  timer = setInterval(() => {
    count--;
    timerEl.innerText = `⏱ ${count}s`;
    if (count <= 0) {
      clearInterval(timer);
      feedbackEl.innerText = "⏰ Time's up!";
      disableButtons();
      nextBtn.disabled = false;
    }
  }, 1000);
}

// ---------- CHECK ANSWER ----------
function checkAnswer(selectedIndex) {
  clearInterval(timer);
  const q = questionsList[currentQuestionIndex];
  const buttons = document.querySelectorAll(".answers button");

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add("correct");
    if (i === selectedIndex && selectedIndex !== q.answer)
      btn.classList.add("wrong");
  });

  if (selectedIndex === q.answer) score++;
  scoreEl.innerText = `Score: ${score}`;
  nextBtn.disabled = false; // Enable next button
}

// ---------- DISABLE OPTIONS ----------
function disableButtons() {
  document.querySelectorAll(".answers button")
    .forEach(btn => btn.disabled = true);
}

// ---------- NEXT / SUBMIT ----------
nextBtn.addEventListener("click", () => {
  if (currentQuestionIndex === questionsList.length - 1) {
    showResult();
  } else {
    currentQuestionIndex++;
    loadQuestion();
  }
});

// ---------- SHOW RESULT ----------
function showResult() {
  questionEl.innerText = "🎉 Quiz Completed!";
  answersEl.innerHTML = "";
  feedbackEl.innerHTML = `Final Score: ${score}/${questionsList.length}`;

  nextBtn.style.display = "none";
  submitBtn.style.display = "none";

  const restartBtn = document.createElement("button");
  restartBtn.innerText = "Restart Quiz";
  restartBtn.style.marginTop = "20px";
  restartBtn.onclick = () => {
    currentQuestionIndex = 0;
    score = 0;
    scoreEl.innerText = `Score: ${score}`;
    nextBtn.style.display = "inline-block";
    loadQuestion();
    restartBtn.remove();
  };
  document.querySelector(".quiz-footer").appendChild(restartBtn);
}

// ---------- START QUIZ ----------
window.onload = initQuiz;

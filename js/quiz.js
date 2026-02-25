/* ================= QUIZ LOGIC ================= */

let questionsList = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 10;

/* ================= WARNING SYSTEM ================= */

let tabSwitchCount = Number(sessionStorage.getItem("tabSwitchCount")) || 0;
let refreshCount = Number(sessionStorage.getItem("refreshCount")) || 0;
const maxWarnings = 3;
let quizSubmitted = false;

/* ================= ACCESS PROTECTION ================= */
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
    window.location.href = "user.html";
  }
})();

/* ================= ELEMENTS ================= */
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

/* ================= BACK BUTTON ================= */
backBtn.addEventListener("click", () => {
  if (confirm("Quit quiz? Progress will be lost.")) {
    sessionStorage.clear();
    localStorage.removeItem("quizDifficulty");
    window.location.href = "user.html";
  }
});

/* ================= TAB SWITCH WARNING ================= */
document.addEventListener("visibilitychange", () => {
  if (document.hidden && !quizSubmitted) {
    tabSwitchCount++;
    sessionStorage.setItem("tabSwitchCount", tabSwitchCount);

    if (tabSwitchCount <= maxWarnings) {
      alert(`⚠ Warning!\nTab switch ${tabSwitchCount}/${maxWarnings}`);
    } else {
      quizSubmitted = true;
      alert("⚠ Too many tab switches! Quiz submitted.");
      showResult();
    }
  }
});

/* ================= REFRESH WARNING ================= */
window.addEventListener("load", () => {
  const navEntries = performance.getEntriesByType("navigation");

  if (navEntries.length > 0 && navEntries[0].type === "reload") {
    if (!quizSubmitted) {
      refreshCount++;
      sessionStorage.setItem("refreshCount", refreshCount);

      if (refreshCount <= maxWarnings) {
        alert(`⚠ Warning!\nPage refresh ${refreshCount}/${maxWarnings}`);
      } else {
        quizSubmitted = true;
        alert("⚠ Too many refresh attempts! Quiz submitted.");
        showResult();
      }
    }
  }
});

/* ================= INIT QUIZ ================= */
function initQuiz() {
  const difficulty = localStorage.getItem("quizDifficulty");
  const allQuestions = getQuestions();

  questionsList = allQuestions.filter(q => q.difficulty === difficulty);

  if (!questionsList.length) {
    alert(`No ${difficulty} questions available.`);
    window.location.href = "user.html";
    return;
  }

  questionsList.sort(() => Math.random() - 0.5);
  questionsList = questionsList.slice(0, 10);

  currentQuestionIndex = 0;
  score = 0;
  scoreEl.innerText = `Score: ${score}`;

  submitBtn.style.display = "none";
  nextBtn.style.display = "inline-block";

  loadQuestion();
}

/* ================= LOAD QUESTION ================= */
function loadQuestion() {
  clearInterval(timer);

  feedbackEl.innerText = "";
  answersEl.innerHTML = "";
  nextBtn.disabled = true;
  submitBtn.disabled = true;

  const q = questionsList[currentQuestionIndex];

  questionSerialEl.innerText = `${currentQuestionIndex + 1}.`;
  questionEl.innerText = q.question;

  progressText.innerText =
    `Question ${currentQuestionIndex + 1} of ${questionsList.length}`;

  progressBar.style.width =
    `${((currentQuestionIndex + 1) / questionsList.length) * 100}%`;

  const optionLabels = ["A", "B", "C", "D"];
  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.innerHTML = `<span class="opt-label">${optionLabels[index]}</span>${option}`;
    btn.onclick = () => checkAnswer(index);
    answersEl.appendChild(btn);
  });

  startTimer(q.difficulty);

  if (currentQuestionIndex === questionsList.length - 1) {
    nextBtn.style.display = "none";
    submitBtn.style.display = "inline-block";
  } else {
    nextBtn.style.display = "inline-block";
    submitBtn.style.display = "none";
  }
}

/* ================= TIMER ================= */
function startTimer(level) {
  timeLeft = level === "easy" ? 15 : level === "medium" ? 10 : 7;
  timerEl.innerText = `⏱ ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerEl.innerText = `⏱ ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      feedbackEl.innerText = "⏰ Time's up!";
      disableButtons();
      nextBtn.disabled = false;
      submitBtn.disabled = false;
    }
  }, 1000);
}

/* ================= CHECK ANSWER ================= */
function checkAnswer(selectedIndex) {
  clearInterval(timer);

  const q = questionsList[currentQuestionIndex];
  const buttons = document.querySelectorAll("#answers button");

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add("correct");
    if (i === selectedIndex && i !== q.answer) btn.classList.add("wrong");
  });

  if (selectedIndex === q.answer) score++;

  scoreEl.innerText = `Score: ${score}`;

  nextBtn.disabled = false;
  submitBtn.disabled = false;
}

/* ================= DISABLE OPTIONS ================= */
function disableButtons() {
  document.querySelectorAll("#answers button").forEach(btn => btn.disabled = true);
}

/* ================= NEXT ================= */
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  loadQuestion();
});

/* ================= SUBMIT ================= */
submitBtn.addEventListener("click", () => {
  showResult();
});

/* ================= RESULT ================= */
function showResult() {
  clearInterval(timer);

  quizSubmitted = true;
  sessionStorage.clear();

  questionSerialEl.style.display = "none";
  timerEl.style.display = "none";

  questionEl.innerText = "🎉 Quiz Completed!";
  answersEl.innerHTML = "";

  feedbackEl.innerHTML = `<strong>Final Score:</strong> ${score}/${questionsList.length}`;

  nextBtn.style.display = "none";
  submitBtn.style.display = "none";

  let restartBtn = document.getElementById("restartBtn");
  if (!restartBtn) {
    restartBtn = document.createElement("button");
    restartBtn.id = "restartBtn";
    restartBtn.innerText = "Restart Quiz";
    restartBtn.onclick = restartQuiz;
    document.querySelector(".quiz-footer").appendChild(restartBtn);
  } else {
    restartBtn.style.display = "inline-block";
  }

  saveQuizHistory();
}

/* ================= RESTART ================= */
function restartQuiz() {
  clearInterval(timer);
  sessionStorage.clear();

  currentQuestionIndex = 0;
  score = 0;

  questionSerialEl.style.display = "inline";
  timerEl.style.display = "inline";

  initQuiz();
}

/* ================= SAVE HISTORY ================= */
function saveQuizHistory() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  const difficulty = localStorage.getItem("quizDifficulty");
  const historyKey = `quizHistory_${user.email}`;

  const history = JSON.parse(localStorage.getItem(historyKey)) || [];

  history.push({
    difficulty: difficulty,
    score: `${score}/${questionsList.length}`,
    datetime: new Date().toISOString()
  });

  localStorage.setItem(historyKey, JSON.stringify(history));
  localStorage.removeItem("quizDifficulty");
}

/* ================= START ================= */
window.onload = initQuiz;
let filteredQuestions = [];
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 10;

const difficultyBox = document.getElementById("difficulty-box");
const quizBox = document.getElementById("quiz-box");

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const timerEl = document.getElementById("timer");

function startQuiz(level) {
  difficultyBox.style.display = "none";
  quizBox.style.display = "block";

  filteredQuestions = questions.filter(q => q.difficulty === level);
  filteredQuestions.sort(() => Math.random() - 0.5);

  timeLeft = level === "easy" ? 15 : level === "medium" ? 10 : 7;

  currentQuestion = 0;
  score = 0;
  scoreEl.textContent = "Score: 0";

  loadQuestion();
}

function loadQuestion() {
  clearInterval(timer);
  timerEl.textContent = `⏱ ${timeLeft}s`;
  feedbackEl.textContent = "";
  answersEl.innerHTML = "";

  const q = filteredQuestions[currentQuestion];
  questionEl.textContent = q.question;

  progressText.textContent = `Question ${currentQuestion + 1} of ${filteredQuestions.length}`;
  progressBar.style.width = `${((currentQuestion + 1) / filteredQuestions.length) * 100}%`;

  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.onclick = () => checkAnswer(index);
    answersEl.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  let count = timeLeft;
  timer = setInterval(() => {
    count--;
    timerEl.textContent = `⏱ ${count}s`;
    if (count === 0) {
      clearInterval(timer);
      feedbackEl.textContent = "⏰ Time Up!";
      disableButtons();
    }
  }, 1000);
}

function checkAnswer(selected) {
  clearInterval(timer);
  const correct = filteredQuestions[currentQuestion].answer;

  document.querySelectorAll(".answers button").forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct) btn.classList.add("correct");
    if (i === selected && selected !== correct) btn.classList.add("wrong");
  });

  if (selected === correct) score++;
  scoreEl.textContent = `Score: ${score}`;
}

function disableButtons() {
  document.querySelectorAll(".answers button").forEach(btn => btn.disabled = true);
}

nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < filteredQuestions.length) {
    loadQuestion();
  } else {
    showResult();
  }
};

function showResult() {
  questionEl.textContent = "🎉 Quiz Completed!";
  answersEl.innerHTML = "";

  const highScore = localStorage.getItem("highScore") || 0;
  if (score > highScore) localStorage.setItem("highScore", score);

  feedbackEl.innerHTML = `
    Final Score: ${score}/${filteredQuestions.length}<br>
    🏆 High Score: ${localStorage.getItem("highScore")}
  `;

  nextBtn.style.display = "none";
  restartBtn.style.display = "block";
}

restartBtn.onclick = () => location.reload();

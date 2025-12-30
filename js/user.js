/* ==============================
   USER DASHBOARD LOGIC
================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ================= AUTH ================= */
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (role !== "user" || !user) {
    window.location.href = "login.html";
    return;
  }

  /* ================= PROFILE ================= */
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const userNameTop = document.getElementById("userName");

  if (profileName) profileName.innerText = user.name;
  if (profileEmail) profileEmail.innerText = user.email;
  if (userNameTop) userNameTop.innerText = user.name;

  /* ================= SIDEBAR SECTION SWITCH ================= */
  window.showSection = function (id, el) {
    document.querySelectorAll(".section").forEach(s =>
      s.classList.add("hidden")
    );

    document.getElementById(id).classList.remove("hidden");

    document.querySelectorAll(".menu li").forEach(li =>
      li.classList.remove("active")
    );

    if (el) el.classList.add("active");

    localStorage.setItem("userCurrentSection", id);
  };

  // Restore last opened section
  const savedSection = localStorage.getItem("userCurrentSection") || "quiz";
  const activeMenu = document.querySelector(`.menu li[data-page="${savedSection}"]`);
  showSection(savedSection, activeMenu);

  /* ================= LOGOUT ================= */
  window.logout = function () {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("role");
    window.location.href = "login.html";
  };

  /* ================= QUIZ SETTINGS ================= */
  let selectedDifficulty = "easy";

  const settings = {
    easy:   { time: 15 },
    medium: { time: 10 },
    hard:   { time: 7 }
  };

  function getQuestionCount(level) {
    const questions = JSON.parse(localStorage.getItem("questions")) || [];
    return questions.filter(q => q.difficulty === level).length;
  }

  /* ================= MODAL ================= */
  window.openModal = function (level) {
    selectedDifficulty = level;

    document.getElementById("modalDifficulty").innerText =
      level.charAt(0).toUpperCase() + level.slice(1);

    document.getElementById("modalQuestions").innerText =
      getQuestionCount(level);

    document.getElementById("modalTime").innerText =
      settings[level].time + " sec per quiz";

    const scores = JSON.parse(localStorage.getItem("lastScores")) || {};
    document.getElementById("modalLastScore").innerText =
      scores[level] || 0;

    document.getElementById("quizModal").classList.remove("hidden");
  };

  window.closeModal = function () {
    document.getElementById("quizModal").classList.add("hidden");
  };

  window.startQuiz = function () {
    localStorage.setItem("quizDifficulty", selectedDifficulty);
    localStorage.setItem("quizTime", settings[selectedDifficulty].time);
    window.location.href = "quiz.html";
  };

  /* ================= HISTORY ================= */
  function loadHistory() {
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    const list = document.getElementById("historyList");

    if (!list) return;

    list.innerHTML = "";

    if (history.length === 0) {
      list.innerHTML = "<li>No quiz attempts yet</li>";
      return;
    }

    history
      .slice()
      .reverse()
      .forEach(h => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${h.difficulty.toUpperCase()}</strong>
          <span>Score: ${h.score}</span>
          <small>${h.date}</small>
        `;
        list.appendChild(li);
      });
  }

  loadHistory();

});

/* ================= USER DASHBOARD LOGIC ================= */
document.addEventListener("DOMContentLoaded", () => {

  /* ========= AUTH ========= */
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (role !== "user" || !user) {
    window.location.href = "login.html";
    return;
  }

  /* ========= PROFILE ========= */
  document.getElementById("profileName").textContent = user.name;       // Welcome message
  document.getElementById("profileNameCard").textContent = user.name;   // Inside card
  document.getElementById("profileEmail").textContent = user.email;

  /* ========= SIDEBAR NAVIGATION ========= */
  const menuItems = document.querySelectorAll(".menu li[data-section]");
  const sections = document.querySelectorAll(".section");
  const sidebar = document.querySelector(".sidebar");

  function activateSection(id) {
    menuItems.forEach(i => i.classList.toggle("active", i.dataset.section === id));
    sections.forEach(s => s.classList.toggle("hidden", s.id !== id));
    localStorage.setItem("activeSection", id);
  }

  // Restore last section or show profile on first login
  const lastSection = localStorage.getItem("activeSection");
  activateSection(lastSection || "profile");

  menuItems.forEach(i =>
    i.addEventListener("click", () => {
      activateSection(i.dataset.section);
      sidebar.classList.remove("show");
    })
  );

  /* ========= LOGOUT ========= */
  document.querySelector(".menu .danger").onclick = () => {
    localStorage.clear();
    window.location.href = "login.html";
  };

  /* ========= MOBILE SIDEBAR TOGGLE ========= */
  document.getElementById("menuToggle").onclick = () => {
    sidebar.classList.toggle("show");
  };

  /* ========= QUIZ SETTINGS ========= */
  let selectedDifficulty = "easy";
  const settings = { easy: { time: 15 }, medium: { time: 10 }, hard: { time: 7 } };

  window.openModal = (level) => {
    selectedDifficulty = level;
    document.getElementById("modalDifficulty").textContent = level.charAt(0).toUpperCase() + level.slice(1);

    const questions = JSON.parse(localStorage.getItem("questions")) || [];
    const count = questions.filter(q => q.difficulty === level).length;
    document.getElementById("modalQuestions").textContent = count;

    document.getElementById("modalTime").textContent = settings[level].time + " sec";
    const lastScores = JSON.parse(localStorage.getItem("lastScores")) || {};
    document.getElementById("modalLastScore").textContent = lastScores[level] || 0;

    document.getElementById("quizModal").classList.remove("hidden");
  };

  window.closeModal = () => document.getElementById("quizModal").classList.add("hidden");

  window.startQuiz = () => {
    localStorage.setItem("quizDifficulty", selectedDifficulty);
    localStorage.setItem("quizTime", settings[selectedDifficulty].time);
    window.location.href = "quiz.html";
  };

  /* ========= HISTORY LOGIC ========= */
  let lastDeleted = null;

  function loadHistory() {
    const body = document.getElementById("historyTableBody");
    body.innerHTML = "";
    let history = JSON.parse(localStorage.getItem("quizHistory")) || [];

    // Apply filters
    const diffFilter = document.getElementById("difficultyFilter").value;
    const dateFilter = document.getElementById("dateFilter").value;

    if (diffFilter !== "all") history = history.filter(h => h.difficulty === diffFilter);
    if (dateFilter) history = history.filter(h => h.datetime?.slice(0, 10) === dateFilter);

    if (!history.length) {
      body.innerHTML = `<tr><td colspan="5" class="empty">No quiz attempts found</td></tr>`;
      return;
    }

    history.forEach((h, index) => {
      let dateStr = "-", timeStr = "-";
      if (h.datetime) {
        const dt = new Date(h.datetime);
        if (!isNaN(dt)) {
          dateStr = dt.toLocaleDateString();
          timeStr = dt.toLocaleTimeString();
        }
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="diff ${h.difficulty}">${h.difficulty}</td>
        <td>${h.score}</td>
        <td>${dateStr}</td>
        <td>${timeStr}</td>
        <td><button class="delete-btn" data-index="${index}">Delete</button></td>
      `;
      body.appendChild(row);
    });

    // Add delete button listeners
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteHistoryItem(parseInt(btn.dataset.index)));
    });
  }

  function deleteHistoryItem(index) {
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    lastDeleted = history.splice(index, 1)[0];
    localStorage.setItem("quizHistory", JSON.stringify(history));
    document.getElementById("undoBtn").disabled = false;
    loadHistory();
    loadStats();
  }

  document.getElementById("undoBtn").onclick = () => {
    if (lastDeleted) {
      const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
      history.unshift(lastDeleted);
      localStorage.setItem("quizHistory", JSON.stringify(history));
      lastDeleted = null;
      document.getElementById("undoBtn").disabled = true;
      loadHistory();
      loadStats();
    }
  };

  /* ========= FILTERS ========= */
  document.getElementById("difficultyFilter").addEventListener("change", loadHistory);
  document.getElementById("dateFilter").addEventListener("change", loadHistory);

  /* ========= USER STATS ========= */
  function loadStats() {
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    const levels = ["easy", "medium", "hard"];

    levels.forEach(l => {
      const data = history.filter(h => h.difficulty === l);
      const total = data.reduce((s, h) => s + h.score, 0);
      document.getElementById(`${l}Attempts`).textContent = data.length;
      document.getElementById(`${l}Best`).textContent = data.length ? Math.max(...data.map(h => h.score)) : 0;
      document.getElementById(`${l}Avg`).textContent = data.length ? (total / data.length).toFixed(2) : 0;
    });
  }

  /* ========= INIT ========= */
  loadHistory();
  loadStats();
});

/* ================= GLOBAL SAVE QUIZ RESULT ================= */
function saveQuizResult(difficulty, score) {
  const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
  const now = new Date();

  history.unshift({
    difficulty,
    score,
    datetime: now.toISOString()  // store full ISO datetime
  });

  localStorage.setItem("quizHistory", JSON.stringify(history));
}

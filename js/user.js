/* ================= AUTO MIGRATE OLD HISTORY ================= */
(function migrateHistory() {
  let history = JSON.parse(localStorage.getItem("quizHistory")) || [];
  let changed = false;

  history = history.map(h => {
    if (!h.datetime && h.date && h.time) {
      const combined = new Date(`${h.date} ${h.time}`);
      if (!isNaN(combined)) {
        h.datetime = combined.toISOString();
        delete h.date;
        delete h.time;
        changed = true;
      }
    }
    return h;
  });

  if (changed) {
    localStorage.setItem("quizHistory", JSON.stringify(history));
  }
})();

/* ================= USER DASHBOARD ================= */
document.addEventListener("DOMContentLoaded", () => {

  /* ========= AUTH ========= */
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (role !== "user" || !user) {
    window.location.href = "login.html";
    return;
  }

  /* ========= ELEMENTS ========= */
  const profileName = document.getElementById("profileName");
  const profileNameCard = document.getElementById("profileNameCard");
  const profileEmail = document.getElementById("profileEmail");

  const sidebar = document.querySelector(".sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const menuItems = document.querySelectorAll(".menu li[data-section]");
  const sections = document.querySelectorAll(".section");

  const quizModal = document.getElementById("quizModal");
  const modalContent = quizModal.querySelector(".modal-content");
  const modalDifficulty = document.getElementById("modalDifficulty");
  const modalQuestions = document.getElementById("modalQuestions");
  const modalTime = document.getElementById("modalTime");
  const modalLastScore = document.getElementById("modalLastScore");

  const historyTableBody = document.getElementById("historyTableBody");
  const difficultyFilter = document.getElementById("difficultyFilter");
  const dateFilterInput = document.getElementById("dateFilter");
  const undoBtn = document.getElementById("undoBtn");

  /* ========= PROFILE ========= */
  profileName.textContent = user.name;
  profileNameCard.textContent = user.name;
  profileEmail.textContent = user.email;

  /* ========= SIDEBAR ========= */
  function openSidebar() {
    sidebar.classList.add("open");
    document.body.classList.add("sidebar-open");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    document.body.classList.remove("sidebar-open");
  }

  menuToggle.addEventListener("click", e => {
    e.stopPropagation();
    openSidebar();
  });

  document.addEventListener("click", e => {
    if (document.body.classList.contains("sidebar-open") &&
        !sidebar.contains(e.target) &&
        !menuToggle.contains(e.target)) {
      closeSidebar();
    }
  });

  function activateSection(id) {
    menuItems.forEach(item => item.classList.toggle("active", item.dataset.section === id));
    sections.forEach(section => section.classList.toggle("hidden", section.id !== id));
    localStorage.setItem("activeSection", id);
  }

  activateSection(localStorage.getItem("activeSection") || "profile");

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      activateSection(item.dataset.section);
      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  document.querySelector(".menu .danger").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  /* ========= QUIZ MODAL ========= */
  let selectedDifficulty = "easy";
  const settings = { easy: {time:15}, medium:{time:10}, hard:{time:7} };

  window.openModal = (level) => {
    selectedDifficulty = level;
    modalDifficulty.textContent = level.charAt(0).toUpperCase() + level.slice(1);

    const questions = JSON.parse(localStorage.getItem("questions")) || [];
    modalQuestions.textContent = questions.filter(q => q.difficulty === level).length;

    modalTime.textContent = settings[level].time + " sec";

    const lastScores = JSON.parse(localStorage.getItem("lastScores")) || {};
    modalLastScore.textContent = lastScores[level] || 0;

    quizModal.classList.remove("hidden");
  };

  window.closeModal = () => {
    quizModal.classList.add("hidden");
  };

  modalContent.addEventListener("click", e => e.stopPropagation());

  // quizModal.addEventListener("click", () => {
  //   closeModal();
  // });

  window.startQuiz = () => {
    localStorage.setItem("quizDifficulty", selectedDifficulty);
    localStorage.setItem("quizTime", settings[selectedDifficulty].time);
    window.location.href = "quiz.html";
  };

  /* ========= HISTORY ========= */
  let lastDeleted = null;

  function loadHistory() {
    historyTableBody.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("quizHistory")) || [];

    if (difficultyFilter.value !== "all") history = history.filter(h => h.difficulty === difficultyFilter.value);
    if (dateFilterInput.value) history = history.filter(h => h.datetime && h.datetime.slice(0,10) === dateFilterInput.value);

    if (!history.length) {
      historyTableBody.innerHTML = `<tr><td colspan="5" class="empty">No quiz attempts found</td></tr>`;
      return;
    }

    history.forEach((h, i) => {
      let dateText = "-";
      let timeText = "-";

      if (h.datetime) {
        const dt = new Date(h.datetime);
        dateText = dt.toLocaleDateString();
        timeText = dt.toLocaleTimeString();
      } else if (h.date && h.time) {
        dateText = h.date;
        timeText = h.time;
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="diff ${h.difficulty}">${h.difficulty}</td>
        <td>${h.score}</td>
        <td>${dateText}</td>
        <td>${timeText}</td>
        <td><button class="delete-btn" data-index="${i}">Delete</button></td>
      `;
      historyTableBody.appendChild(row);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = () => deleteHistoryItem(+btn.dataset.index);
    });
  }

  function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    lastDeleted = history.splice(index, 1)[0];
    localStorage.setItem("quizHistory", JSON.stringify(history));
    undoBtn.disabled = false;
    loadHistory();
    loadStats();
  }

  undoBtn.onclick = () => {
    if (!lastDeleted) return;
    let history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.unshift(lastDeleted);
    localStorage.setItem("quizHistory", JSON.stringify(history));
    lastDeleted = null;
    undoBtn.disabled = true;
    loadHistory();
    loadStats();
  };

  difficultyFilter.onchange = loadHistory;
  dateFilterInput.onchange = loadHistory;

  /* ========= STATS ========= */
  function loadStats() {
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];

    ["easy", "medium", "hard"].forEach(level => {
      const data = history.filter(h => h.difficulty === level);

      // normalize scores → always numbers
      const scores = data.map(h => {
        if (typeof h.score === "number") return h.score;
        if (typeof h.score === "string" && h.score.includes("/")) {
          return Number(h.score.split("/")[0]);
        }
        return 0;
      });

      const attempts = scores.length;
      const best = attempts ? Math.max(...scores) : 0;
      const avg = attempts
        ? (scores.reduce((a, b) => a + b, 0) / attempts).toFixed(2)
        : 0;

      document.getElementById(`${level}Attempts`).textContent = attempts;
      document.getElementById(`${level}Best`).textContent = best;
      document.getElementById(`${level}Avg`).textContent = avg;
    });
  }

  /* ========= INIT ========= */
  loadHistory();
  loadStats();
});

/* ================= SAVE QUIZ RESULT ================= */
function saveQuizResult(difficulty, score) {
  const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
  history.unshift({ difficulty, score, datetime: new Date().toISOString() });
  localStorage.setItem("quizHistory", JSON.stringify(history));
}

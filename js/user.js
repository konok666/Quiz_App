/* ========= AUTO MIGRATE OLD HISTORY ========= */
(function migrateHistory() {
  let history = JSON.parse(localStorage.getItem("quizHistory")) || [];
  let changed = false;

  history = history.map(h => {
    // Old format → new format
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
  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileEmail").textContent = user.email;

  /* ========= SIDEBAR NAVIGATION ========= */
  const menuItems = document.querySelectorAll(".menu li[data-section]");
  const sections = document.querySelectorAll(".section");
  const sidebar = document.querySelector(".sidebar");

  function activateSection(id) {
    menuItems.forEach(item =>
      item.classList.toggle("active", item.dataset.section === id)
    );
    sections.forEach(section =>
      section.classList.toggle("hidden", section.id !== id)
    );
    localStorage.setItem("activeSection", id);
  }

  activateSection(localStorage.getItem("activeSection") || "profile");

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      activateSection(item.dataset.section);
      sidebar.classList.remove("show");
    });
  });

  /* ========= LOGOUT (SECURE) ========= */
  document.querySelector(".menu .danger").onclick = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("role");
    localStorage.removeItem("activeSection");
    window.location.href = "login.html";
  };

  /* ========= MOBILE SIDEBAR ========= */
  document.getElementById("menuToggle").onclick = () => {
    sidebar.classList.toggle("show");
  };

  /* ========= QUIZ SETTINGS ========= */
  let selectedDifficulty = "easy";
  const settings = {
    easy: { time: 15 },
    medium: { time: 10 },
    hard: { time: 7 }
  };

  window.openModal = (level) => {
    selectedDifficulty = level;

    document.getElementById("modalDifficulty").textContent =
      level.charAt(0).toUpperCase() + level.slice(1);

    const questions = JSON.parse(localStorage.getItem("questions")) || [];
    document.getElementById("modalQuestions").textContent =
      questions.filter(q => q.difficulty === level).length;

    document.getElementById("modalTime").textContent =
      settings[level].time + " sec";

    const lastScores = JSON.parse(localStorage.getItem("lastScores")) || {};
    document.getElementById("modalLastScore").textContent =
      lastScores[level] || 0;

    document.getElementById("quizModal").classList.remove("hidden");
  };

  window.closeModal = () => {
    document.getElementById("quizModal").classList.add("hidden");
  };

  window.startQuiz = () => {
    localStorage.setItem("quizDifficulty", selectedDifficulty);
    localStorage.setItem("quizTime", settings[selectedDifficulty].time);
    window.location.href = "quiz.html";
  };

  /* ========= HISTORY ========= */
  let lastDeleted = null;

  function loadHistory() {
    const body = document.getElementById("historyTableBody");
    body.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("quizHistory")) || [];

    const diffFilter = document.getElementById("difficultyFilter").value;
    const dateFilter = document.getElementById("dateFilter").value;

    if (diffFilter !== "all") {
      history = history.filter(h => h.difficulty === diffFilter);
    }

    if (dateFilter) {
      history = history.filter(h =>
        h.datetime && h.datetime.slice(0, 10) === dateFilter
      );
    }

    if (!history.length) {
      body.innerHTML = `
        <tr>
          <td colspan="5" class="empty">No quiz attempts found</td>
        </tr>`;
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
        <td>
          <button class="delete-btn" data-index="${index}">Delete</button>
        </td>
      `;
      body.appendChild(row);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        deleteHistoryItem(parseInt(btn.dataset.index));
      });
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
    if (!lastDeleted) return;

    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.unshift(lastDeleted);
    localStorage.setItem("quizHistory", JSON.stringify(history));

    lastDeleted = null;
    document.getElementById("undoBtn").disabled = true;
    loadHistory();
    loadStats();
  };

  document.getElementById("difficultyFilter").addEventListener("change", loadHistory);
  document.getElementById("dateFilter").addEventListener("change", loadHistory);

  /* ========= STATS ========= */
  function loadStats() {
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    const levels = ["easy", "medium", "hard"];

    levels.forEach(level => {
      const data = history.filter(h => h.difficulty === level);
      const total = data.reduce((sum, h) => sum + h.score, 0);

      document.getElementById(`${level}Attempts`).textContent = data.length;
      document.getElementById(`${level}Best`).textContent =
        data.length ? Math.max(...data.map(h => h.score)) : 0;
      document.getElementById(`${level}Avg`).textContent =
        data.length ? (total / data.length).toFixed(2) : 0;
    });
  }

  /* ========= INIT ========= */
  loadHistory();
  loadStats();
});

/* ================= SAVE QUIZ RESULT ================= */
function saveQuizResult(difficulty, score) {
  const history = JSON.parse(localStorage.getItem("quizHistory")) || [];

  history.unshift({
    difficulty,
    score,
    datetime: new Date().toISOString() // ✅ always valid
  });

  localStorage.setItem("quizHistory", JSON.stringify(history));
}

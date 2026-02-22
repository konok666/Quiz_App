document.addEventListener("DOMContentLoaded", () => {

  /* ================= AUTH CHECK ================= */
  const admin = getAdmin();
  if (!admin || localStorage.getItem("role") !== "admin") {
    window.location.href = "admin-login.html";
    return;
  }

  /* ================= WELCOME TOAST ================= */
  const toast = document.getElementById("welcomeToast");
  const toastGreeting = document.getElementById("toastGreeting");

  if (toast && toastGreeting) {
    const hour = new Date().getHours();
    let greeting = "Hello";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    toastGreeting.textContent = `👋 ${greeting}, Admin`;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.classList.add("hidden"), 400);
    }, 3000);
  }

  /* ================= ELEMENTS ================= */
  const usersListEl = document.getElementById("usersList");
  const questionsListEl = document.getElementById("questionsList");
  const questionForm = document.getElementById("questionForm");

  const questionIdEl = document.getElementById("questionId");
  const questionTextEl = document.getElementById("questionText");
  const optionEls = [0,1,2,3].map(i => document.getElementById(`option${i}`));
  const correctAnswerEl = document.getElementById("correctAnswer");
  const difficultyEl = document.getElementById("difficulty");

  const adminErrorEl = document.getElementById("adminError");
  const adminSuccessEl = document.getElementById("adminSuccess");

  const logoutBtn = document.getElementById("logoutBtn");
  const clearQuestionsBtn = document.getElementById("clearQuestionsBtn");

  const searchInput = document.getElementById("searchInput");
  const difficultyFilter = document.getElementById("difficultyFilter");

  const userCountEl = document.getElementById("userCount");
  const easyCountEl = document.getElementById("easyCount");
  const mediumCountEl = document.getElementById("mediumCount");
  const hardCountEl = document.getElementById("hardCount");

  const sections = document.querySelectorAll(".section");
  const menuItems = document.querySelectorAll(".menu li[data-page]");
  const sidebar = document.querySelector(".sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const overlay = document.querySelector(".overlay");

  /* ================= SIDEBAR ================= */
  function openSidebar() {
    document.body.classList.add("sidebar-open");
  }
  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", e => {
      e.stopPropagation();
      openSidebar();
    });
  }
  if (overlay) overlay.addEventListener("click", closeSidebar);

  document.addEventListener("click", e => {
    if (
      document.body.classList.contains("sidebar-open") &&
      !sidebar.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      closeSidebar();
    }
  });

  /* ================= NAVIGATION ================= */
  function showSection(id) {
    sections.forEach(s => s.classList.toggle("hidden", s.id !== id));
    menuItems.forEach(item =>
      item.classList.toggle("active", item.dataset.page === id)
    );
    localStorage.setItem("currentSection", id);
  }

  showSection(localStorage.getItem("currentSection") || "dashboardWelcome");

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      showSection(item.dataset.page);
      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  /* ================= LOGOUT ================= */
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("role");
      localStorage.removeItem("currentSection");
      window.location.href = "admin-login.html";
    });
  }

  /* ================= USERS ================= */
  function loadUsers() {
    const users = (getUsers() || []).filter(u => u.role === "user");
    if (userCountEl) userCountEl.textContent = users.length;

    if (!usersListEl) return;

    usersListEl.innerHTML = users.length
      ? users.map(u => `
        <li class="user-card">
          <div class="user-info">
            <strong>${u.name}</strong>
            <small>${u.email}</small>
          </div>
        </li>
      `).join("")
      : `<li class="user-card empty">No users</li>`;
  }

  /* ================= QUESTIONS ================= */
  function getQuestionsWithIndex() {
    return (getQuestions() || []).map((q, i) => ({ ...q, __index: i }));
  }

  let lastDeletedQuestion = null;
  let lastDeletedIndex = null;
  let undoTimer = null;

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast show ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove("show"), 3000);
    setTimeout(() => toast.remove(), 3400);
  }

  function loadQuestions() {
    let questions = getQuestionsWithIndex();

    if (easyCountEl) easyCountEl.textContent = questions.filter(q=>q.difficulty==="easy").length;
    if (mediumCountEl) mediumCountEl.textContent = questions.filter(q=>q.difficulty==="medium").length;
    if (hardCountEl) hardCountEl.textContent = questions.filter(q=>q.difficulty==="hard").length;

    const search = searchInput?.value.toLowerCase() || "";
    const diff = difficultyFilter?.value || "";

    questions = questions.filter(q =>
      q.question.toLowerCase().includes(search) &&
      (!diff || q.difficulty === diff)
    );

    if (!questionsListEl) return;

    questionsListEl.innerHTML = questions.length
      ? questions.map((q,i)=>`
        <li class="question-card">
          <div class="question-top">
            <span>Q${i+1}</span>
            <span class="difficulty-badge ${q.difficulty}">${q.difficulty}</span>
          </div>
          <div class="question-text">${q.question}</div>
          <div class="question-options">
            ${(Array.isArray(q.options) ? q.options : [])
              .map((o,j)=>`${String.fromCharCode(65+j)}. ${o}`)
              .join(" | ")}
          </div>
          <div class="question-actions">
            <button class="btn-edit" data-index="${q.__index}">✏️ Edit</button>
            <button class="btn-delete" data-index="${q.__index}">🗑 Delete</button>
          </div>
        </li>
      `).join("")
      : "<li class='question-card empty'>No questions</li>";
  }

  if (searchInput) searchInput.addEventListener("input", loadQuestions);
  if (difficultyFilter) difficultyFilter.addEventListener("change", loadQuestions);

  if (clearQuestionsBtn) {
    clearQuestionsBtn.addEventListener("click", () => {
      const password = prompt("Enter admin password to clear all questions:");
      if (!password || password !== admin.password) {
        showToast("Wrong password", "error");
        return;
      }
      saveQuestions([]);
      loadQuestions();
      loadDashboardStats();
      showToast("All questions permanently deleted");
    });
  }

  questionsListEl?.addEventListener("click", e => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    if (e.target.classList.contains("btn-edit")) editQuestion(index);
    if (e.target.classList.contains("btn-delete")) deleteQuestion(index);
  });

  window.editQuestion = index => {
    const q = getQuestions()[index];
    questionIdEl.value = index;
    questionTextEl.value = q.question;
    optionEls.forEach((o,i)=>o.value=q.options[i]);
    correctAnswerEl.value = q.answer;
    difficultyEl.value = q.difficulty;
    showSection("addQuestion");
  };

  window.deleteQuestion = index => {
    if (!confirm("Delete this question?")) return;
    const questions = getQuestions();
    lastDeletedQuestion = questions[index];
    lastDeletedIndex = index;

    questions.splice(index,1);
    saveQuestions(questions);
    loadQuestions();
    loadDashboardStats();

    showToast("Question deleted. Undo?", "success");

    clearTimeout(undoTimer);
    undoTimer = setTimeout(() => {
      lastDeletedQuestion = null;
      lastDeletedIndex = null;
    }, 5000);
  };

  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "z" && lastDeletedQuestion) {
      const questions = getQuestions();
      questions.splice(lastDeletedIndex, 0, lastDeletedQuestion);
      saveQuestions(questions);
      loadQuestions();
      loadDashboardStats();
      showToast("Delete undone");
      lastDeletedQuestion = null;
      lastDeletedIndex = null;
    }
  });

  /* ================= ADD / EDIT ================= */
  questionForm?.addEventListener("submit", e => {
    e.preventDefault();

    const question = questionTextEl.value.trim();
    const options = optionEls.map(o=>o.value.trim());
    const answer = Number(correctAnswerEl.value);
    const difficulty = difficultyEl.value;

    if (!question || options.includes("") || isNaN(answer) || !difficulty) {
      showError("Fill all fields");
      return;
    }

    const questions = getQuestions() || [];
    const index = questionIdEl.value;

    if (index !== "") {
      questions[index] = { question, options, answer, difficulty };
      showSuccess("Question updated");
    } else {
      questions.push({ question, options, answer, difficulty });
      showSuccess("Question added");
    }

    saveQuestions(questions);
    questionForm.reset();
    questionIdEl.value = "";
    loadQuestions();
    loadDashboardStats();
    showSection("questions");
  });

  /* ================= DASHBOARD ================= */
  function loadDashboardStats() {
    const users = (getUsers() || []).filter(u=>u.role==="user");
    const questions = getQuestions() || [];

    document.getElementById("dashUsers").textContent = users.length;
    document.getElementById("dashQuestions").textContent = questions.length;
    document.getElementById("dashEasy").textContent = questions.filter(q=>q.difficulty==="easy").length;
    document.getElementById("dashMedium").textContent = questions.filter(q=>q.difficulty==="medium").length;
    document.getElementById("dashHard").textContent = questions.filter(q=>q.difficulty==="hard").length;
  }

  function showError(msg) {
    adminErrorEl.textContent = msg;
    setTimeout(()=>adminErrorEl.textContent="",3000);
  }

  function showSuccess(msg) {
    adminSuccessEl.textContent = msg;
    setTimeout(()=>adminSuccessEl.textContent="",3000);
  }

  /* ================= INIT ================= */
  loadUsers();
  loadQuestions();
  loadDashboardStats();
});

document.addEventListener("DOMContentLoaded", () => {

  /* ================= AUTH ================= */
  const admin = getAdmin();
  if (localStorage.getItem("role") !== "admin" || !admin) {
    window.location.href = "admin-login.html";
    return;
  }

  /* ================= WELCOME TOAST ================= */
  const toast = document.getElementById("welcomeToast");
  const toastGreeting = document.getElementById("toastGreeting");

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

  /* ================= ELEMENTS ================= */
  const usersListEl = document.getElementById("usersList");
  const questionsListEl = document.getElementById("questionsList");
  const questionForm = document.getElementById("questionForm");
  const questionIdEl = document.getElementById("questionId");
  const questionTextEl = document.getElementById("questionText");
  const optionEls = [
    document.getElementById("option0"),
    document.getElementById("option1"),
    document.getElementById("option2"),
    document.getElementById("option3"),
  ];
  const correctAnswerEl = document.getElementById("correctAnswer");
  const difficultyEl = document.getElementById("difficulty");
  const adminErrorEl = document.getElementById("adminError");
  const adminSuccessEl = document.getElementById("adminSuccess");
  const logoutBtn = document.getElementById("logoutBtn");
  const searchInput = document.getElementById("searchInput");
  const difficultyFilter = document.getElementById("difficultyFilter");
  const userCountEl = document.getElementById("userCount");
  const easyCountEl = document.getElementById("easyCount");
  const mediumCountEl = document.getElementById("mediumCount");
  const hardCountEl = document.getElementById("hardCount");
  const sections = document.querySelectorAll(".section");
  const menuItems = document.querySelectorAll(".menu li[data-page]");
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");

  /* ================= SIDEBAR TOGGLE ================= */
  if (menuToggle) menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

  /* ================= SECTION NAVIGATION ================= */
  function showSection(id) {
    sections.forEach(s => s.classList.add("hidden"));
    const target = document.getElementById(id);
    if (target) target.classList.remove("hidden");

    menuItems.forEach(m => m.classList.toggle("active", m.dataset.page === id));
    localStorage.setItem("currentSection", id);
  }

  const savedSection = localStorage.getItem("currentSection") || "users";
  showSection(savedSection);
  menuItems.forEach(item => item.addEventListener("click", () => showSection(item.dataset.page)));

  /* ================= LOGOUT ================= */
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("role");
    localStorage.removeItem("currentSection");
    window.location.href = "admin-login.html";
  });

  /* ================= USERS ================= */
  function loadUsers() {
    const users = (getUsers() || []).filter(u => u.role === "user");
    usersListEl.innerHTML = users.length
      ? users.map(u => `<li class="user-card"><strong>${u.name}</strong><br><small>${u.email}</small></li>`).join('')
      : "<li>No users registered</li>";
    userCountEl.textContent = users.length;
  }

  /* ================= QUESTIONS ================= */
  function loadQuestions() {
    let questions = getQuestions() || [];

    // Update difficulty stats
    easyCountEl.textContent = questions.filter(q => q.difficulty === "easy").length;
    mediumCountEl.textContent = questions.filter(q => q.difficulty === "medium").length;
    hardCountEl.textContent = questions.filter(q => q.difficulty === "hard").length;

    // Filter
    const search = searchInput.value.toLowerCase();
    const diff = difficultyFilter.value;
    questions = questions.filter(q => q.question.toLowerCase().includes(search) && (!diff || q.difficulty === diff));

    // Render
    questionsListEl.innerHTML = questions.length ? questions.map((q,i) => `
      <li class="question-card">
        <div class="question-top">
          <span>Q${i+1}</span>
          <span class="difficulty-badge ${q.difficulty}">${q.difficulty}</span>
        </div>
        <div class="question-text">${q.question}</div>
        <div class="question-options">${q.options.map((o,j)=>`${String.fromCharCode(65+j)}. ${o}`).join(" | ")}</div>
        <div class="question-actions">
          <button class="btn-edit" data-index="${i}">✏️ Edit</button>
          <button class="btn-delete" data-index="${i}">🗑 Delete</button>
        </div>
      </li>
    `).join('') : "<li>No matching questions</li>";
  }

  // ================= Event Delegation for Edit/Delete =================
  questionsListEl.addEventListener("click", (e) => {
    const target = e.target;
    const index = target.dataset.index;
    if (target.classList.contains("btn-edit")) editQuestion(index);
    if (target.classList.contains("btn-delete")) deleteQuestion(index);
  });

  /* ================= ADD / EDIT ================= */
  questionForm.addEventListener("submit", e => {
    e.preventDefault();

    const question = questionTextEl.value.trim();
    const options = optionEls.map(o => o.value.trim());
    const answer = Number(correctAnswerEl.value);
    const difficulty = difficultyEl.value;

    if (!question || options.includes("") || isNaN(answer) || !difficulty) {
      showError("Fill all fields correctly");
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
    showSection("questions");
  });

  /* ================= GLOBAL FUNCTIONS ================= */
  window.editQuestion = index => {
    const q = getQuestions()[index];
    questionIdEl.value = index;
    questionTextEl.value = q.question;
    optionEls.forEach((o,i)=>o.value = q.options[i]);
    correctAnswerEl.value = q.answer;
    difficultyEl.value = q.difficulty;
    showSection("addQuestion");
  };

  window.deleteQuestion = index => {
    if(!confirm("Delete this question?")) return;
    const questions = getQuestions();
    questions.splice(index,1);
    saveQuestions(questions);
    loadQuestions();
  };

  /* ================= DASHBOARD STATS ================= */
  function loadDashboardStats() {
    const users = (getUsers()||[]).filter(u=>u.role==="user");
    const questions = getQuestions()||[];

    document.getElementById("dashUsers").textContent = users.length;
    document.getElementById("dashQuestions").textContent = questions.length;
    document.getElementById("dashEasy").textContent = questions.filter(q=>q.difficulty==="easy").length;
    document.getElementById("dashMedium").textContent = questions.filter(q=>q.difficulty==="medium").length;
    document.getElementById("dashHard").textContent = questions.filter(q=>q.difficulty==="hard").length;
  }

  /* ================= HELPERS ================= */
  function showError(msg) {
    adminErrorEl.textContent = msg;
    setTimeout(()=>adminErrorEl.textContent="",3000);
  }
  function showSuccess(msg) {
    adminSuccessEl.textContent = msg;
    setTimeout(()=>adminSuccessEl.textContent="",3000);
  }

  searchInput.addEventListener("input", loadQuestions);
  difficultyFilter.addEventListener("change", loadQuestions);

  /* ================= INIT ================= */
  loadUsers();
  loadQuestions();
  loadDashboardStats();

});

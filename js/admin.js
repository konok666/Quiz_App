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
  const optionEls = [0,1,2,3].map(i => document.getElementById(`option${i}`));
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
  const sidebar = document.querySelector(".sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const overlay = document.querySelector(".overlay");
  const clearQuestionsBtn = document.getElementById("clearQuestionsBtn");

  /* ================= SEARCH SUGGESTIONS ================= */
  const clearBtn = document.getElementById("clearSearch");
  const suggestionsEl = document.getElementById("searchSuggestions");
  const STORAGE_KEY = "adminSearchHistory";

  function getHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }

  function saveToHistory(value) {
    let history = getHistory();
    history = history.filter(item => item !== value);
    history.unshift(value);
    history = history.slice(0, 5); // max 5
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  function renderSuggestions(filter = "") {
    const history = getHistory().filter(item =>
      item.toLowerCase().includes(filter.toLowerCase())
    );

    if (!history.length) {
      suggestionsEl.classList.add("hidden");
      return;
    }

    suggestionsEl.innerHTML = history
      .map(item => `<li>${item}</li>`)
      .join("");

    suggestionsEl.classList.remove("hidden");
  }

  searchInput.addEventListener("input", () => {
    const value = searchInput.value.trim();
    clearBtn.classList.toggle("hidden", !value);
    renderSuggestions(value);
    loadQuestions();
  });

  searchInput.addEventListener("focus", () => {
    renderSuggestions(searchInput.value);
  });

  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && searchInput.value.trim()) {
      saveToHistory(searchInput.value.trim());
      suggestionsEl.classList.add("hidden");
    }
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.add("hidden");
    suggestionsEl.classList.add("hidden");
    searchInput.focus();
    loadQuestions();
  });

  suggestionsEl.addEventListener("click", e => {
    if (e.target.tagName === "LI") {
      searchInput.value = e.target.textContent;
      clearBtn.classList.remove("hidden");
      suggestionsEl.classList.add("hidden");
      loadQuestions();
    }
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".search-box")) {
      suggestionsEl.classList.add("hidden");
    }
  });

  /* ================= SIDEBAR ================= */
  function openSidebar() {
    document.body.classList.add("sidebar-open");
  }

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
  }

  menuToggle.addEventListener("click", e => { e.stopPropagation(); openSidebar(); });

  overlay.addEventListener("click", closeSidebar);

  document.addEventListener("click", e => {
    if (document.body.classList.contains("sidebar-open") &&
        !sidebar.contains(e.target) &&
        !menuToggle.contains(e.target)) {
      closeSidebar();
    }
  });

  /* ================= SECTION NAVIGATION ================= */
  function showSection(id) {
    sections.forEach(s => s.classList.toggle("hidden", s.id !== id));
    menuItems.forEach(item => item.classList.toggle("active", item.dataset.page === id));
    localStorage.setItem("currentSection", id);
  }

  showSection(localStorage.getItem("currentSection") || "users");

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      showSection(item.dataset.page);
      if(window.innerWidth <= 768) closeSidebar();
    });
  });

  /* ================= LOGOUT ================= */
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("role");
    localStorage.removeItem("currentSection");
    window.location.href = "admin-login.html";
  });

  /* ================= USERS ================= */
  function loadUsers() {
    const users = (getUsers() || []).filter(u => u.role === "user");
    userCountEl.textContent = users.length || 0;

    usersListEl.innerHTML = users.length
      ? users.map(u => `
        <li class="user-card">
          <div class="user-info">
            <strong>${u.name}</strong>
            <small>${u.email}</small>
          </div>
        </li>
      `).join('')
      : `<li class="user-card empty">
           <div class="user-info">
             <strong>No users registered</strong>
             <small>Get started by adding new users</small>
           </div>
         </li>`;
  }

  /* ================= QUESTIONS ================= */
  function loadQuestions() {
    let questions = getQuestions() || [];

    easyCountEl.textContent = questions.filter(q => q.difficulty==="easy").length;
    mediumCountEl.textContent = questions.filter(q => q.difficulty==="medium").length;
    hardCountEl.textContent = questions.filter(q => q.difficulty==="hard").length;

    const search = searchInput.value.toLowerCase();
    const diff = difficultyFilter.value;
    questions = questions.filter(q => q.question.toLowerCase().includes(search) && (!diff || q.difficulty === diff));

    questionsListEl.innerHTML = questions.length
      ? questions.map((q,i)=>`
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
      `).join('')
      : "<li class='question-card empty'>No matching questions</li>";
  }

  clearQuestionsBtn.addEventListener("click", () => {
    if(!confirm("Are you sure?")) return;
    saveQuestions([]);
    loadQuestions();
    loadDashboardStats();
  });

  questionsListEl.addEventListener("click", e => {
    const index = e.target.dataset.index;
    if(e.target.classList.contains("btn-edit")) editQuestion(index);
    if(e.target.classList.contains("btn-delete")) deleteQuestion(index);
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
    if(!confirm("Delete this question?")) return;
    const questions = getQuestions();
    questions.splice(index,1);
    saveQuestions(questions);
    loadQuestions();
    loadDashboardStats();
  };

  /* ================= ADD / EDIT ================= */
  questionForm.addEventListener("submit", e => {
    e.preventDefault();
    const question = questionTextEl.value.trim();
    const options = optionEls.map(o=>o.value.trim());
    const answer = Number(correctAnswerEl.value);
    const difficulty = difficultyEl.value;

    if(!question || options.includes("") || isNaN(answer) || !difficulty){
      showError("Fill all fields correctly");
      return;
    }

    const questions = getQuestions() || [];
    const index = questionIdEl.value;

    if(index!=="") {
      questions[index] = {question, options, answer, difficulty};
      showSuccess("Question updated");
    } else {
      questions.push({question, options, answer, difficulty});
      showSuccess("Question added");
    }

    saveQuestions(questions);
    questionForm.reset();
    questionIdEl.value="";
    loadQuestions();
    showSection("questions");
    loadDashboardStats();
  });

  /* ================= DASHBOARD ================= */
  function loadDashboardStats() {
    const users = (getUsers() || []).filter(u => u.role==="user");
    const questions = getQuestions() || [];
    document.getElementById("dashUsers").textContent = users.length;
    document.getElementById("dashQuestions").textContent = questions.length;
    document.getElementById("dashEasy").textContent = questions.filter(q=>q.difficulty==="easy").length;
    document.getElementById("dashMedium").textContent = questions.filter(q=>q.difficulty==="medium").length;
    document.getElementById("dashHard").textContent = questions.filter(q=>q.difficulty==="hard").length;
  }

  /* ================= HELPERS ================= */
  function showError(msg){ adminErrorEl.textContent=msg; setTimeout(()=>adminErrorEl.textContent="",3000);}
  function showSuccess(msg){ adminSuccessEl.textContent=msg; setTimeout(()=>adminSuccessEl.textContent="",3000); }

  /* ================= INIT ================= */
  loadUsers();
  loadQuestions();
  loadDashboardStats();

});

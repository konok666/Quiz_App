document.addEventListener("DOMContentLoaded", () => {

  /* ================= AUTH ================= */
  if (localStorage.getItem("role") !== "admin") {
    window.location.href = "admin-login.html";
    return;
  }

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

  /* ===== COUNTERS ===== */
  const userCountEl = document.getElementById("userCount");
  const easyCountEl = document.getElementById("easyCount");
  const mediumCountEl = document.getElementById("mediumCount");
  const hardCountEl = document.getElementById("hardCount");

  /* ================= SECTION MANAGEMENT ================= */
  const sections = document.querySelectorAll(".section");
  const menuItems = document.querySelectorAll(".menu li[data-page]");

  function setActiveMenu(page) {
    menuItems.forEach(item => {
      item.classList.remove("active");
      if (item.dataset.page === page) {
        item.classList.add("active");
      }
    });
  }

  function showSection(sectionId) {
    sections.forEach(sec => sec.classList.add("hidden"));
    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.classList.remove("hidden");

    localStorage.setItem("currentSection", sectionId);
    setActiveMenu(sectionId);
  }

  // Restore section after refresh
  const savedSection = localStorage.getItem("currentSection") || "users";
  showSection(savedSection);

  // Menu click events
  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      const pageId = item.dataset.page;
      if (pageId) showSection(pageId);
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
    const users = getUsers() || [];
    usersListEl.innerHTML = "";

    if (users.length === 0) {
      usersListEl.innerHTML = "<li>No users registered</li>";
    } else {
      users.forEach(user => {
        const li = document.createElement("li");
        li.textContent = `${user.name} (${user.email})`;
        usersListEl.appendChild(li);
      });
    }

    if (userCountEl) userCountEl.textContent = users.length;
  }

  /* ================= QUESTIONS ================= */
  function loadQuestions() {
    let questions = getQuestions() || [];

    // Difficulty counters
    const easy = questions.filter(q => q.difficulty === "easy").length;
    const medium = questions.filter(q => q.difficulty === "medium").length;
    const hard = questions.filter(q => q.difficulty === "hard").length;

    if (easyCountEl) easyCountEl.textContent = easy;
    if (mediumCountEl) mediumCountEl.textContent = medium;
    if (hardCountEl) hardCountEl.textContent = hard;

    // Search + filter
    const searchText = searchInput?.value.toLowerCase() || "";
    const filterDifficulty = difficultyFilter?.value || "";

    questions = questions.filter(q => {
      const matchesText = q.question.toLowerCase().includes(searchText);
      const matchesDifficulty = filterDifficulty
        ? q.difficulty === filterDifficulty
        : true;
      return matchesText && matchesDifficulty;
    });

    questionsListEl.innerHTML = "";

    if (questions.length === 0) {
      questionsListEl.innerHTML = "<li>No matching questions</li>";
      return;
    }

    questions.forEach((q, index) => {
      const li = document.createElement("li");
      li.className = "question-card";

      const optionsText = q.options
        .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
        .join(" &nbsp; ");

      li.innerHTML = `
        <div class="question-top">
          <span class="question-number">Q${index + 1}</span>
          <span class="difficulty-badge ${q.difficulty}">${q.difficulty}</span>
        </div>

        <div class="question-text">${q.question}</div>

        <div class="question-options">${optionsText}</div>

        <div class="question-actions">
          <button class="btn-edit" onclick="editQuestion(${index})">✏️ Edit</button>
          <button class="btn-delete" onclick="deleteQuestion(${index})">🗑 Delete</button>
        </div>
      `;

      questionsListEl.appendChild(li);
    });
  }

  /* ================= ADD / EDIT ================= */
  questionForm.addEventListener("submit", e => {
    e.preventDefault();

    const questionText = questionTextEl.value.trim();
    const options = optionEls.map(opt => opt.value.trim());
    const correctAnswer = Number(correctAnswerEl.value);
    const difficulty = difficultyEl.value;

    if (
      !questionText ||
      options.some(opt => opt === "") ||
      isNaN(correctAnswer) ||
      !difficulty
    ) {
      showAdminError("Please fill all fields correctly!");
      return;
    }

    const questions = getQuestions() || [];
    const editIndex = questionIdEl.value;

    if (editIndex !== "") {
      questions[editIndex] = { question: questionText, options, answer: correctAnswer, difficulty };
      showAdminSuccess("Question updated successfully!");
    } else {
      questions.push({ question: questionText, options, answer: correctAnswer, difficulty });
      showAdminSuccess("Question added successfully!");
    }

    saveQuestions(questions);
    questionForm.reset();
    questionIdEl.value = "";
    loadQuestions();
  });

  /* ================= HELPERS ================= */
  function showAdminError(msg) {
    adminErrorEl.textContent = msg;
    setTimeout(() => (adminErrorEl.textContent = ""), 3000);
  }

  function showAdminSuccess(msg) {
    adminSuccessEl.textContent = msg;
    setTimeout(() => (adminSuccessEl.textContent = ""), 3000);
  }

  /* ================= EDIT / DELETE ================= */
  window.editQuestion = function (index) {
    const questions = getQuestions() || [];
    const q = questions[index];

    questionIdEl.value = index;
    questionTextEl.value = q.question;
    optionEls.forEach((opt, i) => (opt.value = q.options[i]));
    correctAnswerEl.value = q.answer;
    difficultyEl.value = q.difficulty;

    showSection("addQuestion");
  };

  window.deleteQuestion = function (index) {
    if (!confirm("Are you sure you want to delete this question?")) return;

    const questions = getQuestions() || [];
    questions.splice(index, 1);
    saveQuestions(questions);
    loadQuestions();
  };

  /* ================= SEARCH + FILTER ================= */
  searchInput?.addEventListener("input", loadQuestions);
  difficultyFilter?.addEventListener("change", loadQuestions);

  /* ================= INIT ================= */
  loadUsers();
  loadQuestions();
});

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    window.location.href = "admin-login.html";
    return;
  }

  const usersListEl = document.getElementById("usersList");
  const questionsListEl = document.getElementById("questionsList");
  const questionForm = document.getElementById("questionForm");
  const questionIdEl = document.getElementById("questionId");
  const questionTextEl = document.getElementById("questionText");
  const optionEls = [
    document.getElementById("option0"),
    document.getElementById("option1"),
    document.getElementById("option2"),
    document.getElementById("option3")
  ];
  const correctAnswerEl = document.getElementById("correctAnswer");
  const difficultyEl = document.getElementById("difficulty");
  const adminErrorEl = document.getElementById("adminError");
  const adminSuccessEl = document.getElementById("adminSuccess");
  const logoutBtn = document.getElementById("logoutBtn");

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("role");
      window.location.href = "admin-login.html";
    });
  }

  // Load users
  function loadUsers() {
    const users = getUsers();
    usersListEl.innerHTML = "";
    if (users.length === 0) {
      usersListEl.innerHTML = "<li>No users registered</li>";
      return;
    }
    users.forEach(user => {
      const li = document.createElement("li");
      li.innerText = `${user.name} (${user.email})`;
      usersListEl.appendChild(li);
    });
  }

  // Load questions
  function loadQuestions() {
    const questions = getQuestions();
    questionsListEl.innerHTML = "";
    if (questions.length === 0) {
      questionsListEl.innerHTML = "<li>No questions available</li>";
      return;
    }

    questions.forEach((q, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${q.question} [${q.difficulty}] 
        <button onclick="editQuestion(${index})">Edit</button>
        <button onclick="deleteQuestion(${index})" class="danger">Delete</button>
      `;
      questionsListEl.appendChild(li);
    });
  }

  // Add/Edit question
  if (questionForm) {
    questionForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const questionText = questionTextEl.value.trim();
      const options = optionEls.map(opt => opt.value.trim());
      const correctAnswer = parseInt(correctAnswerEl.value);
      const difficulty = difficultyEl.value;

      if (!questionText || options.some(opt => opt === "") || isNaN(correctAnswer) || !difficulty) {
        showAdminError("Please fill all fields correctly!");
        return;
      }

      let questions = getQuestions();
      const editIndex = questionIdEl.value;

      if (editIndex) {
        questions[editIndex] = { question: questionText, options, answer: correctAnswer, difficulty };
        showAdminSuccess("Question updated successfully!");
      } else {
        questions.push({ question: questionText, options, answer: correctAnswer, difficulty });
        showAdminSuccess("Question added successfully!");
      }

      saveQuestions(questions);
      loadQuestions();
      questionForm.reset();
      questionIdEl.value = "";
    });
  }

  // Helper messages
  function showAdminError(msg) {
    adminErrorEl.innerText = msg;
    setTimeout(() => (adminErrorEl.innerText = ""), 3000);
  }

  function showAdminSuccess(msg) {
    adminSuccessEl.innerText = msg;
    setTimeout(() => (adminSuccessEl.innerText = ""), 3000);
  }

  // ---------- EDIT / DELETE ----------
  window.editQuestion = function (index) {
    const questions = getQuestions();
    const q = questions[index];

    // Fill form
    questionIdEl.value = index;
    questionTextEl.value = q.question;
    optionEls.forEach((opt, i) => (opt.value = q.options[i]));
    correctAnswerEl.value = q.answer;
    difficultyEl.value = q.difficulty;
    // 🔥 Switch to Add/Edit section
    if (typeof showSection === "function") {
      showSection("addQuestion");
    }
  };

  window.deleteQuestion = function (index) {
    let questions = getQuestions();
    if (confirm("Are you sure you want to delete this question?")) {
      questions.splice(index, 1);
      saveQuestions(questions);
      loadQuestions();
    }
  };

  // Initialize
  loadUsers();
  loadQuestions();
});

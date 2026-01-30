/* ============= STORAGE HELPERS & DEFAULT DATA ============= */

/* ---------- DEFAULT ADMIN ---------- */
const DEFAULT_ADMIN = {
  email: "admin@quiz.com",
  password: "admin123",
  role: "admin"
};

/* ---------- INITIAL SETUP ---------- */
(function initStorage() {
  // Users (start empty)
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
  }

  // Questions (start empty – admin adds manually)
  if (!localStorage.getItem("questions")) {
    localStorage.setItem("questions", JSON.stringify([]));
  }

  // Admin
  if (!localStorage.getItem("admin")) {
    localStorage.setItem("admin", JSON.stringify(DEFAULT_ADMIN));
  }
})();

/* ============= USER FUNCTIONS ============= */
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

/* ============= QUESTION FUNCTIONS ============= */
function getQuestions() {
  return JSON.parse(localStorage.getItem("questions")) || [];
}

function saveQuestions(questions) {
  localStorage.setItem("questions", JSON.stringify(questions));
}

/* ============= ADMIN FUNCTIONS ============= */
function getAdmin() {
  return JSON.parse(localStorage.getItem("admin"));
}

function saveAdmin(admin) {
  localStorage.setItem("admin", JSON.stringify(admin));
}

/* ============= DEFAULT QUESTIONS (OPTIONAL) ============= */
/* These are NOT auto-added */

function getDefaultQuestions() {
  return [
    {
      question: "HTML stands for?",
      options: [
        "Hyper Text Markup Language",
        "High Text Machine Language",
        "Hyperlink Text Markup",
        "None"
      ],
      answer: 0,
      difficulty: "easy"
    },
    {
      question: "CSS is used for?",
      options: ["Logic", "Styling", "Database", "Networking"],
      answer: 1,
      difficulty: "easy"
    },
    {
      question: "Which keyword declares a variable?",
      options: ["int", "var", "define", "let"],
      answer: 3,
      difficulty: "medium"
    },
    {
      question: "DOM stands for?",
      options: [
        "Document Object Model",
        "Data Object Model",
        "Digital Object Method",
        "None"
      ],
      answer: 0,
      difficulty: "medium"
    },
    {
      question: "JSON converts string to object using?",
      options: [
        "JSON.parse()",
        "JSON.stringify()",
        "JSON.convert()",
        "parse.JSON()"
      ],
      answer: 0,
      difficulty: "hard"
    }
  ];
}

/* ============= OPTIONAL ADMIN TOOLS ============= */

/* Load default questions manually */
function loadDefaultQuestions() {
  saveQuestions(getDefaultQuestions());
}

/* Clear all questions */
function clearAllQuestions() {
  saveQuestions([]);
}

/* Logout helper */
function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  localStorage.removeItem("showWelcome");
  window.location.href = "login.html";
}

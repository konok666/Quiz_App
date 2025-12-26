/* ==============================
   USER DASHBOARD LOGIC
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("currentUser"));

  // Role protection
  if (role !== "user" || !user) {
    window.location.href = "login.html";
    return;
  }

  // Show username
  const nameEl = document.getElementById("userName");
  if (nameEl) nameEl.innerText = user.name;

  // Start Quiz button
  const startQuizBtn = document.getElementById("startQuizBtn");
  if (startQuizBtn) {
    startQuizBtn.addEventListener("click", () => {
      window.location.href = "quiz.html";
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("role");
      window.location.href = "login.html";
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorEl = document.getElementById("error");
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("togglePassword");

  if (!loginForm) return;

  // Password toggle
  window.togglePassword = () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      passwordInput.type = "password";
      toggleIcon.classList.replace("fa-eye-slash", "fa-eye");
    }
  };

  loginForm.addEventListener("submit", e => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    const users = getUsers() || [];
    const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

    if (!user) {
      showError("❌ Invalid email or password!");
      return;
    }

    // Save current user and role
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("role", "user");

    // Redirect to user dashboard
    window.location.href = "user.html";
  });

  function showError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      setTimeout(() => errorEl.textContent = "", 3000);
    }
  }
});

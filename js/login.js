document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorEl = document.getElementById("error");
  const passwordInput = document.getElementById("password");

  if (!loginForm) return;

  // Password toggle
  window.togglePassword = (inputId, icon) => {
    const input = document.getElementById(inputId);

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } 
    else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
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

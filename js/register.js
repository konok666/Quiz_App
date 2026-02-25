document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const errorEl = document.getElementById("error");
  const successEl = document.getElementById("success");

  if (!registerForm) return;

  // Password toggle function
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

  registerForm.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (password !== confirmPassword) {
      showError("❌ Passwords do not match");
      return;
    }

    const users = getUsers() || [];
    const userExists = users.find(u => u.email.toLowerCase() === email);

    if (userExists) {
      showError("❌ Email already registered!");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role: "user"
    };

    users.push(newUser);
    saveUsers(users);

    showSuccess("✅ Account created! Redirecting to login...");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  });

  function showError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      setTimeout(() => errorEl.textContent = "", 3000);
    }
  }

  function showSuccess(msg) {
    if (successEl) {
      successEl.textContent = msg;
      setTimeout(() => successEl.textContent = "", 3000);
    }
  }
});

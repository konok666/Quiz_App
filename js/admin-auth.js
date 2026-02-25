document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminLoginForm");
  const passwordInput = document.getElementById("adminPassword");
  const toggleIcon = document.getElementById("toggleAdminPassword");
  const errorEl = document.getElementById("error");

  if (!form) return;

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

  form.addEventListener("submit", e => {
    e.preventDefault();

    const email = document.getElementById("adminEmail").value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    const admin = getAdmin();

    if (!admin || email !== admin.email.toLowerCase() || password !== admin.password) {
      errorEl.innerText = "❌ Invalid admin credentials!";
      return;
    }

    // Save role and welcome flag
    localStorage.setItem("role", "admin");
    localStorage.setItem("showWelcome", "true");

    // Redirect to admin dashboard
    window.location.href = "admin.html";
  });
});

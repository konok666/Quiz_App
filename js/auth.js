// ---------- CREATE PERMANENT ADMIN ACCOUNT ----------
if (!localStorage.getItem("admin")) {
  saveAdmin({
    email: "admin@quiz.com",   // default admin email
    password: "admin123"       // default admin password
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // ---------- USER REGISTRATION ----------
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value.trim();

      const users = getUsers();

      const userExists = users.find(u => u.email.toLowerCase() === email);
      if (userExists) {
        showError("Email already registered!");
        return;
      }

      users.push({
        id: Date.now(),
        name,
        email,
        password,
        role: "user"
      });

      saveUsers(users);

      // Redirect to login page
      window.location.href = "login.html";
    });
  }

  // ---------- USER LOGIN ----------
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value.trim();

      const users = getUsers(); // ✅ MISSING LINE (FIX)

      const user = users.find(
        u => u.email.toLowerCase() === email && u.password === password
      );

      if (!user) {
        showError("Invalid email or password!");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("role", "user");

      // Redirect to user dashboard
      window.location.href = "user.html";
    });
  }

  // ---------- ADMIN LOGIN ----------
  const adminLoginForm = document.getElementById("adminLoginForm");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("adminEmail").value.trim();
      const password = document.getElementById("adminPassword").value.trim();

      const admin = getAdmin(); // <-- updated to use helper

      if (!admin || email !== admin.email || password !== admin.password) {
        document.getElementById("error").innerText = "Invalid admin credentials!";
        return;
      }

      localStorage.setItem("role", "admin");
      localStorage.setItem("showWelcome", "true");


      // Redirect to admin dashboard
      window.location.href = "admin.html";
    });
  }

  // ---------- HELPERS ----------
  function showError(msg) {
    const errorEl = document.getElementById("error");
    if (errorEl) errorEl.innerText = msg;
  }

  function showSuccess(msg) {
    const successEl = document.getElementById("success");
    if (successEl) successEl.innerText = msg;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const userId = document.getElementById("userId").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error");

    try {
      // Admin login (no password check for now)
      if (userId === 'admin2027') {
        window.location.href = 'admin.html';
        return;
      }

      // Student login
      const response = await fetch("http://localhost:3000/auth/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, password })
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("student_id", result.id);

        if (result.first_login) {
          window.location.href = "change-password.html";
        } else {
          window.location.href = "student.html";
        }
      } else {
        errorMsg.textContent = result.message || "Login failed";
      }
    } catch (err) {
      console.error("Fetch error:", err);
      errorMsg.textContent = "Network error. Try again.";
    }
  });
});

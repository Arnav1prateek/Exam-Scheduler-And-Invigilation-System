document.getElementById("changePasswordForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const messageElement = document.getElementById("message");

  if (newPassword !== confirmPassword) {
    messageElement.textContent = "Passwords do not match!";
    return;
  }

  try {
    const studentId = localStorage.getItem("student_id"); // ✅ Declare before use
    if (!studentId) {
      messageElement.textContent = "Unauthorized: No student ID found.";
      return;
    }

    const response = await fetch("/student/change_password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password: newPassword, id: studentId }) // ✅ studentId is now defined
    });

    const data = await response.json();

    if (response.ok) {
      alert("Password updated successfully. Please log in again.");
      localStorage.removeItem("student_id");
      window.location.href = "login.html";
    } else {
      messageElement.textContent = data.message || "Failed to update password.";
    }
  } catch (error) {
    console.error("Error:", error);
    messageElement.textContent = "An error occurred while updating the password.";
  }
});

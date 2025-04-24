document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("loginForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        const userId = document.getElementById("userId").value.trim();
        const errorMsg = document.getElementById("error");
    
        try {
            // First check for admin login
            if (userId === 'admin2027') {
                window.location.href = 'admin.html';
                return;
            }

            // Regular user login flow
            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId })
            });
    
            const result = await response.json();
            console.log("Backend response:", result);
    
            if (response.ok) {
                if (result.role === "student") {
                    window.location.href = `student.html?id=${userId}`;
                } else if (result.role === "faculty") {
                    window.location.href = `faculty.html?id=${userId}`;
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
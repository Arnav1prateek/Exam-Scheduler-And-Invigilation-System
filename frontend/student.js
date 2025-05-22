document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');
    
    try {
        // Show loading state
        document.getElementById('student-name').textContent = 'Loading...';
        document.getElementById('student-dept').textContent = 'Loading...';
        document.getElementById('student-year').textContent = 'Loading...';
        document.getElementById('student-semester').textContent = 'Loading...';
        
        // Fetch student data
        const res = await fetch(`http://localhost:3000/api/student/${studentId}`);
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('API Response:', data);
        
        // Validate response structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid server response');
        }
        
        // Check if we have either student data or exams
        if (!data.student && !data.exams) {
            throw new Error('No student or exam data received');
        }
        
        // Update profile section with fallbacks for missing data
        if (data.student) {
            document.getElementById('student-name').textContent = 
                `${data.student.first_name || 'First'} ${data.student.last_name || 'Last'}`;
            document.getElementById('student-info').textContent = 
                data.student.email || 'Email not provided';
            document.getElementById('student-dept').textContent = 
                data.student.department || 'Department not specified';
            document.getElementById('student-year').textContent = 
                data.student.academic_year ? `Year ${data.student.academic_year}` : 'Year not specified';
            document.getElementById('student-semester').textContent = 
                data.student.semester ? `Semester ${data.student.semester}` : 'Semester not specified';
        }
        
        // Set current date
        document.getElementById('current-date').textContent = 
            new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        
        // Populate timetable
        const tbody = document.getElementById('timetable-body');
        tbody.innerHTML = '';
        
        if (!data.exams || data.exams.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" style="text-align: center; padding: 2rem;">No exams scheduled</td>';
            tbody.appendChild(row);
        } else {
            data.exams.forEach(exam => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${exam.subject || 'Subject not specified'}</td>
                    <td>${exam.date ? new Date(exam.date).toLocaleDateString() : 'Date not set'}</td>
                    <td>${formatTimeRange(exam.start_time, exam.end_time)}</td>
                    <td>${exam.room_no || 'Room not assigned'}</td>
                    <td><span class="status-badge">${getExamStatus(exam.date)}</span></td>
                `;
                tbody.appendChild(row);
            });
        }

        // Add logout functionality
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('student_id');
            window.location.href = 'login.html';
        });
        
        // Initialize profile modal after all content is loaded
        setupProfileModal(data.student);
        
    } catch (err) {
        console.error('Error loading student dashboard:', err);
        
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message show';
        errorEl.innerHTML = `
            <strong>Error loading dashboard:</strong> ${err.message}<br><br>
            <small>Please try again later or contact support if the problem persists.</small>
        `;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.prepend(errorEl);
        }
        
        document.getElementById('student-name').textContent = 'Error loading data';
        document.getElementById('student-dept').textContent = 'N/A';
        document.getElementById('student-year').textContent = 'N/A';
        document.getElementById('student-semester').textContent = 'N/A';
    }
});

function getExamStatus(examDate) {
    if (!examDate) return 'Not scheduled';
    
    const today = new Date();
    const examDay = new Date(examDate);
    
    if (examDay < today) return 'Completed';
    if (examDay.toDateString() === today.toDateString()) return 'Today';
    return 'Upcoming';
}

function formatTimeRange(start, end) {
    if (!start && !end) return 'Time not set';
    if (!start) return `Ends at ${end}`;
    if (!end) return `Starts at ${start}`;
    return `${start} - ${end}`;
}

function setupProfileModal(studentData) {
    const modal = document.getElementById('profile-modal');
    const passwordModal = document.getElementById('password-modal');
    const profileBtn = document.getElementById('profile-btn');
    const closeButtons = document.querySelectorAll('.close-modal');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const passwordForm = document.getElementById('password-change-form');
    const passwordError = document.getElementById('password-error');
    const profileId = document.getElementById('profile-id');
    const profileEmail = document.getElementById('profile-email');

    // Check if required elements exist
    if (!modal || !passwordModal || !profileBtn || !changePasswordBtn || !passwordForm) {
        console.error('One or more required elements not found');
        return;
    }

    // Populate profile info if available
    if (studentData && profileId && profileEmail) {
        profileId.textContent = studentData.student_id || 'N/A';
        profileEmail.textContent = studentData.email || 'N/A';
    }

    // Open profile modal
    profileBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Open password change modal
    changePasswordBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        passwordModal.style.display = 'block';
    });

    // Close modals
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
            passwordModal.style.display = 'none';
        });
    });

    // Close when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (e.target === passwordModal) passwordModal.style.display = 'none';
    });

    // Handle password change
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (passwordError) passwordError.textContent = '';
        
        const newPassword = document.getElementById('new-password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;

        if (!newPassword || !confirmPassword) {
            if (passwordError) passwordError.textContent = 'Please fill in all fields';
            return;
        }

        if (newPassword !== confirmPassword) {
            if (passwordError) passwordError.textContent = 'New passwords do not match';
            return;
        }

        try {
            const studentId = localStorage.getItem('student_id');
            const response = await fetch('/student/change_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: studentId, password: newPassword })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Password changed successfully!');
                if (passwordModal) passwordModal.style.display = 'none';
                passwordForm.reset();
            } else {
                if (passwordError) passwordError.textContent = result.message || 'Failed to change password';
            }
        } catch (err) {
            console.error('Error changing password:', err);
            if (passwordError) passwordError.textContent = 'An error occurred. Please try again.';
        }
    });
}
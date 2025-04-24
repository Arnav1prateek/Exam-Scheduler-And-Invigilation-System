document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const facultyId = urlParams.get('id');
  
    try {
        // Fetch faculty data and exams
        const res = await fetch(`http://localhost:3000/api/faculty/${facultyId}`);
        const data = await res.json();
        
        // Update profile section
        document.getElementById('faculty-name').textContent = data.faculty.name;
        document.getElementById('faculty-department').textContent = data.faculty.department;
        
        // Set current date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', options);
        
        // Set up general availability toggle
        const toggle = document.getElementById('availability-toggle');
        toggle.checked = data.faculty.availability_status;
        updateAvailabilityText(toggle.checked);
        
        toggle.addEventListener('change', async () => {
            const isAvailable = toggle.checked;
            updateAvailabilityText(isAvailable);
            
            try {
                await fetch(`http://localhost:3000/api/faculty/${facultyId}/availability`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ availability: isAvailable })
                });
            } catch (err) {
                console.error('Error updating availability:', err);
                alert('Failed to update availability status');
                toggle.checked = !isAvailable; // Revert on error
            }
        });
        
        // Populate exams table
        const tbody = document.getElementById('invigilation-body');
        data.exams.forEach(exam => {
            const row = document.createElement('tr');
            
            // Create toggle for each exam
            const toggleId = `exam-toggle-${exam.exam_id}`;
            
            row.innerHTML = `
                <td>${exam.exam_id}</td>
                <td>${exam.subject}</td>
                <td>${new Date(exam.date).toLocaleDateString()}</td>
                <td>${exam.start_time} - ${exam.end_time}</td>
                <td>${exam.room_no || 'TBD'}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" id="${toggleId}" class="exam-toggle" 
                            ${exam.is_available ? 'checked' : ''}
                            ${exam.is_full && !exam.is_available ? 'disabled' : ''}>
                        <span class="slider round"></span>
                    </label>
                    ${exam.is_full ? '<span class="full-badge">Full</span>' : ''}
                </td>
            `;
            tbody.appendChild(row);
            
            // Set up event listener for each exam toggle
            const examToggle = document.getElementById(toggleId);
            examToggle.addEventListener('change', async () => {
                try {
                    const response = await fetch(`http://localhost:3000/api/faculty/exams/${exam.exam_id}/availability`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            facultyId: facultyId,
                            isAvailable: examToggle.checked 
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        alert(errorData.message);
                        examToggle.checked = !examToggle.checked; // Revert on error
                        return;
                    }

                    const result = await response.json();
                    if (result.is_full) {
                        // Update UI to show exam is now full
                        const badge = examToggle.parentElement.querySelector('.full-badge') || 
                                     document.createElement('span');
                        badge.className = 'full-badge';
                        badge.textContent = 'Full';
                        examToggle.parentElement.appendChild(badge);
                    }
                } catch (err) {
                    console.error('Error updating exam availability:', err);
                    alert('Failed to update exam availability');
                    examToggle.checked = !examToggle.checked; // Revert on error
                }
            });
        });

        // Add logout functionality
        document.getElementById('logout-btn').addEventListener('click', () => {
            // Clear any session data
            localStorage.removeItem('facultyToken');
            // Redirect to login page
            window.location.href = '../login.html';
        });
        
    } catch (err) {
        console.error('Error:', err);
        alert('Error loading faculty dashboard');
    }
});

function updateAvailabilityText(isAvailable) {
    const textElement = document.getElementById('availability-text');
    textElement.textContent = isAvailable ? 'Available for invigilation' : 'Not available';
    textElement.style.color = isAvailable ? '#4CAF50' : '#F44336';
}
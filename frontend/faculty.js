document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const facultyId = urlParams.get('id');
  
    try {
      const res = await fetch(`http://localhost:3000/api/faculty/${facultyId}`);
      const data = await res.json();
      
      // data.exams is the array you're looking for
      const tbody = document.getElementById('invigilation-body');
      data.exams.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.subject}</td>
          <td>${item.date}</td>
          <td>${item.start_time}</td>
          <td>${item.end_time}</td>
          <td>${item.room_no}</td>
        `;
        tbody.appendChild(row);
      });
    } catch (err) {
      alert('Error fetching invigilation schedule');
    }
  });
  
document.addEventListener('DOMContentLoaded', () => {
    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', options);
    
    // Load default table (students)
    loadTableData('students');
    
    // Set up table navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            loadTableData(btn.dataset.table);
        });
    });
    
    // Set up department filter
    document.getElementById('department-select').addEventListener('change', (e) => {
        if (e.target.value) {
            loadDepartmentExams(e.target.value);
        }
    });
    
    // Set up PDF generation
    document.getElementById('generate-pdf').addEventListener('click', generatePDF);
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', () => {
        window.location.href = 'login.html';
    });
});

async function loadTableData(tableName) {
    try {
        const tableMap = {
            'students': 'Student',
            'faculty': 'Faculty',
            'exams': 'Exam',
            'rooms': 'Room',
            'exam_faculty': 'Exam_Faculty'
        };
        
        const backendTableName = tableMap[tableName];
        if (!backendTableName) {
            throw new Error('Invalid table requested');
        }

        console.log(`Fetching data for table: ${backendTableName}`);
        
        const response = await fetch(`http://localhost:3000/api/admin/tables/${backendTableName}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server responded with status ${response.status}`);
        }

        const result = await response.json();
        console.log('API response:', result);

        const thead = document.getElementById('table-header');
        const tbody = document.getElementById('table-body');
        
        // Clear existing content
        thead.innerHTML = '';
        tbody.innerHTML = '';
        
        if (!result.data || result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">No data available</td></tr>';
            return;
        }
        
        // Create table headers
        const headerRow = document.createElement('tr');
        Object.keys(result.data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key.replace(/_/g, ' ').toUpperCase();
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        
        // Create table rows
        result.data.forEach(item => {
            const row = document.createElement('tr');
            Object.values(item).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value !== null ? value : 'NULL';
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        
    } catch (err) {
        console.error('Error loading table data:', {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        alert(`Error loading table data: ${err.message}`);
    }
}

async function loadDepartmentExams(department) {
    try {
        console.log(`Fetching exams for department: ${department}`);
        
        const response = await fetch(`http://localhost:3000/api/admin/exams?department=${encodeURIComponent(department)}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server responded with status ${response.status}`);
        }

        const result = await response.json();
        console.log('Department exams response:', result);

        const thead = document.getElementById('table-header');
        const tbody = document.getElementById('table-body');
        
        // Clear existing content
        thead.innerHTML = '';
        tbody.innerHTML = '';
        
        if (!result.data || result.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center;">No exams found for ${department}</td></tr>`;
            return;
        }
        
        // Create table headers
        const headerRow = document.createElement('tr');
        Object.keys(result.data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key.replace(/_/g, ' ').toUpperCase();
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        
        // Create table rows
        result.data.forEach(item => {
            const row = document.createElement('tr');
            Object.values(item).forEach(value => {
                const td = document.createElement('td');
                if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
                    td.textContent = new Date(value).toLocaleDateString();
                } else {
                    td.textContent = value !== null ? value : 'NULL';
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        
    } catch (err) {
        console.error('Error loading department exams:', {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        alert(`Error loading department exams: ${err.message}`);
    }
}

function generatePDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const table = document.getElementById('data-table');
        const title = document.querySelector('.dashboard-header h1').textContent;
        
        doc.text(title, 14, 15);
        doc.autoTable({
            html: table,
            startY: 20,
            styles: {
                fontSize: 8,
                cellPadding: 2,
                valign: 'middle'
            },
            headStyles: {
                fillColor: [44, 62, 80],
                textColor: 255
            }
        });
        
        doc.save('admin-report.pdf');
    } catch (err) {
        console.error('Error generating PDF:', err);
        alert('Failed to generate PDF');
    }
}
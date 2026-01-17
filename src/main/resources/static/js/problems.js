// Problems Page JavaScript

const API_BASE_URL = 'http://localhost:8080/api';

// Show/Hide problem form
document.getElementById('show-form-btn').addEventListener('click', () => {
    document.getElementById('problem-form-container').style.display = 'block';
    document.getElementById('show-form-btn').style.display = 'none';
});

document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('problem-form-container').style.display = 'none';
    document.getElementById('show-form-btn').style.display = 'block';
    document.getElementById('problem-form').reset();
});

// Fetch all problems
async function fetchProblems() {
    try {
        const response = await fetch(`${API_BASE_URL}/problems`);
        if (!response.ok) throw new Error('Failed to fetch problems');
        const problems = await response.json();
        displayProblems(problems);
    } catch (error) {
        console.error('Error fetching problems:', error);
        document.getElementById('loading').innerHTML = 
            '<p style="color: var(--danger-color);">Error loading problems. Please try again later.</p>';
    }
}

// Display problems on the page
function displayProblems(problems) {
    const problemsFeed = document.getElementById('problems-feed');
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('empty-state');
    
    loading.style.display = 'none';
    
    if (problems.length === 0) {
        problemsFeed.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    problemsFeed.innerHTML = problems.map(problem => {
        const createdDate = new Date(problem.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let attachments = '';
        if (problem.photoPath || problem.filePath) {
            attachments = '<div class="problem-attachments">';
            
            if (problem.photoPath) {
                attachments += `
                    <a href="${API_BASE_URL}/files/${problem.photoPath}" target="_blank" class="attachment-btn">
                        <span class="attachment-icon">🖼️</span>
                        View Photo
                    </a>
                `;
            }
            
            if (problem.filePath) {
                attachments += `
                    <a href="${API_BASE_URL}/files/${problem.filePath}" download class="attachment-btn">
                        <span class="attachment-icon">📎</span>
                        ${problem.fileName || 'Download File'}
                    </a>
                `;
            }
            
            attachments += '</div>';
        }
        
        return `
            <div class="problem-card">
                <div class="problem-header">
                    <h3 class="problem-title">${problem.title}</h3>
                    <p class="problem-meta">Posted on ${createdDate}</p>
                </div>
                <p class="problem-description">${problem.description}</p>
                ${attachments}
            </div>
        `;
    }).join('');
}

// Handle form submission
document.getElementById('problem-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    
    const photoFile = document.getElementById('photo').files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }
    
    const file = document.getElementById('file').files[0];
    if (file) {
        formData.append('file', file);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/problems`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to create problem');
        
        // Show success message
        const formContainer = document.getElementById('problem-form-container');
        formContainer.innerHTML = `
            <div class="success-message">
                ✅ Problem posted successfully!
            </div>
        `;
        
        setTimeout(() => {
            formContainer.style.display = 'none';
            document.getElementById('show-form-btn').style.display = 'block';
            formContainer.innerHTML = ''; // Clear success message
            
            // Recreate the form
            location.reload();
        }, 2000);
        
        // Refresh problems list
        fetchProblems();
        
    } catch (error) {
        console.error('Error creating problem:', error);
        alert('Error posting problem. Please try again.');
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    fetchProblems();
});

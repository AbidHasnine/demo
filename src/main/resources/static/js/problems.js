// Problems Page JavaScript

const API_BASE_URL = 'http://localhost:8080/api';

// Check if user is logged in
function checkLoginStatus() {
    const user = localStorage.getItem('user');
    const showFormBtn = document.getElementById('show-form-btn');
    
    if (!user) {
        // User not logged in - hide form button
        if (showFormBtn) {
            showFormBtn.style.display = 'none';
            showFormBtn.parentElement.innerHTML = `
                <div class="alert alert-warning">
                    <p><i class="fas fa-lock"></i> You must be logged in to post problems.</p>
                    <a href="login.html" class="btn btn-primary">Go to Login</a>
                </div>
            `;
        }
    } else {
        // User is logged in
        if (showFormBtn) {
            showFormBtn.style.display = 'inline-block';
        }
    }
}

// Show/Hide problem form
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    
    const showFormBtn = document.getElementById('show-form-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (showFormBtn) {
        showFormBtn.addEventListener('click', () => {
            document.getElementById('problem-form-container').style.display = 'block';
            showFormBtn.style.display = 'none';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('problem-form-container').style.display = 'none';
            document.getElementById('show-form-btn').style.display = 'block';
            document.getElementById('problem-form').reset();
        });
    }
    
    fetchProblems();
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
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = 
                '<p style="color: var(--danger-color);">Error loading problems. Please try again later.</p>';
        }
    }
}

// Display problems on the page
function displayProblems(problems) {
    const problemsFeed = document.getElementById('problems-feed');
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('empty-state');
    
    if (!problemsFeed) return;
    
    if (loading) loading.style.display = 'none';
    
    if (problems.length === 0) {
        problemsFeed.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
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
        
        const solutionSection = user ? `
            <div class="solution-section">
                <button class="btn btn-sm btn-primary" onclick="showSolutionForm('${problem.id}')">
                    <i class="fas fa-reply"></i> Add Solution
                </button>
                <div id="solution-form-${problem.id}" class="solution-form" style="display: none; margin-top: 1rem;">
                    <form onsubmit="submitSolution(event, '${problem.id}')">
                        <div class="form-group">
                            <label for="solution-title-${problem.id}">Solution Title</label>
                            <input type="text" id="solution-title-${problem.id}" placeholder="Brief title of your solution" required>
                        </div>
                        <div class="form-group">
                            <label for="solution-content-${problem.id}">Solution Content</label>
                            <textarea id="solution-content-${problem.id}" rows="4" placeholder="Describe your solution in detail..." required></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-sm btn-primary">Submit Solution</button>
                            <button type="button" class="btn btn-sm btn-outline" onclick="hideSolutionForm('${problem.id}')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
            <div id="solutions-${problem.id}" class="solutions-list"></div>
        ` : '';
        
        return `
            <div class="problem-card">
                <div class="problem-header">
                    <h3 class="problem-title">${problem.title}</h3>
                    <p class="problem-meta">
                        Posted by <strong>${problem.username || 'Anonymous'}</strong> on ${createdDate}
                    </p>
                </div>
                <p class="problem-description">${problem.description}</p>
                ${attachments}
                ${solutionSection}
            </div>
        `;
    }).join('');
    
    // Load solutions for each problem
    problems.forEach(problem => {
        if (user) {
            fetchSolutions(problem.id);
        }
    });
}

// Show/Hide solution form
function showSolutionForm(problemId) {
    document.getElementById(`solution-form-${problemId}`).style.display = 'block';
}

function hideSolutionForm(problemId) {
    document.getElementById(`solution-form-${problemId}`).style.display = 'none';
}

// Submit solution
async function submitSolution(event, problemId) {
    event.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        alert('You must be logged in to submit solutions');
        return;
    }
    
    const title = document.getElementById(`solution-title-${problemId}`).value;
    const content = document.getElementById(`solution-content-${problemId}`).value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/solutions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                problemId,
                username: user.username,
                userId: user.userId,
                title,
                content
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to submit solution');
        }
        
        alert('Solution submitted successfully!');
        hideSolutionForm(problemId);
        fetchSolutions(problemId);
        
    } catch (error) {
        console.error('Error submitting solution:', error);
        alert('Error submitting solution: ' + error.message);
    }
}

// Fetch solutions for a problem
async function fetchSolutions(problemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/solutions/problem/${problemId}`);
        if (!response.ok) throw new Error('Failed to fetch solutions');
        
        const solutions = await response.json();
        displaySolutions(problemId, solutions);
    } catch (error) {
        console.error('Error fetching solutions:', error);
    }
}

// Display solutions for a problem
function displaySolutions(problemId, solutions) {
    const solutionsList = document.getElementById(`solutions-${problemId}`);
    if (!solutionsList) return;
    
    if (solutions.length === 0) {
        solutionsList.innerHTML = '<p style="color: #666; font-size: 0.9rem;"><i class="fas fa-info-circle"></i> No solutions yet. Be the first to add one!</p>';
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    solutionsList.innerHTML = '<h5 style="margin-top: 1.5rem; margin-bottom: 1rem;">Solutions:</h5>' + 
        solutions.map(solution => {
            const createdDate = new Date(solution.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const isAuthor = user && user.userId === solution.userId;
            const deleteBtn = isAuthor ? `
                <button class="btn btn-sm btn-danger" onclick="deleteSolution('${problemId}', '${solution.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            ` : '';
            
            const acceptedBadge = solution.isAccepted ? '<span class="badge badge-success"><i class="fas fa-check"></i> Accepted Solution</span>' : '';
            
            return `
                <div class="solution-item" style="background: #f9f9f9; padding: 1rem; margin: 0.5rem 0; border-radius: 4px; border-left: 3px solid var(--primary-color);">
                    <div class="solution-header" style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h6 style="margin: 0 0 0.5rem 0;">${solution.title}</h6>
                            <p style="margin: 0; font-size: 0.85rem; color: #666;">
                                By <strong>${solution.username}</strong> • ${createdDate}
                                ${acceptedBadge}
                            </p>
                        </div>
                        <div>
                            ${deleteBtn}
                        </div>
                    </div>
                    <p style="margin: 0.5rem 0 0 0; line-height: 1.6;">${solution.content}</p>
                </div>
            `;
        }).join('');
}

// Delete solution
async function deleteSolution(problemId, solutionId) {
    if (!confirm('Are you sure you want to delete this solution?')) return;
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        alert('You must be logged in');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/solutions/${solutionId}?userId=${user.userId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete solution');
        }
        
        alert('Solution deleted successfully!');
        fetchSolutions(problemId);
        
    } catch (error) {
        console.error('Error deleting solution:', error);
        alert('Error deleting solution');
    }
}

// Handle form submission
const problemForm = document.getElementById('problem-form');
if (problemForm) {
    problemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user) {
            alert('You must be logged in to post problems');
            return;
        }
        
        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('username', user.username);
        formData.append('userId', user.userId);
        
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
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create problem');
            }
            
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
            alert('Error posting problem: ' + error.message);
        }
    });
}


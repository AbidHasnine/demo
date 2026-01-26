// Resources Page JavaScript

const API_BASE_URL = 'http://localhost:8080/api';

let allResources = [];

// Check if user is logged in
function checkLoginStatus() {
    const user = localStorage.getItem('user');
    const resourcesGrid = document.getElementById('resources-grid');
    const filterButtons = document.querySelector('.filter-buttons');
    
    if (!user) {
        // User not logged in - show login message
        if (resourcesGrid) {
            resourcesGrid.innerHTML = `
                <div class="alert alert-warning" style="grid-column: 1/-1;">
                    <p><i class="fas fa-lock"></i> You must be logged in to access resources.</p>
                    <a href="login.html" class="btn btn-primary">Go to Login</a>
                </div>
            `;
        }
        if (filterButtons) {
            filterButtons.style.display = 'none';
        }
        return false;
    }
    if (filterButtons) {
        filterButtons.style.display = 'flex';
    }
    return true;
}

// Fetch resources from backend
async function fetchResources() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user) {
            checkLoginStatus();
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/resources?userId=${user.userId}`);
        if (!response.ok) {
            if (response.status === 401) {
                checkLoginStatus();
                return;
            }
            throw new Error('Failed to fetch resources');
        }
        allResources = await response.json();
        displayResources(allResources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = 
                '<p style="color: var(--danger-color);">Error loading resources. Please try again later.</p>';
        }
    }
}

// Display resources on the page
function displayResources(resources) {
    const resourcesGrid = document.getElementById('resources-grid');
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('empty-state');
    
    if (!resourcesGrid) return;
    
    if (loading) loading.style.display = 'none';
    
    if (resources.length === 0) {
        resourcesGrid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    resourcesGrid.innerHTML = resources.map(resource => `
        <div class="resource-card">
            <span class="resource-category">${resource.category}</span>
            <h3>${resource.title}</h3>
            <p>${resource.description || 'No description available.'}</p>
            <a href="${resource.url}" target="_blank" class="resource-link">
                Visit Resource
            </a>
        </div>
    `).join('');
}

// Filter resources by category
function filterResources(category) {
    if (category === 'all') {
        displayResources(allResources);
    } else {
        const filtered = allResources.filter(resource => resource.category === category);
        displayResources(filtered);
    }
}

// Setup category filter buttons
function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Filter resources
            const category = button.getAttribute('data-category');
            filterResources(category);
        });
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (checkLoginStatus()) {
        setupCategoryFilters();
        fetchResources();
    }
});


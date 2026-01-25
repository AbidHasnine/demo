// Compiler Page JavaScript

const defaultCode = {
    javascript: `// JavaScript Playground
console.log("Hello, World!");

function sum(a, b) {
    return a + b;
}

console.log("Sum of 5 + 3 =", sum(5, 3));`,

    python: `# Python Playground
print("Hello, World!")

def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print("Factorial of 5 is:", factorial(5))`,

    java: `// Java Playground
// Main class must be named 'Main'
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for(int n : numbers) {
            sum += n;
        }
        System.out.println("Sum of array: " + sum);
    }
}`,

    cpp: `// C++ Playground
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "Hello, World!" << std::endl;
    
    std::vector<int> v = {1, 2, 3, 4, 5};
    int sum = std::accumulate(v.begin(), v.end(), 0);
    
    std::cout << "Sum of vector: " << sum << std::endl;
    return 0;
}`,

    c: `// C Playground
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    int i;
    for(i = 0; i < 5; i++) {
        printf("Count: %d\\n", i);
    }
    
    return 0;
}`
};

document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    const codeEditor = document.getElementById('code-editor');
    const runBtn = document.getElementById('run-code-btn');
    const clearBtn = document.getElementById('clear-output-btn');
    const outputConsole = document.getElementById('output-console');

    // Set initial code
    codeEditor.value = defaultCode[languageSelect.value];

    // Language change handler
    languageSelect.addEventListener('change', () => {
        const lang = languageSelect.value;
        // Only update if editor is empty or contains default code of another language
        // For simplicity, we'll just confirm with the user if they want to switch (if they have typed something)
        // But for this MVP, let's just update it if it matches one of the defaults, or just overwrite it.
        // Let's just overwrite for now to be "responsive".
        codeEditor.value = defaultCode[lang];
    });

    // Run Code Handler
    runBtn.addEventListener('click', async () => {
        const code = codeEditor.value;
        const language = languageSelect.value;
        
        if (!code || !code.trim()) {
            outputConsole.textContent = 'Please enter some code to run.';
            outputConsole.classList.add('error');
            return;
        }
        
        // Disable button and show loading
        runBtn.disabled = true;
        runBtn.innerHTML = '<span>⏳</span> Running...';
        outputConsole.innerHTML = '<span class="placeholder-text">Executing code...</span>';
        outputConsole.className = 'output-console'; // Reset classes
        
        try {
            const response = await fetch('/api/compiler/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code,
                    language: language
                })
            });
            
            const data = await response.json();
            
            if (data.output) {
                outputConsole.textContent = data.output;
                if (data.error) {
                    outputConsole.classList.add('error');
                }
            } else {
                outputConsole.textContent = 'No output returned.';
            }
            
        } catch (error) {
            console.error('Execution error:', error);
            outputConsole.textContent = 'Error executing code. Please try again.';
            outputConsole.classList.add('error');
        } finally {
            // Re-enable button
            runBtn.disabled = false;
            runBtn.innerHTML = '<span>▶</span> Run Code';
        }
    });

    // Clear Output Handler
    clearBtn.addEventListener('click', () => {
        outputConsole.innerHTML = '<span class="placeholder-text">Run your code to see output here...</span>';
        outputConsole.className = 'output-console';
    });

    // Allow tab key in textarea
    codeEditor.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;

            // Insert 4 spaces
            this.value = this.value.substring(0, start) + 
                "    " + this.value.substring(end);

            // Put caret at right position
            this.selectionStart = this.selectionEnd = start + 4;
        }
    });
});

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// DOM Elements
const pdfInput = document.getElementById('pdfInput');
const textSection = document.getElementById('textSection');
const extractedText = document.getElementById('extractedText');
const qaSection = document.getElementById('qaSection');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const answerSection = document.getElementById('answerSection');
const answer = document.getElementById('answer');
const loadingIndicator = document.getElementById('loadingIndicator');
const uploadSection = document.getElementById('uploadSection');
const newPdfButton = document.getElementById('newPdfButton');

let currentPdfId = null;

// Function to render math expressions
function renderMath() {
    renderMathInElement(document.getElementById('extractedText'), {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false}
        ],
        throwOnError: false,
        output: 'html'
    });
}

// Handle PDF upload
pdfInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        loadingIndicator.classList.remove('hidden');
        
        const formData = new FormData();
        formData.append('pdf', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }

        // Update the text display with better formatting
        extractedText.innerHTML = data.text
            .replace(/\n/g, '<br>')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
            
        textSection.classList.remove('hidden');
        qaSection.classList.remove('hidden');
        
        // Hide upload section and show new PDF button
        uploadSection.classList.add('hidden');
        newPdfButton.classList.remove('hidden');
        
        // Render math expressions
        renderMath();
    } catch (error) {
        console.error('Detailed upload error:', error);
        alert(`Error processing PDF: ${error.message}`);
    } finally {
        loadingIndicator.classList.add('hidden');
    }
});

// Handle new PDF button click
newPdfButton.addEventListener('click', () => {
    uploadSection.classList.remove('hidden');
    newPdfButton.classList.add('hidden');
    pdfInput.value = ''; // Reset file input
});

// Handle drag and drop
const dropZone = document.querySelector('label');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropZone.classList.add('border-slate-500', 'bg-slate-100');
}

function unhighlight(e) {
    dropZone.classList.remove('border-slate-500', 'bg-slate-100');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file && file.type === 'application/pdf') {
        pdfInput.files = dt.files;
        pdfInput.dispatchEvent(new Event('change'));
    } else {
        alert('Please upload a PDF file.');
    }
}

// Handle question submission
askButton.addEventListener('click', async () => {
    const question = questionInput.value.trim();
    if (!question || !currentPdfId) return;

    try {
        loadingIndicator.classList.remove('hidden');
        const response = await fetch('/api/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pdfId: currentPdfId,
                question: question
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get answer');
        }

        const data = await response.json();
        answer.textContent = data.answer;
        answerSection.classList.remove('hidden');
    } catch (error) {
        console.error('Error getting answer:', error);
        alert('Error processing question. Please try again.');
    } finally {
        loadingIndicator.classList.add('hidden');
    }
});

// Handle Enter key in question input
questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        askButton.click();
    }
});

// Load previously uploaded PDFs
async function loadPreviousPDFs() {
    try {
        const response = await fetch('/api/pdfs');
        if (!response.ok) {
            throw new Error('Failed to load PDFs');
        }
        const pdfs = await response.json();
        // You can implement a UI to show previous PDFs here
    } catch (error) {
        console.error('Error loading PDFs:', error);
    }
}

// Load previous PDFs when the page loads
document.addEventListener('DOMContentLoaded', loadPreviousPDFs); 
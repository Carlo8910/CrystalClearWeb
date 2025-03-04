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

let extractedContent = '';

// Handle PDF upload
pdfInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        loadingIndicator.classList.remove('hidden');
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
        }

        extractedContent = fullText;
        extractedText.textContent = fullText;
        textSection.classList.remove('hidden');
        qaSection.classList.remove('hidden');
    } catch (error) {
        console.error('Error processing PDF:', error);
        alert('Error processing PDF. Please try again.');
    } finally {
        loadingIndicator.classList.add('hidden');
    }
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
    if (!question) return;

    try {
        loadingIndicator.classList.remove('hidden');
        // Replace with your actual Gemini API endpoint and key
        const response = await fetch('YOUR_GEMINI_API_ENDPOINT', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_GEMINI_API_KEY'
            },
            body: JSON.stringify({
                prompt: `Context: ${extractedContent}\n\nQuestion: ${question}`,
                // Add other Gemini API parameters as needed
            })
        });

        const data = await response.json();
        answer.textContent = data.response; // Adjust based on actual API response structure
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
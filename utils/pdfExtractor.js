const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function extractTextFromPDF(filePath) {
    try {
        console.log('Reading PDF file from:', filePath);
        const fileData = fs.readFileSync(filePath);
        
        // Initialize Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        // Convert PDF to base64
        const base64Data = fileData.toString('base64');
        
        // Create the prompt for Gemini
        const prompt = `Please extract the text from this PDF document while preserving the EXACT original formatting:
        1. Keep all line breaks exactly as they appear in the PDF
        2. Maintain all spacing between paragraphs
        3. Preserve all indentation
        4. Keep all bullet points and numbered lists as they are
        5. Maintain any special characters or symbols exactly as they appear
        6. Do not add any extra formatting or line breaks
        7. Do not modify the text content in any way
        8. Keep the exact same spacing between sections
        
        The output should be a direct representation of how the text appears in the PDF, with no modifications to the formatting.`;
        
        // Generate content using Gemini
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "application/pdf",
                    data: base64Data
                }
            }
        ]);

        const response = await result.response;
        const extractedText = response.text();
        
        console.log('Text extraction completed using Gemini');
        return extractedText;
    } catch (error) {
        console.error('Error in extractTextFromPDF:', error);
        throw error;
    }
}

module.exports = extractTextFromPDF; 
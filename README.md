# PDF Text Extractor & Q&A

A modern web application that allows users to upload PDFs, extract text while preserving formatting, and ask questions about the content using the Gemini API.

## Features

- Modern, responsive UI using Tailwind CSS
- Drag-and-drop PDF upload
- Text extraction with formatting preservation
- Interactive Q&A interface
- Real-time loading indicators
- Smooth animations and transitions
- PDF storage and retrieval
- Session-based user tracking

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Gemini API key

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/pdf-extractor
   GEMINI_API_KEY=your_gemini_api_key_here
   SESSION_SECRET=your_session_secret_here
   ```

4. Start MongoDB:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo service mongod start
   ```

5. Start the application:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. Open `http://localhost:3000` in your browser

## Project Structure

```
pdf-extractor/
├── public/              # Static files
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Custom styles
│   └── script.js       # Frontend JavaScript
├── uploads/            # PDF storage directory
├── utils/             # Utility functions
│   └── pdfExtractor.js # PDF text extraction
├── server.js          # Express server
├── package.json       # Dependencies and scripts
└── .env              # Environment variables
```

## Usage

1. Upload a PDF file by either:
   - Dragging and dropping the file into the upload area
   - Clicking the upload area and selecting a file

2. Wait for the text extraction to complete

3. Once the text is displayed, you can:
   - Read the extracted content
   - Type questions in the input field
   - Press Enter or click "Ask" to get answers about the content

4. View your previously uploaded PDFs in the "Previous PDFs" section

## Technologies Used

- Node.js with Express
- MongoDB for data storage
- PDF.js for PDF processing
- Gemini API for text processing and Q&A
- Tailwind CSS for styling
- Express Session for user tracking

## Security Notes

- PDFs are stored securely in the uploads directory
- Session-based user tracking prevents unauthorized access
- API keys are stored in environment variables
- File uploads are restricted to PDF files only
- Input validation and sanitization are implemented

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
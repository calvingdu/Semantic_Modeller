# Semantic Modeller Application

This full-stack application is used for for semantic analysis of PDF documents. It features topic modeling, similarity search, and interactive document visualization that is super simple to use and has extreme focus on privacy, security and usability. 

The use cases for a project like this is to act as the middle ground between AI automation and manual work. For example, when writing a research paper, people want to avoid using AI incase of hallucinations or if they just want to read the context for themselves. This application let's you do that as it will outline where in the document related passages are and enables quick access for certain topics (similar to adding notes to a paper manually and coming back to them to find what you were thinking about) 

There's also 0 use of AI in this as the model is based off embeddings and similiarty search using methods such as Cosine similiarity which is purely math based. *This means it's completely free!*

### Demo:




https://github.com/user-attachments/assets/13d9ee07-297c-4ab9-be25-3a7d89ba4884





## Features

- **PDF Document Processing**
  - Upload and process multiple PDF documents for text indexing and search
  - Automatic text extraction and parsing
  - Page-by-page navigation and zoom controls

- **Semantic Analysis**
  - Ability to self-automate topic prompts 
  - Semantic similarity scoring to given/generated prompts
  - Multiple similarity measurement methods (cosine, euclidean, manhattan, wasserstein) or ensembled

- **Interactive UI**
  - Real-time document viewer
  - Configurable with filters, topic management interface and PDF viewers 
  - Support for dark/light theme modes

## Tech Stack

### Frontend
- Javascript
- React/Next.js
- TailwindCSS (Styling)

### Backend
- Python
- Pytorch
- Scikit Learn
- Flask (Python web framework)
- Uses Hugging Face Embedding Models

## Prerequisites

- Python 3.8+
- Node.js 22+ (because of react-pdf)

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/calvingdu/Semantic_Modeller.git
cd semantic-modeller
```

2. **Setup**
I have a docker setup that contains the entire project:

**Build and start all services**
docker-compose up --build

**Start Containers**
docker-compose up

**Stop all services**
docker-compose down

2a. **Frontend/Backend Setup (If not using Docker)**
Backend: 
```bash
cd backend 
python -m venv venv
source venv/bin/activate
```

Frontend: 
```bash
cd frontend
npm install
```
## Configuration
1. **Ports/Environemnts**
I've chosen Port 5001 for the Backend and Port 3001 for the Frontend but that's just preference.

Can change this in the Dockerfiles/docker-compose file. 

3. **CORS Settings**
The Flask backend is configured to accept requests from the frontend domain. Update the CORS settings in `app.py` if needed.

## Running the Application

1. **Start the Backend Server**
```bash
# From the root directory
python app.py
```
The Flask server will start at `http://localhost:5001`

2. **Start the Frontend Development Server**
```bash
# In a new terminal
npm run dev
```
The frontend will be available at `http://localhost:3001`

## Usage

1. **Upload Documents**
   - Drag and drop PDF files into the upload area
   - Maximum 3 files, 10MB each

2. **Manage Topics**
   - Add custom topics manually
   - Automatic topic generation is automatically enabled, disabled if needed
   - Remove or clear topics as needed

3. **Configure Analysis**
   - Set minimum similarity score
   - Start analysis process

4. **View Results**
   - Navigate through analyzed passages
   - Filter by topic, document, or score
   - Click on results to jump to relevant document sections
   **Note:** There are supposed to be highlighted text for each passage but there are some errors. To be worked on. 

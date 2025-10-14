Chat Application

A full-stack chat application with authentication, multi-chat threads, and clean UI.  

## 🧩 Tech Stack & Structure

- **Frontend** (`frontend/`) — React (likely with hooks), UI components, chat interface  
- **Backend** (`backend/`) — Auth APIs, message endpoints, database integration  
- **.gitignore** — common files to be excluded  

Feel free to add your versions/frameworks (TypeScript, Express, FastAPI, etc.).

## 🚀 Features

- User registration & login  
- Multiple chat sessions (threads)  
- Real-time / near-real-time messaging  
- Sidebar view for list of chats  
- Chat UI & message history

## 🛠️ Setup & Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/khanhtuanvo/chat_application.git
cd chat_application
```

### 2 ⚙️ Create a .env file in the backend directory:
SECRET_KEY=your_new_secret_key
DATABASE_URL=your_new_database_url
OPENAI_API_KEY=your_new_openai_key

### 3. Install frontend dependencies and run locally
```bash
cd frontend
npm install
npm run dev  
```

# 4. Install backend dependencies and run locally
```bash
cd ../backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

🧩 Tech Stack

Frontend: React, Tailwind CSS

Backend: Fastapi

Database: FastAPI

Authentication: JWT

![Login Page](./assets/login.png)
![Chat Interface](./assets/chat.png)


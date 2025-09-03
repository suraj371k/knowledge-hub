# 📘 AI-Powered Collaborative Knowledge Hub (MERN + Gemini)

An AI-enhanced knowledge management system built with the **MERN stack** and **Google Gemini API**.  
This app allows teams to create, manage, search, and collaborate on documents with intelligent AI features such as **auto-summaries, smart tags, semantic search, and Q&A** over team docs.

---

## 🚀 Features

### 🔐 Authentication & Roles
- Email/password authentication with **JWT**.
- **Role-based access control (RBAC)**:
  - **Admin**: can edit/delete any document.
  - **User**: can only manage their own documents.

### 📄 Document Management
- **CRUD operations** on documents with fields:
  - `title`, `content`, `tags`, `summary`, `createdBy`, `createdAt`, `updatedAt`.
- **Gemini AI Integration**:
  - Auto-generate **summaries** and **tags**.
  - **Semantic search** with embeddings.
  - **Q&A**: Ask AI questions and get answers from stored docs.

### 🔍 Search & Filters
- Standard **text-based search**.
- **Semantic search** using embeddings for contextual results.
- **Tag-based filtering** with chip-style UI.

### 🖥️ Frontend Pages
- **Login/Register**
- **Dashboard** → list of docs + activity feed
- **Add/Edit Document**
- **Search Page** → semantic results + filters
- **Team Q&A** → ask Gemini questions from stored docs

### 🧩 Extra Features (Optional Layer)
- **Document Versioning**: Keep history of edits with timestamps.
- **Team Activity Feed**: Shows last 5 edited docs and who edited them.

---

##video link = https://www.loom.com/share/7330c8ba6b0e41ec8726e852ea147ab2

## 📂 Tech Stack

**Frontend**
- React.js + Vite / CRA (depending on setup)
- Tailwind CSS (for UI)
- Axios (API calls)

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- Google Gemini API for AI features

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/ai-knowledge-hub.git
cd ai-knowledge-hub

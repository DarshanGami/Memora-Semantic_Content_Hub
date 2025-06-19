# 📘 Memora

> A full-stack AI-powered content management system that enables users to store, organize, and retrieve notes, images, documents, and links with intelligent, semantic search.

---

## 📌 Overview

**Memora** is more than just a file upload or note-taking tool — it’s an intelligent content platform that uses AI to understand and organize your data.

### 🔍 What Makes It Special?

Most systems rely on keyword-based search. Memora uses **semantic tagging and vector embeddings**, enabling it to "understand" content. Even if you search with different words, it can still find relevant results — **like how a human thinks**.

---

## 🧠 Core Features

- 🔐 User registration, login, logout, and password recovery
- ☁️ Upload multiple content types (text, images, files, URLs)
- 🧠 AI-generated semantic tags (via Gemini API)
- 📈 1024-dimensional vector embeddings (Mixer model)
- 🔍 Fast semantic search (dot product similarity)
- 🏷️ Manage tags: add, delete, edit
- 🌐 Fully containerized using **Docker & Docker Compose**

---

## 🧩 Technology Stack

| Layer       | Technology              | Description                           |
|-------------|--------------------------|---------------------------------------|
| Frontend    | React.js + TypeScript   | UI and user interactions              |
| Backend     | Spring Boot (Java 17)   | REST API, auth, and business logic    |
| AI Service  | Python + Flask          | Microservice for tagging & embeddings |
| AI APIs     | Gemini API              | Generates contextual tags             |
| Embeddings  | Mixer / mxbai-embed     | Converts tags into semantic vectors   |
| Database    | MongoDB (Vector Search) | Stores content, metadata & vectors    |
| DevOps      | Docker + Compose        | Unified local deployment              |

---

## 🧠 Architecture Diagram

> **Color Key**:  
> 🟦 Frontend – React  
> 🟩 Backend – Spring Boot  
> 🟧 AI Services – Flask + Gemini + Mixer  
> 🟪 Database – MongoDB  

![Memora Architecture](index.png)

### 🔧 AI Microservice Details:

![AI Service Architecture](AI-Service.png)

---

## 🔁 Data Flow & AI Logic

Memora intelligently handles content upload, tag generation, semantic search, and updates with a smart pipeline powered by AI.

---

### 📤 1. Content Upload

- User uploads **notes, files, or links** via React frontend.
- Frontend sends data to backend via `POST /api/upload`.
- Backend forwards the raw content to the AI microservice.

---

### 🧠 2. Semantic Tag Generation

- The AI microservice extracts content.
- It uses the **Gemini API** to generate **semantic tags**.
- Tags are returned to the microservice.

---

### 📐 3. Embedding Vectors

- Tags are passed to the **Mixer model** (e.g., `mxbai-embed-large-v1`).
- Each tag is converted into a **1024-dimensional vector** (values between `-1` and `1`).
- Vectors are returned to the backend.

---

### 🗄️ 4. Storage in MongoDB

- Spring Boot saves:
  - Original content
  - Tags
  - Embedding vectors
  - User metadata
- All stored in **MongoDB**, indexed for **vector search**.

---

### 🔍 5. Semantic Search

- User enters a **query**.
- Backend sends the query to the embedder → generates a **query vector**.
- Dot product similarity is used to match stored tag vectors.
- Backend retrieves the **most relevant items** and sends them to the UI.

---

### ✏️ 6. Edit / Tag Update Flow

- If a user **updates content** or **adds/deletes tags**:
  - Backend resends the updated content to AI microservice.
  - **New tags and vectors** are generated.
  - MongoDB is updated to reflect the changes.

---

### 🔐 7. Authentication & Logout

- Users can **register**, **login**, and **recover passwords**.
- Spring Security provides **JWT-based** auth.
- **Logout**:
  - On frontend: token is removed from localStorage.
  - On backend: optionally invalidate or expire token.

---

## 🐳 Docker Deployment

### 🧱 Requirements

- Docker
- Docker Compose

### ▶️ To Run Locally

```bash
git clone https://github.com/your-username/memora.git
cd memora
docker-compose up-- build

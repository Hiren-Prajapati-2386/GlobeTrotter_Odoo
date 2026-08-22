# GlobeTrotter

GlobeTrotter is a full-stack web application designed to help you plan, manage, and share your travel itineraries. It features an interactive UI for tracking trips, activities, expenses, and cities, powered by a robust Python/FastAPI backend and a modern React frontend.

## 📸 Screenshots

<table>
  <tr>
    <td align="center">
      <img src="public/Screenshot%202026-08-22%20165025.png" alt="Screenshot 1" width="400"/>
    </td>
    <td align="center">
      <img src="public/Screenshot%202026-08-22%20165051.png" alt="Screenshot 2" width="400"/>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="public/Screenshot%202026-08-22%20165125.png" alt="Screenshot 3" width="400"/>
    </td>
    <td align="center">
      <img src="public/Screenshot%202026-08-22%20165153.png" alt="Screenshot 4" width="400"/>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="public/Screenshot%202026-08-22%20165227.png" alt="Screenshot 5" width="400"/>
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

**Backend**
*   **Python 3.12+**
*   **FastAPI**: High-performance web framework for APIs.
*   **SQLAlchemy & Alembic**: ORM and database migrations.
*   **PostgreSQL**: Relational database.
*   **Uvicorn**: ASGI web server.
*   **Authentication**: JWT (JSON Web Tokens) with Passlib & bcrypt.

**Frontend**
*   **React 19**: Modern UI library.
*   **Vite**: Ultra-fast build tool and dev server.
*   **Tailwind CSS**: Utility-first CSS framework for styling.
*   **React Router**: Declarative routing.
*   **Recharts**: Data visualization and charts.
*   **Axios**: HTTP client for API requests.

---

## 📂 Folder Structure

```text
GlobeTrotter_Odoo/
├── backend/                  # Python FastAPI Backend
│   ├── alembic/              # Database migration scripts
│   ├── app/                  # Main application package
│   │   ├── core/             # Settings, security, and dependencies
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── routers/          # API endpoints (auth, trips, budget, etc.)
│   │   └── schemas/          # Pydantic schemas for data validation
│   ├── static/               # Uploaded static files
│   ├── .env                  # Environment variables
│   ├── alembic.ini           # Alembic configuration
│   ├── requirements.txt      # Python dependencies
│   └── seed.py               # Script to seed demo data
│
├── frontend/                 # React Frontend
│   ├── public/               # Static assets (favicons, etc.)
│   ├── src/                  # React components, pages, and context
│   ├── package.json          # Node.js dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   └── vite.config.js        # Vite configuration
│
└── public/                   # Project Screenshots (used in README)
```

---

## 🚀 How to Clone and Run

Follow these detailed steps to set up the project locally on your machine.

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd GlobeTrotter_Odoo
```

### 2. Database Setup
Ensure you have **PostgreSQL** installed and running on your system.
1. Open your PostgreSQL CLI (e.g., `psql` or pgAdmin).
2. Create the database:
   ```sql
   CREATE DATABASE globetrotter;
   ```

### 3. Backend Setup
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
```

1. **Create and activate a virtual environment:**
   ```bash
   # On Windows:
   python -m venv venv
   .\venv\Scripts\Activate
   
   # On macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `backend` folder (if it doesn't exist) and add the following:
   ```env
   DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/globetrotter
   SECRET_KEY=your-super-secret-key-change-it-in-production
   ```
   *(Update the database credentials to match your local PostgreSQL setup).*

4. **Run Database Migrations:**
   Apply the database schema:
   ```bash
   alembic upgrade head
   ```

5. **(Optional) Seed Demo Data:**
   Populate the database with sample cities and activities:
   ```bash
   python seed.py
   ```

6. **Start the Backend Server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   *The API will be available at http://127.0.0.1:8000*

### 4. Frontend Setup
Open a **new terminal window** and navigate to the `frontend` folder:
```bash
cd frontend
```

1. **Install Node dependencies:**
   ```bash
   npm install
   ```
   *(Note: If you run into native binding issues on Windows, run `Remove-Item -Recurse -Force node_modules, package-lock.json` and try `npm install` again).*

2. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   *The web app will be available at http://localhost:5173*

---

🎉 **You're all set!** Open the frontend URL in your browser and start exploring GlobeTrotter!

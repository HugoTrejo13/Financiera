# Financiera App 🚀

<p align="center">
  <img src="/assets/demo.jpeg" alt="Financiera App Cover" width="100%">
</p>

**Financiera App** is a modern SaaS platform designed for personal and collaborative financial management. Its primary goal is to empower users to take absolute control of their financial health by tracking income, expenses, debts, and budgets through an intuitive and highly efficient interface. 

The core strength of this platform lies in its ability to handle complex financial scenarios—such as interest-free monthly installments (MSI) and shared budgets—while maintaining a seamless and fast user experience.

## 🌟 Key Features

- **Advanced Expense Tracking:** Accurately record both cash and credit purchases, including automated calculations for monthly installment plans.
- **Smart Budget Control:** Assign specific monthly limits to different spending categories to prevent overspending and maintain financial discipline.
- **Collaborative Environment (Coming Soon):** Share accounts, expenses, and financial goals with roommates, partners, or family members in real-time.
- **AI Integration (Coming Soon):** Smart receipt scanning via camera and predictive analytics to forecast future financial health.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Zustand.
- **Backend:** FastAPI (Python), PostgreSQL, SQLModel.
- **Security:** JSON Web Tokens (JWT) authentication with pure bcrypt encryption.
- **Infrastructure:** Docker & Docker Compose for isolated and reproducible environments.

---

## 📚 Architecture & Documentation

For technical decisions, user flows, and deep database architecture, please refer to the master documents located in the `/docs` folder (PRD, TRD, Schema, etc.). All new development must adhere to the roadmap defined in `/docs/Implementation_Plan.md`.

---

## ⚙️ Prerequisites (For Developers)

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** installed and running.
2. **[Node.js](https://nodejs.org/)** (v18 or higher).

---

## 🏃 How to Run the Project Locally

Any developer cloning this repository can have the app running in seconds by following these two steps:

### Step 1: Start the Backend and Database (Docker)
Open a terminal in the root directory of the project and run:
```bash
docker compose up --build -d
```
> This will download PostgreSQL, build the FastAPI server, and connect them internally. The API will be up and running at `http://localhost:8000`.

### Step 2: Start the Frontend (React)
Open a separate terminal window, navigate to the frontend folder, and start the user interface:
```bash
cd frontend
npm install
npm run dev
```
> The web interface will be available at `http://localhost:5173`.

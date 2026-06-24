<div align="center">
  <h1>Financiera</h1>
  <p>A smart personal finance tracker with automated currency conversion and amortization schedules.</p>

  [![Status](https://img.shields.io/badge/Status-In%20development-orange?style=flat-square)](#)
  [![License](https://img.shields.io/badge/License-None-lightgrey?style=flat-square)](#)
  [![GitHub](https://img.shields.io/badge/GitHub-HugoTrejo13-181717?style=flat-square&logo=github)](#)
</div>

![Demo](./assets/demo.jpeg)

## 📖 About
Financiera is a personal finance application built to help users take control of their expenses and debts without dealing with confusing spreadsheets. It automatically calculates interest rates, builds payment timelines for installment purchases, and fetches real-time currency exchange rates. It solves the problem of tracking complex liabilities by providing a clean, centralized, and visual dashboard.

## ✨ Features
- **Track** cash purchases and installment debts (with or without interest).
- **Categorize** expenses with visual icons and colors for better organization.
- **Visualize** spending patterns with interactive pie charts grouped by category.
- **Calculate** automatic amortization schedules and timeline progress for active debts.
- **Convert** USD to MXN dynamically using the real-time Frankfurter API.
- **Edit** existing financial records seamlessly through a robust centered modal interface.
- **Filter** expenses by date range to analyze specific periods.
- **Read** filtered real-time economic and financial news directly from the dashboard.

## 🛠 Tech Stack

**Frontend**  
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

**Backend**  
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=flat-square&logo=sqlite&logoColor=white)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### Installation

```bash
# Clone the repository
git clone https://github.com/HugoTrejo13/Financiera.git
cd Financiera

# Setup Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Initialize default categories (run once)
python init_categories.py

# Start backend server
uvicorn app.main:app --reload

# Setup Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

### Usage
```bash
# Open your browser and navigate to http://localhost:5173
# 1. Add a new expense by clicking "Nueva compra"
# 2. Select a category (Food, Transport, etc.)
# 3. Choose payment type (cash or installments)
# 4. For USD purchases, watch the exchange rate auto-fill
# 5. View your expense breakdown by category in the interactive chart
```

## 📬 Contact
**Hugo Trejo**  
[![GitHub](https://img.shields.io/badge/GitHub-HugoTrejo13-181717?style=flat-square&logo=github)](https://github.com/HugoTrejo13)

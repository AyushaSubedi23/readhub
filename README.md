# ReadHub 📚

A web-based book platform for discovering books, reading available eBooks, managing a personal library, tracking reading progress, and exchanging books.

**[🌐 Live Demo](https://ayushasubedi23.github.io/readhub/) · [💻 Source Code](https://github.com/AyushaSubedi23/readhub)**

Developed as a group Software Development project and subsequently used as the system under test for a Software Testing project.

## Features

- User registration and login
- Book discovery, search, and categories
- Personal library, wishlist, and reading status
- eBook reader and reading progress tracking
- Book exchange
- User profiles, reviews, and ratings

## Tech Stack

- **Backend:** Python, Flask
- **Database:** SQLite
- **Frontend:** HTML5, CSS3, JavaScript
- **Testing:** Pytest, pytest-cov
- **Version Control:** Git, GitHub

## Setup

**Requirements:** Python 3.12

```bash
git clone https://github.com/AyushaSubedi23/readhub.git
cd readhub
python -m pip install flask pytest pytest-cov werkzeug
python backend/main.py
```

Open http://127.0.0.1:5001 in your browser.

## Testing

```bash
# Run all tests
python -m pytest test

# Run with coverage
python -m pytest test --cov=backend --cov-report=term-missing --cov-branch
```

**Recorded results:** 15 tests passed; 59% reported coverage.

Testing included unit, integration, and end-to-end tests, functional testing, test design techniques, regression testing, and defect reporting.

## Project Structure

```text
readhub/
├── backend/    # Flask application and SQL
├── html/       # HTML pages
├── static/     # CSS, JavaScript, images, PDFs
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── readhub.db
└── README.md
```

## Repository

- [Live Demo](https://ayushasubedi23.github.io/readhub/)
- [GitHub Repository](https://github.com/AyushaSubedi23/readhub)

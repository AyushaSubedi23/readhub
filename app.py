from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import secrets
from functools import wraps


app = Flask(__name__, template_folder="html")
CORS(app)

DATABASE = "readhub.db"

# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row

    # -----------------------------------------------------
    # USERS TABLE
    # -----------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # -----------------------------------------------------
    # SESSIONS TABLE
    # -----------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # -----------------------------------------------------
    # BOOKS TABLE
    # -----------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            cover_url TEXT,
            status TEXT DEFAULT 'wishlist',
            current_page INTEGER DEFAULT 1,
            total_pages INTEGER DEFAULT 0,
            user_id INTEGER
        )
    """)

    # -----------------------------------------------------
    # UPDATE OLD DATABASE
    # -----------------------------------------------------

    columns = [
        row["name"]
        for row in conn.execute(
            "PRAGMA table_info(books)"
        ).fetchall()
    ]

    if "current_page" not in columns:
        conn.execute("""
            ALTER TABLE books
            ADD COLUMN current_page INTEGER DEFAULT 1
        """)

    if "total_pages" not in columns:
        conn.execute("""
            ALTER TABLE books
            ADD COLUMN total_pages INTEGER DEFAULT 0
        """)

    if "user_id" not in columns:
        conn.execute("""
            ALTER TABLE books
            ADD COLUMN user_id INTEGER
        """)

    conn.commit()

    return conn


# =========================================================
# PASSWORD FUNCTIONS
# =========================================================

def hash_password(password):
    return hashlib.sha256(
        password.encode("utf-8")
    ).hexdigest()


def check_password(password, password_hash):
    return hash_password(password) == password_hash


# =========================================================
# AUTHENTICATION
# =========================================================

def get_current_user():

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace(
        "Bearer ",
        "",
        1
    ).strip()

    if not token:
        return None

    conn = get_db_connection()

    user = conn.execute("""
        SELECT users.*
        FROM users
        JOIN sessions
            ON users.id = sessions.user_id
        WHERE sessions.token = ?
    """, (token,)).fetchone()

    conn.close()

    return user


def login_required(function):

    @wraps(function)
    def wrapper(*args, **kwargs):

        user = get_current_user()

        if not user:
            return jsonify({
                "message": "Please login first."
            }), 401

        return function(*args, **kwargs)

    return wrapper


# =========================================================
# FRONTEND ROUTES
# =========================================================

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/explore")
def explore():
    return render_template("explore.html")


@app.route("/library")
def library():
    return render_template("library.html")


@app.route("/exchange")
def exchange():
    return render_template("exchange.html")


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/profile")
def profile():
    return render_template("profile.html")


@app.route("/read")
def read_book():

    pdf_file = request.args.get(
        "file",
        "tgg.pdf"
    )

    book_title = request.args.get(
        "title",
        "ReadHub"
    )

    return render_template(
        "reader.html",
        filename=pdf_file,
        title=book_title
    )


# =========================================================
# API: SIGN UP
# =========================================================

@app.route("/api/signup", methods=["POST"])
def signup():

    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm_password = data.get(
        "confirm_password",
        ""
    )

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not name:
        return jsonify({
            "message": "Name is required."
        }), 400

    if not email:
        return jsonify({
            "message": "Email is required."
        }), 400

    if not password:
        return jsonify({
            "message": "Password is required."
        }), 400

    if password != confirm_password:
        return jsonify({
            "message": "Passwords do not match."
        }), 400

    if len(password) < 6:
        return jsonify({
            "message":
            "Password must be at least 6 characters."
        }), 400

    conn = get_db_connection()

    # -----------------------------------------------------
    # CHECK EXISTING EMAIL
    # -----------------------------------------------------

    existing_user = conn.execute("""
        SELECT id
        FROM users
        WHERE email = ?
    """, (email,)).fetchone()

    if existing_user:

        conn.close()

        return jsonify({
            "message":
            "An account with this email already exists."
        }), 409

    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    password_hash = hash_password(password)

    cursor = conn.execute("""
        INSERT INTO users
        (
            name,
            email,
            password_hash
        )
        VALUES (?, ?, ?)
    """, (
        name,
        email,
        password_hash
    ))

    user_id = cursor.lastrowid

    # -----------------------------------------------------
    # CREATE LOGIN TOKEN
    # -----------------------------------------------------

    token = secrets.token_urlsafe(32)

    conn.execute("""
        INSERT INTO sessions
        (
            user_id,
            token
        )
        VALUES (?, ?)
    """, (
        user_id,
        token
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Account created successfully!",
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }), 201


# =========================================================
# API: LOGIN
# =========================================================

@app.route("/api/login", methods=["POST"])
def api_login():

    data = request.get_json() or {}

    email = data.get(
        "email",
        ""
    ).strip().lower()

    password = data.get(
        "password",
        ""
    )

    if not email or not password:

        return jsonify({
            "message":
            "Email and password are required."
        }), 400

    conn = get_db_connection()

    user = conn.execute("""
        SELECT *
        FROM users
        WHERE email = ?
    """, (email,)).fetchone()

    if not user:

        conn.close()

        return jsonify({
            "message":
            "Invalid email or password."
        }), 401

    if not check_password(
        password,
        user["password_hash"]
    ):

        conn.close()

        return jsonify({
            "message":
            "Invalid email or password."
        }), 401

    # -----------------------------------------------------
    # CREATE NEW SESSION TOKEN
    # -----------------------------------------------------

    token = secrets.token_urlsafe(32)

    conn.execute("""
        INSERT INTO sessions
        (
            user_id,
            token
        )
        VALUES (?, ?)
    """, (
        user["id"],
        token
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Login successful!",
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }), 200


# =========================================================
# API: CURRENT USER
# =========================================================

@app.route("/api/me", methods=["GET"])
@login_required
def get_me():

    user = get_current_user()

    return jsonify({
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }), 200


# =========================================================
# API: LOGOUT
# =========================================================

@app.route("/api/logout", methods=["POST"])
def logout():

    auth_header = request.headers.get(
        "Authorization"
    )

    if not auth_header:
        return jsonify({
            "message": "Already logged out."
        }), 200

    if not auth_header.startswith("Bearer "):
        return jsonify({
            "message": "Already logged out."
        }), 200

    token = auth_header.replace(
        "Bearer ",
        "",
        1
    ).strip()

    conn = get_db_connection()

    conn.execute("""
        DELETE FROM sessions
        WHERE token = ?
    """, (token,))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Logged out successfully!"
    }), 200


# =========================================================
# API: GET PERSONAL LIBRARY
# =========================================================

@app.route("/api/library", methods=["GET"])
@login_required
def get_library():

    user = get_current_user()

    conn = get_db_connection()

    books = conn.execute("""
        SELECT *
        FROM books
        WHERE user_id = ?
        ORDER BY id DESC
    """, (
        user["id"],
    )).fetchall()

    conn.close()

    result = []

    for book in books:

        book_data = dict(book)

        current_page = book_data.get(
            "current_page",
            1
        ) or 1

        total_pages = book_data.get(
            "total_pages",
            0
        ) or 0

        if total_pages > 0:

            progress = round(
                (current_page / total_pages) * 100
            )

            progress = min(
                100,
                max(0, progress)
            )

        else:

            progress = 0

        book_data["progress"] = progress

        result.append(book_data)

    return jsonify(result)


# =========================================================
# API: ADD / UPDATE BOOK
# =========================================================

@app.route("/api/library", methods=["POST"])
@login_required
def add_book():

    user = get_current_user()

    data = request.get_json() or {}

    title = data.get("title")
    author = data.get("author")
    cover_url = data.get("cover_url")

    status = data.get(
        "status",
        "wishlist"
    )

    if not title or not author:

        return jsonify({
            "message":
            "Title and author are required"
        }), 400

    conn = get_db_connection()

    # -----------------------------------------------------
    # ONLY SEARCH THIS USER'S BOOKS
    # -----------------------------------------------------

    existing_book = conn.execute("""
        SELECT id
        FROM books
        WHERE title = ?
        AND user_id = ?
    """, (
        title,
        user["id"]
    )).fetchone()

    if existing_book:

        conn.execute("""
            UPDATE books
            SET author = ?,
                cover_url = ?,
                status = ?
            WHERE id = ?
            AND user_id = ?
        """, (
            author,
            cover_url,
            status,
            existing_book["id"],
            user["id"]
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "message":
            "Book updated successfully!",
            "status": status
        }), 200

    # -----------------------------------------------------
    # ADD BOOK TO THIS USER'S LIBRARY
    # -----------------------------------------------------

    conn.execute("""
        INSERT INTO books
        (
            title,
            author,
            cover_url,
            status,
            current_page,
            total_pages,
            user_id
        )
        VALUES (?, ?, ?, ?, 1, 0, ?)
    """, (
        title,
        author,
        cover_url,
        status,
        user["id"]
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message":
        "Book added successfully!",
        "status": status
    }), 201


# =========================================================
# API: SAVE READING PROGRESS
# =========================================================

@app.route("/api/progress", methods=["POST"])
@login_required
def save_progress():

    user = get_current_user()

    data = request.get_json() or {}

    title = data.get("title")
    current_page = data.get("current_page")
    total_pages = data.get("total_pages")

    if not title:

        return jsonify({
            "message":
            "Book title is required"
        }), 400

    if current_page is None:

        return jsonify({
            "message":
            "Current page is required"
        }), 400

    if total_pages is None:

        return jsonify({
            "message":
            "Total pages is required"
        }), 400

    try:

        current_page = int(current_page)
        total_pages = int(total_pages)

    except (ValueError, TypeError):

        return jsonify({
            "message":
            "Page values must be numbers"
        }), 400

    current_page = max(
        1,
        current_page
    )

    total_pages = max(
        1,
        total_pages
    )

    if current_page > total_pages:
        current_page = total_pages

    conn = get_db_connection()

    # -----------------------------------------------------
    # ONLY FIND THIS USER'S BOOK
    # -----------------------------------------------------

    book = conn.execute("""
        SELECT id
        FROM books
        WHERE title = ?
        AND user_id = ?
    """, (
        title,
        user["id"]
    )).fetchone()

    if not book:

        conn.close()

        return jsonify({
            "message":
            "Book not found in your library"
        }), 404

    conn.execute("""
        UPDATE books
        SET current_page = ?,
            total_pages = ?,
            status = CASE
                WHEN ? >= ? THEN 'completed'
                ELSE 'current'
            END
        WHERE id = ?
        AND user_id = ?
    """, (
        current_page,
        total_pages,
        current_page,
        total_pages,
        book["id"],
        user["id"]
    ))

    conn.commit()
    conn.close()

    progress = round(
        (current_page / total_pages) * 100
    )

    return jsonify({
        "message":
        "Reading progress saved!",
        "title": title,
        "current_page": current_page,
        "total_pages": total_pages,
        "progress": progress
    })


# =========================================================
# API: GET READING PROGRESS
# =========================================================

@app.route(
    "/api/progress/<path:title>",
    methods=["GET"]
)
@login_required
def get_progress(title):

    user = get_current_user()

    conn = get_db_connection()

    book = conn.execute("""
        SELECT
            title,
            current_page,
            total_pages,
            status
        FROM books
        WHERE title = ?
        AND user_id = ?
    """, (
        title,
        user["id"]
    )).fetchone()

    conn.close()

    if not book:

        return jsonify({
            "message":
            "Book not found"
        }), 404

    current_page = book["current_page"] or 1
    total_pages = book["total_pages"] or 0

    if total_pages > 0:

        progress = round(
            (current_page / total_pages) * 100
        )

    else:

        progress = 0

    return jsonify({
        "title": book["title"],
        "current_page": current_page,
        "total_pages": total_pages,
        "progress": progress,
        "status": book["status"]
    })


# =========================================================
# API: DELETE BOOK
# =========================================================

@app.route(
    "/api/library/<int:book_id>",
    methods=["DELETE"]
)
@login_required
def delete_book(book_id):

    user = get_current_user()

    conn = get_db_connection()

    conn.execute("""
        DELETE FROM books
        WHERE id = ?
        AND user_id = ?
    """, (
        book_id,
        user["id"]
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message":
        "Book deleted successfully!"
    })


# =========================================================
# API: UPDATE BOOK STATUS
# =========================================================

@app.route(
    "/api/library/<int:book_id>",
    methods=["PUT"]
)
@login_required
def update_book_status(book_id):

    user = get_current_user()

    data = request.get_json() or {}

    status = data.get("status")

    if status not in [
        "wishlist",
        "current",
        "completed"
    ]:

        return jsonify({
            "message":
            "Invalid status"
        }), 400

    conn = get_db_connection()

    book = conn.execute("""
        SELECT id
        FROM books
        WHERE id = ?
        AND user_id = ?
    """, (
        book_id,
        user["id"]
    )).fetchone()

    if not book:

        conn.close()

        return jsonify({
            "message":
            "Book not found"
        }), 404

    conn.execute("""
        UPDATE books
        SET status = ?
        WHERE id = ?
        AND user_id = ?
    """, (
        status,
        book_id,
        user["id"]
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message":
        "Book status updated successfully!",
        "status": status
    }), 200


# =========================================================
# CLEANUP GATSBY
# =========================================================

@app.route("/api/cleanup-gatsby")
@login_required
def cleanup_gatsby():

    user = get_current_user()

    conn = get_db_connection()

    conn.execute("""
        DELETE FROM books
        WHERE title = 'The Great Gatsby'
        AND user_id = ?
        AND id NOT IN (
            SELECT MIN(id)
            FROM books
            WHERE title = 'The Great Gatsby'
            AND user_id = ?
        )
    """, (
        user["id"],
        user["id"]
    ))

    conn.execute("""
        UPDATE books
        SET status = 'current'
        WHERE title = 'The Great Gatsby'
        AND user_id = ?
    """, (
        user["id"],
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message":
        "Gatsby duplicates cleaned up and status set to current."
    })


# =========================================================
# RUN APP
# =========================================================

if __name__ == "__main__":
    app.run(
        debug=True,
        port=5001
    )
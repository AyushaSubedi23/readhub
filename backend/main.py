from flask import Flask, render_template, request, jsonify
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
app = Flask(__name__, template_folder="html")

DATABASE = "readhub.db"




def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row

    conn.execute("""
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            cover_url TEXT,
            status TEXT DEFAULT 'wishlist',
            current_page INTEGER DEFAULT 1,
            total_pages INTEGER DEFAULT 0
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL
        )
    """)

    columns = [
        row["name"]
        for row in conn.execute("PRAGMA table_info(books)").fetchall()
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

    conn.commit()

    return conn



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



@app.route("/api/library", methods=["GET"])
def get_library():

    conn = get_db_connection()

    books = conn.execute("""
        SELECT *
        FROM books
        ORDER BY id DESC
    """).fetchall()

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




@app.route("/api/library", methods=["POST"])
def add_book():

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
            "message": "Title and author are required"
        }), 400

    conn = get_db_connection()

    existing_book = conn.execute("""
        SELECT id
        FROM books
        WHERE title = ?
    """, (title,)).fetchone()

    if existing_book:

        conn.execute("""
            UPDATE books
            SET author = ?,
                cover_url = ?,
                status = ?
            WHERE id = ?
        """, (
            author,
            cover_url,
            status,
            existing_book["id"]
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "message": "Book updated successfully!",
            "status": status
        }), 200

    conn.execute("""
        INSERT INTO books
        (
            title,
            author,
            cover_url,
            status,
            current_page,
            total_pages
        )
        VALUES (?, ?, ?, ?, 1, 0)
    """, (
        title,
        author,
        cover_url,
        status
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Book added successfully!",
        "status": status
    }), 201




@app.route("/api/progress", methods=["POST"])
def save_progress():

    data = request.get_json() or {}

    title = data.get("title")
    current_page = data.get("current_page")
    total_pages = data.get("total_pages")

    if not title:
        return jsonify({
            "message": "Book title is required"
        }), 400

    if current_page is None:
        return jsonify({
            "message": "Current page is required"
        }), 400

    if total_pages is None:
        return jsonify({
            "message": "Total pages is required"
        }), 400

    try:

        current_page = int(current_page)
        total_pages = int(total_pages)

    except (ValueError, TypeError):

        return jsonify({
            "message": "Page values must be numbers"
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

    book = conn.execute("""
        SELECT id
        FROM books
        WHERE title = ?
    """, (title,)).fetchone()

    if not book:

        conn.close()

        return jsonify({
            "message": "Book not found in library"
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
    """, (
        current_page,
        total_pages,
        current_page,
        total_pages,
        book["id"]
    ))

    conn.commit()
    conn.close()

    progress = round(
        (current_page / total_pages) * 100
    )

    return jsonify({
        "message": "Reading progress saved!",
        "title": title,
        "current_page": current_page,
        "total_pages": total_pages,
        "progress": progress
    })



@app.route("/api/progress/<path:title>", methods=["GET"])
def get_progress(title):

    conn = get_db_connection()

    book = conn.execute("""
        SELECT
            title,
            current_page,
            total_pages,
            status
        FROM books
        WHERE title = ?
    """, (title,)).fetchone()

    conn.close()

    if not book:

        return jsonify({
            "message": "Book not found"
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




@app.route(
    "/api/library/<int:book_id>",
    methods=["DELETE"]
)
def delete_book(book_id):

    conn = get_db_connection()

    conn.execute("""
        DELETE FROM books
        WHERE id = ?
    """, (book_id,))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Book deleted successfully!"
    })

@app.route("/api/library/<int:book_id>", methods=["PUT"])
def update_book_status(book_id):
    data = request.get_json()

    status = data.get("status")

    if status not in ["wishlist", "current", "completed"]:
        return jsonify({
            "message": "Invalid status"
        }), 400

    conn = get_db_connection()

    book = conn.execute("""
        SELECT id FROM books WHERE id = ?
    """, (book_id,)).fetchone()

    if not book:
        conn.close()
        return jsonify({
            "message": "Book not found"
        }), 404

    conn.execute("""
        UPDATE books
        SET status = ?
        WHERE id = ?
    """, (status, book_id))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Book status updated successfully!",
        "status": status
    }), 200



@app.route("/api/cleanup-gatsby")
def cleanup_gatsby():

    conn = get_db_connection()

    conn.execute("""
        DELETE FROM books
        WHERE title = 'The Great Gatsby'
        AND id NOT IN (
            SELECT MIN(id)
            FROM books
            WHERE title = 'The Great Gatsby'
        )
    """)

    conn.execute("""
        UPDATE books
        SET status = 'current'
        WHERE title = 'The Great Gatsby'
    """)

    conn.commit()
    conn.close()

    return jsonify({
        "message":
        "Gatsby duplicates cleaned up and status set to current."
    })


@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")

    if not name or not email or not password:
        return jsonify({"success": False, "message": "All fields are required"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

    if password != confirm_password:
        return jsonify({"success": False, "message": "Passwords do not match"}), 400

    conn = get_db_connection()

    existing = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing:
        conn.close()
        return jsonify({"success": False, "message": "Email already exists"}), 409

    password_hash = generate_password_hash(password)

    cursor = conn.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        (name, email, password_hash)
    )

    user_id = cursor.lastrowid
    token = secrets.token_hex(32)

    conn.execute(
        "INSERT INTO sessions (token, user_id) VALUES (?, ?)",
        (token, user_id)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }), 200


def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    conn = get_db_connection()

    user = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if not user or not check_password_hash(user["password"], password):
        conn.close()
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    token = secrets.token_hex(32)

    conn.execute(
        "INSERT INTO sessions (token, user_id) VALUES (?, ?)",
        (token, user["id"])
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "token": token,
        
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }), 200
@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json() or {}

    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    conn = get_db_connection()

    user = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if not user or not check_password_hash(user["password"], password):
        conn.close()
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    token = secrets.token_hex(32)

    conn.execute(
        "INSERT INTO sessions (token, user_id) VALUES (?, ?)",
        (token, user["id"])
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }), 200



if __name__ == "__main__":
    app.run(
        debug=True,
        port=5001
    )
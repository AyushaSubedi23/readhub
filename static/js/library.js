document.addEventListener("DOMContentLoaded", async () => {

    const currentGrid = document.getElementById("current-reading-grid");
    const wishlistGrid = document.getElementById("wishlist-grid");
    const completedGrid = document.getElementById("completed-grid");

    const token = localStorage.getItem("readhub_token");
    const userId = localStorage.getItem("readhub_user_id");

    // =========================
    // LOGIN CHECK
    // =========================

    if (!token || !userId) {

        const libraryPage =
            document.querySelector(".library-page");

        if (libraryPage) {

            libraryPage.innerHTML = `
                <div style="
                    text-align:center;
                    padding:60px 20px;
                ">
                    <h2>Please login first</h2>

                    <p>
                        You need to login to view your library.
                    </p>

                    <a href="/profile">
                        Go to Profile / Login
                    </a>
                </div>
            `;
        }

        return;
    }


    // =========================
    // BOOK → PDF
    // =========================

    const bookPdfs = {
        "The Great Gatsby": "tgg.pdf",
        "1984": "1984.pdf",
        "Atomic Habits": "atomic.pdf",
        "Pride and Prejudice": "pride.pdf",
        "The Metamorphosis": "metamorphosis.pdf",
        "Frankenstein": "frankenstein.pdf",
        "Jane Eyre": "jane-eyre.pdf",
        "The Adventures of Sherlock Holmes": "sherlock.pdf",
        "Dracula": "dracula.pdf",
        "The Awakening": "awakening.pdf",
        "Wuthering Heights": "wuthering-heights.pdf"
    };


    // =========================
    // OPEN BOOK
    // =========================

    function openBook(book) {

        const pdfFile =
            bookPdfs[book.title];

        if (!pdfFile) {

            alert(
                "PDF for this book is not available yet."
            );

            return;
        }

        window.location.href =
            `/read?file=${encodeURIComponent(pdfFile)}&title=${encodeURIComponent(book.title)}`;
    }


    // =========================
    // UPDATE BOOK STATUS
    // =========================

    async function updateStatus(bookId, status) {

        try {

            const response = await fetch(
                `http://127.0.0.1:5001/api/library/${bookId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Could not update book."
                );

                return;
            }


            console.log(
                "Book updated:",
                data
            );


            // Refresh library
            loadLibrary();


        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            alert(
                "Could not connect to backend."
            );
        }
    }


    // =========================
    // DELETE BOOK
    // =========================

    async function deleteBook(bookId) {

        const confirmed =
            confirm(
                "Remove this book from your library?"
            );

        if (!confirmed) return;


        try {

            const response = await fetch(
                `http://127.0.0.1:5001/api/library/${bookId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Could not delete book."
                );

                return;
            }


            loadLibrary();


        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            alert(
                "Could not connect to backend."
            );
        }
    }


    // =========================
    // LOAD LIBRARY
    // =========================

    async function loadLibrary() {

        try {

            const response =
                await fetch(
                    "http://127.0.0.1:5001/api/library",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            const books =
                await response.json();


            console.log(
                "Library:",
                books
            );


            if (!response.ok) {

                console.error(
                    "Library error:",
                    books
                );

                return;
            }


            renderLibrary(books);


        } catch (error) {

            console.error(
                "Could not connect to backend:",
                error
            );
        }
    }


    // =========================
    // RENDER LIBRARY
    // =========================

    function renderLibrary(books) {

        if (
            !currentGrid ||
            !wishlistGrid ||
            !completedGrid
        ) {
            return;
        }


        currentGrid.innerHTML = "";
        wishlistGrid.innerHTML = "";
        completedGrid.innerHTML = "";


        books.forEach(book => {

            const card =
                document.createElement("article");


            card.className =
                "artsy-book-card";


            // =========================
            // BOOK DETAILS
            // =========================

            let detailsHtml = `
                <h3>${book.title}</h3>

                <p class="author">
                    ${book.author || "Unknown Author"}
                </p>
            `;


            // =========================
            // CURRENT READING
            // =========================

            if (book.status === "current") {

                const savedPage =
                    parseInt(
                        localStorage.getItem(
                            `readhub_page_${book.title}`
                        )
                    ) || 1;


                const totalPages =
                    parseInt(
                        localStorage.getItem(
                            `readhub_total_${book.title}`
                        )
                    ) || 100;


                const percent =
                    Math.min(
                        100,
                        Math.max(
                            0,
                            Math.round(
                                (savedPage / totalPages) * 100
                            )
                        )
                    );


                detailsHtml += `

                    <div style="margin-top:12px;">

                        <div style="
                            display:flex;
                            justify-content:space-between;
                            font-size:12px;
                            color:#4a5568;
                            margin-bottom:5px;
                            font-weight:500;
                        ">

                            <span>
                                Continue reading
                            </span>

                            <span style="
                                color:#627563;
                                font-weight:600;
                            ">
                                ${percent}%
                            </span>

                        </div>


                        <div style="
                            background:#e2e8f0;
                            border-radius:999px;
                            height:6px;
                            width:100%;
                            overflow:hidden;
                        ">

                            <div style="
                                background:#627563;
                                height:100%;
                                width:${percent}%;
                                transition:width .3s ease;
                            "></div>

                        </div>


                        <div style="
                            font-size:11px;
                            color:#718096;
                            margin-top:5px;
                        ">
                            Page ${savedPage} of ${totalPages}
                        </div>

                    </div>

                `;


                // ACTION BUTTONS

                detailsHtml += `

                    <div style="
                        display:flex;
                        gap:8px;
                        margin-top:14px;
                        flex-wrap:wrap;
                    ">

                        <button
                            class="library-action-btn complete-btn"
                            data-id="${book.id}"
                        >
                            ✓ Mark Completed
                        </button>

                    </div>

                `;
            }


            // =========================
            // WISHLIST
            // =========================

            else if (book.status === "wishlist") {

                detailsHtml += `

                    <span
                        class="badge wishlist-badge"
                        style="
                            margin-top:8px;
                            display:inline-block;
                        "
                    >
                        Want to Read
                    </span>

                    <div style="
                        display:flex;
                        gap:8px;
                        margin-top:14px;
                        flex-wrap:wrap;
                    ">

                        <button
                            class="library-action-btn start-btn"
                            data-id="${book.id}"
                        >
                            ▶ Start Reading
                        </button>

                        <button
                            class="library-action-btn delete-btn"
                            data-id="${book.id}"
                        >
                            Remove
                        </button>

                    </div>

                `;
            }


            // =========================
            // COMPLETED
            // =========================

            else if (book.status === "completed") {

                detailsHtml += `

                    <span
                        class="badge completed-badge"
                        style="
                            margin-top:8px;
                            display:inline-block;
                        "
                    >
                        ✓ Completed
                    </span>

                    <div style="
                        margin-top:14px;
                    ">

                        <button
                            class="library-action-btn delete-btn"
                            data-id="${book.id}"
                        >
                            Remove
                        </button>

                    </div>

                `;
            }


            // =========================
            // CARD HTML
            // =========================

            card.innerHTML = `

                <div class="artsy-cover-wrapper">

                    <img
                        src="${book.cover_url || '/static/images/hero.jpeg'}"
                        alt="${book.title}"
                    >

                </div>


                <div class="artsy-details">

                    ${detailsHtml}

                </div>

            `;


            // =========================
            // OPEN BOOK
            // =========================

            card.style.cursor =
                "pointer";


            card.addEventListener(
                "click",
                (event) => {

                    // Don't open reader when
                    // clicking a button

                    if (
                        event.target.closest("button")
                    ) {
                        return;
                    }

                    if (
                        book.status === "current"
                    ) {
                        openBook(book);
                    }
                }
            );


            // =========================
            // BUTTONS
            // =========================

            const completeBtn =
                card.querySelector(
                    ".complete-btn"
                );


            if (completeBtn) {

                completeBtn.addEventListener(
                    "click",
                    () => {

                        updateStatus(
                            book.id,
                            "completed"
                        );

                    }
                );
            }


            const startBtn =
                card.querySelector(
                    ".start-btn"
                );


            if (startBtn) {

                startBtn.addEventListener(
                    "click",
                    () => {

                        updateStatus(
                            book.id,
                            "current"
                        );

                    }
                );
            }


            const deleteBtn =
                card.querySelector(
                    ".delete-btn"
                );


            if (deleteBtn) {

                deleteBtn.addEventListener(
                    "click",
                    () => {

                        deleteBook(
                            book.id
                        );

                    }
                );
            }


            // =========================
            // PLACE CARD
            // =========================

            if (
                book.status === "current"
            ) {

                currentGrid.appendChild(card);

            }

            else if (
                book.status === "completed"
            ) {

                completedGrid.appendChild(card);

            }

            else {

                wishlistGrid.appendChild(card);

            }

        });
    }


    // =========================
    // INITIALIZE
    // =========================

    loadLibrary();

});
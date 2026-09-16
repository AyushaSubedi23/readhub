document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("exploreSearch");
    const tagButtons = document.querySelectorAll(".tag-btn");

    const modal = document.getElementById("bookModal");
    const closeModal = document.getElementById("closeModal");
    const modalCover = document.getElementById("modalCover");
    const modalTitle = document.getElementById("modalTitle");
    const modalAuthor = document.getElementById("modalAuthor");
    const modalRating = document.getElementById("modalRating");
    const modalDescription = document.getElementById("modalDescription");
    const readBookBtn = document.getElementById("readBookBtn");
    const addWishlistBtn = document.getElementById("addWishlistBtn");

    const pdfModal = document.getElementById("pdfModal");
    const closePdfModal = document.getElementById("closePdfModal");
    const pdfIframe = document.getElementById("pdfIframe");
    const homeFullscreenBtn =
    document.getElementById("homeFullscreenBtn");

    let activeGenre = "all";
    let bookCards = document.querySelectorAll(".book-card");

    // Track the currently selected book
    let currentPdf = "";
    let currentTitle = "Unknown Book";

    // =========================
    // SEARCH & FILTER
    // =========================

    function filterBooks() {
        const query = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        bookCards.forEach((card) => {
            const title = card.dataset.title
                ? card.dataset.title.toLowerCase()
                : "";

            const author = card.dataset.author
                ? card.dataset.author.toLowerCase()
                : "";

            const genre = card.dataset.genre
                ? card.dataset.genre.toLowerCase()
                : "";

            const matchesSearch =
                title.includes(query) || author.includes(query);

            const matchesGenre =
                activeGenre === "all" || genre === activeGenre;

            card.style.display =
                matchesSearch && matchesGenre ? "block" : "none";
        });
    }

    // =========================
    // BOOK MODAL
    // =========================

    function addModalListeners() {
        bookCards.forEach((card) => {
            card.addEventListener("click", (event) => {

                // Ignore Add to Library button
                if (event.target.classList.contains("add-library-btn")) {
                    return;
                }

                // Get information from selected book
                currentPdf = card.getAttribute("data-pdf") || "";
                currentTitle = card.dataset.title || "Unknown Book";

                const image = card.querySelector(".book-cover img");
                const rating = card.querySelector(".rating");

                if (modalCover && image) {
                    modalCover.src = image.src;
                }

                if (modalTitle) {
                    modalTitle.innerText = currentTitle;
                }

                if (modalAuthor) {
                    modalAuthor.innerText =
                        `By ${card.dataset.author || ""}`;
                }

                if (modalRating) {
                    modalRating.innerText =
                        rating ? rating.innerText : "No rating";
                }

                if (modalDescription) {
                    modalDescription.innerText =
                        card.dataset.description ||
                        "No description available.";
                }

                if (modal) {
                    modal.style.display = "flex";
                }
            });
        });
    }

    // =========================
    // SEARCH
    // =========================

    if (searchInput) {
        searchInput.addEventListener("input", filterBooks);
    }

    // =========================
    // GENRE FILTERS
    // =========================

    tagButtons.forEach((button) => {
        button.addEventListener("click", () => {
            tagButtons.forEach((btn) => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            activeGenre =
                button.dataset.genre.toLowerCase();

            filterBooks();
        });
    });

    // =========================
// ADD TO WISHLIST
// =========================

if (addWishlistBtn) {

    addWishlistBtn.addEventListener("click", async () => {

        const token =
            localStorage.getItem("readhub_token");

        const userId =
            localStorage.getItem("readhub_user_id");

        if (!token || !userId) {
            alert("Please login first.");
            return;
        }

        if (!currentTitle) {
            alert("Please select a book first.");
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:5001/api/library",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        title: currentTitle,

                        author: modalAuthor
                            ? modalAuthor.innerText.replace("By ", "")
                            : "Unknown Author",

                        cover_url: modalCover
                            ? modalCover.src
                            : "",

                        status: "wishlist"
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                alert("♡ Book added to your wishlist!");

                addWishlistBtn.innerText =
                    "✓ Added to Wishlist";

                addWishlistBtn.disabled = true;

            } else {

                alert(
                    data.message ||
                    "Could not add book to wishlist."
                );
            }

        } catch (error) {

            console.error(
                "Wishlist error:",
                error
            );

            alert(
                "Could not connect to backend."
            );
        }
    });
}

    // =========================
    // CLOSE BOOK DETAIL MODAL
    // =========================

    if (closeModal) {
        closeModal.addEventListener("click", () => {
            if (modal) {
                modal.style.display = "none";
            }
        });
    }

    // =========================
    // CLOSE MODALS BY CLICKING OUTSIDE
    // =========================

    window.addEventListener("click", (event) => {

        if (event.target === modal) {
            modal.style.display = "none";
        }

        if (event.target === pdfModal) {
            pdfModal.style.display = "none";

            if (pdfIframe) {
                pdfIframe.src = "";
            }
        }
    });

    // =========================
    // SAVE READING PROGRESS
    // =========================

    function saveProgress(bookTitle) {
        const token = localStorage.getItem("readhub_token");
        const userId = localStorage.getItem("readhub_user_id");

        if (!token || !userId) {
            alert("Please log in to save your reading progress!");
            window.location.href = "/login";
            return;
        }

        const progressData = {
            title: bookTitle,
            lastOpened: new Date().toISOString(),
            completed: false
        };

        localStorage.setItem(
            `progress_${bookTitle}`,
            JSON.stringify(progressData)
        );
    }

    // =========================
    // READ BOOK
    // =========================

    if (readBookBtn) {

        readBookBtn.addEventListener("click", async () => {

            const token = localStorage.getItem("readhub_token");
            const userId = localStorage.getItem("readhub_user_id");

            if (!token || !userId) {
                alert("Please login first.");
                return;
            }

            // Check if this book actually has a PDF
            if (!currentPdf) {
                alert("This book is not available to read yet.");
                return;
            }

            // Close detail modal
            if (modal) {
                modal.style.display = "none";
            }

            // Open PDF
            if (pdfIframe) {
                pdfIframe.src = `/static/pdf/${currentPdf}`;
            }

            if (pdfModal) {
                pdfModal.style.display = "flex";
            }

            // Save reading progress
            saveProgress(currentTitle);

            // =========================
            // SAVE BOOK AS CURRENT READING
            // =========================

            try {

                const response = await fetch(
                    "http://127.0.0.1:5001/api/library",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            title: currentTitle,

                            author: modalAuthor
                                ? modalAuthor.innerText.replace("By ", "")
                                : "Unknown Author",

                            cover_url: modalCover
                                ? modalCover.src
                                : "",

                            status: "current"
                        })
                    }
                );

                const data = await response.json();

                console.log(
                    "Book saved to library:",
                    data
                );

                if (!response.ok) {
                    console.error(
                        "Could not save book:",
                        data
                    );
                }

            } catch (error) {

                console.error(
                    "Could not connect to library backend:",
                    error
                );
            }
        });
    }

    // =========================
    // CLOSE PDF READER
    // =========================

    if (closePdfModal) {

        closePdfModal.addEventListener("click", () => {

            if (pdfModal) {
                pdfModal.style.display = "none";
            }

            if (pdfIframe) {
                pdfIframe.src = "";
            }
        });
    }
    // =========================
// FULLSCREEN PDF READER
// =========================

if (homeFullscreenBtn) {

    homeFullscreenBtn.addEventListener("click", async () => {

        const pdfContent =
            document.getElementById("pdfModalContent");

        if (!pdfContent) {
            console.error("PDF modal content not found.");
            return;
        }

        try {

            if (!document.fullscreenElement) {

                await pdfContent.requestFullscreen();

                homeFullscreenBtn.textContent =
                    "⛶ Exit Full Screen";

            } else {

                await document.exitFullscreen();

                homeFullscreenBtn.textContent =
                    "⛶ Full Screen";
            }

        } catch (error) {

            console.error(
                "Fullscreen error:",
                error
            );

        }

    });

}
document.addEventListener("fullscreenchange", () => {

    if (!homeFullscreenBtn) return;

    homeFullscreenBtn.textContent =
        document.fullscreenElement
            ? "⛶ Exit Full Screen"
            : "⛶ Full Screen";

});

    // =========================
    // INITIALIZE
    // =========================

    addModalListeners();
    filterBooks();

    // =========================
    // ADD BOOK TO LIBRARY
    // =========================

    const libraryButton =
        document.querySelector(".add-library-btn");

    if (libraryButton) {

        libraryButton.addEventListener(
            "click",
            async (event) => {

                event.stopPropagation();

                const token =
                    localStorage.getItem("readhub_token");

                const userId =
                    localStorage.getItem("readhub_user_id");

                if (!token || !userId) {
                    alert("Please login first.");
                    return;
                }

                try {

                    const response = await fetch(
                        "http://127.0.0.1:5001/api/library",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                title: currentTitle,
                                author: modalAuthor
                                    ? modalAuthor.innerText.replace("By ", "")
                                    : "Unknown Author",
                                cover_url: modalCover
                                    ? modalCover.src
                                    : "",
                                status: "wishlist"
                            })
                        }
                    );

                    const data =
                        await response.json();

                    console.log(
                        "Library response:",
                        data
                    );

                    if (response.ok) {

                        alert(
                            "Book was added to your library!"
                        );

                    } else {

                        alert(
                            data.message ||
                            "Could not add book."
                        );
                    }

                } catch (error) {

                    console.error(
                        "Library error:",
                        error
                    );

                    alert(
                        "Could not connect to backend."
                    );
                }
            }
        );
    }

    // =========================
    // LOGIN
    // =========================

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            (e) => {

                e.preventDefault();

                const email =
                    document.getElementById(
                        "login-email"
                    ).value;

                const existingUser =
                    JSON.parse(
                        localStorage.getItem(
                            "readhub_user"
                        )
                    );

                const userData =
                    existingUser || {
                        id: "1",
                        email: email,
                        name: email.split("@")[0],
                        age: "",
                        bio: "",
                        avatar: ""
                    };

                localStorage.setItem(
                    "readhub_user",
                    JSON.stringify(userData)
                );

                localStorage.setItem(
                    "readhub_token",
                    "mock_jwt_token_123"
                );

                localStorage.setItem(
                    "readhub_user_id",
                    userData.id
                );

                if (typeof renderProfile === "function") {
                    renderProfile();
                }
            }
        );
    }
});
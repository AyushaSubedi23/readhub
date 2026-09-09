document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("exploreSearch");
    const tagButtons = document.querySelectorAll(".tag-btn");
    const bookCards = document.querySelectorAll(".book-card");

    // =========================
    // BOOK DETAIL MODAL
    // =========================

    const modal = document.getElementById("bookModal");
    const closeModal = document.getElementById("closeModal");

    const modalCover = document.getElementById("modalCover");
    const modalTitle = document.getElementById("modalTitle");
    const modalAuthor = document.getElementById("modalAuthor");
    const modalRating = document.getElementById("modalRating");
    const modalDescription = document.getElementById("modalDescription");

    const readBookBtn = document.getElementById("readBookBtn");
    const addWishlistBtn = document.getElementById("addWishlistBtn");


    // =========================
    // PDF MODAL
    // =========================

    const pdfModal = document.getElementById("pdfModal");
    const closePdfModal = document.getElementById("closePdfModal");
    const pdfIframe = document.getElementById("pdfIframe");
    const homeFullscreenBtn = document.getElementById("homeFullscreenBtn");


    // =========================
    // CURRENT BOOK
    // =========================

    let currentPdf = "";
    let currentTitle = "";
    let currentAuthor = "";
    let currentCover = "";


    let activeGenre = "all";


    // =========================
    // SEARCH + FILTER
    // =========================

    function filterBooks() {

        const query = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        bookCards.forEach((card) => {

            const title =
                card.dataset.title
                    ? card.dataset.title.toLowerCase()
                    : "";

            const author =
                card.dataset.author
                    ? card.dataset.author.toLowerCase()
                    : "";

            const genre =
                card.dataset.genre
                    ? card.dataset.genre.toLowerCase()
                    : "";


            const matchesSearch =
                title.includes(query) ||
                author.includes(query);


            const matchesGenre =
                activeGenre === "all" ||
                genre === activeGenre;


            card.style.display =
                matchesSearch && matchesGenre
                    ? "block"
                    : "none";

        });

    }


    // =========================
    // SEARCH
    // =========================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterBooks
        );

    }


    // =========================
    // GENRE FILTER
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
    // BOOK CARD CLICK
    // =========================

    bookCards.forEach((card) => {

        card.addEventListener("click", () => {

            const image =
                card.querySelector(".book-cover img");

            const rating =
                card.querySelector(".rating");


            currentPdf =
                card.dataset.pdf || "";

            currentTitle =
                card.dataset.title ||
                card.querySelector("h3")?.innerText ||
                "Unknown Book";

            currentAuthor =
                card.dataset.author ||
                card.querySelector("p")?.innerText ||
                "Unknown Author";

            currentCover =
                image ? image.src : "";


            // Fill modal

            if (modalCover) {
                modalCover.src = currentCover;
            }

            if (modalTitle) {
                modalTitle.innerText = currentTitle;
            }

            if (modalAuthor) {
                modalAuthor.innerText =
                    `By ${currentAuthor}`;
            }

            if (modalRating) {
                modalRating.innerText =
                    rating
                        ? rating.innerText
                        : "No rating";
            }

            if (modalDescription) {
                modalDescription.innerText =
                    card.dataset.description ||
                    "No description available.";
            }


            // Open details modal

            if (modal) {
                modal.style.display = "flex";
            }

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

        // Check login
        if (!token || !userId) {
            alert("Please login first.");
            return;
        }

        // Check book
        if (!currentTitle || !currentAuthor) {
            alert("Could not identify this book.");
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
                        author: currentAuthor,
                        cover_url: currentCover,
                        status: "wishlist"
                    })
                }
            );

            const result = await response.json();

            if (response.ok) {

                alert("♡ Added to your Wishlist!");

                // Change button appearance
                addWishlistBtn.innerText = "✓ Added to Wishlist";
                addWishlistBtn.disabled = true;

            } else {

                alert(
                    result.message ||
                    "Could not add book to wishlist."
                );

            }

        } catch (error) {

            console.error(
                "Wishlist error:",
                error
            );

            alert(
                "Could not connect to the backend."
            );

        }

    });

}


    // =========================
    // CLOSE BOOK MODAL
    // =========================

    if (closeModal) {

        closeModal.addEventListener("click", () => {

            if (modal) {
                modal.style.display = "none";
            }

        });

    }


    // =========================
    // READ BOOK
    // =========================

    if (readBookBtn) {

        readBookBtn.addEventListener("click", async () => {

            // Check login

            const token =
                localStorage.getItem("readhub_token");

            const userId =
                localStorage.getItem("readhub_user_id");


            if (!token || !userId) {

                alert("Please login first.");

                return;

            }


            // Check PDF

            if (!currentPdf) {

                alert(
                    "The PDF for this book is not available yet."
                );

                return;

            }


            // Close details modal

            if (modal) {
                modal.style.display = "none";
            }


            // Save current book locally

            localStorage.setItem(
                "readhub_current_book",
                currentTitle
            );


            // =========================
            // OPEN READER PAGE
            // =========================

            window.location.href =
                `/read?file=${encodeURIComponent(currentPdf)}&title=${encodeURIComponent(currentTitle)}`;


            // =========================
            // SAVE TO LIBRARY
            // =========================

            try {

                await fetch(
                    "http://127.0.0.1:5001/api/library",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            title: currentTitle,

                            author: currentAuthor,

                            cover_url: currentCover,

                            status: "current"

                        })

                    }
                );

            } catch (error) {

                console.error(
                    "Could not save book to library:",
                    error
                );

            }

        });

    }


    // =========================
    // CLOSE PDF MODAL
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
    // PDF FULLSCREEN
    // =========================

    if (homeFullscreenBtn) {

        homeFullscreenBtn.addEventListener(
            "click",
            async () => {

                const pdfContent =
                    document.getElementById(
                        "pdfModalContent"
                    );

                if (!pdfContent) {
                    return;
                }


                try {

                    if (!document.fullscreenElement) {

                        await pdfContent.requestFullscreen();

                    } else {

                        await document.exitFullscreen();

                    }

                } catch (error) {

                    console.error(
                        "Fullscreen error:",
                        error
                    );

                }

            }
        );

    }


    // =========================
    // CLICK OUTSIDE MODALS
    // =========================

    window.addEventListener("click", (event) => {

        if (
            modal &&
            event.target === modal
        ) {

            modal.style.display = "none";

        }


        if (
            pdfModal &&
            event.target === pdfModal
        ) {

            pdfModal.style.display = "none";

            if (pdfIframe) {
                pdfIframe.src = "";
            }

        }

    });


    // =========================
    // INITIALIZE
    // =========================

    filterBooks();

});
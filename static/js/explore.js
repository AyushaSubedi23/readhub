document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // ELEMENTS
    // =========================

    const searchInput = document.getElementById("exploreSearch");
    const tagButtons = document.querySelectorAll(".tag-btn");
    const bookCards = document.querySelectorAll(".book-card");

    // Book detail modal
    const modal = document.getElementById("bookModal");
    const closeModal = document.getElementById("closeModal");

    const modalCover = document.getElementById("modalCover");
    const modalTitle = document.getElementById("modalTitle");
    const modalAuthor = document.getElementById("modalAuthor");
    const modalRating = document.getElementById("modalRating");
    const modalDescription = document.getElementById("modalDescription");

    const readBookBtn = document.getElementById("readBookBtn");
    const addWishlistBtn = document.getElementById("addWishlistBtn");

    // PDF modal
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

            // Get book information
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


            // =========================
            // FILL MODAL
            // =========================

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


            // Reset wishlist button
            if (addWishlistBtn) {

                const wishlist =
                    JSON.parse(
                        localStorage.getItem("readhub_wishlist") || "[]"
                    );

                const alreadyAdded =
                    wishlist.some(
                        book => book.title === currentTitle
                    );

                if (alreadyAdded) {
                    addWishlistBtn.innerText =
                        "✓ Added to Wishlist";

                    addWishlistBtn.disabled = true;

                } else {

                    addWishlistBtn.innerText =
                        "♡ Add to Wishlist";

                    addWishlistBtn.disabled = false;

                }
            }


            // Open modal
            if (modal) {
                modal.style.display = "flex";
            }

        });

    });


    // =========================
    // ADD TO WISHLIST
    // =========================

    if (addWishlistBtn) {

        addWishlistBtn.addEventListener("click", () => {

            if (!currentTitle || !currentAuthor) {

                alert("Could not identify this book.");

                return;
            }


            // Get existing wishlist
            let wishlist =
                JSON.parse(
                    localStorage.getItem("readhub_wishlist") || "[]"
                );


            // Check if already exists
            const alreadyExists =
                wishlist.some(
                    book => book.title === currentTitle
                );

            if (alreadyExists) {

                alert("This book is already in your Wishlist.");

                return;
            }


            // Add book
            const book = {
                title: currentTitle,
                author: currentAuthor,
                cover: currentCover,
                status: "wishlist"
            };

            wishlist.push(book);


            // Save to browser
            localStorage.setItem(
                "readhub_wishlist",
                JSON.stringify(wishlist)
            );


            // Update button
            addWishlistBtn.innerText =
                "✓ Added to Wishlist";

            addWishlistBtn.disabled = true;


            alert("♡ Added to your Wishlist!");

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

        readBookBtn.addEventListener("click", () => {

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


            // Save current book
            localStorage.setItem(
                "readhub_current_book",
                currentTitle
            );


            // Save current book information
            const currentBook = {
                title: currentTitle,
                author: currentAuthor,
                cover: currentCover,
                pdf: currentPdf,
                status: "current"
            };

            localStorage.setItem(
                "readhub_current_book_data",
                JSON.stringify(currentBook)
            );


            // =========================
            // OPEN READER PAGE
            // =========================

            window.location.href =
                `reader.html?file=${encodeURIComponent(currentPdf)}&title=${encodeURIComponent(currentTitle)}`;

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
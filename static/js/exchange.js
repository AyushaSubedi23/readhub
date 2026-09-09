document.addEventListener("DOMContentLoaded", () => {
    // Load community listings
    let communityListings = JSON.parse(localStorage.getItem("readhub_community")) || [
        {
            id: 1,
            title: "Sapiens: A Brief History",
            author: "Yuval N. Harari",
            owner: "Alex M.",
            condition: "Like New",
            cover: "images/books/sapiens.jpeg",
            isMine: false
        },
        {
            id: 2,
            title: "Dune",
            author: "Frank Herbert",
            owner: "Sarah K.",
            condition: "Good",
            cover: "images/books/dune.jpeg",
            isMine: false
        }
    ];

    const communityGrid = document.getElementById("community-grid");
    const myListingsGrid = document.getElementById("my-listings-grid");
    const form = document.getElementById("list-book-form");

    function renderListings() {
        if (!communityGrid || !myListingsGrid) return;

        communityGrid.innerHTML = "";
        myListingsGrid.innerHTML = "";

        communityListings.forEach((item, index) => {
            const card = document.createElement("article");
            card.className = "exchange-card";

            if (item.isMine) {
                card.innerHTML = `
                    <div>
                        <img src="${item.cover || '/static/images/hero.jpeg'}" alt="${item.title}">
                        <h3>${item.title}</h3>
                        <p class="owner">Condition: <strong>${item.condition}</strong></p>
                    </div>
                    <button class="delete-btn" data-index="${index}">Remove Listing</button>
                `;
                myListingsGrid.appendChild(card);
            } else {
                card.innerHTML = `
                    <div>
                        <img src="${item.cover || '/static/images/hero.jpeg'}" alt="${item.title}">
                        <h3>${item.title}</h3>
                        <p class="owner">Offered by: <strong>${item.owner}</strong> (${item.condition})</p>
                    </div>
                    <button class="trade-btn" data-index="${index}">Request Trade</button>
                `;
                communityGrid.appendChild(card);
            }
        });

        // Event listeners for community trade requests
        document.querySelectorAll(".trade-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                const book = communityListings[index];
                alert(`Trade request sent to ${book.owner} for "${book.title}"!`);
            });
        });

        // Event listeners for deleting user's own listings
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                communityListings.splice(index, 1);
                localStorage.setItem("readhub_community", JSON.stringify(communityListings));
                renderListings();
            });
        });
    }

    // Handle form submission with or without an uploaded image file
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const fileInput = document.getElementById("book-cover-file");
            const file = fileInput && fileInput.files ? fileInput.files[0] : null;

            const createNewBook = (coverUrl) => {
                const newBook = {
                    id: Date.now(),
                    title: document.getElementById("book-title").value,
                    author: document.getElementById("book-author").value,
                    owner: "You",
                    condition: document.getElementById("book-condition").value,
                    cover: coverUrl || '/static/images/hero.jpeg',
                    isMine: true
                };

                communityListings.unshift(newBook);
                localStorage.setItem("readhub_community", JSON.stringify(communityListings));
                
                form.reset();
                renderListings();
            };

            if (file) {
                const reader = new FileReader();
                reader.onload = function(uploadEvent) {
                    createNewBook(uploadEvent.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                createNewBook(null);
            }
        });
    }

    renderListings();
});
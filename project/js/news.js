const newsFilters = document.querySelectorAll(".news-filter");
const newsCards = document.querySelectorAll(".news-page-card");

newsFilters.forEach(button => {
    button.addEventListener("click", () => {

        newsFilters.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const filterValue = button.getAttribute("data-filter");

        newsCards.forEach(card => {
            const category = card.getAttribute("data-category");

            if (filterValue === "all" || filterValue === category) {
                card.classList.remove("hide");
            } else {
                card.classList.add("hide");
            }
        });

    });
});

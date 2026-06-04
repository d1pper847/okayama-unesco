const filterButtons = document.querySelectorAll(".filter-btn");
const activityItems = document.querySelectorAll(".activity-item");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {

        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const filterValue = button.getAttribute("data-filter");

        activityItems.forEach(item => {
            const category = item.getAttribute("data-category");

            if (filterValue === "all" || filterValue === category) {
                item.classList.remove("hide");
            } else {
                item.classList.add("hide");
            }
        });

    });
});

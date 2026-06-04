document.addEventListener("DOMContentLoaded", () => {

    document.body.classList.add("site-loaded");

    const yearTargets = document.querySelectorAll("[data-current-year]");
    const currentYear = new Date().getFullYear();

    yearTargets.forEach(target => {
        target.textContent = currentYear;
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            const mobileMenu = document.getElementById("mobile-menu");

            if (mobileMenu) {
                mobileMenu.classList.remove("active");
            }
        }
    });

    document.querySelectorAll("img").forEach(image => {
        image.addEventListener("error", () => {
            image.style.background = "#e8eee9";
            image.style.objectFit = "cover";
            image.alt = image.alt || "Image not available";
        });
    });

});

const mapPlaces = {
    okayama: {
        category: "Culture",
        title: "Okayama Cultural Center",
        description: "A central place for cultural learning, community events, and local educational activities.",
        area: "Okayama City",
        type: "Culture / Learning"
    },

    kurashiki: {
        category: "Heritage",
        title: "Kurashiki Heritage Area",
        description: "A historical area where visitors can experience traditional streets, local stories, and cultural heritage.",
        area: "Kurashiki",
        type: "Heritage / Culture"
    },

    learning: {
        category: "Education",
        title: "Community Learning Space",
        description: "A place for workshops, ESD programs, student activities, and community-based learning.",
        area: "Northern Okayama",
        type: "Education / ESD"
    },

    nature: {
        category: "Environment",
        title: "Sustainable Nature Area",
        description: "A local nature area connected to environmental learning, sustainability, and community action.",
        area: "Okayama Area",
        type: "Environment / SDGs"
    }
};

document.addEventListener("DOMContentLoaded", () => {

    const pins = document.querySelectorAll(".map-pin");

    const category = document.getElementById("place-category");
    const title = document.getElementById("place-title");
    const description = document.getElementById("place-description");
    const area = document.getElementById("place-area");
    const type = document.getElementById("place-type");

    if (!pins.length || !category || !title || !description || !area || !type) {
        return;
    }

    pins.forEach(pin => {
        pin.addEventListener("click", () => {

            pins.forEach(item => item.classList.remove("active"));
            pin.classList.add("active");

            const placeKey = pin.getAttribute("data-place");
            const place = mapPlaces[placeKey];

            if (!place) {
                return;
            }

            category.textContent = place.category;
            title.textContent = place.title;
            description.textContent = place.description;
            area.textContent = place.area;
            type.textContent = place.type;

        });
    });

});

const mapPlaceKeys = {
    okayama: {
        category: "map_place_okayama_category",
        title: "map_place_okayama_title",
        description: "map_place_okayama_desc",
        area: "map_place_okayama_area",
        type: "map_place_okayama_type"
    },
    kurashiki: {
        category: "map_place_kurashiki_category",
        title: "map_place_kurashiki_title",
        description: "map_place_kurashiki_desc",
        area: "map_place_kurashiki_area",
        type: "map_place_kurashiki_type"
    },
    learning: {
        category: "map_place_learning_category",
        title: "map_place_learning_title",
        description: "map_place_learning_desc",
        area: "map_place_learning_area",
        type: "map_place_learning_type"
    },
    nature: {
        category: "map_place_nature_category",
        title: "map_place_nature_title",
        description: "map_place_nature_desc",
        area: "map_place_nature_area",
        type: "map_place_nature_type"
    }
};

const mapFallback = {
    map_place_okayama_category: "Culture",
    map_place_okayama_title: "Okayama Cultural Center",
    map_place_okayama_desc: "A central place for cultural learning, community events, and local educational activities.",
    map_place_okayama_area: "Okayama City",
    map_place_okayama_type: "Culture / Learning",
    map_place_kurashiki_category: "Heritage",
    map_place_kurashiki_title: "Kurashiki Heritage Area",
    map_place_kurashiki_desc: "A historical area where visitors can experience traditional streets, local stories, and cultural heritage.",
    map_place_kurashiki_area: "Kurashiki",
    map_place_kurashiki_type: "Heritage / Culture",
    map_place_learning_category: "Education",
    map_place_learning_title: "Community Learning Space",
    map_place_learning_desc: "A place for workshops, ESD programs, student activities, and community-based learning.",
    map_place_learning_area: "Northern Okayama",
    map_place_learning_type: "Education / ESD",
    map_place_nature_category: "Environment",
    map_place_nature_title: "Sustainable Nature Area",
    map_place_nature_desc: "A local nature area connected to environmental learning, sustainability, and community action.",
    map_place_nature_area: "Okayama Area",
    map_place_nature_type: "Environment / SDGs"
};

let activePlaceKey = "okayama";

function mapText(key){
    return window.t ? window.t(key, mapFallback[key] || key) : (mapFallback[key] || key);
}

function renderMapPlace(placeKey){
    const place = mapPlaceKeys[placeKey];
    if(!place) return;

    const category = document.getElementById("place-category");
    const title = document.getElementById("place-title");
    const description = document.getElementById("place-description");
    const area = document.getElementById("place-area");
    const type = document.getElementById("place-type");

    if(category) category.textContent = mapText(place.category);
    if(title) title.textContent = mapText(place.title);
    if(description) description.textContent = mapText(place.description);
    if(area) area.textContent = mapText(place.area);
    if(type) type.textContent = mapText(place.type);
}

document.addEventListener("DOMContentLoaded", () => {
    const pins = document.querySelectorAll(".map-pin");
    if (!pins.length) return;

    pins.forEach(pin => {
        pin.addEventListener("click", () => {
            pins.forEach(item => item.classList.remove("active"));
            pin.classList.add("active");
            activePlaceKey = pin.getAttribute("data-place") || "okayama";
            renderMapPlace(activePlaceKey);
        });
    });

    renderMapPlace(activePlaceKey);
});

document.addEventListener("languageChanged", () => renderMapPlace(activePlaceKey));

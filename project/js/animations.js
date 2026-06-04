const revealTargets = document.querySelectorAll(
    "section, .activity-card, .news-card, .news-page-card, .activity-item, .place-item, .featured-news, .place-card, .contact-form-card, .contact-info-card, .faq-item"
);

revealTargets.forEach((target, index) => {
    target.classList.add("reveal");

    if (index % 3 === 1) {
        target.classList.add("reveal-delay-1");
    }

    if (index % 3 === 2) {
        target.classList.add("reveal-delay-2");
    }
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold:0.12
});

revealTargets.forEach(target => {
    revealObserver.observe(target);
});

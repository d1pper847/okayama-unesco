const navbar = document.getElementById("navbar");
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

if (navbar) {
    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 40);
    });
}

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("active");
    });

    mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => mobileMenu.classList.remove("active"));
    });
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(link => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) link.classList.add("active");
});

function refreshAuthNavigation(){
    const isLoggedIn = localStorage.getItem("okayamaUnescoLoggedIn") === "true";
    const loginLinks = document.querySelectorAll('a[href="login.html"]');

    loginLinks.forEach(link => {
        if(isLoggedIn){
            link.href = "dashboard.html";
            link.textContent = "Dashboard";
            link.dataset.lang = "nav_dashboard";
        }else{
            link.href = "login.html";
            link.textContent = "Login";
            link.dataset.lang = "nav_login";
        }
    });
}

refreshAuthNavigation();

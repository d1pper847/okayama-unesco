let currentLanguage = localStorage.getItem("language") || "en";

async function loadLanguage(lang){
    currentLanguage = lang;
    localStorage.setItem("language", lang);

    try{
        const response = await fetch(`locales/${lang}.json`);
        const data = await response.json();

        document.querySelectorAll("[data-lang]").forEach(el=>{
            const key = el.dataset.lang;

            if(data[key]){
                el.textContent = data[key];
            }
        });

        document.querySelectorAll("[data-lang-placeholder]").forEach(el=>{
            const key = el.dataset.langPlaceholder;

            if(data[key]){
                el.setAttribute("placeholder", data[key]);
            }
        });

        document.querySelectorAll(".lang-btn").forEach(btn=>{
            btn.classList.remove("active");
        });

        document.querySelectorAll(`#lang-${lang}, [data-set-lang="${lang}"]`).forEach(btn=>{
            btn.classList.add("active");
        });

        document.documentElement.lang = lang;
    }catch(error){
        console.error("Language file could not be loaded:", error);
    }
}

document.addEventListener("DOMContentLoaded", ()=>{
    loadLanguage(currentLanguage);

    document.querySelectorAll("#lang-ja, [data-set-lang='ja']").forEach(btn=>{
        btn.addEventListener("click", ()=>loadLanguage("ja"));
    });

    document.querySelectorAll("#lang-en, [data-set-lang='en']").forEach(btn=>{
        btn.addEventListener("click", ()=>loadLanguage("en"));
    });
});

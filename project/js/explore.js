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

        document.querySelectorAll(".lang-btn").forEach(btn=>{
            btn.classList.remove("active");
        });

        const activeBtn = document.getElementById(`lang-${lang}`);

        if(activeBtn){
            activeBtn.classList.add("active");
        }

        document.documentElement.lang = lang;
    }catch(error){
        console.error("Language file could not be loaded:", error);
    }
}

document.addEventListener("DOMContentLoaded", ()=>{
    loadLanguage(currentLanguage);

    const jaBtn = document.getElementById("lang-ja");
    const enBtn = document.getElementById("lang-en");

    if(jaBtn){
        jaBtn.addEventListener("click", ()=>loadLanguage("ja"));
    }

    if(enBtn){
        enBtn.addEventListener("click", ()=>loadLanguage("en"));
    }
});

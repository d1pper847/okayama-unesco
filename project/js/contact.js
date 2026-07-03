const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");
const CONTACT_API = "http://localhost:8080/api/contact";

function showContactNote(text, isError = false){
    if(!formNote) return;
    formNote.textContent = text;
    formNote.classList.add("show");
    formNote.style.color = isError ? "#b42318" : "#184d3b";
}

if(contactForm && formNote){
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = {
            name: document.getElementById("contact-name").value.trim(),
            email: document.getElementById("contact-email").value.trim(),
            subject: document.getElementById("contact-subject").value.trim(),
            message: document.getElementById("contact-message").value.trim()
        };

        if(!payload.name || !payload.email || !payload.message){
            showContactNote(window.t ? window.t("contact_validation_required", "Please enter your name, email, and message.") : "Please enter your name, email, and message.", true);
            return;
        }

        try{
            const response = await fetch(CONTACT_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));
            if(!response.ok){
                throw new Error(result.message || "Contact API failed");
            }
            showContactNote(window.t ? window.t("contact_success", "Thank you. Your message was saved.") : "Thank you. Your message was saved.");
        }catch(error){
            const savedMessages = JSON.parse(localStorage.getItem("okayamaUnescoContactMessages") || "[]");
            savedMessages.push({ ...payload, savedAt: new Date().toISOString(), mode: "demo" });
            localStorage.setItem("okayamaUnescoContactMessages", JSON.stringify(savedMessages));
            showContactNote(window.t ? window.t("contact_offline", "Thank you. Your message was saved in this browser because the backend is not running.") : "Thank you. Your message was saved in this browser because the backend is not running.");
        }

        contactForm.reset();
    });
}

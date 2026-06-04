const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");
const CONTACT_API = "http://localhost:8080/api/contact";

if(contactForm && formNote){
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = {
            name: document.getElementById("contact-name").value.trim(),
            email: document.getElementById("contact-email").value.trim(),
            subject: document.getElementById("contact-subject").value.trim(),
            message: document.getElementById("contact-message").value.trim()
        };

        try{
            const response = await fetch(CONTACT_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if(!response.ok) throw new Error("Contact API failed");

            formNote.textContent = "Thank you. Your message was saved to the database.";
        }catch(error){
            formNote.textContent = "Thank you. Backend is not running, so this message was shown in demo mode.";
        }

        formNote.classList.add("show");
        contactForm.reset();
    });
}

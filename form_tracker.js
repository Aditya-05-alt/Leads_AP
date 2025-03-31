(function () {
    function captureFormData(form) {
        const formData = new FormData(form);
        const formDetails = {};

        // Convert FormData entries to a plain object
        formData.forEach((value, key) => {
            formDetails[key] = value;
        });

        // Also capture by ID or class if name is missing
        form.querySelectorAll('input, textarea, select').forEach(element => {
            const key = element.name || element.id || element.className;
            if (key && !formDetails[key]) {
                formDetails[key] = element.value || '';
            }
        });

        console.log("📩 Form Captured:", formDetails);

        // Basic validations
        const nameValid = formDetails.name || formDetails.id_name || formDetails.class_name;
        const emailValid = formDetails.email || formDetails.id_email || formDetails.class_email;

        if (!nameValid) {
            alert("Name field is required. Please check your form.");
            console.error("❌ Name field missing");
            return;
        }

        if (!emailValid) {
            alert("Email field is required. Please check your form.");
            console.error("❌ Email field missing");
            return;
        }

        // Send data to Django API
        fetch("https://leadtracker-production.up.railway.app/api/leads/create/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formDetails),
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Server Response:", data);
            if (data.message) {
                alert("Lead captured successfully!");
                form.reset(); // optional: clear the form
            } else {
                alert("Error: " + (data.error || "Unexpected issue"));
            }
        })
        .catch(error => {
            console.error("❌ Error submitting lead:", error);
            alert("Something went wrong. Please try again.");
        });
    }

    function handleFormSubmit(event) {
        event.preventDefault(); // prevent page reload
        const form = event.target;
        captureFormData(form);
    }

    // Attach to all forms on page
    document.addEventListener('DOMContentLoaded', () => {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => form.addEventListener('submit', handleFormSubmit));
        console.log(`📡 Tracking ${forms.length} form(s) on this page...`);
    });
})();

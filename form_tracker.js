(function () {
    function captureFormData(form) {
        const formData = new FormData(form);
        const formDetails = {};

        // Convert FormData to plain object
        formData.forEach((value, key) => {
            formDetails[key] = value;
        });

        // Fallback: capture by id/class if not in FormData
        form.querySelectorAll('input, textarea, select').forEach(element => {
            const key = element.name || element.id || element.className;
            if (key && !formDetails[key]) {
                formDetails[key] = element.value || '';
            }
        });

        console.log("📩 Form Captured:", formDetails);

        // 🔍 Normalize keys for easier validation
        const normalized = Object.keys(formDetails).reduce((acc, key) => {
            const cleanKey = key.toLowerCase().replace(/[-_]/g, ''); // e.g. your-name → yourname
            acc[cleanKey] = formDetails[key];
            return acc;
        }, {});

        // ✅ Smart validation for name/email (matches things like your-name, your_email, etc)
        const name = normalized.name || normalized.yourname || '';
        const email = normalized.email || normalized.youremail || '';

        if (!name) {
            alert("⚠️ Name field is required. Please check your form.");
            console.error("❌ Name missing");
            return;
        }

        if (!email) {
            alert("⚠️ Email field is required. Please check your form.");
            console.error("❌ Email missing");
            return;
        }

        // 📤 Send to local Django app
        fetch("http://127.0.0.1:8000/leads/create/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: normalized.phone || '',
                message: normalized.message || '',
                source: window.location.hostname || 'unknown',
            }),
        })
        .then(res => res.json())
        .then(data => {
            console.log("✅ Server Response:", data);
            if (data.message) {
                alert("🎉 Lead captured successfully!");
                form.reset();
            } else {
                alert("Error: " + (data.error || "Unknown issue"));
            }
        })
        .catch(error => {
            console.error("❌ Fetch Error:", error);
            alert("Something went wrong. Check the console.");
        });
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        captureFormData(event.target);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', handleFormSubmit);
        });
        console.log(`📡 Tracking ${forms.length} form(s) on this page...`);
    });
})();

(function () {
    function initFormTracking() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                captureFormData(form);
            });
        });
        console.log(`📡 Tracking ${forms.length} form(s) on this page...`);
        console.log("Aditya is tracking");
    }

    function captureFormData(form) {
        const formData = new FormData(form);
        const formDetails = {};

        formData.forEach((value, key) => {
            formDetails[key] = value;
        });

        form.querySelectorAll('input, textarea, select').forEach(element => {
            const key = element.name || element.id || element.className;
            if (key && !formDetails[key]) {
                formDetails[key] = element.value || '';
            }
        });

        console.log("📩 Form Captured:", formDetails);

        const normalized = Object.keys(formDetails).reduce((acc, key) => {
            const cleanKey = key.toLowerCase().replace(/[-_]/g, '');
            acc[cleanKey] = formDetails[key];
            return acc;
        }, {});

        const name = normalized.name || normalized.yourname || '';
        const email = normalized.email || normalized.youremail || '';
        const subject = normalized.subject || normalized.yoursubject || '';

        // if (!name || !email || !subject) {
        //     console.error("❌ Missing required fields");
        //     alert("Please fill out name, email, and subject.");
        //     return;
        // }

        fetch("https://leadtracker-production.up.railway.app/leads/create/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: normalized.phone || '',
                subject: subject,
                message: normalized.message || '',
                source: document.referrer || 'direct',       // 🌐 Where user came *from*
                page_link: window.location.href || 'unknown', // 🏠 Where form was submitted
                // medium: 'Web Form'
            }),
        })
        .then(res => res.json())
        .then(data => {
            console.log("✅ Server Response:", data);
            if (data.message) {
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

    // ✅ Ensure DOM is ready before binding
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFormTracking);
    } else {
        initFormTracking();
    }
})();

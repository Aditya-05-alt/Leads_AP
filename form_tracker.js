(function () {
    function getMediumFromReferrer(referrer) {
        if (!referrer) return "direct";
        const ref = referrer.toLowerCase();

        if (ref.includes("google")) return "google";
        if (ref.includes("facebook")) return "facebook";
        if (ref.includes("instagram")) return "instagram";
        if (ref.includes("linkedin")) return "linkedin";
        if (ref.includes("bing")) return "bing";
        if (ref.includes("youtube")) return "youtube";
        return "referral";
    }

   function initFormTracking() {
    function attachListenersToForms() {
        const forms = document.querySelectorAll('form:not([data-tracked])');
        forms.forEach(form => {
            form.setAttribute('data-tracked', 'true');  // prevent duplicate
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                captureFormData(form);
            });
        });
        console.log(`📡 Tracking ${forms.length} new form(s)...`);
    }

    attachListenersToForms(); // initial

    // 👀 Observe dynamically added forms
    const observer = new MutationObserver(attachListenersToForms);
    observer.observe(document.body, { childList: true, subtree: true });
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
        const phone = normalized.phone || normalized.yourphone || '';
        const message = normalized.message || normalized.comment || normalized.comments || normalized.enquiry || normalized.yourmessage;

        const referrer = document.referrer || 'direct';
        const medium = getMediumFromReferrer(referrer);
        const pageLink = window.location.href;

        // Optional validation
        if (!name || !email) {
            console.error("❌ Missing required fields (name/email)");
            alert("Please fill out name and email.");
            return;
        }

        // Log for debug
        console.log("📤 Sending lead to API:", {
            name, email, phone, subject, message, referrer, medium, pageLink
        });

        fetch("https://leadtracker-production.up.railway.app/leads/create/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                subject: subject,
                message: message,
                source: referrer,
                medium: medium,
                page_link: pageLink
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFormTracking);
    } else {
        initFormTracking();
    }
})();

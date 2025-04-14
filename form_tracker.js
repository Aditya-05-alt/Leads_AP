(function () {
    function parseUTMParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            source: urlParams.get("utm_source") || "",      // e.g., google, facebook
            medium: urlParams.get("utm_medium") || "",      // e.g., cpc, organic
            campaign: urlParams.get("utm_campaign") || "",
            term: urlParams.get("utm_term") || "",
            content: urlParams.get("utm_content") || ""
        };
    }

    function inferSource(referrer, utmSource) {
        if (utmSource) return utmSource;

        if (!referrer) return "direct";
        const url = new URL(referrer);
        const host = url.hostname.replace(/^www\./, '');

        if (host.includes("google")) return "google";
        if (host.includes("facebook")) return "facebook";
        if (host.includes("instagram")) return "instagram";
        if (host.includes("linkedin")) return "linkedin";
        if (host.includes("bing")) return "bing";
        if (host.includes("youtube")) return "youtube";
        if (host.includes("rvtrader")) return "rvtrader.com";

        return host; // fallback to domain name
    }

    function inferMedium(referrer, utmMedium) {
        if (utmMedium) return utmMedium;

        if (!referrer) return "direct";
        const ref = referrer.toLowerCase();

        if (ref.includes("google.com") || ref.includes("bing.com")) return "organic";
        if (ref.includes("facebook") || ref.includes("youtube") || ref.includes("linkedin")) return "referral";
        if (ref.includes("cpc") || ref.includes("gclid")) return "cpc";

        return "referral"; // fallback
    }

    function initFormTracking() {
        function attachListenersToForms() {
            const forms = document.querySelectorAll('form:not([data-tracked])');
            forms.forEach(form => {
                form.setAttribute('data-tracked', 'true');
                form.addEventListener('submit', function (event) {
                    event.preventDefault();
                    captureFormData(form);
                });
            });
        }

        attachListenersToForms();
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

        const normalized = Object.keys(formDetails).reduce((acc, key) => {
            const cleanKey = key.toLowerCase().replace(/[-_]/g, '');
            acc[cleanKey] = formDetails[key];
            return acc;
        }, {});

        const name = normalized.name || normalized.yourname || '';
        const email = normalized.email || normalized.youremail || '';
        const subject = normalized.subject || '';
        const phone = normalized.phone || '';
        const message = normalized.message || '';

        const utms = parseUTMParams();
        const referrer = document.referrer || '';
        const pageLink = window.location.href;

        const leadPayload = {
            name,
            email,
            phone,
            subject,
            message,
            page_link: pageLink,
            source: inferSource(referrer, utms.source),
            medium: inferMedium(referrer, utms.medium),
            utm_campaign: utms.campaign,
            utm_term: utms.term,
            utm_content: utms.content
        };

        console.log("📤 Sending lead to API:", leadPayload);

        fetch("https://leadtracker-production.up.railway.app/leads/create/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(leadPayload),
        })
        .then(res => res.json())
        .then(data => {
            console.log("✅ Server Response:", data);
            if (data.message) form.reset();
        })
        .catch(error => {
            console.error("❌ Fetch Error:", error);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFormTracking);
    } else {
        initFormTracking();
    }
})();

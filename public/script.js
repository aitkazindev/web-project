document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded");
  const lang = localStorage.getItem("lang") || "en";
  console.log("Initial language:", lang);

  ["header", "footer"].forEach((id) => {
    console.log(`Loading ${id}...`);
    fetch(`/partials/${id}.html`)
      .then((res) => res.text())
      .then((html) => {
        console.log(`${id} loaded successfully`);
        document.getElementById(id).innerHTML = html;

        if (id === "header") {
          console.log("Initializing header...");
          const switcher = document.getElementById("language-switcher");
          console.log("Language switcher element:", switcher);
          if (switcher) {
            console.log("Setting initial language value:", lang);
            switcher.value = lang;

            switcher.addEventListener("change", (e) => {
              const selectedLang = e.target.value;
              console.log("Language changed to:", selectedLang);
              localStorage.setItem("lang", selectedLang);
              loadLanguage(selectedLang);
            });
          } else {
            console.error("Language switcher element not found!");
          }

          // Initialize mobile menu after header is loaded
          initializeMobileMenu();

          // Run translation again after header is added
          loadLanguage(lang);
        }
      })
      .catch(err => console.error(`Error loading ${id}:`, err));
  });

  // Also apply to rest of body content
  loadLanguage(lang);
});

function initializeMobileMenu() {
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const navMenu = document.getElementById("nav-menu");

  if (mobileMenuButton && navMenu) {
    // Toggle menu on button click
    mobileMenuButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      navMenu.classList.toggle("hidden");
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
        navMenu.classList.add("hidden");
      }
    });

    // Prevent clicks inside menu from closing it
    navMenu.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Close menu when window is resized to desktop size
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) {
        // md breakpoint
        navMenu.classList.remove("hidden");
      }
    });
  }
}

function loadLanguage(lang) {
  console.log("Loading language file for:", lang);
  fetch(`/locales/${lang}.json`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((translations) => {
      console.log("Translations loaded successfully");
      // Handle regular text content
      const elements = document.querySelectorAll("[data-i18n]");
      console.log("Found elements to translate:", elements.length);
      elements.forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (translations[key]) {
          el.textContent = translations[key];
        } else {
          console.warn(`Translation missing for key: ${key}`);
        }
      });

      // Handle placeholders
      const placeholderElements = document.querySelectorAll("[data-i18n-placeholder]");
      console.log("Found placeholder elements to translate:", placeholderElements.length);
      placeholderElements.forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[key]) {
          el.placeholder = translations[key];
        } else {
          console.warn(`Translation missing for placeholder key: ${key}`);
        }
      });
    })
    .catch((err) => {
      console.error("Failed to load language file:", err);
      // Show user-friendly error message
      alert(`Failed to load language: ${lang}. Please try again.`);
    });
}

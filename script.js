/* =========================================
   SAVEMORE
   MAIN JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     CURRENT YEAR
  ========================================== */

  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }


  /* =========================================
     MOBILE MENU
  ========================================== */

  const menuBtn = document.querySelector(".menu-btn");
  const navbar = document.querySelector(".navbar");

  if (menuBtn && navbar) {

    menuBtn.addEventListener("click", () => {

      const isOpen = navbar.classList.toggle("open");

      menuBtn.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );

      menuBtn.textContent = isOpen ? "✕" : "☰";

    });


    // Close menu after clicking a link

    const navLinks = navbar.querySelectorAll("a");

    navLinks.forEach((link) => {

      link.addEventListener("click", () => {

        navbar.classList.remove("open");

        menuBtn.setAttribute(
          "aria-expanded",
          "false"
        );

        menuBtn.textContent = "☰";

      });

    });


    // Close menu when clicking outside

    document.addEventListener("click", (event) => {

      if (
        navbar.classList.contains("open") &&
        !navbar.contains(event.target) &&
        !menuBtn.contains(event.target)
      ) {

        navbar.classList.remove("open");

        menuBtn.setAttribute(
          "aria-expanded",
          "false"
        );

        menuBtn.textContent = "☰";

      }

    });

  }


  /* =========================================
     FAVORITES / WISHLIST
  ========================================== */

  const wishlistButtons =
    document.querySelectorAll(".wishlist-btn");

  let favorites =
    JSON.parse(
      localStorage.getItem("savemoreFavorites")
    ) || [];


  function updateFavoriteButton(button, saved) {

    button.classList.toggle("saved", saved);

    button.textContent = saved ? "♥" : "♡";

    button.setAttribute(
      "aria-label",
      saved
        ? "Remove from favorites"
        : "Add to favorites"
    );

  }


  function getDealId(button) {

    const card =
      button.closest(".deal-card");

    if (!card) {
      return null;
    }

    const title =
      card.querySelector("h3");

    return title
      ? title.textContent.trim()
      : null;

  }


  wishlistButtons.forEach((button) => {

    const dealId = getDealId(button);

    if (dealId && favorites.includes(dealId)) {
      updateFavoriteButton(button, true);
    }


    button.addEventListener("click", () => {

      const id = getDealId(button);

      if (!id) {
        return;
      }


      const index =
        favorites.indexOf(id);


      if (index === -1) {

        favorites.push(id);

        updateFavoriteButton(
          button,
          true
        );

        showToast(
          "Deal added to favorites ❤️"
        );

      } else {

        favorites.splice(index, 1);

        updateFavoriteButton(
          button,
          false
        );

        showToast(
          "Deal removed from favorites"
        );

      }


      localStorage.setItem(
        "savemoreFavorites",
        JSON.stringify(favorites)
      );

    });

  });


  /* =========================================
     SEARCH BUTTON
  ========================================== */

  const searchBtn =
    document.querySelector(".search-btn");


  if (searchBtn) {

    searchBtn.addEventListener("click", () => {

      openSearch();

    });

  }


  function openSearch() {

    // Don't create another search box

    if (document.querySelector(".search-overlay")) {
      return;
    }


    const overlay =
      document.createElement("div");

    overlay.className =
      "search-overlay";


    overlay.innerHTML = `
      <div class="search-modal">

        <button
          class="search-close"
          type="button"
          aria-label="Close search"
        >
          ✕
        </button>

        <span class="section-label">
          Search SaveMore
        </span>

        <h2>
          Find Deals & Coupons
        </h2>

        <form class="search-form">

          <input
            type="search"
            id="siteSearch"
            placeholder="Search deals, coupons or stores..."
            autocomplete="off"
            required
          >

          <button
            type="submit"
            class="btn btn-primary"
          >
            Search
          </button>

        </form>

        <div
          class="search-results"
          id="searchResults"
        ></div>

      </div>
    `;


    document.body.appendChild(overlay);


    const closeBtn =
      overlay.querySelector(".search-close");

    const searchForm =
      overlay.querySelector(".search-form");

    const input =
      overlay.querySelector("#siteSearch");

    const results =
      overlay.querySelector("#searchResults");


    input.focus();


    closeBtn.addEventListener("click", () => {
      closeSearch(overlay);
    });


    overlay.addEventListener("click", (event) => {

      if (event.target === overlay) {
        closeSearch(overlay);
      }

    });


    document.addEventListener(
      "keydown",
      function escapeSearch(event) {

        if (event.key === "Escape") {

          closeSearch(overlay);

          document.removeEventListener(
            "keydown",
            escapeSearch
          );

        }

      }
    );


    searchForm.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();

        const query =
          input.value.trim().toLowerCase();

        if (!query) {
          return;
        }


        searchSite(
          query,
          results
        );

      }
    );

  }


  function closeSearch(overlay) {

    if (overlay) {
      overlay.remove();
    }

  }


  function searchSite(query, resultsContainer) {

    const dealCards =
      document.querySelectorAll(".deal-card");


    const matches = [];


    dealCards.forEach((card) => {

      const text =
        card.textContent.toLowerCase();

      if (text.includes(query)) {

        const title =
          card.querySelector("h3");

        const category =
          card.querySelector(".deal-category");

        matches.push({
          title:
            title
              ? title.textContent.trim()
              : "Deal",

          category:
            category
              ? category.textContent.trim()
              : "SaveMore"
        });

      }

    });


    if (matches.length === 0) {

      resultsContainer.innerHTML = `
        <div class="search-empty">
          <div>🔎</div>
          <h3>No results found</h3>
          <p>
            Try another deal, store or coupon name.
          </p>
        </div>
      `;

      return;

    }


    resultsContainer.innerHTML = `
      <div class="search-result-heading">
        Found ${matches.length} result${matches.length > 1 ? "s" : ""}
      </div>

      ${matches
        .map(
          (item) => `
            <div class="search-result-item">

              <strong>
                ${escapeHTML(item.title)}
              </strong>

              <span>
                ${escapeHTML(item.category)}
              </span>

            </div>
          `
        )
        .join("")}
    `;

  }


  /* =========================================
     NEWSLETTER
  ========================================== */

  const newsletterForm =
    document.getElementById(
      "newsletterForm"
    );


  if (newsletterForm) {

    newsletterForm.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();


        const emailInput =
          newsletterForm.querySelector(
            'input[type="email"]'
          );


        if (!emailInput) {
          return;
        }


        const email =
          emailInput.value.trim();


        if (!isValidEmail(email)) {

          showToast(
            "Please enter a valid email address."
          );

          emailInput.focus();

          return;

        }


        const subscribers =
          JSON.parse(
            localStorage.getItem(
              "savemoreSubscribers"
            )
          ) || [];


        if (
          subscribers.includes(email)
        ) {

          showToast(
            "You're already subscribed!"
          );

          return;

        }


        subscribers.push(email);


        localStorage.setItem(
          "savemoreSubscribers",
          JSON.stringify(subscribers)
        );


        newsletterForm.reset();


        showToast(
          "Successfully subscribed! 🎉"
        );

      }
    );

  }


  /* =========================================
     EMAIL VALIDATION
  ========================================== */

  function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email);

  }


  /* =========================================
     TOAST NOTIFICATION
  ========================================== */

  function showToast(message) {

    const existingToast =
      document.querySelector(".savemore-toast");

    if (existingToast) {
      existingToast.remove();
    }


    const toast =
      document.createElement("div");

    toast.className =
      "savemore-toast";

    toast.textContent =
      message;


    document.body.appendChild(toast);


    requestAnimationFrame(() => {
      toast.classList.add("show");
    });


    setTimeout(() => {

      toast.classList.remove("show");

      setTimeout(() => {
        toast.remove();
      }, 250);

    }, 2800);

  }


  /* =========================================
     HTML ESCAPE
  ========================================== */

  function escapeHTML(value) {

    const div =
      document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

  }


  /* =========================================
     DEAL CARD HOVER EFFECT
  ========================================== */

  const dealCards =
    document.querySelectorAll(".deal-card");


  dealCards.forEach((card) => {

    card.addEventListener(
      "mouseenter",
      () => {
        card.classList.add("is-hovered");
      }
    );


    card.addEventListener(
      "mouseleave",
      () => {
        card.classList.remove("is-hovered");
      }
    );

  });


  /* =========================================
     SMOOTH INTERNAL LINKS
  ========================================== */

  const internalLinks =
    document.querySelectorAll(
      'a[href^="#"]'
    );


  internalLinks.forEach((link) => {

    link.addEventListener(
      "click",
      (event) => {

        const targetId =
          link.getAttribute("href");


        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }


        const target =
          document.querySelector(targetId);


        if (target) {

          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }

      }
    );

  });


  /* =========================================
     KEYBOARD SHORTCUT
     "/" = OPEN SEARCH
  ========================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      const activeElement =
        document.activeElement;


      const isTyping =
        activeElement &&
        (
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.isContentEditable
        );


      if (
        event.key === "/" &&
        !isTyping
      ) {

        event.preventDefault();

        openSearch();

      }

    }
  );


  /* =========================================
     PAGE LOADED
  ========================================== */

  document.body.classList.add(
    "page-loaded"
  );

});

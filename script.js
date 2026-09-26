/* =========================================
   SAVEMORE - MAIN JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     CURRENT YEAR
  ========================================= */

  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }


  /* =========================================
     MOBILE MENU
  ========================================= */

  const menuBtn = document.querySelector(".menu-btn");
  const navbar = document.querySelector(".navbar");

  if (menuBtn && navbar) {

    menuBtn.addEventListener("click", () => {
      navbar.classList.toggle("open");

      const isOpen = navbar.classList.contains("open");

      menuBtn.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );

      menuBtn.textContent = isOpen ? "✕" : "☰";
    });


    // Close menu when clicking a navigation link

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

      const clickedInsideMenu =
        navbar.contains(event.target);

      const clickedMenuButton =
        menuBtn.contains(event.target);

      if (
        !clickedInsideMenu &&
        !clickedMenuButton &&
        navbar.classList.contains("open")
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
     WISHLIST
  ========================================= */

  const wishlistButtons =
    document.querySelectorAll(".wishlist-btn");

  wishlistButtons.forEach((button) => {

    button.addEventListener("click", () => {

      button.classList.toggle("saved");

      const isSaved =
        button.classList.contains("saved");

      button.textContent =
        isSaved ? "♥" : "♡";

      button.setAttribute(
        "aria-label",
        isSaved
          ? "Remove from favorites"
          : "Add to favorites"
      );

    });

  });


  /* =========================================
     NEWSLETTER FORM
  ========================================= */

  const newsletterForm =
    document.getElementById("newsletterForm");

  if (newsletterForm) {

    newsletterForm.addEventListener("submit", (event) => {

      event.preventDefault();

      const emailInput =
        document.getElementById("email");

      if (!emailInput) {
        return;
      }

      const email =
        emailInput.value.trim();


      /* Basic email validation */

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {

        showMessage(
          "Please enter a valid email address.",
          "error"
        );

        return;
      }


      /*
        Frontend-only for now.

        Later, this form can be connected
        to the SaveMore backend/database.
      */

      showMessage(
        "Thanks! You have been subscribed to SaveMore.",
        "success"
      );

      emailInput.value = "";

    });

  }


  /* =========================================
     SEARCH BUTTON
  ========================================= */

  const searchButton =
    document.querySelector(".search-btn");

  if (searchButton) {

    searchButton.addEventListener("click", () => {

      /*
        Search functionality will be connected
        when deals.html is created.
      */

      window.location.href = "deals.html";

    });

  }


  /* =========================================
     DEAL BUTTONS
  ========================================= */

  const dealButtons =
    document.querySelectorAll(".deal-button");

  dealButtons.forEach((button) => {

    button.addEventListener("click", () => {

      /*
        Deal details page will later receive
        the actual product/deal ID.
      */

      console.log("Opening deal...");

    });

  });


  /* =========================================
     HELPER - SHOW MESSAGE
  ========================================= */

  function showMessage(message, type = "success") {

    const existingMessage =
      document.querySelector(".site-message");

    if (existingMessage) {
      existingMessage.remove();
    }


    const messageElement =
      document.createElement("div");

    messageElement.className =
      `site-message ${type}`;

    messageElement.textContent =
      message;


    /*
      Inline styling keeps this functionality
      working before additional CSS is added.
    */

    Object.assign(
      messageElement.style,
      {
        position: "fixed",
        bottom: "25px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "9999",
        padding: "13px 20px",
        borderRadius: "8px",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "600",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        maxWidth: "90%",
        textAlign: "center",
        background:
          type === "error"
            ? "#ef4444"
            : "#16a34a"
      }
    );


    document.body.appendChild(messageElement);


    /* Automatically remove message */

    setTimeout(() => {

      messageElement.style.opacity = "0";

      messageElement.style.transition =
        "opacity 0.3s ease";

      setTimeout(() => {
        messageElement.remove();
      }, 300);

    }, 3000);

  }


  /* =========================================
     ESC KEY
     Close mobile menu
  ========================================= */

  document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

      if (
        navbar &&
        navbar.classList.contains("open")
      ) {

        navbar.classList.remove("open");

        if (menuBtn) {

          menuBtn.setAttribute(
            "aria-expanded",
            "false"
          );

          menuBtn.textContent = "☰";

        }

      }

    }

  });

});

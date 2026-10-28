/* Lightweight, dependency-free site behaviours. No information is stored or sent to a server. */
(() => {
  "use strict";

  const contacts = {
    johannes: {
      name: "Johannes Pieterse",
      phone: "27711342523",
      email: "johannes.healthandsafety@gmail.com",
    },
    prince: {
      name: "Thapelo Prince Legwabe",
      phone: "27716844359",
      email: "prince.healthandsafety@gmail.com",
    },
  };

  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector("#mobile-menu");
  const setMenu = (open) => {
    if (!menuButton || !mobileNav) return;
    mobileNav.hidden = !open;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuButton.innerHTML = `<svg class="icon"><use href="#${open ? "i-x" : "i-menu"}"/></svg>`;
    document.body.classList.toggle("menu-open", open);
  };
  menuButton?.addEventListener("click", () => setMenu(mobileNav.hidden));
  mobileNav
    ?.querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => setMenu(false)));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (mobileNav.hidden) return;
    if (event.key === "Escape") {
      setMenu(false);
      menuButton.focus();
    }
    if (event.key === "Tab") {
      const links = Array.from(mobileNav.querySelectorAll("a"));
      const last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === menuButton) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        menuButton.focus();
      }
    }
  });
  document.addEventListener("click", (event) => {
    if (
      !mobileNav.hidden &&
      !event.composedPath().includes(document.querySelector(".site-header"))
    )
      setMenu(false);
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const revealElements = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px 25px 0px" },
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  }

  const navLinks = Array.from(
    document.querySelectorAll(".desktop-nav .nav-link"),
  );
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            navLinks.forEach((link) =>
              link.classList.toggle(
                "active",
                link.getAttribute("href") === `#${entry.target.id}`,
              ),
            );
        });
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    sections.forEach((section) => navObserver.observe(section));
  }

  const form = document.getElementById("enquiry-form");
  const serviceField = document.getElementById("client-service");
  const channelInputs = document.querySelectorAll('input[name="channel"]');
  const submitLabel = document.getElementById("submit-label");

  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      serviceField.value = link.dataset.service;
    });
  });

  channelInputs.forEach((input) =>
    input.addEventListener("change", () => {
      submitLabel.textContent =
        document.querySelector('input[name="channel"]:checked').value ===
        "email"
          ? "Open email message"
          : "Open WhatsApp message";
    }),
  );

  // Opens a prefilled chat/email in the visitor's own app; they review and send it there.
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    form.querySelectorAll("[required][maxlength]").forEach((field) => {
      field.value = field.value.trim();
    });
    if (!form.reportValidity()) return;

    const fields = new FormData(form);
    const recipient = contacts[fields.get("recipient")] || contacts.johannes;
    const sender = String(fields.get("name") || "").trim();
    const company = String(fields.get("company") || "").trim();
    const phone = String(fields.get("phone") || "").trim();
    const email = String(fields.get("email") || "").trim();
    const service = String(fields.get("service") || "").trim();
    const message = String(fields.get("message") || "").trim();
    const lines = [
      `Hello ${recipient.name.split(" ")[0]},`,
      "",
      "I would like to enquire about JM Health and Safety Consultants.",
      "",
      `Name: ${sender}`,
      ...(company ? [`Company: ${company}`] : []),
      ...(phone ? [`Phone: ${phone}`] : []),
      ...(email ? [`Email: ${email}`] : []),
      `Service: ${service}`,
      "",
      `My requirements:\n${message}`,
      "",
      "Thank you.",
    ];
    const body = lines.join("\n");
    if (fields.get("channel") === "email") {
      const subject = `JM Health and Safety enquiry — ${service}`;
      window.location.href = `mailto:${recipient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      const url = `https://wa.me/${recipient.phone}?text=${encodeURIComponent(body)}`;
      // Use the same tab for a reliable, non-popup-blocked handoff to WhatsApp.
      window.location.assign(url);
    }
  });
  // Enable only after the draft-handoff handler is registered.
  form.querySelector('button[type="submit"]').disabled = false;
})();

/* ==========================================================================
   TravelVista — main script (vanilla JavaScript, no libraries)
   Features: mobile nav, sticky header, active links, smooth scrolling,
   scroll reveal, destination search, package filtering, gallery lightbox,
   FAQ accordion, tabs, contact validation, booking validation + confirmation,
   newsletter, scroll-to-top.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------- 1. Mobile navigation ---------------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.classList.remove("open");
      });
    });

    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove("open");
        toggle.classList.remove("open");
      }
    });
  }

  /* ---------------- 2. Sticky header shadow + scroll to top ---------------- */
  function initScrollUI() {
    var header = document.querySelector(".header");
    var topBtn = document.querySelector(".to-top");

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (header) header.classList.toggle("scrolled", y > 20);
      if (topBtn) topBtn.classList.toggle("show", y > 420);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (topBtn) {
      topBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* ---------------- 3. Active nav link ---------------- */
  function initActiveLink() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-menu a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("#")[0];
      if (href && href === path) a.classList.add("active");
    });
  }

  /* ---------------- 4. Smooth scrolling for in-page anchors ---------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id === "#" || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var offset = 96;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  }

  /* ---------------- 5. Scroll reveal animations ---------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (i) { i.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            setTimeout(function () { el.classList.add("visible"); }, i * 90);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    items.forEach(function (i) { io.observe(i); });
  }

  /* ---------------- 6. Destination search (home + destinations) ---------------- */
  function initSearch() {
    var form = document.querySelector("[data-search-form]");
    if (!form) return;
    var input = form.querySelector("[data-search-input]");
    var msg = document.querySelector("[data-search-msg]");
    var cards = document.querySelectorAll("[data-destination]");

    function run(e) {
      if (e) e.preventDefault();
      var q = (input.value || "").trim().toLowerCase();
      var type = form.querySelector("[data-search-type]");
      var budget = form.querySelector("[data-search-budget]");
      var found = 0;

      cards.forEach(function (card) {
        var name = (card.getAttribute("data-destination") || "").toLowerCase();
        var region = (card.getAttribute("data-region") || "").toLowerCase();
        var tags = (card.getAttribute("data-tags") || "").toLowerCase();
        var price = parseInt(card.getAttribute("data-price") || "0", 10);

        var matchText = !q || name.indexOf(q) > -1 || region.indexOf(q) > -1 || tags.indexOf(q) > -1;
        var matchType = !type || !type.value || tags.indexOf(type.value.toLowerCase()) > -1;
        var matchBudget = true;
        if (budget && budget.value) {
          var max = parseInt(budget.value, 10);
          matchBudget = !price || price <= max;
        }

        var ok = matchText && matchType && matchBudget;
        card.style.display = ok ? "" : "none";
        if (ok) found++;
      });

      if (msg) {
        msg.classList.add("search-msg");
        if (!q && found === cards.length) {
          msg.textContent = "Showing all " + cards.length + " destinations we currently operate.";
        } else if (found > 0) {
          msg.textContent = found + " destination" + (found > 1 ? "s" : "") + " match your search. Scroll down to explore.";
        } else {
          msg.textContent =
            'No destination matched "' + input.value + '". Try Dubai, Turkey, Maldives, Switzerland, Bali or Japan.';
        }
      }

      var section = document.querySelector("#destinations") || document.querySelector("#popular");
      if (section && q) {
        window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
      }
    }

    form.addEventListener("submit", run);
    if (input) {
      input.addEventListener("keyup", function (e) {
        if (e.key === "Enter") run(e);
      });
    }
  }

  /* ---------------- 7. Package / gallery filtering ---------------- */
  function initFilters() {
    document.querySelectorAll("[data-filter-group]").forEach(function (group) {
      var targetSel = group.getAttribute("data-filter-target");
      var items = document.querySelectorAll(targetSel);
      var empty = document.querySelector(group.getAttribute("data-filter-empty") || "#nothing");

      group.querySelectorAll(".filter-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          group.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");

          var value = btn.getAttribute("data-filter");
          var shown = 0;
          items.forEach(function (item) {
            var cat = item.getAttribute("data-category") || "";
            var ok = value === "all" || cat.split(" ").indexOf(value) > -1;
            if (ok) {
              item.style.display = "";
              item.classList.remove("visible");
              void item.offsetWidth;
              item.classList.add("visible");
              shown++;
            } else {
              item.style.display = "none";
            }
          });
          if (empty) empty.style.display = shown ? "none" : "block";
        });
      });
    });
  }

  /* ---------------- 8. Gallery lightbox ---------------- */
  function initGallery() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
    var box = document.querySelector(".lightbox");
    if (!items.length || !box) return;

    var imgEl = box.querySelector("img");
    var capEl = box.querySelector(".lightbox-caption");
    var current = 0;

    function show(index) {
      var visible = items.filter(function (i) { return i.style.display !== "none"; });
      if (!visible.length) return;
      current = (index + visible.length) % visible.length;
      var item = visible[current];
      var src = item.querySelector("img").getAttribute("src");
      var title = item.getAttribute("data-title") || "";
      var place = item.getAttribute("data-place") || "";
      imgEl.setAttribute("src", src);
      imgEl.setAttribute("alt", title);
      capEl.textContent = place ? title + " — " + place : title;
      box.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      box.classList.remove("open");
      document.body.style.overflow = "";
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        var visible = items.filter(function (i) { return i.style.display !== "none"; });
        show(visible.indexOf(item));
      });
    });

    box.querySelector(".lightbox-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* ---------------- 9. FAQ accordion ---------------- */
  function initAccordion() {
    document.querySelectorAll(".accordion").forEach(function (acc) {
      var items = acc.querySelectorAll(".acc-item");
      items.forEach(function (item) {
        var head = item.querySelector(".acc-head");
        var panel = item.querySelector(".acc-panel");
        if (!head || !panel) return;

        head.setAttribute("aria-expanded", "false");
        head.addEventListener("click", function () {
          var isOpen = item.classList.contains("active");
          items.forEach(function (other) {
            other.classList.remove("active");
            var p = other.querySelector(".acc-panel");
            var h = other.querySelector(".acc-head");
            if (p) p.style.maxHeight = null;
            if (h) h.setAttribute("aria-expanded", "false");
          });
          if (!isOpen) {
            item.classList.add("active");
            panel.style.maxHeight = panel.scrollHeight + 40 + "px";
            head.setAttribute("aria-expanded", "true");
          }
        });
      });
    });

    // FAQ keyword search, if present
    var search = document.querySelector("[data-faq-search]");
    if (search) {
      search.addEventListener("keyup", function () {
        var q = search.value.toLowerCase().trim();
        var count = 0;
        document.querySelectorAll(".acc-item").forEach(function (item) {
          var text = item.textContent.toLowerCase();
          var ok = !q || text.indexOf(q) > -1;
          item.style.display = ok ? "" : "none";
          if (ok) count++;
        });
        var note = document.querySelector("[data-faq-count]");
        if (note) note.textContent = count + " question" + (count === 1 ? "" : "s") + " shown";
      });
    }
  }

  /* ---------------- 10. Tabs (package details) ---------------- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (bar) {
      bar.querySelectorAll(".tab-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-tab");
          bar.querySelectorAll(".tab-btn").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          document.querySelectorAll("[data-tab-panel]").forEach(function (p) {
            p.classList.toggle("active", p.getAttribute("data-tab-panel") === id);
          });
        });
      });
    });
  }

  /* ---------------- 11. Validation helpers ---------------- */
  var patterns = {
    name: /^[A-Za-z][A-Za-z\s'.-]{2,49}$/,
    email: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
    phone: /^[+]?[0-9\s()-]{7,18}$/
  };

  function setState(field, message) {
    var wrap = field.closest(".field") || field.parentElement;
    var msg = wrap.querySelector(".error-msg");
    if (message) {
      wrap.classList.add("invalid");
      wrap.classList.remove("valid");
      if (msg) msg.textContent = message;
      return false;
    }
    wrap.classList.remove("invalid");
    wrap.classList.add("valid");
    if (msg) msg.textContent = "";
    return true;
  }

  function validateField(field) {
    var value = (field.value || "").trim();
    var rule = field.getAttribute("data-rule") || "";
    var label = field.getAttribute("data-label") || "This field";

    if (field.type === "checkbox") {
      return field.checked ? setState(field, "") : setState(field, "Please confirm to continue.");
    }
    if (field.hasAttribute("required") && !value) {
      return setState(field, label + " is required.");
    }
    if (!value) return setState(field, "");

    if (rule === "name" && !patterns.name.test(value)) {
      return setState(field, "Enter a valid name (letters only, min 3 characters).");
    }
    if (rule === "email" && !patterns.email.test(value)) {
      return setState(field, "Enter a valid email, e.g. name@example.com");
    }
    if (rule === "phone" && !patterns.phone.test(value)) {
      return setState(field, "Enter a valid phone number with 7–18 digits.");
    }
    if (rule === "message" && value.length < 15) {
      return setState(field, "Please write at least 15 characters so we can help properly.");
    }
    if (rule === "future") {
      var picked = new Date(value);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(picked.getTime()) || picked <= today) {
        return setState(field, "Choose a departure date in the future.");
      }
    }
    if (rule === "travellers") {
      var n = parseInt(value, 10);
      if (isNaN(n) || n < 1 || n > 20) return setState(field, "Travellers must be between 1 and 20.");
    }
    return setState(field, "");
  }

  function initForms() {
    document.querySelectorAll("[data-validate]").forEach(function (form) {
      var fields = form.querySelectorAll("input, select, textarea");

      fields.forEach(function (field) {
        field.addEventListener("blur", function () { validateField(field); });
        field.addEventListener("input", function () {
          var wrap = field.closest(".field") || field.parentElement;
          if (wrap.classList.contains("invalid")) validateField(field);
        });
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = true;
        var firstBad = null;
        fields.forEach(function (field) {
          if (field.type === "submit" || field.type === "button") return;
          if (!validateField(field)) {
            ok = false;
            if (!firstBad) firstBad = field;
          }
        });

        var scope = form.closest(".form-card") || form.parentElement || document;
        var success = form.querySelector(".alert-success") || scope.querySelector(".alert-success");
        var failure = form.querySelector(".alert-error") || scope.querySelector(".alert-error");

        if (!ok) {
          if (failure) failure.classList.add("show");
          if (success) success.classList.remove("show");
          if (firstBad) {
            firstBad.focus();
            window.scrollTo({
              top: firstBad.getBoundingClientRect().top + window.scrollY - 140,
              behavior: "smooth"
            });
          }
          return;
        }

        if (failure) failure.classList.remove("show");
        if (success) {
          fillSummary(form, success);
          success.classList.add("show");
          window.scrollTo({
            top: success.getBoundingClientRect().top + window.scrollY - 130,
            behavior: "smooth"
          });
        }
        form.reset();
        form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("valid", "invalid"); });
        form.querySelectorAll(".error-msg").forEach(function (m) { m.textContent = ""; });
      });
    });
  }

  /* Booking confirmation summary */
  function fillSummary(form, box) {
    var ref = box.querySelector("[data-ref]");
    if (ref) {
      ref.textContent = "TV-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    }
    var map = {
      "[data-sum-name]": "fullName",
      "[data-sum-email]": "email",
      "[data-sum-package]": "package",
      "[data-sum-date]": "departure",
      "[data-sum-travellers]": "travellers"
    };
    Object.keys(map).forEach(function (sel) {
      var out = box.querySelector(sel);
      var input = form.querySelector('[name="' + map[sel] + '"]');
      if (out && input) {
        out.textContent = input.options ? input.options[input.selectedIndex].text : input.value;
      }
    });
  }

  /* ---------------- 12. Live booking price estimate ---------------- */
  function initEstimate() {
    var form = document.querySelector("[data-booking]");
    if (!form) return;
    var pkg = form.querySelector('[name="package"]');
    var travellers = form.querySelector('[name="travellers"]');
    var room = form.querySelector('[name="roomType"]');
    var out = document.querySelector("[data-estimate]");
    if (!pkg || !travellers || !out) return;

    function update() {
      var base = parseInt(pkg.options[pkg.selectedIndex].getAttribute("data-price") || "0", 10);
      var people = parseInt(travellers.value || "1", 10);
      if (isNaN(people) || people < 1) people = 1;
      var multiplier = 1;
      if (room) {
        if (room.value === "single") multiplier = 1.25;
        if (room.value === "suite") multiplier = 1.6;
      }
      var total = Math.round(base * people * multiplier);
      out.textContent = base ? "$" + total.toLocaleString() : "Select a package";
      var perPerson = document.querySelector("[data-estimate-person]");
      if (perPerson) {
        perPerson.textContent = base ? "$" + Math.round(base * multiplier).toLocaleString() + " per person" : "—";
      }
    }
    [pkg, travellers, room].forEach(function (el) {
      if (el) {
        el.addEventListener("change", update);
        el.addEventListener("input", update);
      }
    });
    update();
  }

  /* Prefill booking package from ?package= query string */
  function initPrefill() {
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get("package");
    if (!wanted) return;
    var select = document.querySelector('[name="package"]');
    if (!select) return;
    Array.prototype.forEach.call(select.options, function (opt) {
      if (opt.value === wanted) select.value = wanted;
    });
    select.dispatchEvent(new Event("change"));
  }

  /* ---------------- 13. Newsletter ---------------- */
  function initNewsletter() {
    document.querySelectorAll("[data-newsletter]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input");
        var note = form.parentElement.querySelector("[data-newsletter-msg]");
        if (!patterns.email.test((input.value || "").trim())) {
          if (note) { note.textContent = "Please enter a valid email address."; note.style.color = "#fbbf24"; }
          return;
        }
        if (note) {
          note.textContent = "Thank you! Your travel deals will arrive every Friday.";
          note.style.color = "#9be6c8";
        }
        form.reset();
      });
    });
  }

  /* ---------------- 14. Footer year + init ---------------- */
  function initMisc() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initScrollUI();
    initActiveLink();
    initSmoothScroll();
    initReveal();
    initSearch();
    initFilters();
    initGallery();
    initAccordion();
    initTabs();
    initForms();
    initEstimate();
    initPrefill();
    initNewsletter();
    initMisc();
  });
})();

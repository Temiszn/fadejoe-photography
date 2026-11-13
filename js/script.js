(() => {
  "use strict";
// Always start the page at the top on refresh.
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Preloader: never leave the page covered if an image is slow.
  const preloader = $(".preloader");
  const hidePreloader = () => preloader?.classList.add("is-hidden");
  window.addEventListener("load", hidePreloader, { once: true });
  window.setTimeout(hidePreloader, 2200);

  // Mobile navigation.
  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");
  const closeMenu = () => {
    menuToggle?.classList.remove("active");
    navLinks?.classList.remove("active");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("locked");
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.classList.toggle("active");
    navLinks?.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
  $$("#navLinks a").forEach(link => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) closeMenu();
  });

  // Current year.
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();


// Three-photo cinematic hero carousel
const heroSlides = [
  { src: "./assets/images/pic1.JPG", label: "BEAUTY / EDITORIAL" },
  { src: "./assets/images/pic2.jpg", label: "PORTRAIT / CHARACTER" },
  { src: "./assets/images/pic13.png", label: "WEDDING / CONNECTION" },
  { src: "./assets/images/pic9.JPG", label: "LIFESTYLE / STORY" },
  { src: "./assets/images/pic5.JPG", label: "BEAUTY / EXPRESSION" },
  { src: "./assets/images/pic10.JPG", label: "FASHION / MOVEMENT" }
];

const frames = [
  $(".frame-one"),
  $(".frame-main"),
  $(".frame-two")
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let currentIndex = 2;
let slideTimer;
let isAnimating = false;

const renderFrame = (frame, index, position) => {
  const slide = heroSlides[index];
  const img = $("img", frame);
  const caption = $("figcaption span", frame);
  const number = $("figcaption b", frame);

  frame.dataset.slideIndex = index;

  if (img) {
    img.src = slide.src;
    img.alt = slide.label;
  }

  if (caption) caption.textContent = slide.label;
  if (number) {
    const formatted = String(index + 1).padStart(2, "0");
    number.textContent = position === "frame-main"
      ? `${formatted} / ${String(heroSlides.length).padStart(2, "0")}`
      : formatted;
  }

  frame.classList.remove("frame-one", "frame-main", "frame-two");
  frame.classList.add(position);
};

// Initial arrangement: previous, active, upcoming
renderFrame(frames[0], 1, "frame-one");
renderFrame(frames[1], 2, "frame-main");
renderFrame(frames[2], 3, "frame-two");

const nextSlide = () => {
  if (isAnimating || reduceMotion.matches || document.hidden) return;

  isAnimating = true;

  const [left, centre, right] = frames;

  // The previous left photo exits.
  left.classList.add("is-exiting");

  // Centre moves to the left.
  centre.classList.remove("frame-main");
  centre.classList.add("frame-one");

  // Right moves into the centre.
  right.classList.remove("frame-two");
  right.classList.add("frame-main");

  // Wait for the movement to finish before reusing the old left frame.
  window.setTimeout(() => {
    currentIndex = (currentIndex + 1) % heroSlides.length;

    // The old left frame becomes the new upcoming photo.
    renderFrame(left, (currentIndex + 1) % heroSlides.length, "frame-two");

    left.classList.remove("is-exiting");
    left.classList.add("is-entering");

    // Update the order for the next rotation.
    frames.push(frames.shift());

    window.setTimeout(() => {
      left.classList.remove("is-entering");
      isAnimating = false;
    }, 950);

  }, 950);
};

const startHeroSlideshow = () => {
  window.clearInterval(slideTimer);

  if (!reduceMotion.matches) {
    slideTimer = window.setInterval(nextSlide, 5200);
  }
};

startHeroSlideshow();

reduceMotion.addEventListener?.("change", startHeroSlideshow);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    window.clearInterval(slideTimer);
  } else {
    startHeroSlideshow();
  }
});


  
  // Cinematic scroll reveal — replay every time an element enters view.
const revealItems = $$(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  }, {
    threshold: 0.15
  });

  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("is-visible"));
}
// Interlude — subtle scroll parallax.
const interlude = $(".interlude");
const interludeImage = $(".interlude-image");

if (interlude && interludeImage) {
  let parallaxFrame = null;

  const updateInterlude = () => {
    parallaxFrame = null;

    const rect = interlude.getBoundingClientRect();

    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const progress =
      (window.innerHeight - rect.top) /
      (window.innerHeight + rect.height);

    const movement = (progress - 0.5) * 70;

    interludeImage.style.transform =
      `translate3d(0, ${movement}px, 0) scale(1.15)`;
  };

  const requestInterludeUpdate = () => {
    if (parallaxFrame === null) {
      parallaxFrame = window.requestAnimationFrame(updateInterlude);
    }
  };

  window.addEventListener("scroll", requestInterludeUpdate, {
    passive: true
  });

  window.addEventListener("resize", requestInterludeUpdate);

  requestInterludeUpdate();
}

  // Gallery filters.
  const filterButtons = $$(".filter-btn");
  const galleryCards = $$(".gallery-card");
  const galleryCount = $("#galleryCount");
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(item => item.classList.toggle("is-active", item === button));
      let visible = 0;
      galleryCards.forEach(card => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !show);
        if (show) visible++;
      });
      if (galleryCount) galleryCount.textContent = `${String(visible).padStart(2, "0")} FRAMES`;
    });
  });

  // Accessible gallery lightbox.
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxCaption = $("#lightboxCaption");
  const lightboxCount = $("#lightboxCount");
  const closeButton = $("#lightboxClose");
  const prevButton = $("#lightboxPrev");
  const nextButton = $("#lightboxNext");
  let lightboxItems = [];
  let lightboxIndex = 0;
  let previousFocus = null;

  const getVisibleCards = () => galleryCards.filter(card => !card.classList.contains("is-hidden"));
  const renderLightbox = () => {
    const card = lightboxItems[lightboxIndex];
    if (!card) return;
    const image = $("img", card);
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = card.dataset.title || image.alt;
    lightboxCount.textContent = `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(lightboxItems.length).padStart(2, "0")}`;
  };
  const openLightbox = card => {
    lightboxItems = getVisibleCards();
    lightboxIndex = lightboxItems.indexOf(card);
    previousFocus = document.activeElement;
    renderLightbox();
    lightbox.classList.add("is-open");
    document.body.classList.add("locked");
    closeButton?.focus();
  };
  const closeLightbox = () => {
    lightbox?.classList.remove("is-open");
    document.body.classList.remove("locked");
    previousFocus?.focus?.();
  };
  const moveLightbox = direction => {
    if (!lightboxItems.length) return;
    lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    renderLightbox();
  };
  galleryCards.forEach(card => card.addEventListener("click", () => openLightbox(card)));
  closeButton?.addEventListener("click", closeLightbox);
  prevButton?.addEventListener("click", () => moveLightbox(-1));
  nextButton?.addEventListener("click", () => moveLightbox(1));
  lightbox?.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", event => {
    if (!lightbox?.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });
})();
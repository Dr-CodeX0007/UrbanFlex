// ============================================================
// UrbanFlex Homepage Banner Carousel - auto sliding, 7 slides
// ============================================================

const bannerTrack = document.getElementById("bannerTrack");
const bannerDots = document.getElementById("bannerDots");

if (bannerTrack && bannerDots) {

    const slides = bannerTrack.querySelectorAll(".banner-slide");
    const totalSlides = slides.length;
    let currentSlide = 0;
    let autoSlideTimer = null;

    // Build dot indicators
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("button");
        dot.classList.add("banner-dot");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToSlide(i));
        bannerDots.appendChild(dot);
    }

    const dotEls = bannerDots.querySelectorAll(".banner-dot");

    function goToSlide(index) {
        currentSlide = index;
        bannerTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

        dotEls.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentSlide);
        });

        resetAutoSlide();
    }

    function nextSlide() {
        const next = (currentSlide + 1) % totalSlides;
        goToSlide(next);
    }

    function resetAutoSlide() {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(nextSlide, 4000);
    }

    resetAutoSlide();

    // Pause on hover (desktop), resume on mouse leave
    const carousel = document.getElementById("bannerCarousel");
    carousel?.addEventListener("mouseenter", () => clearInterval(autoSlideTimer));
    carousel?.addEventListener("mouseleave", resetAutoSlide);
}
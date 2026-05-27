document.querySelectorAll(".mode-card").forEach(card => {
    const img = card.querySelector("img");
    const normalSrc = img.src;
    const glowSrc = card.dataset.glow;

    card.addEventListener("mouseenter", () => {
        img.src = glowSrc;
    });

    card.addEventListener("mouseleave", () => {
        img.src = normalSrc;
    });
});

const aboutBtn = document.getElementById("nav-about");
const aboutText = document.getElementById("about-text");

aboutBtn.addEventListener("click", function (e) {
    e.preventDefault();

    aboutText.classList.remove("glow");
    void aboutText.offsetWidth;
    aboutText.classList.add("glow");

    setTimeout(() => {
        aboutText.classList.remove("glow");
    }, 1600);

    aboutText.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});

const modeCards = document.querySelectorAll(".mode-card");
const entries = document.querySelectorAll(".game-entry");

const idMap = [
    "fnaf1",
    "fnaf2",
    "fnaf3",
    "fnaf4",
    "fnafsl",
    "fnaf6",
    "puppetsrevenge",
    "basementhunt"
];

modeCards.forEach((card, index) => {
    card.addEventListener("click", () => {
        const targetId = idMap[index % 8];
        const target = document.getElementById(targetId);

        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });

            entries.forEach(e => e.classList.remove("active-glow"));

            setTimeout(() => {
                target.classList.add("active-glow");
                const img = target.querySelector(".game-thumb img");

                if (img) {
                    img.src = img.dataset.glow;

                    setTimeout(() => {
                        img.src = img.dataset.normal;
                    }, 2000);
                }

                setTimeout(() => {
                    target.classList.remove("active-glow");
                }, 2000);
            }, 600);
        }
    });
});

const hamburger = document.getElementById("nav-hamburger");
const navRight = document.getElementById("nav-right");
const navDropdown = document.querySelector(".nav-dropdown");
const navDropdownLink = navDropdown ? navDropdown.querySelector(":scope > a") : null;

if (hamburger && navRight) {
    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        hamburger.classList.toggle("open");
        navRight.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
        if (!hamburger.contains(e.target) && !navRight.contains(e.target)) {
            hamburger.classList.remove("open");
            navRight.classList.remove("open");
            if (navDropdown) navDropdown.classList.remove("open");
        }
    });
}

if (navDropdownLink) {
    navDropdownLink.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            e.stopPropagation();
            navDropdown.classList.toggle("open");
        }
    });
}

if (window.innerWidth <= 768) {
    const track = document.querySelector('.modes-track');
    const wrapper = document.querySelector('.modes-wrapper');
    
    if (track && wrapper) {
        let startX = 0;
        let isDragging = false;
        let dragged = false;
        let trackAnim = null;
        const animDuration = 15000;

        setTimeout(() => {
            const anims = track.getAnimations();
            if (anims.length > 0) {
                trackAnim = anims[0];
            }
        }, 100);

        wrapper.addEventListener('touchstart', (e) => {
            isDragging = true;
            dragged = false;
            startX = e.touches[0].clientX;
            if (trackAnim) trackAnim.pause();
        }, { passive: true });

        wrapper.addEventListener('touchmove', (e) => {
            if (!isDragging || !trackAnim) return;
            
            const currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            
            if (Math.abs(deltaX) > 5) dragged = true;

            let newTime = trackAnim.currentTime - (deltaX * 6);
            
            if (newTime < 0) newTime += animDuration;
            if (newTime > animDuration) newTime -= animDuration;
            
            trackAnim.currentTime = newTime;
            startX = currentX;
        }, { passive: true });

        wrapper.addEventListener('touchend', () => {
            isDragging = false;
            if (trackAnim) trackAnim.play();
        });

        track.addEventListener('click', (e) => {
            if (dragged) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }, true);
    }
}

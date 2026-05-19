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
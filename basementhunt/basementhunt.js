(function () {
    const overlay   = document.getElementById('intro-overlay');
    const site      = document.querySelector('.site-content');
    const staticCvs = document.getElementById('introStatic');
    const wipe      = document.getElementById('introWipe');
    const content   = document.getElementById('introContent');
    const textEl    = document.getElementById('introText');
    const cursor    = document.getElementById('introCursor');
    if (!overlay || !site) return;

    const sCtx = staticCvs ? staticCvs.getContext('2d') : null;
    let sW = 0, sH = 0, sBuf, sBuf32, sRAF;

    function resizeStatic() {
        if (!staticCvs || !sCtx) return;
        sW = staticCvs.width  = window.innerWidth;
        sH = staticCvs.height = window.innerHeight;
        sBuf   = sCtx.createImageData(sW, sH);
        sBuf32 = new Uint32Array(sBuf.data.buffer);
    }
    resizeStatic();

    function drawStatic() {
        if (!sCtx || !sBuf32) return;
        const n = sW * sH;
        for (let i = 0; i < n; i++) {
            const g = (Math.random() * 255) | 0;
            sBuf32[i] = (0xFF000000) | (g << 16) | (g << 8) | g;
        }
        sCtx.putImageData(sBuf, 0, 0);
        sRAF = requestAnimationFrame(drawStatic);
    }

    function stopStatic() {
        cancelAnimationFrame(sRAF);
        if (staticCvs) staticCvs.style.opacity = '0';
    }

    function fireWipe(onDone) {
        if (!wipe) { onDone && onDone(); return; }
        wipe.style.transition = 'none';
        wipe.style.top = '-2px';
        wipe.style.opacity = '1';
        void wipe.offsetHeight;
        wipe.style.transition = 'top 0.28s cubic-bezier(0.55,0,1,0.45)';
        wipe.style.top = '100vh';
        setTimeout(() => {
            wipe.style.opacity = '0';
            onDone && onDone();
        }, 300);
    }

    const MESSAGE  = 'The lights are the only thing keeping it away.';
    let charIdx    = 0;
    
    // Timer references for skipping
    let typeTimer  = null;
    let tExit1     = null;
    let tExit2     = null;
    let tExit3     = null;

    function typeNext() {
        if (!textEl) return;
        if (charIdx >= MESSAGE.length) {
            tExit1 = setTimeout(beginExit, 1500);
            return;
        }
        textEl.textContent += MESSAGE[charIdx];
        charIdx++;

        let delay = 48 + (Math.random() * 32 - 16);
        if (Math.random() < 0.07)  delay += 160;
        if (MESSAGE[charIdx - 1] === ' ') delay += 18;
        typeTimer = setTimeout(typeNext, delay);
    }

    function beginExit() {
        if (cursor) { cursor.style.animation = 'none'; cursor.style.opacity = '0'; }
        tExit2 = setTimeout(() => {
            if (content) {
                content.style.transition = 'opacity 0.9s ease';
                content.style.opacity = '0';
            }
            tExit3 = setTimeout(() => {
                overlay.classList.add('fade-out');
                site.classList.add('fade-in');
                const nav = document.getElementById('bh-nav');
                if (nav) nav.style.opacity = '1';
            }, 700);
        }, 200);
    }

    if (staticCvs) { staticCvs.style.opacity = '0.9'; drawStatic(); }

    let t1 = setTimeout(() => {
        stopStatic();
        fireWipe();
    }, 850);

    let t2 = setTimeout(() => {
        if (content) {
            content.style.transition = 'opacity 0.4s ease';
            content.style.opacity = '1';
        }
        typeTimer = setTimeout(typeNext, 120);
    }, 1550);

    // Skip functionality
    function skipIntro() {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(typeTimer);
        clearTimeout(tExit1);
        clearTimeout(tExit2);
        clearTimeout(tExit3);

        stopStatic();

        if (wipe) { wipe.style.transition = 'none'; wipe.style.opacity = '0'; }
        if (cursor) { cursor.style.animation = 'none'; cursor.style.opacity = '0'; }
        if (content) { content.style.transition = 'none'; content.style.opacity = '0'; }

        overlay.style.transition = 'opacity 0.4s ease';
        overlay.style.opacity = '0';
        
        site.style.transition = 'opacity 0.4s ease';
        site.classList.add('fade-in');

        const nav = document.getElementById('bh-nav');
        if (nav) nav.style.opacity = '1';

        setTimeout(() => {
            overlay.classList.add('fade-out');
        }, 400);

        document.removeEventListener('click', handleSkipTrigger, true);
    }

    let lastTap = 0;
    function handleSkipTrigger(e) {
        const now = Date.now();
        if (now - lastTap < 400) {
            skipIntro();
        }
        lastTap = now;
    }

    document.addEventListener('click', handleSkipTrigger, true);

}());

(function () {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = `
        position:fixed;inset:0;
        width:100%;height:100%;
        pointer-events:none;z-index:292;
    `;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    function makeParticle(randomY) {
        return {
            x:            Math.random() * canvas.width,
            y:            randomY ? Math.random() * canvas.height : canvas.height + 4,
            r:            0.3 + Math.random() * 1.8,
            vy:           -(0.05 + Math.random() * 0.18),
            vx:           (Math.random() - 0.5) * 0.08,
            wobOff:       Math.random() * Math.PI * 2,
            wobSpd:       0.004 + Math.random() * 0.008,
            opacity:      0.035 + Math.random() * 0.115,
            bright:       Math.random() < 0.06,
        };
    }

    const COUNT = 72;
    const particles = Array.from({ length: COUNT }, () => makeParticle(true));

    function makeAsh() {
        return {
            x:       Math.random() * canvas.width,
            y:       -4,
            r:       0.5 + Math.random() * 2.5,
            vy:      0.12 + Math.random() * 0.28,
            vx:      (Math.random() - 0.5) * 0.15,
            wobOff:  Math.random() * Math.PI * 2,
            wobSpd:  0.002 + Math.random() * 0.005,
            opacity: 0.02 + Math.random() * 0.07,
        };
    }
    const ASH_COUNT = 24;
    const ash = Array.from({ length: ASH_COUNT }, () => ({ ...makeAsh(), y: Math.random() * canvas.height }));

    let t = 0;

    function animateDust(ts) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t = ts * 0.001;

        for (const p of particles) {
            const wx = Math.sin(t * p.wobSpd * 80 + p.wobOff) * 0.35;
            p.x += p.vx + wx;
            p.y += p.vy;

            if (p.y < -4) {
                Object.assign(p, makeParticle(false));
            }
            if (p.x < -4) p.x = canvas.width + 4;
            if (p.x > canvas.width + 4) p.x = -4;

            const color = p.bright
                ? `rgba(200,170,60,${p.opacity * 1.8})`
                : `rgba(160,120,40,${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }

        for (const a of ash) {
            const wx = Math.sin(t * a.wobSpd * 80 + a.wobOff) * 0.6;
            a.x += a.vx + wx;
            a.y += a.vy;

            if (a.y > canvas.height + 4) {
                Object.assign(a, makeAsh());
            }
            if (a.x < -4) a.x = canvas.width + 4;
            if (a.x > canvas.width + 4) a.x = -4;

            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(130,100,35,${a.opacity})`;
            ctx.fill();
        }

        requestAnimationFrame(animateDust);
    }

    setTimeout(() => requestAnimationFrame(animateDust), 4200);
})();

(function () {
    const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#________@▓▒░█▌▐■□▪▫◆◇";

    function scramble(el, opts = {}) {
        const original  = el.dataset.originalText || el.textContent;
        el.dataset.originalText = original;

        const {
            duration   = 280,
            intensity  = 0.35,
            revealMs   = 160,
        } = opts;

        let start = null;
        const chars = original.split("");

        function frame(ts) {
            if (!start) start = ts;
            const elapsed = ts - start;
            const progress = Math.min(elapsed / duration, 1);

            const out = chars.map((c, i) => {
                if (c === " " || c === "\n" || c === ".") return c;
                const shouldCorrupt = Math.random() < intensity;
                if (elapsed < revealMs && shouldCorrupt) {
                    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                }
                if (elapsed >= revealMs && i / chars.length < (progress - (revealMs / duration))) {
                    return c;
                }
                return Math.random() < intensity * 0.5
                    ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
                    : c;
            });

            el.textContent = out.join("");

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                el.textContent = original;
            }
        }

        requestAnimationFrame(frame);
    }

    function setupScrambles() {
        const eyebrow  = document.querySelector(".eyebrow");
        const subtitle = document.querySelector(".subtitle");
        const h2       = document.querySelector(".intro-box h2");

        function scheduleScramble(el, minMs, maxMs, opts) {
            if (!el) return;
            function loop() {
                const delay = minMs + Math.random() * (maxMs - minMs);
                setTimeout(() => {
                    scramble(el, opts);
                    loop();
                }, delay);
            }
            loop();
        }

        scheduleScramble(eyebrow,  6000, 14000, { duration: 220, intensity: 0.28, revealMs: 120 });
        scheduleScramble(subtitle, 8000, 18000, { duration: 350, intensity: 0.42, revealMs: 180 });
        scheduleScramble(h2,       5000, 12000, { duration: 400, intensity: 0.50, revealMs: 200 });
    }

    setTimeout(setupScrambles, 4800);
})();

(function () {
    const figure = document.querySelector(".endo-figure");
    const img    = figure ? figure.querySelector("img") : null;
    if (!img) return;

    function init() {

        const redGhost  = img.cloneNode();
        const cyanGhost = img.cloneNode();

        function styleGhost(el, color) {
            el.style.cssText = `
                position:absolute;inset:0;
                width:100%;height:100%;
                object-fit:cover;object-position:left center;
                pointer-events:none;
                mix-blend-mode:screen;
                opacity:0.075;
                will-change:transform,opacity;
                transition:none;
                -webkit-mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.12) 10%,rgba(0,0,0,0.5) 26%,#000 52%);
                mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.12) 10%,rgba(0,0,0,0.5) 26%,#000 52%);
            `;
            if (color === "red")  el.style.filter = "brightness(0.85) contrast(1.2) saturate(0) sepia(1) hue-rotate(-10deg) saturate(4)";
            if (color === "cyan") el.style.filter = "brightness(0.85) contrast(1.2) saturate(0) sepia(1) hue-rotate(160deg)  saturate(4)";
        }
        styleGhost(redGhost,  "red");
        styleGhost(cyanGhost, "cyan");
        figure.appendChild(redGhost);
        figure.appendChild(cyanGhost);

        const sliceContainer = document.createElement("div");
        sliceContainer.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:4;overflow:hidden;";
        figure.appendChild(sliceContainer);

        const noiseCanvas = document.createElement("canvas");
        noiseCanvas.style.cssText = `
            position:absolute;inset:0;width:100%;height:100%;
            pointer-events:none;z-index:3;opacity:0.07;
            mix-blend-mode:overlay;
            -webkit-mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 26%,#000 52%);
            mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 26%,#000 52%);
        `;
        figure.appendChild(noiseCanvas);
        const nCtx = noiseCanvas.getContext("2d");

        function drawFigureNoise() {
            const w = figure.offsetWidth  || 500;
            const h = figure.offsetHeight || 600;
            if (noiseCanvas.width  !== w) noiseCanvas.width  = w;
            if (noiseCanvas.height !== h) noiseCanvas.height = h;
            nCtx.clearRect(0, 0, w, h);

            const count = Math.floor(w * h * 0.0026);
            nCtx.fillStyle = "rgba(200,180,80,0.9)";
            for (let i = 0; i < count; i++) {
                nCtx.fillRect(
                    Math.floor(Math.random() * w),
                    Math.floor(Math.random() * h),
                    1, 1
                );
            }
            if (Math.random() < 0.14) {
                const y   = Math.floor(Math.random() * h);
                const x0  = Math.floor(Math.random() * w * 0.4);
                const len = Math.floor(Math.random() * w * 0.48 + w * 0.05);
                nCtx.fillStyle = `rgba(240,220,100,${0.25 + Math.random() * 0.50})`;
                nCtx.fillRect(x0, y, len, 1);
            }
            if (Math.random() < 0.06) {
                const cx = Math.floor(Math.random() * w);
                const cy = Math.floor(Math.random() * h);
                for (let j = 0; j < 6; j++) {
                    nCtx.fillStyle = `rgba(60,180,60,${0.2 + Math.random() * 0.3})`;
                    nCtx.fillRect(cx + Math.floor(Math.random() * 5 - 2), cy + Math.floor(Math.random() * 5 - 2), 1, 1);
                }
            }
            setTimeout(drawFigureNoise, 50 + Math.random() * 95);
        }
        drawFigureNoise();

        const beam = document.createElement("div");
        beam.style.cssText = `
            position:absolute;left:0;right:0;height:16px;
            background:linear-gradient(to bottom,
                transparent,rgba(220,220,160,0.038) 40%,
                rgba(220,220,160,0.055) 50%,
                rgba(220,220,160,0.038) 60%,transparent
            );
            pointer-events:none;z-index:8;top:-16px;
            -webkit-mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.5) 26%,#000 52%);
            mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.5) 26%,#000 52%);
        `;
        figure.appendChild(beam);
        let beamY = -16, lastTs = 0;
        function sweepBeam(ts) {
            const dt = Math.min(ts - lastTs, 50);
            lastTs = ts;
            beamY += dt * 0.31;
            if (beamY > (figure.offsetHeight || 600) + 16) beamY = -16;
            beam.style.top = beamY + "px";
            requestAnimationFrame(sweepBeam);
        }
        requestAnimationFrame(sweepBeam);

        const rand  = (a, b) => a + Math.random() * (b - a);
        const irand = (a, b) => Math.floor(rand(a, b));
        const sign  = () => Math.random() > 0.5 ? 1 : -1;

        let ambT = 0;
        let rgbLocked = false;

        function ambientDrift() {
            ambT += 0.0055;
            if (!rgbLocked) {
                const dx = Math.sin(ambT) * 2.8 + Math.sin(ambT * 2.2) * 0.9;
                const dy = Math.cos(ambT * 0.72) * 1.4;
                redGhost.style.transform  = `translateX(${dx}px) translateY(${dy}px)`;
                cyanGhost.style.transform = `translateX(${-dx * 0.70}px) translateY(${-dy * 0.52}px)`;
                redGhost.style.opacity    = String(Math.max(0.048, 0.075 + Math.sin(ambT * 0.30) * 0.028));
                cyanGhost.style.opacity   = String(Math.max(0.036, 0.058 + Math.cos(ambT * 0.40) * 0.022));
            }
            requestAnimationFrame(ambientDrift);
        }
        setTimeout(() => requestAnimationFrame(ambientDrift), 4500);

        function sliceTear(intensity = 1) {
            const count = irand(3, 10);
            const strips = [];
            const figH = figure.offsetHeight;
            const figW = figure.offsetWidth;

            for (let i = 0; i < count; i++) {
                const topPx  = rand(0, figH * 0.92);
                const hPx    = rand(3, figH * 0.12 * intensity);
                const shiftX = sign() * rand(4, 38 * intensity);
                const shiftY = rand(-4, 4) * intensity;
                const strip  = document.createElement("div");
                strip.style.cssText = `position:absolute;left:0;right:0;top:${topPx}px;height:${hPx}px;overflow:hidden;`;
                const clone = img.cloneNode();
                clone.style.cssText = `
                    position:absolute;width:${figW}px;height:${figH}px;
                    object-fit:cover;object-position:left center;
                    top:${-topPx + shiftY}px;left:0;
                    transform:translateX(${shiftX}px);
                    filter:brightness(${0.68 + Math.random() * 0.5}) contrast(${1.2 + Math.random() * 0.7}) saturate(${0.28 + Math.random() * 0.7}) sepia(${Math.random() * 0.5}) hue-rotate(${sign() * Math.random() * 30}deg);
                    -webkit-mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.12) 10%,rgba(0,0,0,0.5) 26%,#000 52%);
                    mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.12) 10%,rgba(0,0,0,0.5) 26%,#000 52%);
                `;
                strip.appendChild(clone);
                sliceContainer.appendChild(strip);
                strips.push(strip);
            }
            setTimeout(() => strips.forEach(s => s.remove()), irand(30, 120 * intensity));
        }

        function imageJerk(intensity = 1) {
            const steps = irand(2, 5); let delay = 0;
            for (let i = 0; i < steps; i++) {
                const dx = sign() * rand(2, 16 * intensity);
                const dy = sign() * rand(0, 6  * intensity);
                setTimeout(() => {
                    img.style.transition = "none";
                    img.style.transform  = `translateX(${dx}px) translateY(${dy}px)`;
                }, delay);
                delay += irand(20, 60);
            }
            setTimeout(() => {
                img.style.transition = "transform 0.08s ease";
                img.style.transform  = "translateX(0) translateY(0)";
            }, delay);
        }

        function rgbSplit(intensity = 1) {
            rgbLocked = true;
            const dx = sign() * rand(4, 18 * intensity);
            redGhost.style.transform  = `translateX(${dx}px)`;
            cyanGhost.style.transform = `translateX(${-dx * 0.7}px)`;
            redGhost.style.opacity    = String(rand(0.30, 0.72));
            cyanGhost.style.opacity   = String(rand(0.26, 0.66));
            setTimeout(() => { rgbLocked = false; }, irand(40, 165));
        }

        function vertRoll() {
            const dy = sign() * rand(8, 40);
            img.style.transition = "none";
            img.style.transform  = `translateY(${dy}px)`;
            setTimeout(() => {
                img.style.transition = "transform 0.1s linear";
                img.style.transform  = "translateY(0)";
            }, irand(30, 80));
        }

        function signalCollapse() {
            img.style.filter = "brightness(0.04) contrast(2.2) saturate(0.2) sepia(0.6) hue-rotate(-30deg)";
            setTimeout(() => {
                img.style.filter = "brightness(1.35) contrast(0.88) saturate(1.2) hue-rotate(10deg)";
                setTimeout(() => {
                    img.style.filter = "brightness(0.40) contrast(1.7) saturate(0.35)";
                    setTimeout(() => { img.style.filter = ""; }, 68);
                }, 55);
            }, irand(40, 115));
        }

        function scanDesync() {
            const band  = document.createElement("div");
            const figH  = figure.offsetHeight;
            const startY = rand(-20, figH * 0.4);
            band.style.cssText = `
                position:absolute;left:0;right:0;
                height:${rand(2, 8)}px;top:${startY}px;
                background:rgba(255,255,255,${rand(0.08, 0.24)});
                pointer-events:none;z-index:7;
                transition:top ${rand(0.08, 0.22)}s linear;
            `;
            figure.appendChild(band);
            requestAnimationFrame(() => requestAnimationFrame(() => {
                band.style.top = `${figH + 20}px`;
            }));
            setTimeout(() => band.remove(), 400);
        }

        function staticPop() {
            const figH  = figure.offsetHeight || 600;
            const pop   = document.createElement("div");
            pop.style.cssText = `
                position:absolute;left:0;right:0;
                top:${rand(0, figH * 0.92)}px;
                height:${rand(1, 10)}px;
                background:rgba(255,255,220,${rand(0.16, 0.62)});
                pointer-events:none;z-index:9;
                mix-blend-mode:screen;
                -webkit-mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.5) 20%,#000 52%);
                mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.5) 20%,#000 52%);
            `;
            figure.appendChild(pop);
            setTimeout(() => pop.remove(), irand(18, 65));
        }

        function magneticWarp(intensity = 1) {
            const skX = sign() * rand(0.5, 3.0 * intensity);
            const scY = 1 + rand(0, 0.036 * intensity);
            img.style.transition = "none";
            img.style.transform  = `skewX(${skX}deg) scaleY(${scY})`;
            setTimeout(() => {
                img.style.transition = "transform 0.07s ease";
                img.style.transform  = "skewX(0deg) scaleY(1)";
            }, irand(22, 90));
        }

        function interferenceLines(intensity = 1) {
            const count = irand(2, 5);
            const bars  = [];
            for (let i = 0; i < count; i++) {
                const bar  = document.createElement("div");
                const topP = rand(2, 96);
                const col  = Math.random() > 0.5
                    ? `rgba(18,190,165,${rand(0.16, 0.32) * intensity})`
                    : `rgba(196,154,58,${rand(0.18, 0.36) * intensity})`;
                bar.style.cssText = `
                    position:absolute;left:0;right:0;
                    top:${topP}%;height:${rand(1, 4)}px;
                    background:${col};
                    pointer-events:none;z-index:8;
                    transform:translateX(${sign() * rand(2, 16)}px);
                `;
                figure.appendChild(bar);
                bars.push(bar);
            }
            setTimeout(() => bars.forEach(b => b.remove()), irand(28, 115));
        }

        function glitchLight() {
            const r = Math.random();
            if      (r < 0.26) sliceTear(0.6);
            else if (r < 0.44) imageJerk(0.7);
            else if (r < 0.58) rgbSplit(0.7);
            else if (r < 0.70) scanDesync();
            else if (r < 0.81) staticPop();
            else if (r < 0.91) interferenceLines(0.8);
            else               vertRoll();
        }

        function glitchMedium() {
            sliceTear(1.2);
            setTimeout(() => imageJerk(1),             32);
            if (Math.random() > 0.36) setTimeout(() => rgbSplit(1),            62);
            if (Math.random() > 0.52) setTimeout(() => staticPop(),             88);
            if (Math.random() > 0.62) setTimeout(() => interferenceLines(1),   112);
        }

        function glitchHeavy() {
            signalCollapse();
            setTimeout(() => sliceTear(1.8),           82);
            setTimeout(() => imageJerk(1.5),           122);
            setTimeout(() => rgbSplit(1.5),            148);
            setTimeout(() => magneticWarp(1),          170);
            setTimeout(() => sliceTear(1.4),           210);
            setTimeout(() => scanDesync(),             270);
            setTimeout(() => interferenceLines(1.2),   292);
            setTimeout(() => staticPop(),              315);
            setTimeout(() => imageJerk(1),             340);
            setTimeout(() => staticPop(),              362);
        }

        function glitchMega() {
            signalCollapse();
            for (let i = 0; i < 4; i++) setTimeout(() => sliceTear(2.2), i * 60);
            setTimeout(() => imageJerk(2),             88);
            setTimeout(() => rgbSplit(2),              108);
            setTimeout(() => magneticWarp(1.6),        132);
            setTimeout(() => interferenceLines(1.5),   158);
            setTimeout(() => sliceTear(1.6),           188);
            setTimeout(() => signalCollapse(),          275);
            setTimeout(() => staticPop(),              295);
            setTimeout(() => imageJerk(1.5),           315);
            setTimeout(() => rgbSplit(1.2),            375);
            setTimeout(() => sliceTear(1),             438);
            setTimeout(() => interferenceLines(1),     462);
            setTimeout(() => magneticWarp(0.8),        498);
        }

        function scheduleNext() {
            setTimeout(() => {
                const r = Math.random();
                if      (r < 0.44) glitchLight();
                else if (r < 0.72) glitchMedium();
                else if (r < 0.90) glitchHeavy();
                else               glitchMega();
                scheduleNext();
            }, rand(950, 5200));
        }

        setTimeout(scheduleNext, 4500);

        setInterval(() => {
            const r = Math.random();
            if      (r < 0.36) glitchLight();
            else if (r < 0.52) staticPop();
            else if (r < 0.62) interferenceLines(0.6);
        }, rand(1900, 3500));
    }

    if (img.complete && img.naturalHeight !== 0) {
        init();
    } else {
        img.addEventListener("load",  init);
        img.addEventListener("error", init);
    }
})();

(function () {
    const overlay = document.getElementById("glitchOverlay");

    function tearGlitch() {
        const count  = 1 + Math.floor(Math.random() * 4);
        const strips = [];
        for (let i = 0; i < count; i++) {
            const strip  = document.createElement("div");
            strip.className = "g-strip";
            const topPct = 5  + Math.random() * 85;
            const height = 3  + Math.random() * 30;
            const shiftX = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 28);
            const hue    = Math.random() > 0.55
                ? `hue-rotate(${80  + Math.random() * 200}deg) saturate(200%)`
                : `invert(1) hue-rotate(${20 + Math.random() * 90}deg)`;
            strip.style.cssText = `
                top:${topPct}%;height:${height}px;
                transform:translateX(${shiftX}px);
                backdrop-filter:${hue};-webkit-backdrop-filter:${hue};
                opacity:${0.5 + Math.random() * 0.5};
            `;
            overlay.appendChild(strip);
            strips.push(strip);
        }
        setTimeout(() => strips.forEach(s => s.remove()), 35 + Math.random() * 75);
    }

    function colorBleed() {
        const strip  = document.createElement("div");
        strip.className = "g-strip";
        const topPct = 10 + Math.random() * 70;
        const height = 50 + Math.random() * 140;
        const hue    = `hue-rotate(${120 + Math.random() * 220}deg) saturate(320%) brightness(1.25)`;
        strip.style.cssText = `
            top:${topPct}%;height:${height}px;
            backdrop-filter:${hue};-webkit-backdrop-filter:${hue};
            opacity:${0.18 + Math.random() * 0.38};
        `;
        overlay.appendChild(strip);
        setTimeout(() => strip.remove(), 55 + Math.random() * 65);
    }

    function signalDrop() {
        const strip  = document.createElement("div");
        strip.className = "g-strip";
        const height = 8 + Math.random() * 24;
        strip.style.cssText = `top:-${height}px;height:${height}px;background:rgba(0,0,0,0.92);`;
        overlay.appendChild(strip);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            strip.style.top        = "110vh";
            strip.style.transition = `top ${0.12 + Math.random() * 0.22}s linear`;
        }));
        setTimeout(() => strip.remove(), 600);
    }

    function signalSpike() {
        const flash = document.createElement("div");
        flash.style.cssText = `
            position:fixed;inset:0;
            background:rgba(255,255,255,${0.04 + Math.random() * 0.08});
            pointer-events:none;z-index:302;
        `;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 30 + Math.random() * 40);
    }

    function randomEvent() {
        const r = Math.random();
        if      (r < 0.40) tearGlitch();
        else if (r < 0.60) { tearGlitch(); setTimeout(tearGlitch, 55); }
        else if (r < 0.72) colorBleed();
        else if (r < 0.82) signalDrop();
        else if (r < 0.92) signalSpike();
        else               { tearGlitch(); tearGlitch(); }
    }

    function burstEvent() {
        const n = 3 + Math.floor(Math.random() * 5);
        let delay = 0;
        for (let i = 0; i < n; i++) {
            delay += 35 + Math.random() * 75;
            setTimeout(randomEvent, delay);
        }
    }

    function scheduleNext() {
        setTimeout(() => {
            const r = Math.random();
            if (r < 0.22) burstEvent();
            else           randomEvent();
            scheduleNext();
        }, 1800 + Math.random() * 6500);
    }

    setTimeout(scheduleNext, 4200);
})();

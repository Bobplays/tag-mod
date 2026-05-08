(function () {

    const runtime = window.c3_runtimeInterface?._localRuntime;
    if (!runtime) return;

    // ---------------- FINDERS ----------------

    function findYellow() {
        return Array.from(runtime._instancesByUid.values()).find(o => {
            const n = o._objectType?._name?.toLowerCase() || "";
            return n === "yellow_skin";
        });
    }

    function findRed() {
        return Array.from(runtime._instancesByUid.values()).find(o => {
            const n = o._objectType?._name?.toLowerCase() || "";
            return n === "red_skin";
        });
    }

    function findBlue() {
        return Array.from(runtime._instancesByUid.values()).find(o => {
            const n = o._objectType?._name?.toLowerCase() || "";
            return n === "blue_skin";
        });
    }

    // ---------------- OBJECTS ----------------

    let yellow, wi_yellow, value_yellow = 0;
    let red, wi_red, value_red = 0;
    let blue, wi_blue, value_blue = 0;

    // ---------------- INPUT ----------------

    let holdingJ = false;
    let holdingL = false;

    let holdingA = false;
    let holdingD = false;

    let holdingLeft = false;
    let holdingRight = false;

    document.addEventListener("keydown", (e) => {
        const k = e.key.toLowerCase();

        if (k === "j") holdingJ = true;
        if (k === "l") holdingL = true;

        if (k === "a") holdingA = true;
        if (k === "d") holdingD = true;

        if (e.key === "ArrowLeft") holdingLeft = true;
        if (e.key === "ArrowRight") holdingRight = true;
    });

    document.addEventListener("keyup", (e) => {
        const k = e.key.toLowerCase();

        if (k === "j") holdingJ = false;
        if (k === "l") holdingL = false;

        if (k === "a") holdingA = false;
        if (k === "d") holdingD = false;

        if (e.key === "ArrowLeft") holdingLeft = false;
        if (e.key === "ArrowRight") holdingRight = false;
    });

    // ---------------- LOOP ----------------

    function loop() {

        // -------- YELLOW (J/L) --------
        if (!yellow || yellow._destroyed || !wi_yellow) {
            yellow = findYellow();
            if (yellow) {
                wi_yellow = yellow._worldInfo;
                value_yellow = wi_yellow._a || 0;
            }
        }

        if (wi_yellow) {

            if (holdingL) value_yellow += 0.3;
            if (holdingJ) value_yellow -= 0.3;

            wi_yellow._a = value_yellow;

            try { wi_yellow.SetBboxChanged?.(); } catch {}
        }

        // -------- RED (A/D) --------
        if (!red || red._destroyed || !wi_red) {
            red = findRed();
            if (red) {
                wi_red = red._worldInfo;
                value_red = wi_red._a || 0;
            }
        }

        if (wi_red) {

            if (holdingD) value_red += 0.3;
            if (holdingA) value_red -= 0.3;

            wi_red._a = value_red;

            try { wi_red.SetBboxChanged?.(); } catch {}
        }

        // -------- BLUE (← →) --------
        if (!blue || blue._destroyed || !wi_blue) {
            blue = findBlue();
            if (blue) {
                wi_blue = blue._worldInfo;
                value_blue = wi_blue._a || 0;
            }
        }

        if (wi_blue) {

            if (holdingRight) value_blue += 0.3;
            if (holdingLeft) value_blue -= 0.3;

            wi_blue._a = value_blue;

            try { wi_blue.SetBboxChanged?.(); } catch {}
        }

        requestAnimationFrame(loop);
    }

    loop();

})();
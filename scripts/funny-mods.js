(function () {

    // ---------------- RUNTIME ----------------

    let runtime = null;

    function getRuntime() {
        return window.c3_runtimeInterface?._localRuntime || null;
    }

    function ensureRuntime() {
        const r = getRuntime();

        if (r && r !== runtime) {
            runtime = r;

            // force full rescan when runtime changes
            yellow = red = blue = null;
            wi_yellow = wi_red = wi_blue = null;
        }

        return runtime;
    }

    // ---------------- FINDERS ----------------

    function findByName(name) {
        if (!runtime?._instancesByUid) return null;

        return Array.from(runtime._instancesByUid.values()).find(o => {
            const n = o._objectType?._name?.toLowerCase() || "";
            return n === name;
        });
    }

    const findYellow = () => findByName("yellow_skin");
    const findRed    = () => findByName("red_skin");
    const findBlue   = () => findByName("blue_skin");

    // ---------------- STATE ----------------

    let yellow, red, blue;
    let wi_yellow, wi_red, wi_blue;

    let value_yellow = 0;
    let value_red = 0;
    let value_blue = 0;

    let holdingJ = false, holdingL = false;
    let holdingA = false, holdingD = false;
    let holdingLeft = false, holdingRight = false;

    // ---------------- INPUT ----------------

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

    // ---------------- RECOVERY ----------------

    let lastFullLossTime = 0;

    function shouldForceRescan(y, r, b) {
        return !y && !r && !b;
    }

    function forceRescanIfNeeded() {
        const now = Date.now();

        const y = !!findYellow();
        const r = !!findRed();
        const b = !!findBlue();

        if (shouldForceRescan(y, r, b)) {
            if (now - lastFullLossTime > 1000) {
                yellow = red = blue = null;
                wi_yellow = wi_red = wi_blue = null;
                lastFullLossTime = now;
            }
        }
    }

    // ---------------- LOOP ----------------

    function loop() {

        ensureRuntime();

        if (!runtime) {
            requestAnimationFrame(loop);
            return;
        }

        forceRescanIfNeeded();

        // -------- YELLOW --------
        if (!yellow || yellow._destroyed || !wi_yellow) {
            yellow = findYellow();
            wi_yellow = yellow?._worldInfo || null;
        }

        if (wi_yellow) {
            if (holdingL) value_yellow += 0.3;
            if (holdingJ) value_yellow -= 0.3;

            wi_yellow._a = value_yellow;
            wi_yellow.SetBboxChanged?.();
        }

        // -------- RED --------
        if (!red || red._destroyed || !wi_red) {
            red = findRed();
            wi_red = red?._worldInfo || null;
        }

        if (wi_red) {
            if (holdingD) value_red += 0.3;
            if (holdingA) value_red -= 0.3;

            wi_red._a = value_red;
            wi_red.SetBboxChanged?.();
        }

        // -------- BLUE --------
        if (!blue || blue._destroyed || !wi_blue) {
            blue = findBlue();
            wi_blue = blue?._worldInfo || null;
        }

        if (wi_blue) {
            if (holdingRight) value_blue += 0.3;
            if (holdingLeft) value_blue -= 0.3;

            wi_blue._a = value_blue;
            wi_blue.SetBboxChanged?.();
        }

        requestAnimationFrame(loop);
    }

    loop();

})();
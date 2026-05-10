(function () {

    let runtime = null;
    let running = false;
    let rafId = null;

    function getRuntime() {
        return window.rt
            || window.c3_runtimeInterface?._localRuntime
            || null;
    }

    function ensureRuntime() {
        const r = getRuntime();
        if (r) runtime = r;
        return runtime;
    }

    function getInstances() {
        if (!runtime) return null;
        return runtime._instancesByUid || runtime._instances || null;
    }

    function findByName(name) {
        const instances = getInstances();
        if (!instances) return null;

        const lower = name.toLowerCase();

        return Array.from(instances.values()).find(o => {
            const n = o?._objectType?._name?.toLowerCase?.() || "";
            return n === lower;
        });
    }

    const findYellow = () => findByName("yellow_skin");
    const findRed    = () => findByName("red_skin");
    const findBlue   = () => findByName("blue_skin");

    let yellow, red, blue;
    let wi_yellow, wi_red, wi_blue;

    let value_yellow = 0;
    let value_red = 0;
    let value_blue = 0;

    let holdingJ = false, holdingL = false;
    let holdingA = false, holdingD = false;
    let holdingLeft = false, holdingRight = false;

    function onKeyDown(e) {
        const k = e.key.toLowerCase();

        if (k === "j") holdingJ = true;
        if (k === "l") holdingL = true;
        if (k === "a") holdingA = true;
        if (k === "d") holdingD = true;

        if (e.key === "ArrowLeft") holdingLeft = true;
        if (e.key === "ArrowRight") holdingRight = true;
    }

    function onKeyUp(e) {
        const k = e.key.toLowerCase();

        if (k === "j") holdingJ = false;
        if (k === "l") holdingL = false;
        if (k === "a") holdingA = false;
        if (k === "d") holdingD = false;

        if (e.key === "ArrowLeft") holdingLeft = false;
        if (e.key === "ArrowRight") holdingRight = false;
    }

    function loop() {
        if (!running) return;

        ensureRuntime();
        if (!runtime) {
            rafId = requestAnimationFrame(loop);
            return;
        }

        if (!yellow || yellow._destroyed) {
            yellow = findYellow();
            wi_yellow = yellow?._worldInfo || null;
        }

        if (wi_yellow) {
            if (holdingL) value_yellow += 0.3;
            if (holdingJ) value_yellow -= 0.3;

            wi_yellow._a = value_yellow;
            wi_yellow.SetBboxChanged?.();
        }

        if (!red || red._destroyed) {
            red = findRed();
            wi_red = red?._worldInfo || null;
        }

        if (wi_red) {
            if (holdingD) value_red += 0.3;
            if (holdingA) value_red -= 0.3;

            wi_red._a = value_red;
            wi_red.SetBboxChanged?.();
        }

        if (!blue || blue._destroyed) {
            blue = findBlue();
            wi_blue = blue?._worldInfo || null;
        }

        if (wi_blue) {
            if (holdingRight) value_blue += 0.3;
            if (holdingLeft) value_blue -= 0.3;

            wi_blue._a = value_blue;
            wi_blue.SetBboxChanged?.();
        }

        rafId = requestAnimationFrame(loop);
    }


    const mod = {
        id: 2,
        name: "Roll",
        desc: "makes the skins roll When moving ",
        enabled: false,

        init(api) {
            document.addEventListener("keydown", onKeyDown);
            document.addEventListener("keyup", onKeyUp);
        },

        toggle(state) {

            running = state;

            if (state) {
                loop();
            } else {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
            }
        }
    };

    window.ModAPI?.register(mod);

})();
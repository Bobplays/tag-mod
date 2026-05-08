(() => {

    let runtime;

    function waitForRuntime() {
        runtime = window.c3_runtimeInterface?._localRuntime;

        if (!runtime) {
            requestAnimationFrame(waitForRuntime);
            return;
        }

        setup();
    }

    function setup() {

        let injected = false;

        let player_yellow = null;
        let wi_yellow = null;
        let value_yellow = 0;

        let player_red = null;
        let wi_red = null;
        let value_red = 0;

        let holdingL = false;
        let holdingJ = false;

        function findYellow() {
            const instances = Array.from(runtime._instancesByUid.values());

            return instances.find(o => {
                const n = o._objectType?._name?.toLowerCase() || "";
                return n === "yellow_skin";
            });
        }

        function findRed() {
            const instances = Array.from(runtime._instancesByUid.values());

            return instances.find(o => {
                const n = o._objectType?._name?.toLowerCase() || "";
                return n === "red_skin";
            });
        }

        function init() {
            if (injected) return;

            // Yellow
            player_yellow = findYellow();
            if (player_yellow) {
                wi_yellow = player_yellow._worldInfo;
                value_yellow = wi_yellow._a || 0;
            }

            // Red (ACTIVE TARGET NOW)
            player_red = findRed();
            if (!player_red) return;

            wi_red = player_red._worldInfo;
            value_red = wi_red._a || 0;

            injected = true;

            console.log("[MOD] Injected into red_skin (yellow ignored for now)");

            requestAnimationFrame(loop);
        }

        document.addEventListener("keydown", (e) => {

            if (e.key === "1") {
                init();
            }

            if (e.key.toLowerCase() === "l") holdingL = true;
            if (e.key.toLowerCase() === "j") holdingJ = true;
        });

        document.addEventListener("keyup", (e) => {

            if (e.key.toLowerCase() === "l") holdingL = false;
            if (e.key.toLowerCase() === "j") holdingJ = false;
        });

        function loop() {
            if (!injected) return;

            // refresh red_skin
            if (!wi_red || !player_red) {
                player_red = findRed();
                if (player_red) wi_red = player_red._worldInfo;
            }

            if (wi_red) {

                if (holdingL) value_red += 0.3;
                if (holdingJ) value_red -= 0.3;

                wi_red._a = value_red;

                try {
                    wi_red.SetBboxChanged();
                } catch {}
            }

            // yellow_skin is now ONLY tracked (no modification)
            if (!wi_yellow || !player_yellow) {
                player_yellow = findYellow();
                if (player_yellow) wi_yellow = player_yellow._worldInfo;
            }

            if (wi_yellow) {
                value_yellow = wi_yellow._a || value_yellow;
            }

            requestAnimationFrame(loop);
        }
    }

    waitForRuntime();

})();
window.ModHandler = {
    initAll() {
        for (const mod of window.ModAPI.mods) {
            try {
                if (typeof mod.init === "function") {
                    mod.init(window.ModAPI);
                }
            } catch (e) {
                console.warn("[ModHandler] init error:", mod.name, e);
            }
        }
    },

    loadScript(path) {
        const s = document.createElement("script");
        s.src = path;
        document.head.appendChild(s);
    }
};
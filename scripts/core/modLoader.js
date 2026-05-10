console.log("[ModLoader] Starting");
const MOD_PATH = "scripts/mods/";
const mods = [
    "test.js",
    "roll.js"
];

function waitForAPI(cb) {
    const check = () => {
        if (window.ModAPI && window.ModAPI.mods) return cb();
        setTimeout(check, 50);
    };
    check();
}

for (const mod of mods) {
    ModHandler.loadScript(MOD_PATH + mod);
}

waitForAPI(() => {
    setTimeout(() => {
        ModHandler.initAll();
        window.ModAPI.ready = true;
        console.log("[ModLoader] Mods initialized");
    }, 200);
});
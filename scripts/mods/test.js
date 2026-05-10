window.ModAPI.register({
    id: 1,
    name: "Test Mod",
    desc: "Example mod for testing system",
    enabled: false,

    init(api) {
        console.log("[Test Mod] Initialized");
    },

    toggle(state, api) {
        console.log("[Test Mod] state:", state);
    }
});
window.ModAPI = window.ModAPI || {};
Object.assign(window.ModAPI, {
    ready: false,
    runtime: null,
    layout: null,
    mods: [],
    values: {},
    set(key, value) {
        this.values[key] = value;
    },
    get(key) {
        return this.values[key];
    },
    register(mod) {
        this.mods.push(mod);
    },
    getMod(id) {
        return this.mods.find(m => m.id === id);
    },
    toggleMod(id, state) {
        const mod = this.getMod(id);
        if (!mod) return;
        mod.enabled = state;
        try {
            if (typeof mod.toggle === "function") {
                mod.toggle(state, this);
            }
        } catch (e) {
            console.warn("[ModAPI] toggle error:", e);
        }
    }
});

(() => {
    const wait = () => {
        if (!window.c3_runtimeInterface?._localRuntime || !self.C3)
            return setTimeout(wait, 100);
        const proto =
            Object.values(C3).find(v =>
                v?.prototype?.CreateInitialInstances
            )?.prototype;
        if (!proto) return;
        const original = proto.CreateInitialInstances;
        proto.CreateInitialInstances = function () {
            window.ModAPI.layout = this._layout?._name || null;
            return original.apply(this, arguments);
        };
    };
    wait();
})();
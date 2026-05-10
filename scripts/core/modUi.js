(function () {
    if (document.getElementById("RuntimeJS-launcher-ui")) return;
    const WIDTH = 950;
    const HEIGHT = 560;
    const SAVE_KEY = "RuntimeJS_launcher_save";

    let activePage = "home";
    let modSearch = "";
    let menuOpen = false;
    let debugMode = false;
    let mapLocked = false;

    function isMapActive() {
        const layout = window.ModAPI?.layout;

        if (!layout) return false;
        if (typeof layout === "string") {
            return layout.includes("map");
        }
        if (Array.isArray(layout)) {
            return layout.some(v => String(v).includes("map"));
        }
        if (typeof layout === "object") {
            return JSON.stringify(layout).includes("map");
        }
        return false;
    }

    const root = document.createElement("div");
    root.id = "RuntimeJS-launcher-ui";
    root.style.display = "none";
    document.body.appendChild(root);
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "scripts/core/gui/style.css";
    document.head.appendChild(style);

    setInterval(() => {
        if (debugMode) return;
        const inMap = isMapActive();
        if (inMap) {
            mapLocked = true;
            menuOpen = false;
            root.style.display = "none";
        } else {
            mapLocked = false;
        }

    }, 100);

    document.addEventListener("keydown", (e) => {
        if (e.code !== "ShiftRight") return;
        if (e.repeat) return;
        if (mapLocked && !debugMode) {
            menuOpen = false;
            root.style.display = "none";
            return;
        }
        menuOpen = !menuOpen;
        root.style.display =
            menuOpen
                ? "block"
                : "none";
    });


    function getMods() {
        return window.ModAPI?.mods || [];
    }

    function getMod(id) {
        return getMods().find(m => String(m.id) === String(id));
    }

    let moving = false;

    let offsetX = 0;
    let offsetY = 0;

    let targetX =
        window.innerWidth / 2 - WIDTH / 2;

    let targetY =
        window.innerHeight / 2 - HEIGHT / 2;

    let currentX = targetX;
    let currentY = targetY;

    let rotTarget = 0;
    let rotCurrent = 0;

    let prevX = 0;
    let prevT = 0;

    function clamp(v, min, max) {
        return Math.max(min, Math.min(v, max));
    }

    function render() {
        const mods = getMods();
        root.innerHTML = `
        <div class="grab" id="grab">
            RuntimeJS Launcher
        </div>
        <div class="layout">
            <div class="sidebar">
                ${["home", "mods", "settings"]
                .map(p => `
                    <div
                        class="tab ${activePage === p ? "active" : ""}"
                        onclick="window.__setPage('${p}')"
                    >
                        ${p.charAt(0).toUpperCase() + p.slice(1)}
                    </div>
                `).join("")}
            </div>
            <div class="content">
                ${page(mods)}
            </div>
        </div>
        `;
        bind();
    }

    function page(mods) {
        if (activePage === "home") {
            return `
            <div class="page">
                <h2>RuntimeJS Launcher</h2>
                <p style="opacity:.6">
                    Manage your mods and configuration
                </p>
                <div class="grid">
                    <div class="card">
                        <b>Installed Mods</b><br>
                        <span id="installed-count">${mods.length}</span>
                    </div>
                    <div class="card">
                        <b>Active Mods</b><br>
                        <span id="active-count">${mods.filter(m => m.enabled).length}</span>
                    </div>
                </div>
                <div class="card" style="margin-top:12px">
                    <b>Changelog</b>
                    <div class="logbox">
                        v1.0.0 - Initial release<br>
                        • Added mod management UI<br>
                    </div>
                </div>
            </div>
            `;
        }
        if (activePage === "mods") {
            return `
            <div class="page">
                <h2>Mods</h2>
                <input
                    id="search"
                    value="${modSearch}"
                    placeholder="Search mods..."
                />
                <div style="margin-top:10px">
                    ${mods
                    .filter(m =>
                        m.name.toLowerCase().includes(modSearch.toLowerCase())
                    )
                    .map(m => `
                        <div class="mod" data-mod="${m.id}">
                            <div>
                                <b>${m.name}</b><br>
                                <span style="opacity:.6;font-size:12px">
                                    ${m.desc || "No description"}
                                </span>
                            </div>
                            <div
                                class="toggle"
                                onclick="window.__toggle('${m.id}')"
                                style="background:${m.enabled ? "#22c55e" : "rgba(255,255,255,0.1)"}"
                            >
                                <div
                                    class="dot"
                                    style="transform:translateX(${m.enabled ? 22 : 0}px)"
                                ></div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
            `;
        }
        return `
        <div class="page">
            <h2>Settings</h2>
            <div class="card" style="margin-top:12px">
                <b>Debug Mode</b><br>
                <span style="opacity:.6;font-size:12px">
                    Overrides map lock system
                </span>
                <div
                    class="toggle debug-toggle"
                    onclick="window.__toggleDebug()"
                    style="margin-top:10px;background:${debugMode ? "#22c55e" : "rgba(255,255,255,0.1)"}"
                >
                    <div
                        class="dot debug-dot"
                        style="transform:${debugMode ? "translateX(22px)" : "translateX(0px)"}"
                    ></div>
                </div>
            </div>
        </div>
        `;
    }

    function bind() {
        const grab =
            document.getElementById("grab");
        const search =
            document.getElementById("search");

        if (grab) {
            grab.onmousedown = (e) => {
                moving = true;

                offsetX =
                    e.clientX - root.getBoundingClientRect().left;

                offsetY =
                    e.clientY - root.getBoundingClientRect().top;

                prevX = e.clientX;
                prevT = Date.now();
            };
        }

        if (search) {

            search.oninput = (e) => {
                modSearch = e.target.value;
                render();
            };
        }
    }

    window.__toggle = (id) => {
        const mod = getMod(id);
        if (!mod) return;
        const newState = !mod.enabled;

        if (window.ModAPI?.toggleMod) {
            window.ModAPI.toggleMod(mod.id, newState);
        } else {
            mod.enabled = newState;
        }

        mod.enabled = newState;
        const el = document.querySelector(`[data-mod='${mod.id}']`);
        if (!el) return;

        const toggle = el.querySelector(".toggle");
        const dot = el.querySelector(".dot");

        toggle.style.background = newState
            ? "#22c55e"
            : "rgba(255,255,255,0.1)";
        dot.style.transform = newState
            ? "translateX(22px)"
            : "translateX(0px)";

        updateCounters();
        saveState();
    };

    function updateCounters() {
        const mods = getMods();
        const installed =
            document.getElementById("installed-count");
        const active =
            document.getElementById("active-count");

        if (installed) {
            installed.textContent = mods.length;
        }
        if (active) {
            active.textContent =
                mods.filter(m => m.enabled).length;
        }
    }

    window.__toggleDebug = () => {
        debugMode = !debugMode;
        const toggle = document.querySelector(".debug-toggle");
        const dot = document.querySelector(".debug-dot");

        if (toggle && dot) {
            toggle.style.background =
                debugMode ? "#22c55e" : "rgba(255,255,255,0.1)";
            dot.style.transform =
                debugMode ? "translateX(22px)" : "translateX(0px)";
        }
        saveState();
    };

    let lastCount = -1;
    setInterval(() => {
        const count = getMods().length;

        if (count !== lastCount) {
            lastCount = count;
            updateCounters();

            if (activePage === "mods") render();
            if (activePage === "home") updateCounters();
        }

    }, 250);

    window.__setPage = (p) => {
        activePage = p;
        render();
    };

    document.addEventListener("mousemove", (e) => {
        if (!moving) return;

        const now = Date.now();
        const dt = now - prevT;
        const dx = e.clientX - prevX;
        const speed = Math.abs(dx / (dt || 1));

        rotTarget =
            dx > 0
                ? Math.min(speed * 6, 6)
                : -Math.min(speed * 6, 6);

        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        x = clamp(x, 0, window.innerWidth - WIDTH);
        y = clamp(y, 0, window.innerHeight - HEIGHT);

        targetX = x;
        targetY = y;

        prevX = e.clientX;
        prevT = now;
    });

    document.addEventListener("mouseup", () => {
        moving = false;
        rotTarget = 0;
    });

    function saveState() {
        const mods = window.ModAPI?.mods || [];
        const data = {
            debugMode,
            mods: mods.map(m => ({
                id: m.id,
                enabled: m.enabled
            }))
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }
    function loadState() {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error("Failed to parse save:", e);
            return;
        }
        debugMode = !!data.debugMode;
        const interval = setInterval(() => {
            const mods = window.ModAPI?.mods;
            if (!mods || !mods.length) return;
            if (data.mods) {
                for (const saved of data.mods) {
                    const mod = mods.find(m => String(m.id) === String(saved.id));
                    if (!mod) continue;
                    const newState = !!saved.enabled;
                    if (window.ModAPI?.toggleMod) {
                        window.ModAPI.toggleMod(mod.id, newState);
                    } else {
                        mod.enabled = newState;
                    }
                }
            }
            clearInterval(interval);
            if (typeof updateCounters === "function") updateCounters();
            if (typeof render === "function") render();
        }, 100);
    }

    function loop() {
        currentX += (targetX - currentX) * 0.3;
        currentY += (targetY - currentY) * 0.3;
        rotCurrent += (rotTarget - rotCurrent) * 0.25;

        root.style.transform =
            `translate(${currentX}px,${currentY}px) rotate(${rotCurrent}deg)`;
        requestAnimationFrame(loop);
    }
    render();
    requestAnimationFrame(loop);
    loadState();
})();
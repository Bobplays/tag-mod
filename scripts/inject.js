(function () {

    /*──────────────────────────────*/
    /* UI STYLE                    */
    /*──────────────────────────────*/
    const style = document.createElement("style");
    style.innerHTML = `
    :root {
        --base:#1e1e2e;
        --mantle:#181825;
        --surface0:#313244;
        --surface1:#45475a;
        --text:#cdd6f4;
        --subtext:#a6adc8;
        --accent:#89b4fa;
        --accent2:#cba6f7;
    }

    #InjectedMain {
        position:fixed;
        top:120px;
        left:120px;
        width:950px;
        height:560px;
        display:flex;
        border-radius:18px;
        background:var(--base);
        box-shadow:0 20px 40px rgba(0,0,0,0.5);
        color:var(--text);
        font-family:sans-serif;
        z-index:999999;
    }

    #InjectedSidebar {
        width:220px;
        background:var(--mantle);
        border-right:1px solid var(--surface0);
        padding:12px;
    }

    .tabButton {
        padding:10px;
        margin-bottom:6px;
        border-radius:10px;
        background:var(--surface0);
        color:var(--subtext);
        cursor:pointer;
    }

    .tabButton.active {
        background:var(--accent);
        color:#111;
    }

    #InjectedMenu {
        flex:1;
        overflow-y:auto;
        padding:14px;
    }

    .searchBox {
        width:100%;
        padding:8px;
        margin-bottom:12px;
        border-radius:10px;
        border:none;
        background:var(--surface0);
        color:var(--text);
    }

    .userCard {
        background:var(--surface0);
        margin-bottom:10px;
        padding:10px;
        border-radius:14px;
    }

    .title {
        font-weight:bold;
        color:var(--accent2);
        margin-bottom:6px;
    }

    .field {
        font-size:12px;
        color:var(--subtext);
    }

    .btn {
        margin-top:6px;
        padding:6px;
        border-radius:8px;
        background:var(--surface1);
        cursor:pointer;
        font-size:12px;
        text-align:center;
    }

    .btn:hover {
        background:var(--accent);
        color:#111;
    }
    `;
    document.head.appendChild(style);

    /*──────────────────────────────*/
    /* UI                          */
    /*──────────────────────────────*/
    const main = document.createElement("div");
    main.id = "InjectedMain";
    main.innerHTML = `
        <div id="InjectedSidebar">
            <div class="tabButton active" data-tab="runtime">Runtime</div>
            <div class="tabButton" data-tab="instances">Instances</div>
            <div class="tabButton" data-tab="misc">Misc</div>
        </div>
        <div id="InjectedMenu"></div>
    `;
    document.body.appendChild(main);

    const menu = document.getElementById("InjectedMenu");

    /*──────────────────────────────*/
    /* DRAG                        */
    /*──────────────────────────────*/
    let moving=false,ox=0,oy=0;

    main.onmousedown=e=>{
        moving=true;
        ox=e.clientX-main.offsetLeft;
        oy=e.clientY-main.offsetTop;
    };

    document.onmousemove=e=>{
        if(!moving) return;
        main.style.left=e.clientX-ox+"px";
        main.style.top=e.clientY-oy+"px";
    };

    document.onmouseup=()=>moving=false;

    /*──────────────────────────────*/
    /* RUNTIME                     */
    /*──────────────────────────────*/
    const getRuntime=()=>window.c3_runtimeInterface?._localRuntime;

    let tab="runtime";
    let search="";
    let cards=new Map();

    let focusedUid=null;
    let lastSnapshot=new Map();
    let logButtons=new Set();

    /*──────────────────────────────*/
    /* SAFE STRINGIFY              */
    /*──────────────────────────────*/
    function safeStringify(obj, maxDepth = 2) {
        const seen = new WeakSet();

        return JSON.stringify(obj, function (key, value) {

            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) return "[Circular]";
                seen.add(value);
            }

            const depth = this.__depth__ || 0;
            if (depth >= maxDepth) return "[MaxDepth]";

            if (typeof value === "object" && value !== null) {
                Object.defineProperty(value, "__depth__", {
                    value: depth + 1,
                    enumerable: false
                });
            }

            return value;

        }, 2);
    }

    /*──────────────────────────────*/
    /* TABS                        */
    /*──────────────────────────────*/
    document.querySelectorAll(".tabButton").forEach(btn=>{
        btn.onclick=()=>{

            document.querySelectorAll(".tabButton").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");

            tab=btn.dataset.tab;

            menu.innerHTML="";
            cards.clear();
            logButtons.clear();

            if(tab === "instances"){
                const s=document.createElement("input");
                s.className="searchBox";
                s.placeholder="Search instances...";
                s.value=search;

                s.oninput=e=>{
                    search=e.target.value.toLowerCase();
                };

                menu.prepend(s);
            }
        };
    });

    /*──────────────────────────────*/
    /* CARD                        */
    /*──────────────────────────────*/
    function createCard(id,title){
        const c=document.createElement("div");
        c.className="userCard";
        c.innerHTML=`<div class="title">${title}</div><div class="fields"></div>`;
        menu.appendChild(c);
        cards.set(id,c);
        return c.querySelector(".fields");
    }

    /*──────────────────────────────*/
    /* SNAPSHOT                    */
    /*──────────────────────────────*/
    function snapshot(inst){
        const w=inst._worldInfo||{};

        let data = {
            uid: inst._uid,
            type: inst._objectType?._name,
            visible: inst.visible,
            opacity: inst.opacity,
            angle: inst.angle
        };

        for(const k in w){
            data["world."+k]=w[k];
        }

        return data;
    }

    function diffSnapshots(prev, now){
        if(!prev) return "";

        let out="";
        for(const k in now){
            if(prev[k] !== now[k]){
                out += `<div style="color:#f38ba8">${k}: ${prev[k]} → ${now[k]}</div>`;
            }
        }
        return out;
    }

    /*──────────────────────────────*/
    /* INSPECTOR                  */
    /*──────────────────────────────*/
    const inspector=document.createElement("div");
    inspector.style=`
        position:fixed;
        right:20px;
        top:120px;
        width:340px;
        height:450px;
        background:#181825;
        color:#cdd6f4;
        z-index:999999;
        border-radius:12px;
        padding:10px;
        overflow:auto;
        font-family:sans-serif;
    `;
    document.body.appendChild(inspector);

    function updateInspector(runtime){

        if(!focusedUid){
            inspector.innerHTML="No instance selected";
            return;
        }

        const inst=runtime._instancesByUid.get(focusedUid);

        if(!inst){
            inspector.innerHTML="Instance no longer exists";
            focusedUid=null;
            return;
        }

        const now=snapshot(inst);
        const prev=lastSnapshot.get(focusedUid);

        const changes = diffSnapshots(prev, now);

        lastSnapshot.set(focusedUid, {...now});

        inspector.innerHTML=`
            <b style="color:#cba6f7">${now.type}</b><br>
            UID: ${now.uid}

            <hr style="border:1px solid #313244">

            <div class="btn" id="dumpJsonBtn">Dump Full JSON</div>

            <hr style="border:1px solid #313244">

            <b>FULL STATE (click to select)</b><br>

            <pre id="jsonDump" style="
                font-size:11px;
                white-space:pre-wrap;
                user-select:text;
                cursor:pointer;
            ">
${safeStringify(now, 2)}
            </pre>

            <hr style="border:1px solid #313244">

            <b>CHANGES (OLD → NEW)</b><br>
            ${changes || "<span style='color:#a6adc8'>No changes</span>"}
        `;

        /* dump button (clean console dump) */
        document.getElementById("dumpJsonBtn").onclick=()=>{
            console.log("INSTANCE SNAPSHOT:\n", now);
        };

        /* click-to-select JSON */
        const dump=document.getElementById("jsonDump");
        if(dump){
            dump.onclick=()=>{
                const range=document.createRange();
                range.selectNodeContents(dump);

                const sel=window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);

                console.log("[MOD] JSON selected");
            };
        }
    }

    /*──────────────────────────────*/
    /* LOOP                        */
    /*──────────────────────────────*/
    function loop(){
        const runtime=getRuntime();
        if(!runtime) return requestAnimationFrame(loop);

        if(tab==="runtime"){
            if(!cards.has("rt")){
                const f=createCard("rt","Runtime");
                for(const k in runtime){
                    f.innerHTML+=`<div class="field">${k}</div>`;
                }
            }
        }

        if(tab==="instances"){

            for(const inst of runtime._instancesByUid.values()){

                const name=inst._objectType?._name||"unknown";
                const uid=inst._uid;

                if(search && !name.toLowerCase().includes(search)) continue;

                let card=cards.get(uid);

                if(!card){
                    card=createCard(uid,`${name} (${uid})`);
                } else {
                    card=card.querySelector(".fields");
                    card.innerHTML="";
                }

                const w=inst._worldInfo||{};

                card.innerHTML+=`
                    <div class="field">x:${w._x}</div>
                    <div class="field">y:${w._y}</div>
                    <div class="field">w:${w._w}</div>
                    <div class="field">h:${w._h}</div>
                `;

                if(!logButtons.has(uid)){
                    logButtons.add(uid);

                    const btn=document.createElement("div");
                    btn.className="btn";
                    btn.innerText="Inspect";

                    btn.onclick=()=>{
                        focusedUid=uid;
                        lastSnapshot.delete(uid);
                    };

                    card.parentElement.appendChild(btn);
                }
            }
        }

        updateInspector(runtime);
        requestAnimationFrame(loop);
    }

    loop();

    /*──────────────────────────────*/
    /* RIGHT SHIFT TOGGLE          */
    /*──────────────────────────────*/
    let visible=true;

    function setUI(v){
        visible=v;
        main.style.display=v?"flex":"none";
        inspector.style.display=v?"block":"none";
    }

    document.addEventListener("keydown",e=>{
        if(e.key==="Shift"&&e.location===2){
            setUI(!visible);
        }
    });

})();
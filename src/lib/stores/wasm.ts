let wasmReady: Promise<void> | null = null;
let wasmInstance: WebAssembly.Instance | null = null;
let go: any;


export function initializeWasm(): Promise<void> {
    console.log("Initializing WASM lololo");
    if (wasmReady) return wasmReady;

    wasmReady = new Promise<void>((resolve, reject) => {
        const init = async () => {
            if (typeof window.Go === "undefined") {
                console.error("Go WASM runtime not loaded");
                reject(new Error("Go WASM runtime not loaded"));
                return;
            }

            go = new window.Go();

            try {
                const result = await WebAssembly.instantiateStreaming(
                    fetch("/domain.wasm"),
                    go.importObject
                );

                wasmInstance = result.instance;

                let ready = false;

                // JS hook that Go will call when ready
                (window as any).__wasmReady = () => {
                    console.log("WASM signaled ready");
                    ready = true;
                    resolve();
                };

                // Start Go (this never returns)
                console.log("Starting Go WASM");
                go.run(wasmInstance).then(() => {
                    console.error("Go WASM exited unexpectedly");
                    if (!ready) {
                        reject(new Error("Go WASM exited before being ready"));
                    }
                }).catch((e: any) => {
                    console.error("Go WASM crashed", e);
                    if (!ready) {
                        reject(e);
                    }
                });
            } catch (e) {
                console.error("Error initializing WASM", e);
                reject(e);
            }
        };

        init();
    });

    return wasmReady;
}
export { wasmReady };
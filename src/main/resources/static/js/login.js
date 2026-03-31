document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const errorBox = document.getElementById("loginError");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        ocultarError();

        const username = document.getElementById("username")?.value?.trim();
        const password = document.getElementById("password")?.value || "";

        if (!username || !password) {
            mostrarError("Ingresa usuario y contraseña.");
            return;
        }

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ username, password })
            });

            const text = await res.text();
            let data = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = null;
            }

            if (!res.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    `Error ${res.status}: no se pudo iniciar sesión`
                );
            }

            sessionStorage.setItem("sesionUsuario", JSON.stringify(data));
            window.location.href = "/index";

        } catch (err) {
            console.error("Error login:", err);
            mostrarError(err.message || "Usuario o contraseña incorrectos.");
        }
    });

    function mostrarError(msg) {
        if (!errorBox) return;
        errorBox.textContent = msg;
        errorBox.classList.remove("d-none");
    }

    function ocultarError() {
        if (!errorBox) return;
        errorBox.textContent = "";
        errorBox.classList.add("d-none");
    }
});
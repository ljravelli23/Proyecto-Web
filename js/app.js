const filter = document.querySelector("#team-filter");
const apiKeyInput = document.querySelector("#api-key-input");
const toast = document.querySelector("#toast");
let toastTimer;

if (AppState.apiKey) {
	apiKeyInput.value = AppState.apiKey;
}

populateTeamFilter();
renderAll();

document.addEventListener("click", (event) => {
	const navButton = event.target.closest("[data-view]");
	if (navButton) switchView(navButton.dataset.view);

	if (
		event.target.closest("#demo-toggle-btn") ||
		event.target.closest("[data-activate-demo]")
	) {
		toggleDemo();
	}
});

document.querySelector("#open-pack-btn").addEventListener("click", () => {
	if (!AppState.demoEnabled) {
		showToast("Primero activa los datos demo para abrir un sobre.");
		return;
	}
	const pack = openDemoPack();
	renderAll(filter.value);
	renderPack(pack);
	showToast("¡Sobre abierto! Las siete barajitas se agregaron a tu colección.");
});

document.querySelector("#connect-btn").addEventListener("click", () => {
	const savedKey = setApiKey(apiKeyInput.value);
	if (!savedKey) {
		showToast("Pega una API Key antes de conectar.");
		return;
	}
	showToast(
		"API Key guardada. Cuando llegue el backend, ya estará lista para usar.",
	);
});

filter.addEventListener("change", () => renderAll(filter.value));

function toggleDemo() {
	if (AppState.demoEnabled) {
		disableDemoData();
		document.querySelector("#pack-result").innerHTML = "";
		filter.value = "all";
		showToast("Datos demo desactivados.");
	} else {
		enableDemoData();
		showToast(
			"Datos demo activados: 4 selecciones y 48 barajitas disponibles.",
		);
	}
	renderAll(filter.value);
}

function switchView(viewName) {
	document.querySelectorAll(".view").forEach((view) => {
		const active = view.id === `view-${viewName}`;
		view.hidden = !active;
		view.classList.toggle("active", active);
	});
	document.querySelectorAll("[data-view]").forEach((button) => {
		const active = button.dataset.view === viewName;
		button.classList.toggle("active", active);
		button.setAttribute("aria-selected", String(active));
	});
	window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
	clearTimeout(toastTimer);
	toast.textContent = message;
	toast.classList.add("show");
	toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

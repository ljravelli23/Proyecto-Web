const filter = document.querySelector("#team-filter");
const apiKeyInput = document.querySelector("#api-key-input");
const toast = document.querySelector("#toast");
let toastTimer;

// Elimina claves que versiones anteriores pudieran haber guardado en el navegador.
try { sessionStorage.removeItem("apiKey"); } catch { /* Almacenamiento no disponible. */ }

populateTeamFilter();
renderAll();

document.addEventListener("click", async (event) => {
	const stickButton = event.target.closest("[data-stick-code]");
	if (stickButton) {
		await handleStickCard(stickButton);
		return;
	}

	const stickAllButton = event.target.closest("[data-stick-all]");
	if (stickAllButton) {
		await handleStickAllCards(stickAllButton);
		return;
	}

	const navButton = event.target.closest("[data-view]");
	if (navButton) switchView(navButton.dataset.view);

	if (
		event.target.closest("#demo-toggle-btn") ||
		event.target.closest("[data-activate-demo]")
	) {
		toggleDemo();
	}
});

document.querySelector("#open-pack-btn").addEventListener("click", async () => {
	if (AppState.dataMode === "empty") {
		showToast("Conecta la API o activa los datos demo antes de abrir un sobre.");
		return;
	}

	if (AppState.dataMode === "demo") {
		await animatePackOpening();
		const pack = openDemoPack();
		renderAll(filter.value);
		renderPack(pack);
		playPackCelebration();
		showToast("¡Sobre demo abierto! Se agregaron siete barajitas.");
		return;
	}

	const button = document.querySelector("#open-pack-btn");
	button.disabled = true;
	button.textContent = "Abriendo…";
	try {
		const [result] = await Promise.all([openApiPack(), animatePackOpening()]);
		const pack = normalizeApiPack(result.pack);
		const snapshot = await loadApiSnapshot();
		applyApiSnapshot(snapshot);
		populateTeamFilter();
		filter.value = "all";
		renderAll();
		renderPack(pack);
		playPackCelebration();
		showToast(`¡Sobre real abierto! Quedan ${result.unopenedPacks} sobres.`);
	} catch (error) {
		showToast(error.message);
	} finally {
		button.disabled = false;
		renderConnectionState();
	}
});

document.querySelector("#connect-btn").addEventListener("click", async () => {
	if (AppState.apiConnected) {
		disconnectApi();
		apiKeyInput.value = "WC2026_GRP3_D1BCEC3A0CA0B697";
		populateTeamFilter();
		filter.value = "all";
		renderAll();
		showToast("API desconectada. La clave sigue guardada solo en esta sesión.");
		return;
	}

	// Usar la API key del input o la predeterminada si está vacía
	const apiKey = apiKeyInput.value.trim() || "WC2026_GRP3_D1BCEC3A0CA0B697";
	const savedKey = setApiKey(apiKey);
	if (!savedKey) {
		showToast("Pega una API Key antes de conectar.");
		return;
	}

	const button = document.querySelector("#connect-btn");
	button.disabled = true;
	button.textContent = "Conectando…";
	try {
		const snapshot = await loadApiSnapshot();
		applyApiSnapshot(snapshot);
		apiKeyInput.value = "WC2026_GRP3_D1BCEC3A0CA0B697";
		populateTeamFilter();
		filter.value = "all";
		document.querySelector("#pack-result").innerHTML = "";
		renderAll();
		showToast(`Conectado como ${AppState.group?.name || "grupo autenticado"}.`);
	} catch (error) {
		disconnectApi();
		apiKeyInput.value = "WC2026_GRP3_D1BCEC3A0CA0B697";
		renderAll();
		showToast(error.message);
	} finally {
		button.disabled = false;
		renderConnectionState();
	}
});

filter.addEventListener("change", () => renderAll(filter.value));

function toggleDemo() {
	if (AppState.dataMode === "demo") {
		disableDemoData();
		document.querySelector("#pack-result").innerHTML = "";
		filter.value = "all";
		showToast("Datos demo desactivados.");
	} else {
		enableDemoData();
		clearApiKey();
		apiKeyInput.value = "";
		populateTeamFilter();
		filter.value = "all";
		document.querySelector("#pack-result").innerHTML = "";
		showToast(
			"Datos demo activados: 4 selecciones y 48 barajitas disponibles.",
		);
	}
	renderAll(filter.value);
}

async function handleStickCard(button) {
	if (AppState.dataMode !== "api" || button.disabled) return;
	const cardCode = button.dataset.stickCode;
	
	// Verificar si la barajita ya está pegada
	const sticker = teams
		.flatMap((team) => team.stickers)
		.find((item) => item.code === cardCode || item.id === cardCode);
	
	if (sticker && sticker.isStuck) {
		showToast(`La barajita "${sticker.name}" ya está pegada en el álbum. No se puede pegar otra vez.`);
		return;
	}
	
	if (sticker && sticker.inventoryCount <= 0) {
		showToast(`No tienes copias disponibles de "${sticker.name}" para pegar.`);
		return;
	}
	
	const originalText = button.textContent;
	button.disabled = true;
	button.textContent = "Pegando…";

	try {
		await stickApiCard(cardCode);
		const snapshot = await loadApiSnapshot();
		applyApiSnapshot(snapshot);
		populateTeamFilter();
		filter.value = "all";
		renderAll();
		showToast(`¡Barajita "${sticker.name}" pegada en el álbum!`);
	} catch (error) {
		button.disabled = false;
		button.textContent = originalText;
		showToast(error.message);
	}
}

async function handleStickAllCards(button) {
	if (AppState.dataMode !== "api" || button.disabled) return;
	
	const packCodes = button.dataset.stickAll.split(",");
	const availableCodes = packCodes.filter(code => {
		const sticker = teams
			.flatMap((team) => team.stickers)
			.find((item) => item.code === code || item.id === code);
		return sticker && !sticker.isStuck && sticker.inventoryCount > 0;
	});
	
	const alreadyStuckCount = packCodes.length - availableCodes.length;
	
	if (availableCodes.length === 0) {
		if (alreadyStuckCount > 0) {
			showToast(`Todas las barajitas ya están pegadas en el álbum.`);
		} else {
			showToast("No hay barajitas disponibles para pegar.");
		}
		return;
	}
	
	const originalText = button.textContent;
	button.disabled = true;
	button.textContent = "Pegando…";
	
	let stuckCount = 0;
	let skippedCount = 0;
	
	try {
		for (const code of availableCodes) {
			try {
				await stickApiCard(code);
				stuckCount++;
			} catch (error) {
				skippedCount++;
				console.error(`Error pegando ${code}:`, error);
			}
		}
		
		const snapshot = await loadApiSnapshot();
		applyApiSnapshot(snapshot);
		populateTeamFilter();
		filter.value = "all";
		renderAll();
		
		let message = `✅ ¡${stuckCount} barajitas pegadas en el álbum!`;
		if (alreadyStuckCount > 0) {
			message += ` (${alreadyStuckCount} ya estaban pegadas)`;
		}
		if (skippedCount > 0) {
			message += ` (${skippedCount} no se pudieron pegar)`;
		}
		showToast(message);
	} catch (error) {
		button.disabled = false;
		button.textContent = originalText;
		showToast(error.message);
	}
}

function animatePackOpening() {
	const stage = document.querySelector(".pack-stage");
	stage.classList.remove("opening");
	void stage.offsetWidth;
	stage.classList.add("opening");
	const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 950;
	return new Promise((resolve) => setTimeout(() => {
		stage.classList.remove("opening");
		resolve();
	}, duration));
}

function playPackCelebration() {
	document.querySelector(".pack-celebration")?.remove();
	const celebration = document.createElement("div");
	celebration.className = "pack-celebration";
	celebration.setAttribute("aria-hidden", "true");
	celebration.innerHTML = `<div class="celebration-flash"></div>${Array.from({ length: 28 }, (_, index) => `<i style="--i:${index};--x:${(index * 37) % 100};--delay:${(index % 7) * 0.05}s"></i>`).join("")}`;
	document.body.append(celebration);
	setTimeout(() => celebration.remove(), 2400);
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

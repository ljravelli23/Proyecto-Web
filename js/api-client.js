const API_BASE_URL = "https://sticker-album-server-proyect-production.up.railway.app";

async function apiRequest(path, options = {}) {
	const { method = "GET", body, apiKey = AppState.apiKey } = options;
	const headers = { Accept: "application/json" };

	if (apiKey) headers["x-api-key"] = apiKey;
	if (body !== undefined) headers["Content-Type"] = "application/json";

	let response;
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			method,
			headers,
			body: body === undefined ? undefined : JSON.stringify(body),
		});
	} catch {
		throw new Error("No se pudo contactar el servidor de Railway.");
	}

	const payload = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(
			payload.message || payload.error || `La API respondió con código ${response.status}.`,
		);
	}

	return payload;
}

function getApiGroup() {
	return apiRequest("/api/groups/me");
}

function getApiAlbum() {
	return apiRequest("/api/album");
}

function getApiDuplicates() {
	return apiRequest("/api/inventory/duplicates");
}

function getApiTrades() {
	return apiRequest("/api/trades");
}

function openApiPack() {
	return apiRequest("/api/packs/open");
}

function stickApiCard(cardCode) {
	return apiRequest("/api/album/stick", {
		method: "POST",
		body: { cardCode },
	});
}

async function loadApiSnapshot() {
	const [group, album, duplicates, trades] = await Promise.all([
		getApiGroup(),
		getApiAlbum(),
		getApiDuplicates(),
		getApiTrades().catch(() => ({ trades: [] })),
	]);

	return { group, album, duplicates, trades };
}

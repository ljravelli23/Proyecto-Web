const FIFA_TO_FLAG_CODE = {
	MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz", CAN: "ca", BIH: "ba",
	QAT: "qa", SUI: "ch", BRA: "br", MAR: "ma", HAI: "ht", SCO: "gb-sct",
	USA: "us", PAR: "py", AUS: "au", TUR: "tr", GER: "de", CUW: "cw",
	CIV: "ci", ECU: "ec", NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
	BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz", ESP: "es", CPV: "cv",
	KSA: "sa", URU: "uy", FRA: "fr", NOR: "no", SEN: "sn", IRQ: "iq",
	ARG: "ar", AUT: "at", ALG: "dz", JOR: "jo", POR: "pt", COD: "cd",
	UZB: "uz", COL: "co", ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
};

const PLAYER_IMAGE_CACHE_KEY = "wc2026-player-images-v1";
const playerImageCache = loadPlayerImageCache();
const pendingPlayerImages = new Map();
let playerImageObserver;

function getFlagUrl(countryCode) {
	const flagCode = FIFA_TO_FLAG_CODE[countryCode];
	return flagCode ? `https://flagcdn.com/w160/${flagCode}.png` : "";
}

function hydrateStickerImages(root = document) {
	if (playerImageObserver) playerImageObserver.disconnect();

	const images = [...root.querySelectorAll("img[data-player-photo]")];
	if (!("IntersectionObserver" in window)) {
		images.forEach(loadPlayerImage);
		return;
	}

	playerImageObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			observer.unobserve(entry.target);
			loadPlayerImage(entry.target);
		});
	}, { rootMargin: "320px 0px" });

	images.forEach((image) => playerImageObserver.observe(image));
}

async function loadPlayerImage(image) {
	if (!image?.isConnected || image.dataset.loaded === "true") return;
	image.dataset.loaded = "true";
	image.closest(".sticker-visual")?.classList.add("photo-loading");

	const url = await resolvePlayerPhoto(image.dataset.playerPhoto, image.dataset.playerCountry);
	if (!image.isConnected) return;

	if (!url) {
		image.closest(".sticker-visual")?.classList.remove("photo-loading");
		image.classList.add("photo-unavailable");
		return;
	}

	image.addEventListener("load", () => {
		image.classList.add("loaded");
		image.closest(".sticker-visual")?.classList.remove("photo-loading");
	}, { once: true });
	image.addEventListener("error", () => {
		image.closest(".sticker-visual")?.classList.remove("photo-loading");
		image.classList.add("photo-unavailable");
	}, { once: true });
	image.src = url;
}

async function resolvePlayerPhoto(name, country) {
	const cacheKey = `${name}|${country || ""}`;
	if (Object.hasOwn(playerImageCache, cacheKey)) return playerImageCache[cacheKey] || null;
	if (pendingPlayerImages.has(cacheKey)) return pendingPlayerImages.get(cacheKey);

	const request = (async () => {
		let photo = await requestWikiPageImage("es", name);
		if (!photo) photo = await requestWikiPageImage("en", name);
		if (!photo) photo = await searchWikiPageImage(name, country);
		playerImageCache[cacheKey] = photo || "";
		savePlayerImageCache();
		pendingPlayerImages.delete(cacheKey);
		return photo;
	})();

	pendingPlayerImages.set(cacheKey, request);
	return request;
}

async function requestWikiPageImage(language, title) {
	const params = new URLSearchParams({
		action: "query",
		format: "json",
		origin: "*",
		redirects: "1",
		prop: "pageimages",
		piprop: "thumbnail",
		pithumbsize: "420",
		titles: title,
	});
	return requestWikiThumbnail(`https://${language}.wikipedia.org/w/api.php?${params}`);
}

async function searchWikiPageImage(name, country) {
	const params = new URLSearchParams({
		action: "query",
		format: "json",
		origin: "*",
		generator: "search",
		gsrsearch: `${name} futbolista ${country || ""}`.trim(),
		gsrnamespace: "0",
		gsrlimit: "1",
		prop: "pageimages",
		piprop: "thumbnail",
		pithumbsize: "420",
	});
	return requestWikiThumbnail(`https://es.wikipedia.org/w/api.php?${params}`);
}

async function requestWikiThumbnail(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) return null;
		const payload = await response.json();
		const page = Object.values(payload.query?.pages || {}).find((item) => item.thumbnail?.source);
		return page?.thumbnail?.source || null;
	} catch {
		return null;
	}
}

function loadPlayerImageCache() {
	try {
		return JSON.parse(localStorage.getItem(PLAYER_IMAGE_CACHE_KEY) || "{}");
	} catch {
		return {};
	}
}

function savePlayerImageCache() {
	try {
		localStorage.setItem(PLAYER_IMAGE_CACHE_KEY, JSON.stringify(playerImageCache));
	} catch {
		// La aplicación sigue funcionando aunque el navegador bloquee el almacenamiento.
	}
}

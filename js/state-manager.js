const demoTeams = [
	{
		id: "ARG",
		name: "Argentina",
		flag: "🇦🇷",
		group: "Grupo J",
		rgb: "105, 190, 235",
		stickers: makeTeam("ARG", "Argentina", [
			"Escudo AFA",
			"Emiliano Martínez",
			"Nahuel Molina",
			"Cristian Romero",
			"Lisandro Martínez",
			"Nicolás Tagliafico",
			"Rodrigo De Paul",
			"Enzo Fernández",
			"Alexis Mac Allister",
			"Lionel Messi",
			"Julián Álvarez",
			"Lautaro Martínez",
		]),
	},
	{
		id: "BRA",
		name: "Brasil",
		flag: "🇧🇷",
		group: "Grupo C",
		rgb: "255, 220, 40",
		stickers: makeTeam("BRA", "Brasil", [
			"Escudo CBF",
			"Alisson Becker",
			"Danilo",
			"Marquinhos",
			"Gabriel Magalhães",
			"Guilherme Arana",
			"Bruno Guimarães",
			"Lucas Paquetá",
			"Rodrygo",
			"Vinícius Júnior",
			"Raphinha",
			"Endrick",
		]),
	},
	{
		id: "ESP",
		name: "España",
		flag: "🇪🇸",
		group: "Grupo H",
		rgb: "238, 59, 59",
		stickers: makeTeam("ESP", "España", [
			"Escudo RFEF",
			"Unai Simón",
			"Dani Carvajal",
			"Robin Le Normand",
			"Aymeric Laporte",
			"Marc Cucurella",
			"Rodri",
			"Pedri",
			"Dani Olmo",
			"Lamine Yamal",
			"Nico Williams",
			"Álvaro Morata",
		]),
	},
	{
		id: "POR",
		name: "Portugal",
		flag: "🇵🇹",
		group: "Grupo K",
		rgb: "40, 184, 105",
		stickers: makeTeam("POR", "Portugal", [
			"Escudo FPF",
			"Diogo Costa",
			"João Cancelo",
			"Rúben Dias",
			"Gonçalo Inácio",
			"Nuno Mendes",
			"Bruno Fernandes",
			"Vitinha",
			"Bernardo Silva",
			"Rafael Leão",
			"Cristiano Ronaldo",
			"Diogo Jota",
		]),
	},
];

let teams = demoTeams;

function makeTeam(teamId, teamName, names) {
	return names.map((name, index) => ({
		id: `${teamId}-${String(index).padStart(2, "0")}`,
		teamId,
		teamName,
		name,
		number: index,
		role:
			index === 0
				? "Escudo"
				: index === 1
					? "Portero"
					: index < 6
						? "Defensa"
						: index < 9
							? "Mediocampista"
							: "Delantero",
	}));
}

const AppState = {
	apiKey: "",
	dataMode: "empty",
	demoEnabled: false,
	apiConnected: false,
	group: null,
	apiStats: null,
	apiDuplicates: [],
	apiTrades: [],
	myCollection: {},
	duplicates: [],
	missing: [],
	pendingOffers: [],
	lastPack: [],
};

const demoCounts = {
	"ARG-00": 1,
	"ARG-01": 1,
	"ARG-02": 2,
	"ARG-03": 1,
	"ARG-05": 1,
	"ARG-07": 1,
	"ARG-09": 2,
	"ARG-10": 1,
	"BRA-00": 1,
	"BRA-01": 1,
	"BRA-03": 1,
	"BRA-04": 2,
	"BRA-06": 1,
	"BRA-08": 1,
	"BRA-09": 3,
	"ESP-00": 1,
	"ESP-02": 1,
	"ESP-03": 1,
	"ESP-05": 1,
	"ESP-06": 2,
	"ESP-07": 1,
	"ESP-09": 1,
	"ESP-10": 1,
	"POR-00": 1,
	"POR-01": 1,
	"POR-03": 1,
	"POR-05": 1,
	"POR-06": 2,
	"POR-07": 1,
	"POR-08": 1,
	"POR-10": 3,
	"POR-11": 1,
};

function enableDemoData() {
	teams = demoTeams;
	AppState.dataMode = "demo";
	AppState.demoEnabled = true;
	AppState.apiConnected = false;
	AppState.group = null;
	AppState.apiStats = null;
	AppState.apiDuplicates = [];
	AppState.apiTrades = [];
	AppState.lastPack = [];
	AppState.myCollection = Object.fromEntries(
		Object.entries(demoCounts).map(([id, count]) => [id, { id, count }]),
	);
}

function disableDemoData() {
	AppState.dataMode = "empty";
	AppState.demoEnabled = false;
	AppState.myCollection = {};
	AppState.lastPack = [];
}

function setApiKey(apiKey) {
	AppState.apiKey = apiKey.trim();
	return AppState.apiKey;
}

function clearApiKey() {
	AppState.apiKey = "";
}

function getStickerStatus(stickerId) {
	if (AppState.dataMode === "api") {
		const sticker = teams
			.flatMap((team) => team.stickers)
			.find((item) => item.id === stickerId);
		if (!sticker) return "missing";
		if (sticker.isStuck || sticker.inventoryCount > 0 || sticker.apiStatus !== "MISSING") return "owned";
		return "missing";
	}

	const item = AppState.myCollection[stickerId];
	if (!item) return "missing";
	if (item.count > 1) return "duplicate";
	return "owned";
}

function getCollectionStats() {
	if (AppState.dataMode === "api" && AppState.apiStats) {
		const all = teams.flatMap((team) => team.stickers);
		const obtained = all.filter((sticker) => getStickerStatus(sticker.id) !== "missing").length;
		return {
			total: AppState.apiStats.totalCardsInAlbum || 0,
			owned: obtained,
			missing: Math.max(0, (AppState.apiStats.totalCardsInAlbum || all.length) - obtained),
			duplicates: AppState.apiStats.totalDuplicates || 0,
			teams: teams.length,
		};
	}

	const all = teams.flatMap((team) => team.stickers);
	const owned = all.filter(
		(sticker) => AppState.myCollection[sticker.id],
	).length;
	const duplicates = all.filter(
		(sticker) => (AppState.myCollection[sticker.id]?.count || 0) > 1,
	).length;
	return {
		total: all.length,
		owned,
		missing: all.length - owned,
		duplicates,
		teams: teams.length,
	};
}

function getDuplicates() {
	if (AppState.dataMode === "api") return AppState.apiDuplicates;

	const stickersById = new Map(
		teams
			.flatMap((team) => team.stickers)
			.map((sticker) => [sticker.id, sticker]),
	);
	return Object.values(AppState.myCollection)
		.filter((item) => item.count > 1)
		.map((item) => ({ ...stickersById.get(item.id), count: item.count }));
}

function applyApiSnapshot(snapshot) {
	const pages = snapshot.album?.pages || [];
	const palette = [
		"105, 190, 235",
		"255, 220, 40",
		"238, 59, 59",
		"40, 184, 105",
		"149, 117, 205",
		"255, 139, 61",
	];

	teams = pages.map((page, index) => ({
		id: page.countryCode,
		name: page.country,
		flag: page.countryCode,
		group: page.wcGroup,
		rgb: palette[index % palette.length],
		stickers: (page.stickers || []).map((sticker) => ({
			id: sticker.id || sticker.code,
			code: sticker.code,
			teamId: page.countryCode,
			teamName: page.country,
			name: sticker.name,
			number: sticker.number,
			role: sticker.role,
			apiStatus: sticker.status,
			quantity: sticker.quantity || 0,
			duplicatesCount: sticker.duplicatesCount || 0,
			isStuck: Boolean(sticker.isStuck),
		})),
	}));

	const stickersByCode = new Map(
		teams.flatMap((team) => team.stickers).map((sticker) => [sticker.code, sticker]),
	);

	AppState.apiDuplicates = (snapshot.duplicates?.duplicates || []).map((item) => ({
		...(stickersByCode.get(item.code) || {
			id: item.code,
			code: item.code,
			name: item.name,
			teamId: item.code?.split("-")[0],
			teamName: item.country,
			role: "Barajita",
		}),
		count: item.duplicatesAvailable,
	}));

	AppState.apiDuplicates.forEach((item) => {
		const sticker = stickersByCode.get(item.code);
		if (!sticker) return;
		sticker.inventoryCount = item.count;
		sticker.quantity = Math.max(sticker.quantity || 0, item.count || 0);
		if (!sticker.isStuck && item.count > 0) sticker.apiStatus = "AVAILABLE";
	});

	AppState.dataMode = "api";
	AppState.demoEnabled = false;
	AppState.apiConnected = true;
	AppState.group = snapshot.group?.group || null;
	AppState.apiStats = snapshot.album?.stats || null;
	AppState.apiTrades = snapshot.trades?.trades || snapshot.trades?.data || [];
	AppState.lastPack = [];
	AppState.myCollection = Object.fromEntries(
		teams.flatMap((team) => team.stickers).map((sticker) => [
			sticker.id,
			{
				id: sticker.id,
				count: sticker.inventoryCount || (sticker.isStuck ? 1 : 0),
			},
		]),
	);
}

function normalizeApiPack(pack) {
	return (pack || []).map((sticker) => ({
		id: sticker.id || sticker.code,
		code: sticker.code,
		teamId: sticker.countryCode,
		teamName: sticker.country,
		name: sticker.name,
		number: sticker.number,
		role: sticker.role,
		packStatus: sticker.isNewInAlbum ? "owned" : "duplicate",
	}));
}

function disconnectApi() {
	teams = demoTeams;
	AppState.dataMode = "empty";
	AppState.apiConnected = false;
	AppState.group = null;
	AppState.apiStats = null;
	AppState.apiDuplicates = [];
	AppState.apiTrades = [];
	AppState.myCollection = {};
	AppState.lastPack = [];
	clearApiKey();
}

function openDemoPack() {
	const all = teams.flatMap((team) => team.stickers);
	const shuffled = [...all].sort(() => Math.random() - 0.5);
	const pack = shuffled.slice(0, 7);
	pack.forEach((sticker) => {
		const current = AppState.myCollection[sticker.id]?.count || 0;
		AppState.myCollection[sticker.id] = { id: sticker.id, count: current + 1 };
	});
	AppState.lastPack = pack;
	return pack;
}

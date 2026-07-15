const teams = [
    {
        id: 'ARG', name: 'Argentina', flag: '🇦🇷', group: 'Grupo J', rgb: '105, 190, 235',
        stickers: makeTeam('ARG', 'Argentina', ['Escudo AFA', 'Emiliano Martínez', 'Nahuel Molina', 'Cristian Romero', 'Lisandro Martínez', 'Nicolás Tagliafico', 'Rodrigo De Paul', 'Enzo Fernández', 'Alexis Mac Allister', 'Lionel Messi', 'Julián Álvarez', 'Lautaro Martínez'])
    },
    {
        id: 'BRA', name: 'Brasil', flag: '🇧🇷', group: 'Grupo C', rgb: '255, 220, 40',
        stickers: makeTeam('BRA', 'Brasil', ['Escudo CBF', 'Alisson Becker', 'Danilo', 'Marquinhos', 'Gabriel Magalhães', 'Guilherme Arana', 'Bruno Guimarães', 'Lucas Paquetá', 'Rodrygo', 'Vinícius Júnior', 'Raphinha', 'Endrick'])
    },
    {
        id: 'ESP', name: 'España', flag: '🇪🇸', group: 'Grupo H', rgb: '238, 59, 59',
        stickers: makeTeam('ESP', 'España', ['Escudo RFEF', 'Unai Simón', 'Dani Carvajal', 'Robin Le Normand', 'Aymeric Laporte', 'Marc Cucurella', 'Rodri', 'Pedri', 'Dani Olmo', 'Lamine Yamal', 'Nico Williams', 'Álvaro Morata'])
    },
    {
        id: 'POR', name: 'Portugal', flag: '🇵🇹', group: 'Grupo K', rgb: '40, 184, 105',
        stickers: makeTeam('POR', 'Portugal', ['Escudo FPF', 'Diogo Costa', 'João Cancelo', 'Rúben Dias', 'Gonçalo Inácio', 'Nuno Mendes', 'Bruno Fernandes', 'Vitinha', 'Bernardo Silva', 'Rafael Leão', 'Cristiano Ronaldo', 'Diogo Jota'])
    }
];

function makeTeam(teamId, teamName, names) {
    return names.map((name, index) => ({
        id: `${teamId}-${String(index).padStart(2, '0')}`,
        teamId,
        teamName,
        name,
        number: index,
        role: index === 0 ? 'Escudo' : index === 1 ? 'Portero' : index < 6 ? 'Defensa' : index < 9 ? 'Mediocampista' : 'Delantero'
    }));
}

const AppState = {
    demoEnabled: false,
    myCollection: {},
    lastPack: []
};

const demoCounts = {
    'ARG-00': 1, 'ARG-01': 1, 'ARG-02': 2, 'ARG-03': 1, 'ARG-05': 1, 'ARG-07': 1, 'ARG-09': 2, 'ARG-10': 1,
    'BRA-00': 1, 'BRA-01': 1, 'BRA-03': 1, 'BRA-04': 2, 'BRA-06': 1, 'BRA-08': 1, 'BRA-09': 3,
    'ESP-00': 1, 'ESP-02': 1, 'ESP-03': 1, 'ESP-05': 1, 'ESP-06': 2, 'ESP-07': 1, 'ESP-09': 1, 'ESP-10': 1,
    'POR-00': 1, 'POR-01': 1, 'POR-03': 1, 'POR-05': 1, 'POR-06': 2, 'POR-07': 1, 'POR-08': 1, 'POR-10': 3, 'POR-11': 1
};

function enableDemoData() {
    AppState.demoEnabled = true;
    AppState.lastPack = [];
    AppState.myCollection = Object.fromEntries(
        Object.entries(demoCounts).map(([id, count]) => [id, { id, count }])
    );
}

function disableDemoData() {
    AppState.demoEnabled = false;
    AppState.myCollection = {};
    AppState.lastPack = [];
}

function getStickerStatus(stickerId) {
    const item = AppState.myCollection[stickerId];
    if (!item) return 'missing';
    if (item.count > 1) return 'duplicate';
    return 'owned';
}

function getCollectionStats() {
    const all = teams.flatMap(team => team.stickers);
    const owned = all.filter(sticker => AppState.myCollection[sticker.id]).length;
    const duplicates = all.filter(sticker => (AppState.myCollection[sticker.id]?.count || 0) > 1).length;
    return { total: all.length, owned, missing: all.length - owned, duplicates, teams: teams.length };
}

function getDuplicates() {
    const stickersById = new Map(teams.flatMap(team => team.stickers).map(sticker => [sticker.id, sticker]));
    return Object.values(AppState.myCollection)
        .filter(item => item.count > 1)
        .map(item => ({ ...stickersById.get(item.id), count: item.count }));
}

function openDemoPack() {
    const all = teams.flatMap(team => team.stickers);
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const pack = shuffled.slice(0, 7);
    pack.forEach(sticker => {
        const current = AppState.myCollection[sticker.id]?.count || 0;
        AppState.myCollection[sticker.id] = { id: sticker.id, count: current + 1 };
    });
    AppState.lastPack = pack;
    return pack;
}

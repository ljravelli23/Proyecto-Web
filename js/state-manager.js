const AppState = {
    apiKey: '',
    myCollection: {
        // Ejemplo: { "POR-10": { id: "POR-10", name: "Cristiano", count: 1, role: "Delantero" } }
    },
    duplicates: [], // Filtra del collection los que tengan count > 1
    missing: [],    // Los IDs que te faltan (lo calcularás comparando con el total de 12 por país)
    pendingOffers: []
};

// Función para saber si una barajita está pegada, repetida o falta
export function getStickerStatus(stickerId) {
    const item = AppState.myCollection[stickerId];
    if (!item) return 'missing';
    if (item.count > 1) return 'duplicate';
    return 'owned';
}
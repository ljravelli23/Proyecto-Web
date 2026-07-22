function renderAll(selectedTeam = 'all') {
    renderStats();
    renderAlbum(selectedTeam);
    renderDuplicates();
    renderOffers();
    renderDemoButton();
    renderConnectionState();
    hydrateStickerImages();
}

function populateTeamFilter() {
    const select = document.querySelector('#team-filter');
    select.innerHTML = '<option value="all">Todas las selecciones</option>';
    teams.forEach(team => select.insertAdjacentHTML('beforeend', `<option value="${safe(team.id)}">${safe(team.flag)} ${safe(team.name)}</option>`));
}

function renderStats() {
    const hasData = AppState.dataMode !== 'empty';
    const stats = hasData ? getCollectionStats() : { total: 0, owned: 0, missing: 0, duplicates: 0, teams: 0 };
    const percent = stats.total ? Math.round(stats.owned / stats.total * 100) : 0;
    setText('owned-total', stats.owned);
    setText('sticker-total', stats.total);
    setText('owned-stat', stats.owned);
    setText('missing-stat', stats.missing);
    setText('duplicate-stat', stats.duplicates);
    setText('teams-stat', stats.teams);
    setText('progress-percent', `${percent}%`);
    const progressMessage = AppState.dataMode === 'api'
        ? `${stats.missing} faltantes · ${AppState.group?.unopenedPacks ?? 0} sobres disponibles`
        : AppState.dataMode === 'demo'
            ? `${stats.missing} barajitas para completar la edición demo`
            : 'Conecta la API o activa los datos demo';
    setText('progress-message', progressMessage);
    document.querySelector('#progress-ring').style.setProperty('--progress', percent);
}

function renderAlbum(selectedTeam) {
    const container = document.querySelector('#album-grid');
    if (AppState.dataMode === 'empty') {
        container.innerHTML = `<div class="empty-state"><span class="empty-ball" aria-hidden="true">⚽</span><h3>Tu álbum está esperando</h3><p>Conecta la API Key de tu grupo o activa la colección de prueba.</p><button class="button button-primary" type="button" data-activate-demo>Activar datos demo</button></div>`;
        return;
    }

    const visibleTeams = selectedTeam === 'all' ? teams : teams.filter(team => team.id === selectedTeam);
    container.innerHTML = visibleTeams.map(team => {
        const collected = team.stickers.filter(sticker => {
            const status = getStickerStatus(sticker.id);
            return AppState.dataMode === 'api' ? status === 'owned' : status !== 'missing';
        }).length;
        return `<article class="country-section" style="--team-rgb:${team.rgb}">
            <header class="country-header">
                <div class="country-identity"><span class="country-flag">${teamFlagMarkup(team)}</span><div><h3>${safe(team.name)}</h3><small>${safe(team.group)} · ${team.stickers.length} barajitas</small></div></div>
                <div class="team-progress"><strong>${collected}/${team.stickers.length}</strong><span>COLECCIONADAS</span></div>
            </header>
            <div class="sticker-grid">${team.stickers.map(sticker => stickerCard(sticker, team)).join('')}</div>
        </article>`;
    }).join('');
}

function renderPack(pack) {
    const container = document.querySelector('#pack-result');
    container.innerHTML = pack.map(sticker => {
        const team = teams.find(item => item.id === sticker.teamId) || { flag: sticker.teamId, rgb: '105, 190, 235' };
        const catalogSticker = team.stickers?.find(item => item.code === sticker.code || item.id === sticker.id);
        return stickerCard({ ...catalogSticker, ...sticker, inventoryCount: catalogSticker?.inventoryCount || 0 }, team, true);
    }).join('');
    container.classList.remove('celebrating');
    void container.offsetWidth;
    container.classList.add('celebrating');
    hydrateStickerImages(container);
}

function stickerCard(sticker, team, revealOwned = false) {
    const count = AppState.myCollection[sticker.id]?.count || 0;
    const status = revealOwned ? (sticker.packStatus || (count > 1 ? 'duplicate' : 'owned')) : getStickerStatus(sticker.id);
    const inventoryCount = sticker.inventoryCount || (AppState.dataMode === 'api' ? count : 0);
    const initials = sticker.name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('');
    const isCrest = sticker.number === 0 || String(sticker.role).toLowerCase() === 'escudo';
    const canStick = AppState.dataMode === 'api' && !sticker.isStuck && inventoryCount > 0;
    const visual = isCrest
        ? `<span class="crest-symbol">${teamFlagMarkup(team, 'crest-flag')}</span>`
        : status === 'missing'
            ? `<span class="sticker-number">${String(sticker.number).padStart(2,'0')}</span><span class="sticker-initials">?</span>`
            : `<span class="sticker-number photo-number">${String(sticker.number).padStart(2,'0')}</span><span class="sticker-initials photo-fallback">${safe(initials)}</span><img class="player-photo" data-player-photo="${safe(sticker.name)}" data-player-country="${safe(sticker.teamName || team.name)}" alt="Foto de ${safe(sticker.name)}">`;
    return `<figure class="sticker ${status}${canStick ? ' can-stick' : ''}" style="--team-rgb:${team.rgb}" title="${safe(sticker.name)}">
        ${status === 'duplicate' || inventoryCount > 0 ? `<span class="duplicate-chip">x${inventoryCount || count}</span>` : ''}
        ${status === 'owned' ? '<span class="owned-chip">✓</span>' : ''}
        <div class="sticker-visual">
            ${visual}
            ${canStick ? `<button class="stick-button" type="button" data-stick-code="${safe(sticker.code || sticker.id)}" aria-label="Pegar ${safe(sticker.name)} en el álbum">Pegar</button>` : ''}
        </div>
        <figcaption><strong>${status === 'missing' ? `Barajita ${String(sticker.number).padStart(2,'0')}` : safe(sticker.name)}</strong><span>${status === 'missing' ? 'Faltante' : safe(sticker.role)}</span></figcaption>
    </figure>`;
}

function renderDuplicates() {
    const container = document.querySelector('#my-duplicates-list');
    const duplicates = AppState.dataMode !== 'empty' ? getDuplicates() : [];
    setText('duplicate-badge', duplicates.length);
    container.innerHTML = duplicates.length ? duplicates.map(sticker => {
        const team = teams.find(item => item.id === sticker.teamId);
        const stickAction = AppState.dataMode === 'api' && !sticker.isStuck && sticker.count > 0
            ? `<button class="mini-stick-button" type="button" data-stick-code="${safe(sticker.code || sticker.id)}" aria-label="Pegar ${safe(sticker.name)} en el álbum">Pegar</button>`
            : AppState.dataMode === 'api' ? '<span class="stuck-label">Pegada</span>' : '';
        return `<article class="duplicate-row"><span class="mini-flag">${teamFlagMarkup(team || { id: sticker.teamId, name: sticker.teamName, flag: sticker.teamId })}</span><div><strong>${safe(sticker.name)}</strong><small>${safe(team?.name || sticker.teamName)} · ${safe(sticker.role)}</small></div>${stickAction}<b>x${sticker.count}</b></article>`;
    }).join('') : `<div class="offer-placeholder"><span aria-hidden="true">◇</span><h3>Sin duplicados</h3><p>${AppState.dataMode === 'api' ? 'Abre un sobre real para empezar a llenar tu inventario.' : 'Activa la demo o abre sobres para conseguir barajitas repetidas.'}</p></div>`;
}

function renderDemoButton() {
    const button = document.querySelector('#demo-toggle-btn');
    button.classList.toggle('active', AppState.demoEnabled);
    button.setAttribute('aria-pressed', String(AppState.demoEnabled));
    button.lastChild.textContent = AppState.demoEnabled ? ' Desactivar datos demo' : ' Activar datos demo';
}

function renderConnectionState() {
    const button = document.querySelector('#connect-btn');
    const input = document.querySelector('#api-key-input');
    const packTitle = document.querySelector('#pack-mode-title');
    const packCopy = document.querySelector('#pack-mode-copy');
    const packButton = document.querySelector('#open-pack-btn');
    const liveBadge = document.querySelector('#market-live-badge');

    button.classList.toggle('connected', AppState.apiConnected);
    button.textContent = AppState.apiConnected ? 'Desconectar' : 'Conectar';
    input.disabled = AppState.apiConnected;

    if (AppState.dataMode === 'api') {
        packTitle.textContent = `Sobres del ${AppState.group?.name || 'grupo'}`;
        packCopy.textContent = `${AppState.group?.unopenedPacks ?? 0} sobres disponibles. Cada apertura consume un sobre real.`;
        packButton.textContent = 'Abrir sobre real';
        liveBadge.textContent = 'API conectada';
        liveBadge.classList.add('connected');
    } else {
        packTitle.textContent = 'Sobre edición demo';
        packCopy.textContent = 'No consume saldo ni requiere conexión con la API.';
        packButton.textContent = 'Abrir sobre demo';
        liveBadge.textContent = AppState.apiConnected ? 'API conectada' : 'API pendiente';
        liveBadge.classList.toggle('connected', AppState.apiConnected);
    }
}

function renderOffers() {
    const container = document.querySelector('#incoming-offers-list');
    const trades = AppState.dataMode === 'api' ? AppState.apiTrades : [];
    if (!trades.length) {
        container.className = 'offer-placeholder';
        container.innerHTML = `<span aria-hidden="true">⇄</span><h3>Sin ofertas todavía</h3><p>${AppState.dataMode === 'api' ? 'El mercado está conectado y no hay propuestas disponibles.' : 'Conecta la API para consultar las propuestas del mercado.'}</p>`;
        return;
    }

    container.className = 'duplicate-list';
    container.innerHTML = trades.slice(0, 12).map(trade => `<article class="duplicate-row"><span class="mini-flag">⇄</span><div><strong>Intercambio ${safe(trade.status || 'pendiente')}</strong><small>${safe(trade.proposerGroup?.name || trade.group?.name || 'Mercado Mundial')}</small></div><b>${safe(trade.status || 'PENDING')}</b></article>`).join('');
}

function setText(id, value) {
    document.getElementById(id).textContent = value;
}

function safe(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function teamFlagMarkup(team, className = '') {
    const url = getFlagUrl(team?.id);
    if (!url) return safe(team?.flag || team?.id || '🌐');
    return `<img class="flag-image ${safe(className)}" src="${url}" alt="Bandera de ${safe(team?.name || team?.id)}" loading="lazy">`;
}

function renderAll(selectedTeam = 'all') {
    renderStats();
    renderAlbum(selectedTeam);
    renderDuplicates();
    renderDemoButton();
}

function populateTeamFilter() {
    const select = document.querySelector('#team-filter');
    teams.forEach(team => select.insertAdjacentHTML('beforeend', `<option value="${team.id}">${team.flag} ${team.name}</option>`));
}

function renderStats() {
    const stats = AppState.demoEnabled ? getCollectionStats() : { total: 0, owned: 0, missing: 0, duplicates: 0, teams: 0 };
    const percent = stats.total ? Math.round(stats.owned / stats.total * 100) : 0;
    setText('owned-total', stats.owned);
    setText('sticker-total', stats.total);
    setText('owned-stat', stats.owned);
    setText('missing-stat', stats.missing);
    setText('duplicate-stat', stats.duplicates);
    setText('teams-stat', stats.teams);
    setText('progress-percent', `${percent}%`);
    setText('progress-message', AppState.demoEnabled ? `${stats.missing} barajitas para completar la edición demo` : 'Activa los datos demo para comenzar');
    document.querySelector('#progress-ring').style.setProperty('--progress', percent);
}

function renderAlbum(selectedTeam) {
    const container = document.querySelector('#album-grid');
    if (!AppState.demoEnabled) {
        container.innerHTML = `<div class="empty-state"><span class="empty-ball" aria-hidden="true">⚽</span><h3>Tu álbum está esperando</h3><p>Usa “Activar datos demo” para cargar selecciones y comenzar a probar la colección.</p><button class="button button-primary" type="button" data-activate-demo>Activar datos demo</button></div>`;
        return;
    }

    const visibleTeams = selectedTeam === 'all' ? teams : teams.filter(team => team.id === selectedTeam);
    container.innerHTML = visibleTeams.map(team => {
        const collected = team.stickers.filter(sticker => AppState.myCollection[sticker.id]).length;
        return `<article class="country-section" style="--team-rgb:${team.rgb}">
            <header class="country-header">
                <div class="country-identity"><span class="country-flag">${team.flag}</span><div><h3>${team.name}</h3><small>${team.group} · 12 barajitas</small></div></div>
                <div class="team-progress"><strong>${collected}/12</strong><span>COLECCIONADAS</span></div>
            </header>
            <div class="sticker-grid">${team.stickers.map(sticker => stickerCard(sticker, team)).join('')}</div>
        </article>`;
    }).join('');
}

function renderPack(pack) {
    const container = document.querySelector('#pack-result');
    container.innerHTML = pack.map(sticker => {
        const team = teams.find(item => item.id === sticker.teamId);
        return stickerCard(sticker, team, true);
    }).join('');
}

function stickerCard(sticker, team, revealOwned = false) {
    const count = AppState.myCollection[sticker.id]?.count || 0;
    const status = revealOwned ? (count > 1 ? 'duplicate' : 'owned') : getStickerStatus(sticker.id);
    const initials = sticker.name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('');
    const isCrest = sticker.number === 0;
    return `<figure class="sticker ${status}" style="--team-rgb:${team.rgb}" title="${sticker.name}">
        ${status === 'duplicate' ? `<span class="duplicate-chip">x${count}</span>` : ''}
        ${status === 'owned' ? '<span class="owned-chip">✓</span>' : ''}
        <div class="sticker-visual">
            ${isCrest ? `<span class="crest-symbol">${team.flag}</span>` : `<span class="sticker-number">${String(sticker.number).padStart(2,'0')}</span><span class="sticker-initials">${status === 'missing' ? '?' : initials}</span>`}
        </div>
        <figcaption><strong>${status === 'missing' ? `Barajita ${String(sticker.number).padStart(2,'0')}` : sticker.name}</strong><span>${status === 'missing' ? 'Faltante' : sticker.role}</span></figcaption>
    </figure>`;
}

function renderDuplicates() {
    const container = document.querySelector('#my-duplicates-list');
    const duplicates = AppState.demoEnabled ? getDuplicates() : [];
    setText('duplicate-badge', duplicates.length);
    container.innerHTML = duplicates.length ? duplicates.map(sticker => {
        const team = teams.find(item => item.id === sticker.teamId);
        return `<article class="duplicate-row"><span class="mini-flag">${team.flag}</span><div><strong>${sticker.name}</strong><small>${team.name} · ${sticker.role}</small></div><b>x${sticker.count}</b></article>`;
    }).join('') : `<div class="offer-placeholder"><span aria-hidden="true">◇</span><h3>Sin duplicados</h3><p>Activa la demo o abre sobres para conseguir barajitas repetidas.</p></div>`;
}

function renderDemoButton() {
    const button = document.querySelector('#demo-toggle-btn');
    button.classList.toggle('active', AppState.demoEnabled);
    button.setAttribute('aria-pressed', String(AppState.demoEnabled));
    button.lastChild.textContent = AppState.demoEnabled ? ' Desactivar datos demo' : ' Activar datos demo';
}

function setText(id, value) {
    document.getElementById(id).textContent = value;
}

/**
 * 1. ヘルパー関数
 */
function formatDate(dateInput) {
    if (!dateInput) return "";
    return Array.isArray(dateInput) ? dateInput.join(", ") : dateInput;
}

function formatTime(timeInput) {
    if (!timeInput) return "";
    const formatSingle = (t) => {
        const h = parseInt(t.split(':')[0], 10);
        return `${h < 12 ? "午前" : "午後"} ${t}`;
    };
    return Array.isArray(timeInput) ? timeInput.map(t => formatSingle(t)).join(" / ") : formatSingle(timeInput);
}

/**
 * 2. 状態リセット
 */
function resetToListView() {
    const detailPage = document.getElementById('detail-page');
    const listPage = document.getElementById('list-page');
    const header = document.getElementById('main-header');
    const intro = document.getElementById('intro');

    if (listPage && detailPage) {
        header.classList.remove('detail-mode');
        intro.classList.remove('detail-mode');
        listPage.classList.remove('hidden');
        detailPage.classList.add('hidden');
    }

    const drawer = document.getElementById('drawer');
    if (drawer && drawer.classList.contains('is-active')) {
        drawer.classList.remove('is-active');
        document.getElementById('drawer-overlay')?.classList.remove('is-active');
        document.getElementById('menu-btn')?.classList.remove('is-open');
    }

    const modal = document.getElementById('image-modal');
    if (modal) modal.remove();
    document.body.style.overflow = '';

    // CTAセクション・フッターを再表示
    document.querySelectorAll('.cta-section, #yorisou').forEach(el => el.classList.remove('hidden'));
    document.getElementById('main-footer').classList.remove('hidden');
}

/**
 * 3. 画像モーダル（見切れ防止・スクロール解除対応）
 */
function openImageModal(imgSrc) {
    const modal = document.createElement('div');
    modal.id = 'image-modal';
    Object.assign(modal.style, {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: 10000, cursor: 'zoom-out', padding: '20px', boxSizing: 'border-box'
    });

    const container = document.createElement('div');
    container.style.position = 'relative';

    const img = document.createElement('img');
    img.src = imgSrc;
    Object.assign(img.style, { maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '4px' });

    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '&times;';
    Object.assign(closeBtn.style, { position: 'absolute', top: '-50px', right: '0', color: 'white', fontSize: '40px', cursor: 'pointer' });

    container.appendChild(img);
    container.appendChild(closeBtn);
    modal.appendChild(container);

    modal.onclick = () => {
        modal.remove();
        document.body.style.overflow = '';
    };

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

/**
 * 4. セミナー詳細表示
 */
function showDetail(event, shouldPush = true) {
    const detailContent = document.getElementById('detail-content');
    if (!detailContent) return;

    document.getElementById('main-header').classList.add('detail-mode');
    document.getElementById('intro').classList.add('detail-mode');

    const lastDate = Array.isArray(event.date) ? event.date[event.date.length - 1] : event.date;
    const lastTime = Array.isArray(event.time) ? event.time[event.time.length - 1] : event.time;
    const isFuture = new Date(`${lastDate}T${lastTime}`) > new Date();

    detailContent.innerHTML = `
        <div class="detail-container">
            <div class="detail-visual">
                <img src="${event.image}" alt="${event.title}" id="detail-main-img" style="width:100%; border-radius:12px; display:block; cursor:zoom-in;">
                <p style="text-align:right; font-size:12px; color:#666; margin-top:8px;">画像をタップして拡大</p>
            </div>
            <div class="detail-main-info">
                <h1>${event.title}</h1>
                <p class="description">${event.content}</p>
                <table class="info-table">
                    <tr><th>開催日</th><td>${formatDate(event.date)}</td></tr>
                    <tr><th>時間</th><td>${formatTime(event.time)} 〜 ${event.endTime || ''}</td></tr>
                    <tr><th>会場</th><td>${event.location}</td></tr>
                    <tr><th>講師</th><td>${event.speaker}</td></tr>
                    <tr><th>主催</th><td>${event.organizer}</td></tr>
                </table>
                <div class="action-area">
                    ${isFuture ? `<a href="${event.formUrl}" class="entry-btn" target="_blank" rel="noopener">このセミナーに申し込む</a>` : `<div class="entry-btn disabled">このセミナーは終了しました</div>`}
                </div>
            </div>
        </div>
    `;

    document.getElementById('detail-main-img').onclick = () => openImageModal(event.image);
    document.getElementById('list-page').classList.add('hidden');
    document.getElementById('detail-page').classList.remove('hidden');

    // CTAセクション・フッターを非表示
    document.querySelectorAll('.cta-section, #yorisou').forEach(el => el.classList.add('hidden'));
    document.getElementById('main-footer').classList.add('hidden');

    window.scrollTo({ top: 0, behavior: 'auto' });

    if (shouldPush) history.pushState({ page: "detail", id: event.id }, "", `#detail-${event.id}`);
}

/**
 * 5. 一覧初期化
 */
function init() {
    const listPage = document.getElementById('list-page');
    const events = window.seminarEvents;
    if (!listPage || !events) return;

    listPage.innerHTML = '';
    const now = new Date();
    const BATCH = 4;

    const activeEvents = [];
    const closedEvents = [];

    events.forEach(event => {
        const lastDate = Array.isArray(event.date) ? event.date[event.date.length - 1] : event.date;
        const lastTime = Array.isArray(event.time) ? event.time[event.time.length - 1] : event.time;
        const isActive = new Date(`${lastDate}T${lastTime}`) > now;
        (isActive ? activeEvents : closedEvents).push(event);
    });

    // カードを生成する関数
    function createCard(event, isActive) {
        const card = document.createElement('div');
        card.className = `card ${isActive ? 'active' : 'closed'}`;
        card.innerHTML = `<div class="card-image"><img src="${event.image}" alt="${event.title}" loading="lazy"></div><div class="card-info"><div class="card-meta"><span class="location-text">${event.area}</span><span class="badge ${isActive ? 'badge-active' : 'badge-closed'}">${isActive ? '受付中' : '終了'}</span></div><h2>${event.title}</h2><p class="card-date">開催日: ${formatDate(event.date)}</p></div>`;
        card.onclick = () => showDetail(event);
        return card;
    }

    // 受付中セクション
    if (activeEvents.length > 0) {
        const t = document.createElement('h2');
        t.className = 'section-title main-title';
        t.innerText = 'セミナー情報';
        const activeGrid = document.createElement('div');
        activeGrid.className = 'active-grid';
        activeEvents.forEach(event => activeGrid.appendChild(createCard(event, true)));
        listPage.appendChild(t);
        listPage.appendChild(activeGrid);
    }

    // アーカイブセクション
    if (closedEvents.length > 0) {
        const t = document.createElement('h2');
        t.className = 'section-title';
        t.innerText = 'セミナーアーカイブ';
        const closedGrid = document.createElement('div');
        closedGrid.className = 'closed-grid';
        listPage.appendChild(t);
        listPage.appendChild(closedGrid);

        let shown = 0;

        function showNextBatch() {
            const batch = closedEvents.slice(shown, shown + BATCH);
            batch.forEach(event => closedGrid.appendChild(createCard(event, false)));
            shown += batch.length;

            // 既存のボタンを削除
            const existing = document.getElementById('load-more-btn');
            if (existing) existing.remove();

            // まだ残りがあればボタンを追加
            if (shown < closedEvents.length) {
                const btn = document.createElement('button');
                btn.id = 'load-more-btn';
                btn.textContent = 'さらに表示';
                btn.onclick = showNextBatch;
                listPage.appendChild(btn);
            }
        }

        showNextBatch();
    }
}

/**
 * 6. イベント設定
 */
document.addEventListener('DOMContentLoaded', () => {
    const homeLinks = document.querySelectorAll('#site-logo, .nav-home');
    const searchLinks = document.querySelectorAll('.nav-search');
    const backBtn = document.getElementById('btn-back');

    const handleHomeAction = (e) => {
        e.preventDefault(); resetToListView();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState(null, "", "./");
    };

    const handleScrollAction = (e) => {
        e.preventDefault(); resetToListView();
        if (typeof ScrollManager !== 'undefined') ScrollManager.scrollTo('.main-title');
        history.pushState(null, "", "./");
    };

    homeLinks.forEach(el => el.onclick = handleHomeAction);
    searchLinks.forEach(el => el.onclick = handleScrollAction);
    if (backBtn) backBtn.onclick = handleScrollAction;

    if (document.getElementById('list-page')) {
        init();
        if (window.location.hash.startsWith('#detail-')) {
            const eventId = window.location.hash.replace('#detail-', '');
            const event = window.seminarEvents.find(ev => ev.id == eventId);
            if (event) setTimeout(() => showDetail(event, false), 200);
        }
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page === "detail") {
                const event = window.seminarEvents.find(ev => ev.id == e.state.id);
                if (event) showDetail(event, false);
            } else { resetToListView(); }
        });
    }

    const shikakuLinks = document.querySelectorAll('.nav-shikaku');
    shikakuLinks.forEach(el => el.onclick = (e) => {
        e.preventDefault();
        resetToListView();
        if (typeof ScrollManager !== 'undefined') ScrollManager.scrollTo('#shikaku');
        history.pushState(null, "", "./");
    });
});
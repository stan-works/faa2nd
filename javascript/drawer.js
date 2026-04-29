document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('drawer-overlay');

    // 開閉を切り替える関数
    const toggleDrawer = () => {
        menuBtn.classList.toggle('is-open');
        drawer.classList.toggle('is-active');
        overlay.classList.toggle('is-active');
        
        // ドロワーが開いている時はスクロールを禁止
        document.body.style.overflow = drawer.classList.contains('is-active') ? 'hidden' : '';
    };

    // イベントリスナー
    menuBtn.addEventListener('click', toggleDrawer);
    overlay.addEventListener('click', toggleDrawer);

    // メニュー内のリンクをクリックしたら閉じる
    const drawerLinks = document.querySelectorAll('.drawer-links a');
    drawerLinks.forEach(link => {
        link.addEventListener('click', toggleDrawer);
    });
});
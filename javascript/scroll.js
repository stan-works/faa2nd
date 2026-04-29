const ScrollManager = {
    header: null,

    init() {
        this.header = document.getElementById('main-header');
        if (!this.header) return;
        window.addEventListener('scroll', () => this.handleHeaderStyle());
        this.handleHeaderStyle();

        // 【追加】URLのハッシュ（#seminar）をチェックして、遷移直後にスクロール
        if (window.location.hash === '#seminar') {
            // ページ読み込み完了後に実行
            window.addEventListener('load', () => {
                this.scrollTo('.main-title');
            });
        }
    },

    handleHeaderStyle() {
        if (!this.header) return;
        if (this.header.classList.contains('detail-mode')) return;

        if (window.scrollY > 100) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
    },

    scrollTo(selector, offset = 100) {
        const target = document.querySelector(selector);
        if (!target) {
            // index.html以外にいる場合は、ハッシュ付きで遷移
            window.location.href = 'index.html#seminar';
            return;
        }
        setTimeout(() => {
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }, 150);
    }
};

document.addEventListener('DOMContentLoaded', () => ScrollManager.init());
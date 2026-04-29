// トップへ戻るボタン用

const ScrollTopBtn = {
    btn: null,

    init() {
        // ボタン要素を生成
        this.btn = document.createElement('button');
        this.btn.id = 'scroll-top-btn';
        this.btn.setAttribute('aria-label', 'トップへ戻る');
this.btn.innerHTML = '<span class="scroll-top-inner"><span class="material-symbols-outlined">arrow_upward</span></span>';        document.body.appendChild(this.btn);

        // スクロールで表示・非表示
        window.addEventListener('scroll', () => this.toggle());

        // クリックでトップへ
        this.btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    toggle() {
        if (window.scrollY > 300) {
            this.btn.classList.add('is-visible');
        } else {
            this.btn.classList.remove('is-visible');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => ScrollTopBtn.init());
// PahadiCart & Himora Multi-Portal Theme Engine
// Ultra-Responsive Dark/Light mode switching with LocalStorage persistence & SVG icons

(function() {
  const SUN_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="theme-svg"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const MOON_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="theme-svg"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  class PahadiThemeController {
    constructor() {
      this.portal = this.detectPortal();
      this.storageKey = 'pahadi_theme_' + this.portal;
      this.theme = this.getInitialTheme();
      this.applyTheme(this.theme, false);
      
      // Auto-bind on DOM load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.syncButtons());
      } else {
        setTimeout(() => this.syncButtons(), 10);
      }
    }

    detectPortal() {
      const p = window.location.pathname.toLowerCase();
      if (p.includes('/merchant')) return 'merchant';
      if (p.includes('/rider')) return 'rider';
      if (p.includes('/admin')) return 'admin';
      return 'customer';
    }

    getInitialTheme() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved === 'dark' || saved === 'light') return saved;
      } catch(e) {}
      
      // Default persona alignment:
      // Admin & Rider default to Dark Mode
      // Customer & Merchant default to Light Mode
      if (this.portal === 'admin' || this.portal === 'rider') {
        return 'dark';
      }
      return 'light';
    }

    toggleTheme() {
      const newTheme = this.theme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
      return newTheme;
    }

    setTheme(theme) {
      this.theme = theme;
      try {
        localStorage.setItem(this.storageKey, theme);
      } catch(e) {}
      this.applyTheme(theme, true);
    }

    applyTheme(theme, animate = true) {
      document.documentElement.setAttribute('data-theme', theme);
      if (document.body) {
        document.body.setAttribute('data-theme', theme);
        document.body.classList.toggle('dark-theme', theme === 'dark');
        document.body.classList.toggle('light-theme', theme === 'light');
      }

      // Smooth color transition
      if (animate && document.body) {
        document.body.classList.add('theme-switching');
        clearTimeout(this._switchTimer);
        this._switchTimer = setTimeout(() => {
          if (document.body) document.body.classList.remove('theme-switching');
        }, 350);
      }

      this.syncButtons();

      // Dispatch event
      try {
        window.dispatchEvent(new CustomEvent('pahadi:themechange', { detail: { theme, portal: this.portal } }));
      } catch(e) {}
    }

    syncButtons() {
      const isDark = this.theme === 'dark';
      // When dark, button shows Sun icon + 'Light' (next mode)
      // When light, button shows Moon icon + 'Dark' (next mode)
      const targetIcon = isDark ? SUN_SVG : MOON_SVG;
      const targetLabel = isDark ? 'Light' : 'Dark';
      const tooltip = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';

      document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.setAttribute('title', tooltip);
        btn.setAttribute('aria-label', tooltip);
        btn.setAttribute('data-current-theme', this.theme);

        let iconEl = btn.querySelector('.theme-toggle-icon') || btn.querySelector('.theme-icon') || btn.querySelector('[data-theme-icon]');
        if (!iconEl) {
          iconEl = document.createElement('span');
          iconEl.className = 'theme-toggle-icon';
          btn.prepend(iconEl);
        }
        if (iconEl.innerHTML !== targetIcon) {
          iconEl.innerHTML = targetIcon;
        }

        let labelEl = btn.querySelector('.theme-toggle-label') || btn.querySelector('.theme-label') || btn.querySelector('[data-theme-label]');
        if (labelEl) {
          labelEl.textContent = targetLabel;
        }

        btn.classList.toggle('theme-active-dark', isDark);
        btn.classList.toggle('theme-active-light', !isDark);
      });
    }
  }

  window.PahadiThemeController = PahadiThemeController;
  window.pahadiTheme = new PahadiThemeController();
  window.toggleTheme = () => window.pahadiTheme.toggleTheme();
  window.toggleAdminTheme = () => window.pahadiTheme.toggleTheme();
})();

/**
 * Jeevanix Local — Sovereign Founder / CEO Authentication & Security Gate
 * Master Admin Password Protection: 'Pahadi#123'
 * Dedicated Founder Verification with 4-Digit Master PIN for Critical Operations
 */

(function() {
  const MASTER_ADMIN_PASSWORD = 'Pahadi#123';
  const ADMIN_AUTH_SESSION_KEY = 'pahadi_admin_session_auth';
  const FOUNDER_SESSION_KEY = 'jeevanix_founder_session';
  const DEFAULT_FOUNDER = {
    id: 'FOUNDER-01',
    role: 'SUPER_ADMIN',
    title: 'Founder & CEO',
    name: 'Jeevanix Founder',
    email: 'founder@jeevanix.in',
    phone: '9816000001',
    pin: '7890' // Default Master Security PIN
  };

  class JeevanixFounderAuth {
    constructor() {
      this.initSession();
      this.checkLoginGate();
    }

    initSession() {
      try {
        if (!localStorage.getItem(FOUNDER_SESSION_KEY)) {
          localStorage.setItem(FOUNDER_SESSION_KEY, JSON.stringify({
            authenticated: true,
            founder: DEFAULT_FOUNDER,
            verifiedAt: Date.now()
          }));
        }
      } catch(e) {}
    }

    isLoggedIn() {
      try {
        return sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY) === 'authenticated';
      } catch(e) {
        return false;
      }
    }

    checkLoginGate() {
      const gate = document.getElementById('adminLoginGate');
      if (!gate) return;

      if (!this.isLoggedIn()) {
        gate.style.display = 'flex';
        setTimeout(() => {
          const inp = document.getElementById('adminLoginPasswordInput');
          if (inp) inp.focus();
        }, 100);
      } else {
        gate.style.display = 'none';
      }
    }

    loginWithPassword(password) {
      const errorEl = document.getElementById('adminLoginError');
      const inputEl = document.getElementById('adminLoginPasswordInput');

      if (password === MASTER_ADMIN_PASSWORD) {
        try {
          sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, 'authenticated');
          sessionStorage.setItem('pahadi_active_role', 'SUPER_ADMIN');
        } catch(e) {}

        const gate = document.getElementById('adminLoginGate');
        if (gate) {
          gate.style.transition = 'opacity 0.3s ease';
          gate.style.opacity = '0';
          setTimeout(() => {
            gate.style.display = 'none';
            gate.style.opacity = '1';
          }, 300);
        }
        if (errorEl) errorEl.style.display = 'none';
        this.logSecurityEvent('ADMIN_LOGIN_SUCCESS', 'Admin authenticated with master password');
        return { success: true };
      } else {
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.innerText = '❌ Invalid Password! Kripya sahi Admin Password (Pahadi#123) darj karein.';
        }
        if (inputEl) {
          inputEl.style.borderColor = '#ef4444';
          inputEl.focus();
        }
        this.logSecurityEvent('ADMIN_LOGIN_FAILED', 'Failed admin login attempt with incorrect password');
        return { success: false, message: 'Invalid Password' };
      }
    }

    logout() {
      if (confirm('Kya aap Admin Command Center se logout karna chahte hain?')) {
        try {
          sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
          sessionStorage.removeItem('pahadi_active_role');
        } catch(e) {}
        this.logSecurityEvent('ADMIN_LOGOUT', 'Admin logged out');
        const gate = document.getElementById('adminLoginGate');
        if (gate) {
          gate.style.display = 'flex';
          const inputEl = document.getElementById('adminLoginPasswordInput');
          if (inputEl) {
            inputEl.value = '';
            inputEl.focus();
          }
        } else {
          window.location.href = '/';
        }
      }
    }

    getFounderInfo() {
      try {
        const s = JSON.parse(localStorage.getItem(FOUNDER_SESSION_KEY));
        return s?.founder || DEFAULT_FOUNDER;
      } catch(e) {
        return DEFAULT_FOUNDER;
      }
    }

    verifyPin(enteredPin) {
      const founder = this.getFounderInfo();
      return enteredPin === founder.pin;
    }

    setMasterPin(oldPin, newPin) {
      if (!this.verifyPin(oldPin)) {
        return { success: false, message: 'Current Master PIN is incorrect.' };
      }
      if (!newPin || newPin.length !== 4 || isNaN(newPin)) {
        return { success: false, message: 'New PIN must be exactly 4 digits.' };
      }
      const founder = this.getFounderInfo();
      founder.pin = newPin;
      localStorage.setItem(FOUNDER_SESSION_KEY, JSON.stringify({
        authenticated: true,
        founder: founder,
        verifiedAt: Date.now()
      }));
      this.logSecurityEvent('FOUNDER_PIN_CHANGED', 'Master Security PIN updated by Founder');
      return { success: true, message: 'Master Security PIN updated successfully!' };
    }

    logSecurityEvent(action, details) {
      if (window.PahadiAdminApi && window.PahadiAdminApi.logAuditEvent) {
        window.PahadiAdminApi.logAuditEvent(action, 'SECURITY', '0', details, 'VERIFIED');
      }
    }

    promptVerification(actionName, onVerified, optionalReasonPrompt = false) {
      const modal = document.getElementById('founderPinModal');
      const titleEl = document.getElementById('founderPinActionTitle');
      const inputEl = document.getElementById('founderPinInput');
      const errorEl = document.getElementById('founderPinError');
      const reasonWrap = document.getElementById('founderReasonWrap');
      const reasonInput = document.getElementById('founderReasonInput');

      if (!modal || !inputEl) {
        const pin = prompt('👑 FOUNDER VERIFICATION REQUIRED\nEnter 4-digit Master Security PIN for: ' + actionName);
        if (this.verifyPin(pin)) {
          let reason = 'Authorized by Founder';
          if (optionalReasonPrompt) {
            reason = prompt('Enter reason for: ' + actionName) || reason;
          }
          this.logSecurityEvent(actionName, reason);
          if (onVerified) onVerified(reason);
        } else {
          alert('❌ Verification Failed: Invalid Master PIN');
        }
        return;
      }

      titleEl.innerText = actionName;
      inputEl.value = '';
      if (errorEl) errorEl.style.display = 'none';
      if (reasonWrap) {
        reasonWrap.style.display = optionalReasonPrompt ? 'block' : 'none';
        if (reasonInput) reasonInput.value = '';
      }

      modal.style.display = 'flex';
      inputEl.focus();

      window._pendingFounderCallback = (reason) => {
        modal.style.display = 'none';
        this.logSecurityEvent(actionName, reason || 'Authorized via Master PIN');
        if (onVerified) onVerified(reason);
      };
    }
  }

  const authInstance = new JeevanixFounderAuth();
  window.JeevanixFounderAuth = authInstance;

  // Global helpers
  window.handleAdminLoginSubmit = function() {
    const inp = document.getElementById('adminLoginPasswordInput');
    const val = inp ? inp.value.trim() : '';
    authInstance.loginWithPassword(val);
  };

  window.toggleAdminPasswordVisibility = function() {
    const inp = document.getElementById('adminLoginPasswordInput');
    if (inp) {
      inp.type = inp.type === 'password' ? 'text' : 'password';
    }
  };

  window.pahadiLogout = function() {
    authInstance.logout();
  };

  document.addEventListener('DOMContentLoaded', () => {
    authInstance.checkLoginGate();
  });
})();

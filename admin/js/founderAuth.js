/**
 * Jeevanix Local — Sovereign Founder / CEO Authentication & Security Gate
 * Dedicated Founder Verification with 4-Digit Master PIN for Critical Operations
 */

(function() {
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

  window.JeevanixFounderAuth = new JeevanixFounderAuth();
})();

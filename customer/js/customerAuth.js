/**
 * Jeevanix Local — Zero-Cost Customer Authentication Engine
 * Pure Client-Side Secure Storage (Zero Paid SMS/OTP API)
 * Handles Registration, Login, Session Persistence, and Address Sync
 */

(function() {
  const USERS_STORAGE_KEY = 'jeevanix_users_db';
  const SESSION_STORAGE_KEY = 'jeevanix_active_session';

  class JeevanixCustomerAuth {
    constructor() {
      this.initDefaultUsers();
    }

    initDefaultUsers() {
      try {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (!stored) {
          const defaultUser = {
            id: 'cx-101',
            name: 'Amar Thakur',
            phone: '9816012890',
            password: 'password123',
            address: 'Near Durga Mandir, Mall Road, Solan, Himachal Pradesh - 173212',
            colony: 'Mall Road Lower Bazaar',
            staircaseNote: 'Descend 15 stone steps, blue door on left',
            town: 'solan',
            createdAt: new Date().toISOString()
          };
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultUser]));
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(defaultUser));
        }
      } catch(e) {
        console.warn('Auth storage init error:', e);
      }
    }

    getAllUsers() {
      try {
        return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
      } catch(e) {
        return [];
      }
    }

    getCurrentUser() {
      try {
        const session = localStorage.getItem(SESSION_STORAGE_KEY);
        return session ? JSON.parse(session) : null;
      } catch(e) {
        return null;
      }
    }

    register(name, phone, password, confirmPassword, address, colony, staircaseNote, town) {
      if (!name || !name.trim()) return { success: false, message: 'Kripya apna poora naam likhein.' };
      const cleanPhone = (phone || '').replace(/\D/g, '');
      if (cleanPhone.length !== 10) return { success: false, message: 'Kripya 10-digit ka valid mobile number dalein.' };
      if (!password || password.length < 4) return { success: false, message: 'Password kam se kam 4 aksharon ka hona chahiye.' };
      if (password !== confirmPassword) return { success: false, message: 'Passwords aapas me match nahi ho rahe hain.' };
      if (!address || !address.trim()) return { success: false, message: 'Kripya delivery ka pura pata (address) dalein.' };

      const users = this.getAllUsers();
      if (users.find(u => u.phone === cleanPhone)) {
        return { success: false, message: 'Yeh mobile number pehle se registered hai. Kripya Login karein.' };
      }

      const newUser = {
        id: 'cx-' + Math.floor(1000 + Math.random() * 9000),
        name: name.trim(),
        phone: cleanPhone,
        password: password,
        address: address.trim(),
        colony: colony || 'Solan Central',
        staircaseNote: staircaseNote || 'Direct road level access',
        town: town || 'solan',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));

      if (window.pahadiBus) {
        window.pahadiBus.broadcast('CUSTOMER_REGISTERED', { userId: newUser.id, name: newUser.name, phone: newUser.phone });
      }

      return { success: true, user: newUser, message: 'Jeevanix Local me aapka swagat hai!' };
    }

    login(phone, password) {
      const cleanPhone = (phone || '').replace(/\D/g, '');
      if (cleanPhone.length !== 10) return { success: false, message: 'Kripya 10-digit mobile number dalein.' };
      if (!password) return { success: false, message: 'Password likhna zaroori hai.' };

      const users = this.getAllUsers();
      const user = users.find(u => u.phone === cleanPhone);

      if (!user) {
        return { success: false, message: 'Mobile number mila nahi. Kripya New Account banayein.' };
      }

      if (user.password !== password) {
        return { success: false, message: 'Galat Password! Kripya dobara koshish karein.' };
      }

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      return { success: true, user: user, message: 'Login safal raha!' };
    }

    logout() {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return { success: true };
    }

    updateProfile(updates) {
      const current = this.getCurrentUser();
      if (!current) return { success: false, message: 'Not logged in' };

      const users = this.getAllUsers();
      const idx = users.findIndex(u => u.id === current.id);
      if (idx !== -1) {
        Object.assign(users[idx], updates);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(users[idx]));
        return { success: true, user: users[idx] };
      }
      return { success: false, message: 'User not found' };
    }
  }

  window.JeevanixCustomerAuth = new JeevanixCustomerAuth();
})();

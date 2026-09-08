// PahadiCart Role-Based Access Control (RBAC) Engine
(function() {
  const ROLES = {
    SUPER_ADMIN: {
      id: 'SUPER_ADMIN',
      name: 'Super Admin (Platform Founder)',
      badgeColor: '#10b981',
      description: 'Unrestricted full access across all operations, finances, settings, and town nodes.',
      permissions: ['*']
    },
    OPERATIONS_ADMIN: {
      id: 'OPERATIONS_ADMIN',
      name: 'Operations Manager',
      badgeColor: '#38bdf8',
      description: 'Command tower, live dispatch, riders fleet, walking runners, service zones & roadblocks.',
      permissions: [
        'view:overview', 'view:orders', 'manage:orders',
        'view:merchants', 'manage:merchants', 'view:riders', 'manage:riders',
        'view:runners', 'manage:runners', 'view:dispatch', 'manage:dispatch',
        'view:zones', 'manage:zones', 'view:geofences', 'manage:geofences',
        'view:terrain', 'manage:terrain', 'view:weather', 'manage:weather',
        'view:customers'
      ]
    },
    FINANCE_ADMIN: {
      id: 'FINANCE_ADMIN',
      name: 'Finance & Accounts Controller',
      badgeColor: '#fbbf24',
      description: 'P&L statements, merchant settlement batches, rider wallets, COD reconciliation, 1% TCS.',
      permissions: [
        'view:overview', 'view:orders', 'view:merchants',
        'view:finance', 'manage:finance', 'view:payments', 'manage:payments',
        'view:refunds', 'manage:refunds', 'view:settlements', 'manage:settlements',
        'view:wallets', 'manage:wallets', 'view:cod', 'manage:cod',
        'view:commissions', 'manage:commissions', 'view:reports'
      ]
    },
    SUPPORT_ADMIN: {
      id: 'SUPPORT_ADMIN',
      name: 'Customer Support Lead',
      badgeColor: '#a855f7',
      description: 'Customer order issues, missing staircase drops, refund requests, disputes & review moderation.',
      permissions: [
        'view:overview', 'view:orders', 'view:customers', 'manage:customers',
        'view:support', 'manage:support', 'view:reviews', 'manage:reviews',
        'view:notifications'
      ]
    },
    TOWN_COORDINATOR: {
      id: 'TOWN_COORDINATOR',
      name: 'Solan Town Node Coordinator',
      badgeColor: '#f97316',
      description: 'Assigned town operations only. Cannot modify global commissions, finances, or other town zones.',
      assignedTown: 'solan',
      permissions: [
        'view:overview', 'view:orders', 'manage:orders',
        'view:merchants', 'view:riders', 'view:runners',
        'view:dispatch', 'manage:dispatch', 'view:zones'
      ]
    }
  };

  class PahadiRBAC {
    constructor() {
      this.roles = ROLES;
      const savedRole = sessionStorage.getItem('pahadi_active_role') || 'SUPER_ADMIN';
      this.currentRole = this.roles[savedRole] ? savedRole : 'SUPER_ADMIN';
      this.currentUser = {
        name: 'Sachin Shukla',
        email: 'ops@pahadicart.himachal.gov.in',
        role: this.currentRole
      };
    }

    getCurrentUser() {
      return {
        ...this.currentUser,
        role: this.currentRole,
        roleDetails: this.roles[this.currentRole]
      };
    }

    switchRole(roleId) { return this.setRole(roleId); }
    getActiveRole() { return this.currentRole; }
    init() { this.applyPermissionsToUI(); }
    canPerform(resource, action) {
      if (this.currentRole === "SUPER_ADMIN") return true;
      const perm = resource.toUpperCase() + "_" + action.toUpperCase();
      return this.hasPermission(perm) || this.hasPermission(resource.toUpperCase() + "_MANAGE");
    }
    setRole(roleId) {
      if (this.roles[roleId]) {
        this.currentRole = roleId;
        this.currentUser.role = roleId;
        sessionStorage.setItem('pahadi_active_role', roleId);
        console.log('Active Admin Role switched to:', roleId);

        if (window.PahadiAdminApi) {
          window.PahadiAdminApi.recordAudit(
            'ADMIN_ROLE_SWITCH',
            'AdminUser',
            this.currentUser.name,
            'PREV_ROLE',
            roleId,
            'Role switcher toggled in Admin Navbar'
          );
        }

        this.applyPermissionsToUI();
        if (typeof showToast === 'function') {
          showToast('🔐 Switched to ' + this.roles[roleId].name);
        }
      }
    }

    hasPermission(permission) {
      const active = this.roles[this.currentRole];
      if (!active) return false;
      if (active.permissions.includes('*')) return true;
      return active.permissions.includes(permission);
    }

    canAccessTab(tabId) {
      return this.hasPermission('view:' + tabId);
    }

    applyPermissionsToUI() {
      // Update Navbar Role Badge & Info
      const badge = document.getElementById('navbarRoleBadge');
      if (badge) {
        const r = this.roles[this.currentRole];
        badge.innerText = r.id.replace('_', ' ');
        badge.style.background = r.badgeColor + '22';
        badge.style.color = r.badgeColor;
        badge.style.borderColor = r.badgeColor + '66';
      }

      const roleDescEl = document.getElementById('navbarRoleDesc');
      if (roleDescEl) {
        roleDescEl.innerText = this.roles[this.currentRole].name;
      }

      // Restrict Sidebar Tabs
      document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
        const tab = item.dataset.tab;
        const allowed = this.canAccessTab(tab);
        item.style.display = allowed ? 'flex' : 'none';
      });

      // If current active tab is restricted, auto-switch to overview
      const activeTabEl = document.querySelector('.nav-item.active');
      if (activeTabEl && activeTabEl.style.display === 'none') {
        if (typeof switchTab === 'function') {
          switchTab('overview');
        }
      }

      // Enforce Town Coordinator restriction if applicable
      const townSelect = document.getElementById('townSelect');
      if (townSelect && this.currentRole === 'TOWN_COORDINATOR') {
        townSelect.value = 'solan';
        townSelect.disabled = true;
      } else if (townSelect) {
        townSelect.disabled = false;
      }
    }
  }

  const rbacInstance = new PahadiRBAC();
  window.PahadiRBAC = rbacInstance;
  window.RbacService = rbacInstance;
  window.PAHADI_ROLES = ROLES;
})();

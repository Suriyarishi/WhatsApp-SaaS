export const BottomNav = (path, role, plan, hasProfile) => {
    if (role === 'admin') {
        return `
      <nav>
        <a href="/admin" data-link class="${path === '/admin' ? 'active' : ''}">
          <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/></svg>
          Admin
        </a>
        <a href="/admin/users" data-link class="${path === '/admin/users' ? 'active' : ''}">
          <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Users
        </a>
        <a href="#" id="logout-link">
          <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </a>
      </nav>
    `;
    }

    if (hasProfile) {
        const centerCTA = plan === 'pro'
            ? `<a href="/automations" data-link class="nav-cta ${path === '/automations' ? 'active' : ''}">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
         </a>`
            : `<a href="/pricing" data-link class="nav-cta ${path === '/pricing' ? 'active' : ''}">
          <svg viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13 0-2.97a2.1 2.1 0 0 0-3 0z"/><path d="M20 4s-4.5 0-9 4.5c-1.5 1.5-2 3.5-2 5s.5 3 2 4.5c1.5 1.5 3 2 4.5 2s3.5-.5 5-2C24 8.5 24 4 24 4z"/></svg>
         </a>`;

        return `
      <nav>
        <a href="/dashboard" data-link class="${path === '/dashboard' ? 'active' : ''}">
          <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/></svg>
          Home
        </a>
        <a href="/bookings" data-link class="${path === '/bookings' ? 'active' : ''}">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Bookings
        </a>
        ${centerCTA}
        <a href="/analytics" data-link class="${path === '/analytics' ? 'active' : ''} ${plan === 'free' ? 'locked' : ''}">
          <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Stats
        </a>
        <a href="/profile" data-link class="${path === '/profile' ? 'active' : ''}">
          <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Profile
        </a>
      </nav>
    `;
    }

    // Setup state or unknown
    return `
    <nav>
      <a href="/profile" data-link class="active">
        <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Setup
      </a>
      <a href="#" id="logout-link">
        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Logout
      </a>
    </nav>
  `;
};

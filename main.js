import { supabase } from './supabase.js'

import { LandingPage } from './pages/Landing.js'
import { SignupPage } from './pages/Signup.js'
import { LoginPage } from './pages/Login.js'
import { DashboardHome } from './pages/Dashboard.js'
import { ProfilePage } from './pages/Profile.js'
import { BookingsPage } from './pages/Bookings.js'
import { SettingsPage } from './pages/Settings.js'
import { PricingPage } from './pages/Pricing.js'
import { AdminDashboard } from './pages/AdminDashboard.js'
import { AdminUsersPage } from './pages/AdminUsers.js'
import { BottomNav } from './components/BottomNav.js'

const app = document.querySelector('#app')

const routes = {
  '/': () => LandingPage(),
  '/signup': () => SignupPage(),
  '/login': () => LoginPage(),
  '/dashboard': () => DashboardHome(),
  '/profile': () => ProfilePage(),
  '/bookings': () => BookingsPage(),
  '/settings': () => SettingsPage(),
  '/pricing': (p) => PricingPage(p),
  '/automations': (u, r, p) => p === 'pro' ? `<h1>Real Automations Page</h1>` : `<section class="locked-feature"><h1>🔒 Automations</h1><p>Automate your WhatsApp replies and booking confirmations.</p><button class="btn-primary" data-link href="/pricing">View Pro Plans</button></section>`,
  '/analytics': (u, r, p) => p === 'pro' ? `<h1>Real Analytics Page</h1>` : `<section class="locked-feature"><h1>🔒 Analytics</h1><p>Track your business growth and customer engagement.</p><button class="btn-primary" data-link href="/pricing">View Pro Plans</button></section>`,
  '/admin': () => AdminDashboard(),
  '/admin/users': () => AdminUsersPage()
};

// --- ROUTER ENGINE ---
async function router() {
  const path = window.location.pathname;
  const { data: { session } } = await supabase.auth.getSession();

  // 1. Auth & Public Route Logic
  const publicRoutes = ['/', '/login', '/signup'];
  if (!session) {
    if (!publicRoutes.includes(path)) return navigate('/login');
    return render(path);
  }

  // 2. Auth State Fetching
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
  const role = profile?.role || 'business';

  let plan = 'free';
  let hasProfile = false;

  if (role === 'business') {
    const { data: sub } = await supabase.from('subscriptions').select('plan, status').eq('user_id', session.user.id).single();
    if (sub && sub.status === 'active') plan = sub.plan;

    const { data: bizProfile } = await supabase.from('business_profiles').select('id').eq('user_id', session.user.id).single();
    hasProfile = !!bizProfile;

    // A. Profile Enforcement
    if (!hasProfile && path !== '/profile') return navigate('/profile');

    // B. Post-Login Redirect
    if (hasProfile && (path === '/login' || path === '/signup')) return navigate('/dashboard');

    // C. Feature Gating
    const strictlyBlocked = ['/advanced-settings'];
    if (plan === 'free' && strictlyBlocked.includes(path)) return navigate('/pricing');
  }

  // 3. Admin Routing
  const isAdminPath = path.startsWith('/admin');
  if (role === 'admin' && !isAdminPath && path !== '/') return navigate('/admin');
  if (role === 'business' && isAdminPath) return navigate('/dashboard');

  render(path, session.user, role, plan, hasProfile);
}

function navigate(path) {
  window.history.pushState({}, '', path);
  router();
}

/**
 * GLOBAL RENDER (The App Shell)
 * Centralizes how we inject HTML and handle listeners.
 */
async function render(path, user = null, role = null, plan = 'free', hasProfile = false) {
  const viewFunc = routes[path] || (() => LandingPage());
  const { data: { session } } = await supabase.auth.getSession();

  // APP SHELL WRAPPER
  const navHtml = session ? BottomNav(path, role, plan, hasProfile) : '';

  app.innerHTML = `
    <main id="page-content">
      ${viewFunc(user, role, plan)}
    </main>
    ${navHtml}
  `;

  // --- RE-ATTACH LISTENERS ---
  document.querySelector('#logout-link')?.addEventListener('click', handleLogout);

  if (path === '/signup') document.querySelector('#signup-form').onsubmit = handleSignup;
  if (path === '/login') document.querySelector('#login-form').onsubmit = handleLogin;

  if (session && role === 'business') {
    if (path === '/profile') {
      loadProfileData(user);
      document.querySelector('#profile-form').onsubmit = handleProfileSave;
    }
    if (path === '/dashboard') {
      loadDashboardData(user, plan);
      document.querySelector('#view-all-bookings')?.addEventListener('click', () => navigate('/bookings'));
    }
    if (path === '/bookings') loadBookings(user);
    if (path === '/pricing') {
      document.querySelector('#upgrade-btn')?.addEventListener('click', () => handleUpgrade(user, 'pro'));
      document.querySelector('#upgrade-btn-final')?.addEventListener('click', () => handleUpgrade(user, 'pro'));
    }
  }

  if (session && role === 'admin') {
    if (path === '/admin') loadAdminStats();
    if (path === '/admin/users') loadAllUsers();
  }
}

// --- PROFILE LOGIC ---
async function handleProfileSave(e) {
  e.preventDefault();
  const { data: { user } } = await supabase.auth.getUser();

  const pkg = {
    user_id: user.id,
    business_name: document.querySelector('#biz-name').value,
    whatsapp_number: document.querySelector('#biz-phone').value,
    address: document.querySelector('#biz-address').value,
    working_hours: document.querySelector('#biz-hours').value
  };

  const { error } = await supabase.from('business_profiles').upsert(pkg, { onConflict: 'user_id' });

  if (error) alert(error.message);
  else navigate('/dashboard');
}

async function loadProfileData(user) {
  const { data } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).single();
  if (data) {
    document.querySelector('#biz-name').value = data.business_name || '';
    document.querySelector('#biz-phone').value = data.whatsapp_number || '';
    document.querySelector('#biz-address').value = data.address || '';
    document.querySelector('#biz-hours').value = data.working_hours || '';
  }
}

// --- DASHBOARD LOGIC ---
async function loadDashboardData(user, plan = 'free') {
  const { data: biz } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).single();
  if (!biz) return;

  document.querySelector('#welcome-title').textContent = `Welcome back, ${biz.business_name}!`;

  if (plan === 'free') {
    const banner = document.createElement('div');
    banner.className = 'upgrade-banner';
    banner.innerHTML = `<p>🚀 Unlock automated confirmations and analytics! <a href="/pricing" data-link>Upgrade to Pro</a></p>`;
    document.querySelector('.dashboard').prepend(banner);
  }
}

// --- PAYMENT LOGIC ---
async function handleUpgrade(user, planType = 'pro') {
  const btn = document.querySelector('#upgrade-btn') || document.querySelector('#upgrade-btn-final');
  if (btn) { btn.disabled = true; btn.textContent = "Processing... ⏳"; }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ action: 'create-order', payload: { plan: planType } })
    });

    const order = await res.json();
    if (order.error) throw new Error(order.error);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "AutoWhats",
      description: `${planType.toUpperCase()} Subscription`,
      order_id: order.id,
      handler: async function (response) {
        const verifyRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ action: 'verify-payment', payload: { ...response, plan: planType } })
        });
        const result = await verifyRes.json();
        if (result.status === 'success') { alert("Success! Pro Active."); router(); }
        else alert("Verification failed.");
      },
      prefill: { email: user.email },
      theme: { color: "#25d366" }
    };
    new window.Razorpay(options).open();
  } catch (err) { alert(err.message); if (btn) btn.disabled = false; }
}

// --- AUTH HANDLERS ---
async function handleSignup(e) {
  e.preventDefault();
  const { error } = await supabase.auth.signUp({
    email: document.querySelector('#signup-email').value,
    password: document.querySelector('#signup-password').value,
    options: { data: { role: 'business' } }
  });
  if (error) alert(error.message); else alert("Check your email!");
}

async function handleLogin(e) {
  e.preventDefault();
  const { error } = await supabase.auth.signInWithPassword({
    email: document.querySelector('#login-email').value,
    password: document.querySelector('#login-password').value
  });
  if (error) alert(error.message); else router();
}

async function handleLogout() { await supabase.auth.signOut(); router(); }

// --- INIT ---
window.onpopstate = router;
document.addEventListener('DOMContentLoaded', router);
document.addEventListener('click', e => {
  const link = e.target.closest('[data-link]');
  if (link) { e.preventDefault(); navigate(link.getAttribute('href')); }
});

import { supabase } from './supabase.js'

import { LandingPage } from './pages/Landing.js'
import { SignupPage } from './pages/Signup.js'
import { LoginPage } from './pages/Login.js'
import { DashboardHome } from './pages/Dashboard.js'
import { ProfilePage } from './pages/Profile.js'
import { SetupPage } from './pages/Setup.js'
import { BookingsPage } from './pages/Bookings.js'
import { SettingsPage } from './pages/Settings.js'
import { PricingPage } from './pages/Pricing.js'
import { AdminDashboard } from './pages/AdminDashboard.js'
import { AdminUsersPage } from './pages/AdminUsers.js'

const app = document.querySelector('#app')

const routes = {
  '/': () => LandingPage(),
  '/signup': () => SignupPage(),
  '/login': () => LoginPage(),
  '/dashboard': (u, r, p) => DashboardHome(),
  '/profile': (u, r, p) => ProfilePage(),
  '/bookings': (u, r, p) => BookingsPage(),
  '/settings': (u, r, p) => SettingsPage(),
  '/pricing': (u, r, p) => PricingPage(p),
  '/automations': (u, r, p) => p === 'pro' ? `<h1>Real Automations Page</h1>` : `<section class="locked-feature"><h1>🔒 Automations</h1><p>Automate your WhatsApp replies and booking confirmations.</p><button class="btn-primary" data-link href="/pricing">View Pro Plans</button></section>`,
  '/analytics': (u, r, p) => p === 'pro' ? `<h1>Real Analytics Page</h1>` : `<section class="locked-feature"><h1>🔒 Analytics</h1><p>Track your business growth and customer engagement.</p><button class="btn-primary" data-link href="/pricing">View Pro Plans</button></section>`,
  '/admin': (u, r, p) => AdminDashboard(),
  '/admin/users': (u, r, p) => AdminUsersPage()
};

// --- SECURITY & ROUTING ---
async function router() {
  const path = window.location.pathname;
  const { data: { session } } = await supabase.auth.getSession();

  // 1. Auth Guard
  if (!session) {
    const publicRoutes = ['/', '/login', '/signup'];
    if (!publicRoutes.includes(path)) return navigate('/login');
    return render(path);
  }

  // 2. Role Guard
  const { data: profile, error: roleError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const role = profile?.role || session.user.user_metadata?.role;

  if (!role || roleError) {
    await supabase.auth.signOut();
    return navigate('/login');
  }

  // 3. Business Guard & Onboarding
  let plan = 'free';
  if (role === 'business') {
    // Fetch Subscription
    const { data: sub } = await supabase.from('subscriptions').select('plan, status').eq('user_id', session.user.id).single();
    if (sub && sub.status === 'active') plan = sub.plan;

    // Fetch Business Profile (The Gatekeeper)
    const { data: bizProfile } = await supabase.from('business_profiles').select('id').eq('user_id', session.user.id).single();

    // ONBOARDING LOGIC
    if (!bizProfile) {
      if (path !== '/profile') return navigate('/profile');
    } else {
      // Profile EXISTS
      if (path === '/profile' || path === '/login' || path === '/signup') {
        return navigate('/dashboard');
      }
    }

    // Feature Gating (Hard redirects)
    const strictlyBlockedRoutes = ['/advanced-settings'];
    if (plan === 'free' && strictlyBlockedRoutes.includes(path)) return navigate('/pricing');
  }

  // 4. Admin Redirection
  const isAdminPath = path.startsWith('/admin');
  const isBusinessPath = ['/dashboard', '/profile', '/bookings', '/settings', '/pricing', '/automations', '/analytics'].includes(path);

  if (role === 'admin') {
    if (isBusinessPath) return navigate('/admin');
    if (!isAdminPath && path !== '/') return navigate('/admin');
  }

  if (role === 'business' && isAdminPath) return navigate('/dashboard');

  render(path, session.user, role, plan);
}

function navigate(path) {
  window.history.pushState({}, '', path);
  router();
}

async function render(path, user = null, role = null, plan = 'free') {
  const viewFunc = routes[path] || (() => LandingPage());
  const { data: { session } } = await supabase.auth.getSession();

  const nav = `
    <nav>
      <a href="/" data-link>Landing</a>
      ${!session ? `
        <a href="/login" data-link>Login</a>
        <a href="/signup" data-link>Signup</a>
      ` : role === 'admin' ? `
        <a href="/admin" data-link>Admin Dash</a>
        <a href="/admin/users" data-link>Users</a>
        <a href="#" id="logout-link">Logout</a>
      ` : `
        <a href="/dashboard" data-link>Dashboard</a>
        <a href="/bookings" data-link>Bookings</a>
        <a href="/automations" data-link class="${plan === 'free' ? 'locked' : ''}">Automations ${plan === 'free' ? '🔒' : ''}</a>
        <a href="/analytics" data-link class="${plan === 'free' ? 'locked' : ''}">Analytics ${plan === 'free' ? '🔒' : ''}</a>
        <a href="/profile" data-link>Profile</a>
        <a href="/pricing" data-link class="${plan === 'pro' ? 'pro-link' : ''}">
          ${plan === 'pro' ? 'Pro Plan' : 'Upgrade 🚀'}
        </a>
        <a href="#" id="logout-link">Logout</a>
      `}
    </nav>
  `;

  app.innerHTML = nav + viewFunc(user, role, plan);

  // Attach dynamic event listeners
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
      document.querySelector('#view-all-bookings').onclick = () => navigate('/bookings');
    }
    if (path === '/bookings') loadBookings(user);
    if (path === '/pricing') {
      const view = PricingPage(plan);
      app.innerHTML = nav + view;
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

  const name = document.querySelector('#biz-name').value;
  const phone = document.querySelector('#biz-phone').value;
  const address = document.querySelector('#biz-address').value;
  const hours = document.querySelector('#biz-hours').value;

  const { error } = await supabase
    .from('business_profiles')
    .upsert({
      user_id: user.id,
      business_name: name,
      whatsapp_number: phone,
      address,
      working_hours: hours
    }, { onConflict: 'user_id' });

  if (error) alert(error.message);
  else navigate('/dashboard'); // Strict: Redirect to dashboard on success
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

// --- ADMIN LOGIC ---
async function loadAdminStats() {
  const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: biz } = await supabase.from('business_profiles').select('*', { count: 'exact', head: true });

  const totalUsersEl = document.querySelector('#total-users');
  const activeBizEl = document.querySelector('#active-biz');

  if (totalUsersEl) totalUsersEl.textContent = users || 0;
  if (activeBizEl) activeBizEl.textContent = biz || 0;
}

async function loadDashboardData(user, plan = 'free') {
  const { data: biz } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).single();

  if (biz) {
    document.querySelector('#welcome-title').textContent = `Welcome back, ${biz.business_name}!`;
    if (plan === 'free') {
      const banner = document.createElement('div');
      banner.className = 'upgrade-banner';
      banner.innerHTML = `<p>🚀 Unlock automated confirmations and analytics! <a href="/pricing" data-link>Upgrade to Pro</a></p>`;
      document.querySelector('.dashboard').prepend(banner);
    }
  } else return;
}

// --- PAYMENT LOGIC ---
async function handleUpgrade(user, planType = 'pro') {
  const btn = document.querySelector('#upgrade-btn') || document.querySelector('#upgrade-btn-final');
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Processing... ⏳";
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();

    // 1. Create Order (Server-Side)
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ action: 'create-order', payload: { plan: planType } })
    });

    const order = await res.json();
    if (order.error) throw new Error(order.error);

    // 2. Open Razorpay Checkout (Frontend)
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Public Key Only
      amount: order.amount,
      currency: order.currency,
      name: "AutoWhats SaaS",
      description: `${planType.toUpperCase()} Subscription upgrade`,
      order_id: order.id,
      handler: async function (response) {
        if (btn) btn.textContent = "Verifying Payment... 🔒";

        // 3. Verify Payment (Server-Side)
        const verifyRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'verify-payment',
            payload: { ...response, plan: planType }
          })
        });

        const result = await verifyRes.json();
        if (result.status === 'success') {
          alert("Success! Your subscription is now active.");
          router(); // Instant re-render with new plan
        } else {
          alert("Payment verification failed. Please contact support.");
          if (btn) {
            btn.disabled = false;
            btn.textContent = `Upgrade to ${planType} 🚀`;
          }
        }
      },
      modal: {
        ondismiss: function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = `Upgrade to ${planType} 🚀`;
          }
        }
      },
      prefill: { email: user.email },
      theme: { color: "#25d366" }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error('PAYMENT_ERROR:', err.message);
    alert("Payment Error: " + err.message);
    if (btn) {
      btn.disabled = false;
      btn.textContent = `Upgrade to ${planType} 🚀`;
    }
  }
}

async function loadAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, role, created_at')
    .order('created_at', { ascending: false });

  const list = document.querySelector('#users-list');
  if (error || !data || data.length === 0) {
    list.innerHTML = '<tr><td colspan="4">No users found.</td></tr>';
  } else {
    list.innerHTML = data.map(u => `
      <tr>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>Active</td>
        <td><button disabled>Manage</button></td>
      </tr>
    `).join('');
  }
}

// --- AUTH HANDLERS ---
async function handleSignup(e) {
  e.preventDefault();
  const email = document.querySelector('#signup-email').value;
  const password = document.querySelector('#signup-password').value;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: 'business' } // Default role
    }
  });
  if (error) alert(error.message);
  else alert("Check your email!");
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.querySelector('#login-email').value;
  const password = document.querySelector('#login-password').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else router();
}

async function handleLogout(e) {
  if (e) e.preventDefault();
  await supabase.auth.signOut();
  router();
}

// Handle browser navigation
window.onpopstate = router;
document.addEventListener('DOMContentLoaded', router);

// Handle clicks
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-link]');
  if (link) {
    e.preventDefault();
    navigate(link.getAttribute('href'));
  }
});

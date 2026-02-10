import { supabase } from './supabase.js'

import { LandingPage } from './pages/Landing.js'
import { SignupPage } from './pages/Signup.js'
import { LoginPage } from './pages/Login.js'
import { DashboardHome } from './pages/Dashboard.js'
import { BusinessProfilePage } from './pages/BusinessProfile.js'
import { SetupPage } from './pages/Setup.js'
import { BookingsPage } from './pages/Bookings.js'
import { SettingsPage } from './pages/Settings.js'

const app = document.querySelector('#app')

const routes = {
  '/': LandingPage,
  '/signup': SignupPage,
  '/login': LoginPage,
  '/dashboard': DashboardHome,
  '/profile': BusinessProfilePage, // 🔥 IMPORTANT CHANGE
  '/setup': SetupPage,
  '/bookings': BookingsPage,
  '/settings': SettingsPage
}

// Simple router
const router = async () => {
  const path = window.location.pathname
  const page = routes[path] || LandingPage
  await page()
}

window.addEventListener('popstate', router)
document.addEventListener('DOMContentLoaded', router)

// SPA link handling
document.body.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-link]')
  if (!link) return

  e.preventDefault()
  history.pushState({}, '', link.href)
  router()
})

// --- AUTH LOGIC ---
async function handleSignup(e) {
  e.preventDefault();
  const email = document.querySelector('#signup-email').value;
  const password = document.querySelector('#signup-password').value;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) alert(error.message);
  else {
    alert("Check your email for confirmation!");
    navigate('/login');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.querySelector('#login-email').value;
  const password = document.querySelector('#login-password').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) alert(error.message);
  else navigate('/dashboard');
}

async function handleLogout() {
  await supabase.auth.signOut();
  navigate('/');
}

// --- DATA PERSISTENCE ---
async function handleProfileSave(e) {
  e.preventDefault();
  const { data: { user } } = await supabase.auth.getUser();
  const name = document.querySelector('#biz-name').value;
  const phone = document.querySelector('#biz-phone').value;
  const address = document.querySelector('#biz-address').value;
  const hours = document.querySelector('#biz-hours').value;

  const { error } = await supabase
    .from('businesses')
    .upsert({
      user_id: user.id,
      business_name: name,
      whatsapp_number: phone,
      address,
      working_hours: hours
    }, { onConflict: 'user_id' });

  if (error) alert(error.message);
  else alert('Profile updated!');
}

async function handleSetupSave(e) {
  e.preventDefault();
  const { data: { user } } = await supabase.auth.getUser();

  // Get business ID first
  const { data: biz } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!biz) {
    alert("Please save your Business Profile first!");
    return;
  }

  const welcome = document.querySelector('#welcome-msg').value;
  const service = document.querySelector('#service-msg').value;
  const confirm = document.querySelector('#confirm-msg').value;

  const { error } = await supabase
    .from('message_templates')
    .upsert({
      business_id: biz.id,
      welcome_msg: welcome,
      service_msg: service,
      confirm_msg: confirm
    }, { onConflict: 'business_id' });

  if (error) alert(error.message);
  else alert('Templates saved!');
}

async function loadDashboardData(user) {
  const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single();

  if (biz) {
    document.querySelector('#welcome-title').textContent = `Welcome back, ${biz.business_name}!`;
  }

  if (!biz) {
    document.querySelector('#booking-count').textContent = 'Profile incomplete';
    return;
  }

  // Count today's bookings
  const today = new Date().toISOString().split('T')[0];
  const { count, error } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', biz.id)
    .eq('booking_date', today);

  if (!error) document.querySelector('#booking-count').textContent = count || 0;

  // Load Latest 5
  const { data: latest } = await supabase
    .from('bookings')
    .select('*')
    .eq('business_id', biz.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const list = document.querySelector('#latest-bookings-list');
  if (latest && latest.length > 0) {
    list.innerHTML = latest.map(b => `
      <tr>
        <td>${b.cust_name}</td>
        <td>${b.service}</td>
        <td>${b.time}</td>
      </tr>
    `).join('');
  } else {
    list.innerHTML = '<tr><td>No bookings yet.</td></tr>';
  }
}

async function handlePasswordChange(e) {
  e.preventDefault();
  const newPassword = document.querySelector('#new-password').value;
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) alert(error.message);
  else alert('Password updated successfully!');
}

async function loadBookings(user) {
  const { data: biz } = await supabase.from('businesses').select('id').eq('user_id', user.id).single();
  if (!biz) {
    document.querySelector('#bookings-list').innerHTML = '<tr><td colspan="4">Please set up your profile first.</td></tr>';
    return;
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('business_id', biz.id)
    .order('created_at', { ascending: false });

  const list = document.querySelector('#bookings-list');
  if (error || !data || data.length === 0) {
    list.innerHTML = '<tr><td colspan="4">No bookings found yet.</td></tr>';
  } else {
    list.innerHTML = data.map(b => `
      <tr>
        <td>${b.cust_name || 'Anonymous'}</td>
        <td>${b.service || 'N/A'}</td>
        <td>${b.time || 'N/A'}</td>
        <td><span class="status-badge">${b.status}</span></td>
      </tr>
    `).join('');
  }
}

// --- ROUTING ---
async function navigate(path) {
  const { data: { session } } = await supabase.auth.getSession();

  // Protect dashboard routes
  const isDashboardRoute = ['/dashboard', '/profile', '/setup', '/bookings', '/settings'].includes(path);
  if (isDashboardRoute && !session) {
    navigate('/login');
    return;
  }

  window.history.pushState({}, path, window.location.origin + path);
  const view = routes[path] || LandingPage;

  const nav = `
    <nav>
      <a href="/" data-link>Landing</a>
      ${!session ? `
        <a href="/login" data-link>Login</a>
        <a href="/signup" data-link>Signup</a>
      ` : `
        <a href="/dashboard" data-link>Dashboard</a>
        <a href="/bookings" data-link>Bookings</a>
        <a href="/profile" data-link>Profile</a>
        <a href="/setup" data-link>Setup</a>
        <a href="#" id="logout-link">Logout</a>
      `}
    </nav>
  `;

  app.innerHTML = nav + view();

  // Attach listeners and load data for current view
  if (path === '/signup') document.querySelector('#signup-form').onsubmit = handleSignup;
  if (path === '/login') document.querySelector('#login-form').onsubmit = handleLogin;

  if (session) {
    document.querySelector('#logout-link')?.addEventListener('click', handleLogout);

    if (path === '/dashboard') {
      loadDashboardData(session.user);
      document.querySelector('#view-all-bookings').onclick = () => navigate('/bookings');
    }
    if (path === '/bookings') loadBookings(session.user);
    if (path === '/settings') document.querySelector('#change-password-form').onsubmit = handlePasswordChange;

    if (path === '/profile') {
      const form = document.querySelector('#profile-form');
      form.onsubmit = handleProfileSave;
      // Pre-fill
      const { data } = await supabase.from('businesses').select('*').eq('user_id', session.user.id).single();
      if (data) {
        document.querySelector('#biz-name').value = data.business_name || '';
        document.querySelector('#biz-phone').value = data.whatsapp_number || '';
        document.querySelector('#biz-address').value = data.address || '';
        document.querySelector('#biz-hours').value = data.working_hours || '';
      }
    }

    if (path === '/setup') {
      const form = document.querySelector('#setup-form');
      form.onsubmit = handleSetupSave;
      // Pre-fill
      const { data: biz } = await supabase.from('businesses').select('id').eq('user_id', session.user.id).single();
      if (biz) {
        const { data } = await supabase.from('message_templates').select('*').eq('business_id', biz.id).single();
        if (data) {
          document.querySelector('#welcome-msg').value = data.welcome_msg || '';
          document.querySelector('#service-msg').value = data.service_msg || '';
          document.querySelector('#confirm-msg').value = data.confirm_msg || '';
        }
      }
    }
  }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  try {
    navigate(window.location.pathname);
  } catch (error) {
    console.error("Navigation error:", error);
    if (app) app.innerHTML = `<h1>Something went wrong</h1><p>Check if your Supabase keys are configured in supabase.js</p>`;
  }
});

// Handle back/forward
window.onpopstate = () => navigate(window.location.pathname);

// Universal click listener for routing
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    navigate(e.target.getAttribute('href'));
  }
});

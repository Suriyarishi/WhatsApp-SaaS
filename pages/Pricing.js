export const PricingPage = (plan = 'free') => {
  if (plan === 'pro') {
    return `
      <section class="pricing-pro-status">
        <div class="card glass">
          <h1>You’re on Pro 🎉</h1>
          <p>Thank you for trusting AutoWhats! All premium features are unlocked for your account.</p>
          <div class="status-badge-pro">Active Subscription</div>
          <button class="btn-secondary" data-link href="/dashboard">Back to Dashboard</button>
        </div>
      </section>
    `;
  }

  return `
    <section class="pricing-v2">
      <!-- 1 HERO -->
      <div class="hero-simple">
        <h1>Simple WhatsApp Automation for Local Businesses</h1>
        <p>Save time replying to customers. Never miss bookings again.</p>
        <span class="support-line">Built for salons, clinics, and local service businesses.</span>
      </div>

      <!-- 2 PRICING CARDS -->
      <div class="pricing-grid">
        <div class="pricing-card">
          <h3>Starter</h3>
          <p class="price">₹99<span>/mo</span></p>
          <p class="tagline">For small salons just getting started</p>
          <ul>
            <li>✅ Business profile</li>
            <li>✅ Manual booking entries</li>
            <li>✅ 1 WhatsApp auto-reply template</li>
            <li>✅ Customer details saved</li>
            <li class="locked">❌ No reminders</li>
            <li class="locked">❌ No automation triggers</li>
            <li class="locked">❌ No analytics</li>
          </ul>
          <button class="btn-secondary" disabled>Continue with Starter</button>
          <p class="micro-text">No commitment • Upgrade anytime</p>
        </div>

        <div class="pricing-card featured">
          <div class="badge">⭐ Most Popular</div>
          <h3>Pro</h3>
          <p class="price">₹499<span>/mo</span></p>
          <p class="tagline">For growing businesses that want automation</p>
          <ul>
            <li>✅ Unlimited WhatsApp auto-replies</li>
            <li>✅ Automatic booking confirmation</li>
            <li>✅ Appointment reminders</li>
            <li>✅ Daily summary messages</li>
            <li>✅ Analytics dashboard</li>
            <li>✅ Priority support</li>
          </ul>
          <button class="btn-primary" id="upgrade-btn">Upgrade to Pro 🚀</button>
          <p class="micro-text">Cancel anytime • No hidden charges</p>
        </div>
      </div>

      <!-- 3 COMPARISON TABLE -->
      <div class="comparison-section">
        <h3>Starter vs Pro</h3>
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Starter</th>
              <th>Pro</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Business profile</td><td>✅</td><td>✅</td></tr>
            <tr><td>Auto-reply templates</td><td>1</td><td>Unlimited</td></tr>
            <tr><td>Booking reminders</td><td>❌</td><td>✅</td></tr>
            <tr><td>Automation</td><td>❌</td><td>✅</td></tr>
            <tr><td>Analytics</td><td>❌</td><td>✅</td></tr>
            <tr><td>Support</td><td>Standard</td><td>Priority</td></tr>
          </tbody>
        </table>
      </div>

      <!-- 4 TRUST SECTION -->
      <div class="trust-section">
        <h3>Built for real local businesses</h3>
        <div class="trust-grid">
          <div class="trust-item">🔒 Your data is secure</div>
          <div class="trust-item">🇮🇳 Designed for Indian businesses</div>
          <div class="trust-item">📱 Works directly with WhatsApp</div>
          <div class="trust-item">💬 No technical knowledge needed</div>
        </div>
      </div>

      <!-- 5 FAQ SECTION -->
      <div class="faq-section">
        <h3>Questions?</h3>
        <div class="faq-grid">
          <div class="faq-card">
            <h4>Can I start with Starter and upgrade later?</h4>
            <p>Yes. Upgrade anytime. Your data stays.</p>
          </div>
          <div class="faq-card">
            <h4>Will my WhatsApp number be safe?</h4>
            <p>Yes. We never message customers without your permission.</p>
          </div>
          <div class="faq-card">
            <h4>Is there a contract?</h4>
            <p>No. Monthly plan. Cancel anytime.</p>
          </div>
          <div class="faq-card">
            <h4>Do I need a mobile app?</h4>
            <p>No. Everything works from the website.</p>
          </div>
        </div>
      </div>

      <!-- 6 FINAL CTA -->
      <div class="final-cta">
        <h2>Start simple. Upgrade when you’re ready.</h2>
        <div class="cta-buttons">
          <button class="btn-primary" id="upgrade-btn-final">Upgrade to Pro</button>
          <button class="btn-secondary" data-link href="/dashboard">Continue with Starter</button>
        </div>
      </div>
    </section>
  `;
}

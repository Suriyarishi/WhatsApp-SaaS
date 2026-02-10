export const SetupPage = () => `
  <section class="setup">
    <h2>Auto-Reply Setup</h2>
    <form id="setup-form">
      <label>Welcome Message</label>
      <textarea id="welcome-msg" placeholder="Hello 👋 Welcome to {{Business Name}}. Thank you for contacting us..."></textarea>
      
      <label>Service & Pricing Message</label>
      <textarea id="service-msg" placeholder="We offer the following services: • Haircut • Facial..."></textarea>
      
      <label>Booking Request Message</label>
      <textarea id="request-msg" placeholder="Thank you. Please share your preferred date and time..."></textarea>

      <label>Booking Confirmation Message</label>
      <textarea id="confirm-msg" placeholder="Your appointment has been confirmed ✅ Service: {{Service}}..."></textarea>
      
      <button type="submit" id="setup-save-btn">Save Templates</button>
    </form>
  </section>
`

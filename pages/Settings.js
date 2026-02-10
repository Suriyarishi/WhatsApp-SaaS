export const SettingsPage = () => `
  <section class="settings">
    <h2>Settings</h2>
    <div class="card">
      <h3>Account Control</h3>
      <form id="change-password-form">
        <input type="password" id="new-password" placeholder="New Password" required />
        <button type="submit">Change Password</button>
      </form>
      <hr style="margin: 20px 0; border: 0.5px solid #eee;" />
      <button id="logout" class="btn-danger">Logout</button>
    </div>
  </section>
`

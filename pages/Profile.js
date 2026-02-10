export const ProfilePage = () => `
  <section>
    <h2>Business Profile</h2>
    <form id="profile-form">
      <label>Salon Name</label>
      <input type="text" id="biz-name" required>
      <label>WhatsApp Number</label>
      <input type="text" id="biz-phone" required>
      <label>Address</label>
      <textarea id="biz-address"></textarea>
      <label>Working Hours</label>
      <input type="text" id="biz-hours" placeholder="e.g. 9AM - 9PM">
      <button type="submit">Update Profile</button>
    </form>
    <hr>
    <a href="/settings" data-link>Account Settings</a>
  </section>
`

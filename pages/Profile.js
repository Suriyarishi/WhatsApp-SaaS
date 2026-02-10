export const ProfilePage = () => `
  <section class="profile">
    <h2>Business Profile</h2>
    <form id="profile-form">
      <input type="text" id="biz-name" placeholder="Salon Name" required />
      <input type="text" id="biz-phone" placeholder="WhatsApp Number" required />
      <textarea id="biz-address" placeholder="Address"></textarea>
      <input type="text" id="biz-hours" placeholder="Working Hours (e.g. 9AM-8PM)" required />
      <button type="submit" id="profile-save-btn">Save Profile</button>
    </form>
  </section>
`

export const DashboardHome = () => `
  <section class="dashboard">
    <h2 id="welcome-title">Welcome back!</h2>
    <div class="stats-card">
      <h3>Today's Bookings</h3>
      <p id="booking-count">Loading...</p>
    </div>
    
    <div class="latest-bookings">
      <h3>Latest Bookings</h3>
      <table class="simple-table">
        <tbody id="latest-bookings-list">
          <tr><td>Loading...</td></tr>
        </tbody>
      </table>
      <button id="view-all-bookings" style="margin-top: 20px;" data-link href="/bookings">View All Bookings</button>
    </div>
  </section>
`

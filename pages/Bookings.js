export const BookingsPage = () => `
  <section class="bookings">
    <h2>Customer Bookings</h2>
    <table id="bookings-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Service</th>
          <th>Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="bookings-list">
        <tr><td colspan="4">Loading bookings...</td></tr>
      </tbody>
    </table>
  </section>
`

export const LoginPage = () => `
  <section class="auth">
    <h2>Login</h2>
    <form id="login-form">
      <input type="email" id="login-email" placeholder="Email" required />
      <input type="password" id="login-password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p>Need an account? <a href="/signup" data-link>Sign up</a></p>
  </section>
`

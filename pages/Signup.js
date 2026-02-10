export const SignupPage = () => `
  <section class="auth">
    <h2>Sign Up</h2>
    <form id="signup-form">
      <input type="email" id="signup-email" placeholder="Email" required />
      <input type="password" id="signup-password" placeholder="Password" required />
      <button type="submit" id="signup-btn">Create Account</button>
    </form>
    <p>Already have an account? <a href="/login" data-link>Login</a></p>
  </section>
`

import { supabase } from '../supabase.js'

export const LoginPage = async () => {
  const app = document.querySelector('#app')

  // ✅ If already logged in → redirect
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    history.pushState({}, '', '/profile')
    window.dispatchEvent(new Event('popstate'))
    return
  }

  // ✅ Render UI
  app.innerHTML = `
    <section class="auth">
      <h2>Login</h2>

      <form id="login-form">
        <input type="email" id="login-email" placeholder="Email" required />
        <input type="password" id="login-password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>

      <p>
        Need an account?
        <a href="/signup" data-link>Sign up</a>
      </p>
    </section>
  `

  // ✅ Handle submit
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('login-email').value
    const password = document.getElementById('login-password').value

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert(error.message)
      return
    }

    // ✅ LOGIN SUCCESS → REDIRECT
    history.pushState({}, '', '/profile')
    window.dispatchEvent(new Event('popstate'))
  })
}

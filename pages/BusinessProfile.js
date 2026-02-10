import { supabase } from '../supabase.js'

export const BusinessProfilePage = async () => {
  const app = document.querySelector('#app')

  // 🔐 Protect route
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    history.pushState({}, '', '/login')
    window.dispatchEvent(new Event('popstate'))
    return
  }

  // 🔍 Check existing profile
  let { data: profile, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // 🧠 Auto-create profile if not exists
  if (!profile) {
    const { data: newProfile, error: insertError } = await supabase
      .from('business_profiles')
      .insert({
        user_id: user.id,
        business_type: 'salon'
      })
      .select()
      .single()

    if (insertError) {
      alert(insertError.message)
      return
    }

    profile = newProfile
  }

  // 🖼️ Render UI
  app.innerHTML = `
    <section class="profile">
      <h2>Business Profile</h2>

      <form id="profile-form">
        <input id="business_name" placeholder="Business Name" value="${profile.business_name || ''}" required />
        <input id="whatsapp_number" placeholder="WhatsApp Number" value="${profile.whatsapp_number || ''}" required />
        <input id="opening_time" placeholder="Opening Time (eg: 09:00)" value="${profile.opening_time || ''}" />
        <input id="closing_time" placeholder="Closing Time (eg: 21:00)" value="${profile.closing_time || ''}" />

        <button type="submit">Save Profile</button>
      </form>
    </section>
  `

  // 💾 Save handler
  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault()

    const updates = {
      business_name: document.getElementById('business_name').value,
      whatsapp_number: document.getElementById('whatsapp_number').value,
      opening_time: document.getElementById('opening_time').value,
      closing_time: document.getElementById('closing_time').value
    }

    const { error } = await supabase
      .from('business_profiles')
      .update(updates)
      .eq('user_id', user.id)

    if (error) {
      alert(error.message)
      return
    }

    alert('Profile saved successfully ✅')
  })
}

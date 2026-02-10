import { supabase } from "../supabase.js"

export const BusinessProfilePage = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    location.href = "/login"
    return
  }

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  document.querySelector("#app").innerHTML = `
    <section class="profile">
      <h2>Business Profile</h2>

      <form id="business-form">
        <input type="text" id="business_name" placeholder="Business Name" required
          value="${profile?.business_name || ""}" />

        <input type="text" id="whatsapp_number" placeholder="WhatsApp Number" required
          value="${profile?.whatsapp_number || ""}" />

        <input type="text" id="opening_time" placeholder="Opening Time (eg 9:00 AM)"
          value="${profile?.opening_time || ""}" />

        <input type="text" id="closing_time" placeholder="Closing Time (eg 8:00 PM)"
          value="${profile?.closing_time || ""}" />

        <button type="submit">Save</button>
      </form>
    </section>
  `

  document
    .getElementById("business-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault()

      const payload = {
        user_id: user.id,
        business_name: document.getElementById("business_name").value,
        whatsapp_number: document.getElementById("whatsapp_number").value,
        opening_time: document.getElementById("opening_time").value,
        closing_time: document.getElementById("closing_time").value,
      }

      const { error } = await supabase
        .from("business_profiles")
        .upsert(payload)

      if (error) {
        alert(error.message)
      } else {
        alert("Business profile saved ✅")
      }
    })
}

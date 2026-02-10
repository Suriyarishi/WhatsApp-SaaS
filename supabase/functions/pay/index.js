import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Razorpay from 'https://esm.sh/razorpay@2.9.2'

/**
 * CORS Headers for cross-domain requests from the frontend
 */
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * PRODUCTION-SAFE RAZORPAY HANDLER
 * 
 * Logic:
 * 1. Verify user session via Auth header.
 * 2. Ensure user has 'business' role (Lockdown).
 * 3. Create Razorpay order server-side via secret keys.
 * 4. Verify Payment signature server-side.
 * 5. Update Subscription table (Admin override).
 */
Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL'),
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        )

        // A. Verify User Session
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Auth Header')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
        }

        // B. Verify Business Role
        const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'business') {
            return new Response(JSON.stringify({ error: 'Only business accounts can subscribe.' }), { status: 403, headers: corsHeaders })
        }

        const { action, payload } = await req.json()
        const razorpay = new Razorpay({
            key_id: Deno.env.get('RAZORPAY_KEY_ID'),
            key_secret: Deno.env.get('RAZORPAY_KEY_SECRET'),
        })

        // --- Action: Create Order ---
        if (action === 'create-order') {
            const planType = payload?.plan || 'pro';
            const amount = planType === 'pro' ? 49900 : 9900; // ₹499 or ₹99

            const order = await razorpay.orders.create({
                amount,
                currency: 'INR',
                receipt: `receipt_${user.id}_${Date.now()}`,
            })
            return new Response(JSON.stringify(order), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // --- Action: Verify Payment ---
        if (action === 'verify-payment') {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload
            const body = razorpay_order_id + "|" + razorpay_payment_id

            const encoder = new TextEncoder()
            const key = await crypto.subtle.importKey(
                'raw', encoder.encode(Deno.env.get('RAZORPAY_KEY_SECRET')),
                { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
            )
            const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
            const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')

            if (expectedSignature === razorpay_signature) {
                // PAYMENT LEGIT -> UPDATE SUB
                const expiresAt = new Date()
                expiresAt.setDate(expiresAt.getDate() + 30) // 30 Day cycle

                await supabaseAdmin.from('subscriptions').upsert({
                    user_id: user.id,
                    plan: payload.plan || 'pro',
                    status: 'active',
                    started_at: new Date().toISOString(),
                    expires_at: expiresAt.toISOString(),
                }, { onConflict: 'user_id' })

                return new Response(JSON.stringify({ status: 'success' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            } else {
                return new Response(JSON.stringify({ error: 'Invalid signature' }), {
                    status: 400, headers: corsHeaders
                })
            }
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: corsHeaders })
    } catch (err) {
        console.error('SERVER_ERROR:', err.message)
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: corsHeaders
        })
    }
})

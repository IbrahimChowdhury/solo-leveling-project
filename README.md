# Solo Leveling Gamified Life App

A production-ready gamified life application built using Next.js (App Router), Supabase, and Stripe. Inspired by the "Solo Leveling" anime status screens.

## Tech Stack
- **Framework**: Next.js (latest, App Router)
- **Database/Auth**: Supabase (PostgreSQL, GoTrue Auth, Realtime)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Visuals**: Recharts (Radar Attribute & Progression History charts)
- **Payments**: Stripe Billing Subscriptions

---

## 1. Environment Variables Setup

Create a `.env.local` file in the root directory and copy the following environment configuration parameters:

```env
# Next.js Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key-for-bypassing-rls

# Stripe Configurations
STRIPE_SECRET_KEY=sk_test_...
STRIPE_MONTHLY_PRICE_ID=price_monthly_...
STRIPE_YEARLY_PRICE_ID=price_yearly_...
STRIPE_WEBHOOK_SECRET=whsec_...

# System Cron Secret (for protecting /api/cron/reset endpoint)
CRON_SECRET=your_custom_long_cron_token_here
```

---

## 2. Supabase Setup

### Database Schema
1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Navigate to the **SQL Editor** tab in the sidebar.
3. Open the file [supabase/schema.sql](file:///g:/GIT_Files/My%20Projects/solo-leveling/supabase/schema.sql) from this project.
4. Copy the complete SQL script, paste it into the Supabase SQL editor window, and click **Run**.
   - This creates the `profiles`, `daily_quests`, `custom_quests`, `quest_completions`, `stat_history`, `penalties`, `subscriptions`, and `admin_notifications` tables.
   - It configures triggers to automatically instantiate a Level 1 hunter profile card inside `profiles` upon standard email registrations.
   - It sets up secure, non-recursive Row-Level Security (RLS) policies.

### Storage Bucket Setup
1. In the Supabase Dashboard, go to **Storage**.
2. Click **New Bucket** and name it `avatars`.
3. Set the bucket to **Public** (allowing other users/profiles to view uploaded image files).
4. Add custom policies to let authenticated users upload their own avatars:
   - **Allowed operations**: `INSERT`, `UPDATE`
   - **Target**: `auth.uid()::text = (storage.foldername(name))[1]` (this restricts users to folder names matching their UUID).

### Seeding Admin Credentials
To access the `/admin` control views, a profile must have `is_admin` set to `true`. Run the following SQL query inside your Supabase SQL Editor once you register a test account:

```sql
UPDATE public.profiles
SET is_admin = true
WHERE display_name = 'Your Registered Display Name';
-- OR by UUID:
-- WHERE id = 'your-user-uuid-here';
```

---

## 3. Stripe Subscriptions Integration

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com) (in test mode).
2. Create a Product named **Solo Leveling Awakened Pro**:
   - Add a Monthly recurring pricing plan: `$4.99/month`.
   - Add a Yearly recurring pricing plan: `$49.99/year` (saving 17%).
3. Copy the pricing IDs (`price_...`) and save them as `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_YEARLY_PRICE_ID` in your `.env.local` file.
4. Configure Stripe Webhooks:
   - In Stripe Developers portal under **Webhooks**, click **Add Endpoint**.
   - Set the URL target to `${NEXT_PUBLIC_APP_URL}/api/webhooks/stripe` (use a utility like `stripe-cli` or `ngrok` for local testing redirecting to `http://localhost:3000/api/webhooks/stripe`).
   - Subscribe to these events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the Signing Secret (`whsec_...`) and save it as `STRIPE_WEBHOOK_SECRET` in your `.env.local`.

---

## 4. Daily Reset Cron Job Setup

The endpoint at `/api/cron/reset` executes the daily reset:
- Compares daily completed quests to apply streaks.
- Applies degradation penalties (`-50 XP`, `-2` stats) to missed quests (respects Pro Weekly Penalty Shields).
- Regenerates the next day's daily system quests targeting the user's weakest stats.

To trigger this automatically at **00:00 UTC** daily:
- If deploying to **Vercel**, configure a `vercel.json` cron schedule:
```json
{
  "crons": [
    {
      "path": "/api/cron/reset",
      "schedule": "0 0 * * *"
    }
  ]
}
```
- Configure the header `Authorization: Bearer <CRON_SECRET>` inside your cron dispatcher to match the token set in your environment configuration.

---

## 5. Local Running & Builds

Install packages:
```bash
npm install
```

Run in local development mode:
```bash
npm run dev
```

Build for Vercel/production:
```bash
npm run build
```

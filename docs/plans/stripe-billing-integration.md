# Stripe Billing Integration & Subscription Management Plan

## Implementation Status

**Last Updated:** 2025-12-26

### ✅ Completed

- ✅ **Phase 1: Core Stripe Setup** (4/4 tasks)
  - Installed Stripe SDK
  - Created Stripe client initialization
  - Created and ran database migration
  - Updated environment variables

- ✅ **Phase 2: Stripe Customer & Product Management** (4/4 tasks)
  - Created customer management functions
  - Created product/price management
  - Created Stripe database query helpers
  - Created migration script for existing tiers

- ✅ **Phase 3: Admin Panel** (6/6 tasks)
  - Created admin tier CRUD queries
  - Created admin API endpoints (list, get, update, delete, sync)
  - Created React Query hooks
  - Created admin tiers list page
  - Created tier editor component
  - Added navigation link to AdminNav

- ✅ **Phase 4: Webhook System** (3/3 tasks)
  - Created webhook handler endpoint with signature verification
  - Created event handlers (invoice, subscription, customer, payment)
  - Implemented idempotency tracking with webhook_events table

- ✅ **Phase 5: Checkout Flow** (5/5 tasks)
  - Created checkout session API endpoint
  - Created checkout success endpoint
  - Modified SubscriptionCard for Stripe Checkout integration
  - Created subscription success page
  - Implemented subscription management (cancel, change-tier)

### 📋 Remaining Work

- 📋 **Phase 6: Testing & Production** (3 tasks)
  - End-to-end testing
  - Error scenario testing
  - Production deployment setup

**See:** [Stripe Billing Feature Documentation](../features/stripe-billing.md) for detailed implementation details.

---

## Implementation Notes

### TypeScript Type Safety

All Stripe integration code is fully type-safe. Key type solutions implemented:

1. **Custom Webhook Types**: Created `WebhookInvoice` and `WebhookSubscription` types to handle Stripe's expanded webhook objects with properties not in base types
2. **JsonValue Import**: Fixed by importing from `~/lib/db/types` instead of kysely directly
3. **Stripe API Version**: Using `"2025-12-15.clover"` for latest features
4. **Type Casting**: Used for subscription period fields (`current_period_start`, `current_period_end`) which exist in webhook responses but aren't typed in base Stripe types

### Database Compliance

- Ensured all database operations match actual schema (subscription_transactions table fields)
- Added proper null/undefined handling for optional fields
- DataTable integration required adding `id` field to tier data

### Architectural Patterns

- **Price Immutability**: Always creates new Stripe prices when updating (never updates existing)
- **Webhook Idempotency**: Uses `webhook_events` table with unique constraint on `event_id`
- **Auto-sync**: Admin tier updates automatically trigger Stripe product/price creation
- **Lazy Customer Creation**: Stripe customers only created when user first upgrades

### Files Created (27 total)

**Phase 1-2 (Core):**

- `src/lib/stripe/client.ts`
- `src/lib/stripe/customers.ts`
- `src/lib/stripe/products.ts`
- `src/lib/stripe/queries.ts`
- `src/lib/stripe/migrate-existing-tiers.ts`
- `src/lib/db/migrations/021_add_stripe_integration.ts`

**Phase 3 (Admin):**

- `src/lib/db/queries/admin-subscription-tiers.ts`
- `src/routes/api/admin/subscription-tiers/index.ts`
- `src/routes/api/admin/subscription-tiers/$id.ts`
- `src/routes/api/admin/subscription-tiers/sync-stripe.ts`
- `src/hooks/useAdminSubscriptionTiersQuery.ts`
- `src/routes/admin/subscription-tiers.tsx`
- `src/routes/admin/subscription-tiers/$id/edit.tsx`
- `src/components/admin/SubscriptionTierEditor.tsx`
- Modified: `src/components/admin/AdminNav.tsx`

**Phase 4 (Webhooks):**

- `src/lib/stripe/webhooks/utils.ts`
- `src/lib/stripe/webhooks/invoice.ts`
- `src/lib/stripe/webhooks/subscription.ts`
- `src/lib/stripe/webhooks/customer.ts`
- `src/lib/stripe/webhooks/payment.ts`
- `src/routes/api/webhooks/stripe.ts`

**Phase 5 (Checkout):**

- `src/routes/api/checkout/create-session.ts`
- `src/routes/api/checkout/success.ts`
- `src/routes/api/subscriptions/cancel.ts`
- `src/routes/api/subscriptions/change-tier.ts`
- `src/routes/subscription/success.tsx`
- Modified: `src/components/subscription/SubscriptionCard.tsx`

---

## Overview

Integrate Stripe payment processing with the existing billing system and create an admin panel for managing subscription tiers. The system already has a complete database schema for billing, subscriptions, and invoices - this plan will connect it to Stripe for actual payment processing.

## Key Decisions

Based on user requirements:

- **Invoice Storage**: Keep our own `invoices` table as source of truth, synced from Stripe webhooks
- **Pricing Management**: Database (`subscription_tier_limits`) is source of truth, sync to Stripe when changed
- **Payment Provider**: Start with Stripe only (PayPal can be added later)
- **Product Creation**: Auto-create Stripe products/prices when admin creates/updates subscription tiers
- **Checkout Method**: Use Stripe Checkout (hosted) for faster implementation and PCI compliance

## Database Schema Changes

### Migration: `021_add_stripe_integration.ts`

Add Stripe-specific fields to link database records with Stripe objects:

**subscription_tier_limits table:**

- `stripe_product_id` (varchar(255)) - Link to Stripe Product
- `stripe_price_id_monthly` (varchar(255)) - Link to monthly Stripe Price
- `stripe_price_id_yearly` (varchar(255)) - Link to yearly Stripe Price
- `stripe_metadata` (jsonb) - Additional Stripe metadata

**users table:**

- `stripe_customer_id` (varchar(255)) - Link to Stripe Customer
- `stripe_subscription_id` (varchar(255)) - Active Stripe Subscription ID

**invoices table:**

- `stripe_invoice_object` (jsonb) - Full Stripe invoice for reference (optional, for debugging)

**New table: webhook_events** (for idempotency)

- `id` (uuid, primary key)
- `event_id` (varchar(255), unique) - Stripe event ID
- `event_type` (varchar(100)) - Event type (invoice.paid, etc.)
- `payload` (jsonb) - Full event payload
- `processed` (boolean, default false)
- `processed_at` (timestamp)
- `error` (text) - Error message if processing failed
- `created_at` (timestamp)

## Implementation Phases

### Phase 1: Core Stripe Setup

**1.1 Install Dependencies**

```bash
pnpm add stripe
pnpm add -D @types/stripe
```

**1.2 Environment Variables** (add to `.env.example` and `.env`)

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd
```

**1.3 Create Stripe Client**

- File: `src/lib/stripe/client.ts`
- Initialize Stripe SDK with API key
- Export `stripe` client and `STRIPE_CONFIG` constants

**1.4 Run Database Migration**

- Create: `src/lib/db/migrations/021_add_stripe_integration.ts`
- Add all Stripe fields listed above
- Run: `pnpm db:migrate`

### Phase 2: Stripe Customer & Product Management

**2.1 Customer Management**

- File: `src/lib/stripe/customers.ts`
- Functions:
  - `getOrCreateStripeCustomer(userId, email, name)` - Lazy customer creation
  - `updateStripeCustomer(customerId, data)` - Update customer info
  - `syncCustomerToDatabase(userId, stripeCustomer)` - Sync to billing_details

**2.2 Product & Price Management**

- File: `src/lib/stripe/products.ts`
- Functions:
  - `createOrUpdateTierInStripe(tier)` - Create/update Stripe product and prices
  - `archiveStripePrice(priceId)` - Archive old prices when updated
  - Key logic: Always create NEW prices when updating (Stripe best practice)

**2.3 Database Query Helpers**

- File: `src/lib/stripe/queries.ts`
- Functions for syncing Stripe data to database
- Update user subscription tier, dates, and IDs

**2.4 Migration Script for Existing Tiers**

- File: `src/lib/stripe/migrate-existing-tiers.ts`
- One-time script to create Stripe products for existing 4 tiers
- Run manually: `tsx --env-file=.env src/lib/stripe/migrate-existing-tiers.ts`

### Phase 3: Admin Panel - Subscription Tier Management

**3.1 Backend API - Tier CRUD**

Create: `src/routes/api/admin/subscription-tiers/index.ts`

- `GET /api/admin/subscription-tiers` - List all tiers (active + inactive)
- `POST /api/admin/subscription-tiers` - Create tier + auto-create Stripe product/prices

Create: `src/routes/api/admin/subscription-tiers/$id.ts`

- `GET /api/admin/subscription-tiers/:id` - Get single tier
- `PATCH /api/admin/subscription-tiers/:id` - Update tier + create new Stripe prices
- `DELETE /api/admin/subscription-tiers/:id` - Soft delete (set is_active=false)

Create: `src/lib/db/queries/admin-subscription-tiers.ts`

- Database query functions for tier CRUD
- Follow pattern from `src/lib/db/queries/users.ts`

**3.2 Frontend Admin Page**

Create: `src/routes/admin/subscription-tiers.tsx`

- Follow pattern from `src/routes/admin/users/index.tsx`
- Use: AdminLayout, DataTable, StatCard, FilterBar, PaginationControls
- Display tiers with pricing, limits, Stripe sync status
- Row click → navigate to edit page

Create: `src/routes/admin/subscription-tiers/$id/edit.tsx`

- Edit form for tier details
- Fields: name, description, price_monthly, price_yearly, text_generations_per_day, voice_generations_per_day, features (checkboxes), is_active
- Show Stripe IDs (readonly) with "View in Stripe" links
- On save → trigger Stripe product/price creation

Create: `src/components/admin/SubscriptionTierEditor.tsx`

- Reusable form component for creating/editing tiers
- Validation with Zod schema
- Loading state during Stripe API calls
- Success/error toast notifications

Create: `src/hooks/useAdminSubscriptionTiersQuery.ts`

- React Query hooks: `useAdminTiersQuery`, `useCreateTierMutation`, `useUpdateTierMutation`, `useDeleteTierMutation`

**3.3 Navigation**

Modify: `src/components/admin/AdminNav.tsx`

- Add "Subscription Tiers" navigation item (admin only)
- Icon: CreditCard or DollarSign from lucide-react

### Phase 4: Webhook System

**4.1 Main Webhook Handler**

Create: `src/routes/api/webhooks/stripe.ts`

- `POST /api/webhooks/stripe` - Main webhook endpoint
- Verify Stripe signature using `STRIPE_WEBHOOK_SECRET`
- Check idempotency (webhook_events table)
- Route to specific handlers based on event type
- Always return 200 to Stripe (even on error)

**4.2 Event Handlers**

Create: `src/lib/stripe/webhooks/invoice.ts`

- `handleInvoiceCreated(invoice)` - Create invoice record in database
- `handleInvoiceFinalized(invoice)` - Update status to 'open'
- `handleInvoicePaid(invoice)` - Update status to 'paid', sync PDF URLs, create transaction
- `handleInvoicePaymentFailed(invoice)` - Update status to 'failed'

Create: `src/lib/stripe/webhooks/subscription.ts`

- `handleSubscriptionCreated(subscription)` - Update user tier, dates, subscription_id
- `handleSubscriptionUpdated(subscription)` - Update tier/dates if changed, handle cancellation
- `handleSubscriptionDeleted(subscription)` - Revert user to free tier

Create: `src/lib/stripe/webhooks/customer.ts`

- `handleCustomerUpdated(customer)` - Sync to billing_details table

Create: `src/lib/stripe/webhooks/payment.ts`

- `handlePaymentMethodAttached(paymentMethod)` - Add to payment_methods table
- `handleChargeRefunded(charge)` - Create negative transaction record

Create: `src/lib/stripe/webhooks/utils.ts`

- `saveWebhookEvent(eventId, type, payload)` - Store in webhook_events table
- `isEventProcessed(eventId)` - Check if already processed
- `markEventProcessed(eventId, error?)` - Update processed status

**4.3 Local Webhook Testing Setup**

- Install Stripe CLI: <https://stripe.com/docs/stripe-cli>
- Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Copy webhook secret to `.env` as `STRIPE_WEBHOOK_SECRET`
- Test events: `stripe trigger invoice.paid`, `stripe trigger customer.subscription.created`

### Phase 5: Checkout Flow

**5.1 Checkout Session Creation**

Create: `src/routes/api/checkout/create-session.ts`

- `POST /api/checkout/create-session`
- Request body: `{ tierId: string, billingPeriod: 'monthly' | 'yearly' }`
- Steps:
  1. Require authentication
  2. Validate tier exists and is active
  3. Get or create Stripe customer
  4. Get appropriate price ID (monthly or yearly)
  5. Create Stripe Checkout Session (mode: 'subscription')
  6. Return session URL to frontend
- Success URL: `/subscription/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `/subscription`

Create: `src/routes/api/checkout/success.ts`

- `GET /api/checkout/success?session_id=xxx`
- Verify session with Stripe
- Return session status (actual tier update happens via webhook)

**5.2 Frontend Checkout Integration**

Modify: `src/components/subscription/SubscriptionCard.tsx`

- Change "Upgrade Now" button to call `/api/checkout/create-session`
- Add loading state during session creation
- Redirect to Stripe Checkout URL on success
- Show error toast on failure

Create: `src/routes/subscription/success.tsx`

- Display success message after payment
- Poll `/api/subscriptions/my-subscription` to check tier update
- Show loading while webhook processes
- Auto-redirect to `/subscription` after 3 seconds

**5.3 Subscription Management**

Create: `src/routes/api/subscriptions/cancel.ts`

- `POST /api/subscriptions/cancel`
- Cancel Stripe subscription with `cancel_at_period_end=true`
- User keeps access until end of billing period
- Webhook updates database

Create: `src/routes/api/subscriptions/change-tier.ts`

- `POST /api/subscriptions/change-tier`
- Request body: `{ tierId: string }`
- Update Stripe subscription items with new price
- Stripe handles proration automatically
- Webhook syncs to database

**5.4 User Subscription Management UI** (future enhancement)

Modify: `src/routes/subscription.tsx`

- Add "Cancel Subscription" button for paid users
- Add "Change Plan" functionality
- Show next billing date, auto-renew status
- Link to invoice history

### Phase 6: Testing & Verification

**6.1 End-to-End Test Flow**

1. Create new tier in admin panel → verify Stripe product created
2. Upgrade user to paid tier → verify checkout session works
3. Complete payment (test card: 4242 4242 4242 4242)
4. Verify webhook fires and tier updates in database
5. Check invoice created in database with line items
6. Test cancellation → verify tier stays active until period end
7. Test tier change (upgrade/downgrade) → verify proration

**6.2 Error Scenarios**

- Stripe API failure when creating product (admin should see error, tier saved without Stripe ID)
- Webhook delivery failure (logged in webhook_events table with error)
- Payment failure (invoice status updated to 'failed')
- Duplicate webhook events (idempotency check prevents double processing)

**6.3 Use Test Mode**

- Always use `sk_test_...` and `pk_test_...` keys initially
- Test cards: <https://stripe.com/docs/testing>
- Only switch to live keys after thorough testing

## Critical Files Reference

**Database:**

- [src/lib/db/migrations/016_add_subscriptions.ts](../../src/lib/db/migrations/016_add_subscriptions.ts) - Current subscription schema
- [src/lib/db/migrations/017_add_billing_and_invoices.ts](../../src/lib/db/migrations/017_add_billing_and_invoices.ts) - Current billing schema
- [src/lib/db/queries/billing.ts](../../src/lib/db/queries/billing.ts) - Billing query patterns
- [src/lib/db/queries/subscriptions.ts](../../src/lib/db/queries/subscriptions.ts) - Subscription queries

**Admin Panel Patterns:**

- [src/routes/api/admin/users/index.ts](../../src/routes/api/admin/users/index.ts) - API pattern (pagination, filtering, requireAdmin)
- [src/routes/admin/users/index.tsx](../../src/routes/admin/users/index.tsx) - Frontend list page pattern
- [src/components/admin/DataTable.tsx](../../src/components/admin/DataTable.tsx) - Reusable table component
- [src/components/admin/AdminLayout.tsx](../../src/components/admin/AdminLayout.tsx) - Layout wrapper
- [src/components/admin/AdminNav.tsx](../../src/components/admin/AdminNav.tsx) - Sidebar navigation

**Subscription UI:**

- [src/components/subscription/SubscriptionCard.tsx](../../src/components/subscription/SubscriptionCard.tsx) - Tier display card to modify
- [src/components/subscription/BillingDetailsCard.tsx](../../src/components/subscription/BillingDetailsCard.tsx) - Billing info display
- [src/components/subscription/InvoiceHistory.tsx](../../src/components/subscription/InvoiceHistory.tsx) - Invoice list

## Architecture Decisions

**1. Database as Source of Truth**

- Store full invoice/subscription data locally, synced FROM Stripe
- Enables fast queries, offline access, provider independence
- Requires robust webhook handling

**2. Price Immutability**

- Always create NEW Stripe prices when updating tier pricing
- Archive old prices (don't delete - may have active subscriptions)
- Follows Stripe best practices

**3. Webhook Idempotency**

- Store all events in `webhook_events` table
- Check `event_id` before processing
- Prevents duplicate charges/tier updates

**4. Lazy Customer Creation**

- Create Stripe customer only when user first attempts to upgrade
- Reduces unnecessary Stripe API calls for free users

**5. Auto-sync on Admin Save**

- Immediately create/update Stripe products when admin saves tier
- Show loading spinner and success/error feedback
- No separate "Sync to Stripe" button needed (but can add as fallback)

## Next Steps After Implementation

1. **Production Deployment:**
   - Switch to live Stripe keys (`sk_live_...`, `pk_live_...`)
   - Configure production webhook endpoint in Stripe Dashboard
   - Test with real card (small amount)

2. **Monitoring:**
   - Add admin page to view `webhook_events` table
   - Alert on unprocessed events or errors
   - Monitor Stripe Dashboard for failed payments

3. **Future Enhancements:**
   - Add PayPal integration (similar pattern)
   - Email notifications for payment failures
   - Usage-based billing (track generations, bill overages)
   - Coupons/discount codes (Stripe supports this)
   - Trial periods (configure in Stripe product settings)

## Estimated Effort

- Phase 1 (Core Setup): 1-2 days
- Phase 2 (Customer/Product Mgmt): 2-3 days
- Phase 3 (Admin Panel): 3-4 days
- Phase 4 (Webhooks): 3-4 days
- Phase 5 (Checkout Flow): 2-3 days
- Phase 6 (Testing): 2 days

**Total: ~13-18 days** for complete implementation

## Success Criteria

✅ Admin can create/edit subscription tiers in admin panel
✅ Changes to tiers automatically sync to Stripe (products/prices created)
✅ Users can upgrade to paid tier via Stripe Checkout
✅ Webhooks sync invoices and subscriptions to database
✅ Invoice history displays with PDF download links
✅ Users can cancel subscriptions (keep access until period end)
✅ Proration works for upgrades/downgrades
✅ All Stripe data stored locally for fast queries
✅ Test mode fully working before production deployment

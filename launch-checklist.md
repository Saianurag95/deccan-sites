# Deccan Sites Launch Checklist

## What Is Connected
- Static React website
- Node backend
- Email OTP endpoints
- Razorpay payment order endpoint
- Razorpay payment verification endpoint
- On-site project portal
- Backend project requirement storage
- Automatic Project ID generation

## Required Live Environment Values
Add these values on the hosting platform:

```text
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
OTP_SECRET=use-a-long-random-secret
RESEND_API_KEY=your-resend-api-key
OTP_FROM_EMAIL=Deccan Sites <your-verified-email@yourdomain.com>
RAZORPAY_KEY_ID=your-live-razorpay-key-id
RAZORPAY_KEY_SECRET=your-live-razorpay-key-secret
```

## Razorpay Setup
1. Create or open your Razorpay account.
2. Complete business/KYC activation.
3. Go to Dashboard -> Account & Settings -> API Keys.
4. Generate Test keys first.
5. Test a payment from the website.
6. When ready, switch to Live mode and generate Live keys.
7. Replace test keys with live keys in the hosting environment.

## Hosting Setup
Use Vercel for the public website and API routes.

Recommended current setup:
- GitHub repo connected to Vercel
- Static files served by Vercel
- API routes served from the `/api` folder

Build command:
```text
None
```

Output directory:
```text
.
```

## After Deployment
1. Open the live URL.
2. Submit one test project requirement inside the portal.
3. Confirm a Project ID appears on the page.
4. Test the payment section with Razorpay Test keys using that generated Project ID.
6. Check `.data/auth-store.json` locally only for development.
7. For serious production, move users/payments into a real database.

## Production Database Note
The current Vercel API creates project estimates and Razorpay orders, but it does not permanently store leads in a database yet. For serious production, connect a real database so every portal submission and payment status is saved.

Suggested next database:
- Supabase PostgreSQL
- Neon PostgreSQL
- MongoDB Atlas

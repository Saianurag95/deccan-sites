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
Use a Node-capable host because the backend must run server code.

Recommended for this current project:
- Render Web Service
- Railway
- DigitalOcean App Platform

Build command:
```text
npm install
```

Start command:
```text
npm start
```

## After Deployment
1. Open the live URL.
2. Submit one test project requirement inside the portal.
3. Confirm a Project ID appears on the page.
4. Test the payment section with Razorpay Test keys using that generated Project ID.
6. Check `.data/auth-store.json` locally only for development.
7. For serious production, move users/payments into a real database.

## Production Database Note
The current backend stores payment records in a local JSON file. That is fine for local testing, but live hosting should use a real database because many hosts do not permanently keep local filesystem data.

Suggested next database:
- Supabase PostgreSQL
- Neon PostgreSQL
- MongoDB Atlas

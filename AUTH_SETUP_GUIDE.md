# 🔐 AUTHENTICATION SETUP GUIDE

## Date: November 15, 2025
## Status: CRITICAL - FOLLOW ALL STEPS

---

## 🚨 PROBLEMS IDENTIFIED

1. **Google OAuth "Site can't be reached" error** - Missing/incorrect redirect URLs in Supabase
2. **Email confirmation not received** - Email provider not configured or disabled in Supabase
3. **Missing RLS policies** - Users can't create profiles after signup

---

## 📋 STEP-BY-STEP FIX

### Step 1: Run SQL Script (REQUIRED)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/iclnquvhushnvjzzcjrs
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content of `supabase/FIX_AUTH_COMPLETE.sql`
5. Paste it and click **Run**
6. Wait for success message

---

### Step 2: Configure Site URL (REQUIRED)

1. In Supabase Dashboard, go to **Authentication > URL Configuration**
2. Set **Site URL** to your production URL:
   - Production: `https://your-app.vercel.app` (replace with actual domain)
   - Local dev: `http://localhost:5173`

---

### Step 3: Configure Redirect URLs (REQUIRED FOR GOOGLE OAUTH)

1. Still in **Authentication > URL Configuration**
2. Under **Redirect URLs**, add these URLs (click "+ Add URL" for each):
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:5173/auth/callback` (for local development)
   - Replace `your-app.vercel.app` with your actual domain

---

### Step 4: Setup Google OAuth (REQUIRED FOR GOOGLE SIGNIN)

#### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Choose **Web application**
6. Add these to **Authorized redirect URIs**:
   ```
   https://iclnquvhushnvjzzcjrs.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   ```
7. Copy the **Client ID** and **Client Secret**

#### B. Configure in Supabase

1. In Supabase Dashboard, go to **Authentication > Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google** to ON
4. Paste your **Client ID**
5. Paste your **Client Secret**
6. Click **Save**

---

### Step 5: Configure Email Settings (REQUIRED FOR EMAIL SIGNUP)

#### Option A: Use Supabase Built-in Email (Quick Setup)

1. Go to **Authentication > Email Templates**
2. Verify **Confirm signup** template is active
3. Click **Settings** tab
4. Under **Email Auth**, ensure **Enable email confirmations** is toggled ON
5. That's it! Supabase will send emails automatically

#### Option B: Use Custom SMTP (Recommended for Production)

1. Go to **Project Settings > Auth**
2. Scroll to **SMTP Settings**
3. Toggle **Enable Custom SMTP** to ON
4. Fill in your SMTP details:
   - **Sender email**: Your verified email address
   - **Sender name**: ORBIT LIVE TEAM
   - **Host**: Your SMTP host (e.g., smtp.gmail.com)
   - **Port**: 587 (TLS) or 465 (SSL)
   - **Username**: Your SMTP username
   - **Password**: Your SMTP password
5. Click **Save**

#### Gmail SMTP Setup (If using Gmail):
- Host: `smtp.gmail.com`
- Port: `587`
- Username: Your Gmail address
- Password: Use [App Password](https://myaccount.google.com/apppasswords), NOT your regular password

---

### Step 6: Test Authentication

#### Test Google OAuth:
1. Open your app
2. Click "Continue with Google"
3. Select your Google account
4. Should redirect to `/auth/callback` and then to dashboard
5. If error: Check redirect URLs in Step 3 & 4

#### Test Email Signup:
1. Open your app
2. Switch to "Sign Up" mode
3. Enter email, password, and name
4. Click "Create Account"
5. Check email inbox for confirmation link
6. Click the confirmation link
7. Should redirect to your app and auto-login

---

## 🔍 TROUBLESHOOTING

### Google OAuth Issues

**Error: "Site can't be reached" after Google login**
- ✅ Verify redirect URLs in Step 3 match EXACTLY
- ✅ Check Google Console authorized redirect URIs in Step 4A
- ✅ Make sure Google Provider is enabled in Supabase (Step 4B)
- ✅ Clear browser cache and cookies
- ✅ Try incognito/private browsing mode

**Error: "Invalid redirect URI"**
- ✅ In Supabase, the redirect URL must include `/auth/callback`
- ✅ In Google Console, redirect must be Supabase callback URL
- ✅ URLs must start with `https://` in production

### Email Confirmation Issues

**Error: "Confirmation email not received"**
- ✅ Check spam/junk folder
- ✅ Verify SMTP settings in Step 5
- ✅ Check Supabase logs: Dashboard > Logs > Auth Logs
- ✅ Try with a different email address
- ✅ If using Gmail, make sure "Less secure app access" is enabled OR use App Password

**Error: "Email rate limit exceeded"**
- ✅ Supabase has rate limits on email sending
- ✅ Wait 1 hour and try again
- ✅ Consider upgrading Supabase plan for higher limits

**Emails going to spam:**
- ✅ Add SPF, DKIM, and DMARC records to your domain
- ✅ Use a verified domain for sender email
- ✅ Consider using email service like SendGrid or AWS SES

### Profile Creation Issues

**Error: "Permission denied for table users"**
- ✅ Run the SQL script from Step 1 again
- ✅ Check RLS policies in Supabase Dashboard > Authentication > Policies
- ✅ Make sure the trigger `on_auth_user_created` exists

---

## ✅ VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] SQL script executed successfully
- [ ] Site URL is set correctly
- [ ] Redirect URLs include `/auth/callback`
- [ ] Google OAuth credentials are configured
- [ ] Google Provider is enabled in Supabase
- [ ] Email confirmations are enabled
- [ ] SMTP is configured (if using custom email)
- [ ] Test signup with email works
- [ ] Test Google OAuth works
- [ ] Users can access dashboard after login

---

## 🆘 STILL NOT WORKING?

1. **Check browser console** for JavaScript errors
2. **Check Supabase logs**: Dashboard > Logs > Auth Logs
3. **Verify environment variables** in `.env` file:
   ```
   VITE_SUPABASE_URL=https://iclnquvhushnvjzzcjrs.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. **Restart dev server** after any `.env` changes
5. **Clear browser cache** and localStorage
6. **Try incognito mode** to rule out cached issues

---

## 📧 Support

If issues persist after following all steps:
- Email: orbitlive.info@gmail.com
- Phone: +91 7993547438

Include:
- Screenshot of error
- Browser console logs
- Supabase auth logs
- Steps you've completed

---

## 🔄 DEPLOYMENT NOTE

When deploying to production (Vercel, Netlify, etc.):

1. **Set environment variables** in your hosting platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. **Update Supabase redirect URLs** to include production domain

3. **Update Google OAuth** authorized redirect URIs to include production domain

4. **Test authentication** on production URL before going live

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Email SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)


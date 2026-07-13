╔══════════════════════════════════════════════════════════════════════╗
║  BTECH STUDY POINT — NETLIFY DEPLOYMENT GUIDE (read carefully!)      ║
╚══════════════════════════════════════════════════════════════════════╝

This app uses YouTube for videos and PostgreSQL for data.
You MUST set up a database before it will work.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STEP 1: Create a FREE PostgreSQL database (2 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Go to https://neon.tech → sign up (free, no credit card)
  2. Click "New Project" → give it any name
  3. Copy the "Connection string" — it looks like:
     postgresql://neondb:AbCdEf123456@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

  SAVE THIS STRING — you need it for Netlify.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STEP 2: Push the code to GitHub
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Extract this zip on your computer
  2. Go to https://github.com → New repository (e.g. "btech-study-point")
  3. Upload ALL files from the zip to the repository
     (GitHub web: just drag-and-drop the extracted files)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STEP 3: Deploy on Netlify
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Go to https://app.netlify.com → "Add new site" → "Import from Git"
  2. Select your GitHub repository
  3. DO NOT CLICK DEPLOY YET — first set environment variables:
     Click "Advanced" → "Add environment variables"
     Add this ONE variable:

       Key:   DATABASE_URL
       Value: postgresql://neondb:AbCdEf...@ep-xxx.neon.tech/neondb?sslmode=require
              (paste YOUR Neon connection string from Step 1)

  4. Now click "Deploy site"
  5. Wait 2-3 minutes for the build to complete

  The build will AUTOMATICALLY:
  - Switch to PostgreSQL schema
  - Generate Prisma client
  - Create all database tables (prisma db push)
  - Build the Next.js app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STEP 4: Verify it works
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Visit your Netlify URL (e.g. https://your-site.netlify.app)
  2. The registration form should appear
  3. Register a test account — it should work without errors
  4. If you get "Network error", check:
     - Did you set DATABASE_URL in Netlify environment variables?
     - Is the Neon database active? (free tier pauses after inactivity)
     - Check Netlify Functions logs for details

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STEP 5: Add your YouTube lectures
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Upload your lecture videos to YouTube as UNLISTED
  2. Visit: https://YOUR-SITE.netlify.app/#admin
  3. Login:
       Email:    neveralone20040@gmail.com
       Password: Pathak@2011
  4. Check "Keep me logged in" for auto-login
  5. Select Branch + Semester → Add Subject → Add Chapter
  6. Click "Add Content" → "YouTube Video" tab
  7. Paste the YouTube URL → click "Add Video"
  8. The video now plays embedded on your website!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STEP 6 (Optional): Add Ads/Posters
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  In the admin panel, scroll down to "Ads & Posters":
  1. Enter a title
  2. Upload an image (under 2MB) — poster, banner, etc.
  3. Optionally add a click link
  4. Click "Add Ad"
  5. Users will see the ad as a banner on their dashboard
  6. Users can dismiss ads with the X button
  7. Toggle ads active/inactive with the power button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Problem: "Network error" on register/login
  Cause: DATABASE_URL not set, or database not reachable
  Fix: Set DATABASE_URL in Netlify → Site settings → Environment variables
       Make sure it's a PostgreSQL connection string (starts with postgresql://)

  Problem: "Subject already exists" but not showing in list
  Cause: Database tables don't exist
  Fix: The build now auto-creates tables. If still failing, run locally:
       npm install
       DATABASE_URL="your-neon-url" npx prisma db push
       This creates all tables in your Neon database.

  Problem: Build fails on Netlify
  Cause: Missing dependencies or Prisma issues
  Fix: Check Netlify build logs. The @netlify/plugin-nextjs is included.

  Problem: Admin panel not accessible
  Fix: Make sure to visit https://YOUR-SITE.netlify.app/#admin (with the #)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ADMIN ACCESS
  URL:    https://YOUR-SITE.netlify.app/#admin
  Email:  neveralone20040@gmail.com
  Pass:   Pathak@2011

  Made with love by Pavnesh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

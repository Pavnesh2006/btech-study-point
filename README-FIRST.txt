╔══════════════════════════════════════════════════════════════════════╗
║     BTECH STUDY POINT — DEPLOYMENT GUIDE (YouTube + Ads edition)     ║
╚══════════════════════════════════════════════════════════════════════╝

This version uses YOUTUBE for video storage (no storage problems!)
and stores ads as images in the database. Works perfectly on Netlify.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  HOW IT WORKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  VIDEOS: Upload your lectures to YouTube as UNLISTED videos.
          Then in the admin panel, paste the YouTube URL.
          Videos play embedded on your website — users can't
          download or copy the link.

  ADS:    Upload poster images (under 2MB) in the admin panel.
          Users see them as a banner and can dismiss with X.

  STORAGE: No file storage needed! Videos are on YouTube,
           ads are in the database. Works on Netlify free tier.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STEP 1: Get a FREE PostgreSQL database
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Go to https://neon.tech → sign up (free, no credit card)
  2. Create a new project
  3. Copy the connection string:
     postgresql://neondb:AbCdEf123@ep-xxx.neon.tech/neondb?sslmode=require

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STEP 2: Push to GitHub
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Extract this zip
  2. Create a GitHub repo
  3. Upload all files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STEP 3: Deploy on Netlify
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. https://app.netlify.com → Add new site → Import from Git
  2. Select your repo
  3. Click "Advanced" → Add environment variable:
       Key:   DATABASE_URL
       Value: postgresql://neondb:...@ep-xxx.neon.tech/neondb?sslmode=require
  4. Deploy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STEP 4: Create database tables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Run locally (extract zip, then):
    npm install
    DATABASE_URL="your-neon-connection-string" npx prisma db push

  OR run this SQL in Neon's SQL Editor:

  CREATE TABLE "Subject" (id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT, branch TEXT NOT NULL, semester INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT subject_bsn_key UNIQUE (branch, semester, name));
  CREATE TABLE "Chapter" (id TEXT PRIMARY KEY, name TEXT NOT NULL, "subjectId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT chapter_sn_key UNIQUE ("subjectId", name), CONSTRAINT chapter_s_fk FOREIGN KEY ("subjectId") REFERENCES "Subject"(id) ON DELETE CASCADE);
  CREATE TABLE "Resource" (id TEXT PRIMARY KEY, title TEXT NOT NULL, type TEXT NOT NULL, "youtubeId" TEXT, "noteUrl" TEXT, "noteFileName" TEXT, "chapterId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT resource_c_fk FOREIGN KEY ("chapterId") REFERENCES "Chapter"(id) ON DELETE CASCADE);
  CREATE INDEX resource_ct_idx ON "Resource"("chapterId", type);
  CREATE TABLE "User" (id TEXT PRIMARY KEY, email TEXT NOT NULL, "passwordHash" TEXT NOT NULL, name TEXT NOT NULL, branch TEXT NOT NULL, semester INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT user_email_key UNIQUE (email));
  CREATE INDEX user_bs_idx ON "User"(branch, semester);
  CREATE TABLE "Ad" (id TEXT PRIMARY KEY, title TEXT NOT NULL, "imageUrl" TEXT NOT NULL, "linkUrl" TEXT, active BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STEP 5: Add your YouTube lectures
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Upload your lecture videos to YouTube as UNLISTED
  2. Visit https://YOURSITE.netlify.app/#admin
  3. Login: neveralone20040@gmail.com / Pathak@2011
  4. Select branch + semester → add subject → add chapter
  5. Click "Add Content" → "YouTube Video" tab
  6. Paste the YouTube URL → click Add
  7. The video now plays embedded on your website!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ADMIN ACCESS: https://YOURSITE.netlify.app/#admin
  Email: neveralone20040@gmail.com  Password: Pathak@2011

  Made with love by Pavnesh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

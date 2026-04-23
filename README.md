# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7faf910b-f519-4e77-a38b-59938d6c7bac

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7faf910b-f519-4e77-a38b-59938d6c7bac) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <https://github.com/Mahanteshmcb/myconnect.git>

# Step 2: Navigate to the project directory.
cd myconnect

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7faf910b-f519-4e77-a38b-59938d6c7bac) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## ✔ Adding Firebase resources to Google Cloud Platform project
# Option C: Firebase Hosting

Install Firebase CLI: npm install -g firebase-tools
Run firebase login
In your project folder:
firebase init hosting
(choose “dist” as the public directory)
Deploy:
firebase deploy
# =================================================== #

✔ Please specify a unique project id (warning: cannot be modified afterward) [6-30
characters]:
 joinmyconnect
✔ What would you like to call your project? (defaults to your project ID) myconnect
✔ Creating Google Cloud Platform project
✔ Adding Firebase resources to Google Cloud Platform project

=== Your Firebase project is ready! ===

Project information:
   - Project ID: joinmyconnect
   - Project Name: myconnect

Firebase console is available at
https://console.firebase.google.com/project/joinmyconnect/overview

=== Hosting Setup

Your public directory is the folder (relative to your project directory) that
will contain Hosting assets to be uploaded with firebase deploy. If you
have a build process for your assets, use your build's output directory.

✔ What do you want to use as your public directory? dist
✔ Configure as a single-page app (rewrite all urls to /index.html)? Yes
✔ Set up automatic builds and deploys with GitHub? No
✔ File dist\index.html already exists. Overwrite? No
i  Skipping write of dist\index.html

=== Agent Skills Setup
If you are using an AI coding agent, Firebase Agent Skills make it an expert at Firebase.
✔ Would you like to install agent skills for Firebase? Yes
i  Installing Agent skills in the background...
+  Agent skills installation started

+  Wrote configuration info to firebase.json
+  Wrote project information to .firebaserc

+  Firebase initialization complete!
(base) PS C:\Users\Mahantesh\DevelopmentProjects\myconnect> firebase deploy
(node:9304) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)

=== Deploying to 'joinmyconnect'...

i  deploying hosting
i  hosting[joinmyconnect]: beginning deploy...
i  hosting[joinmyconnect]: found 6 files in dist
+  hosting[joinmyconnect]: file upload complete
i  hosting[joinmyconnect]: finalizing version...
+  hosting[joinmyconnect]: version finalized
i  hosting[joinmyconnect]: releasing new version...
+  hosting[joinmyconnect]: release complete

+  Deploy complete!

Project Console: https://console.firebase.google.com/project/joinmyconnect/overview
Hosting URL: https://joinmyconnect.web.app
# JM Health and Safety Consultants

Static, dependency-free company website. Deploy the repository root to Vercel as an **Other** project; no build command or output directory override is required.

## Local development

Use the existing checkout (no worktree is needed). Python 3 is preinstalled in the cloud environment:

```sh
cd /workspace/jm-health-safety
python3 -m http.server 8000 --bind 127.0.0.1
```

The server serves `index.html` and local assets directly. There are no dependencies, environment variables, backend services or build steps.

## Design and photography

`assets/site.css` contains the premium design layer; the original inline stylesheet supplies the site's foundational components. The site uses system fonts and a locally hosted WebP image (~147 KB), with no external font or image requests.

**`assets/safety-team.webp` is an AI-generated illustrative placeholder, not actual JM staff, a client site, or evidence of a completed project.** Replace it with approved company photography before using staff/site imagery as a business representation. The hero and about section share the asset with different crops. Update both alt descriptions and remove the illustrative caption only after approved photography is supplied. Retain an optimized WebP and intrinsic dimensions.

Industries are presented as discussion contexts, not claims of existing clients or sector accreditations. No awards, testimonials, years of experience or certifications have been added.

## Verification

Browser checks cover 320, 390, 768, 1024 and 1440 px: horizontal overflow, image loading, mobile menu and Escape, FAQ expansion, service selection, enquiry channel switching, required form fields and JavaScript errors. Inspect desktop and mobile layouts visually after edits.

The enquiry form creates a WhatsApp or email draft in the visitor's app. It does not send messages or store personal data. External handoffs should be intercepted during automated testing; never send test enquiries to the business.

## Image visibility / Vercel publishing

The production document uses **root-relative asset URLs**: `/assets/site.css` and `/assets/safety-team.webp`. There are two prominent image placements (hero and about), plus a dedicated three-photo **Safety in Action** editorial gallery. The gallery uses real stock photography hosted on Unsplash's image CDN and includes fallback to the project's local `safety-team.webp` file.

If images appear missing in production:

1. Verify **Vercel → Project → Deployments** shows the newest `main` commit as **Ready**, and visit the **Production** URL rather than a historical preview deployment.
2. Open `https://YOUR-SITE.DOMAIN/assets/safety-team.webp` directly. It should display the safety team photo, **not** a 404 or an HTML page.
3. Open `https://YOUR-SITE.DOMAIN/assets/site.css?v=20261028b`. It should return CSS. If either request fails, check Vercel's project root directory and output directory. Static files are in the repository root and its `assets/` folder; there is no build command or framework.
4. Hard-refresh the page (`Ctrl+Shift+R`) in case it shows an old deployment.
5. Check the browser Network tab for failed image requests; if the external Unsplash CDN is unavailable, each gallery image falls back to the locally hosted asset. The two primary site images also have an external fallback.

### Photography and representation

- The locally hosted safety team visual remains an **AI-generated representative image**, not JM staff.
- The gallery uses genuine Unsplash stock photographs; they do **not** depict JM staff, projects, customers, or compliance achievements.
- Source pages: https://unsplash.com/photos/hard-hats-and-safety-vests-wjHdeYmI-XU (Tanya Paquet), https://unsplash.com/photos/two-construction-workers-in-hard-hats-and-vests-EuYrxc_Amkc (Eric Stoynov), https://unsplash.com/photos/workers-with-safety-vests-and-hard-hats-near-a-truck-iJdbR4wGrfo (Haewon Oh).
- The source pages list the photographs under the Unsplash License. Before final client delivery, consider downloading and hosting optimized copies locally to remove the third-party runtime dependency. Preserve source credits in this README.

## October 2026 — Johannes business-card branding refresh

- `assets/jm-official-logo.webp` was carefully cropped from the client-provided JM business card. It preserves the real printed JM initials and hard-hat artwork, rather than inventing another logo. A higher-resolution original supplied directly by the client would be preferable for future brand use.
- Updated hero and corporate colours to the client's more vivid black / yellow / white construction-card direction.
- Added the four focus areas shown on the new card: health and safety management, compliance & audits, construction safety, and risk assessments & solutions.
- Added a dedicated Johannes Pieterse contact/profile block with direct phone, email and WhatsApp links and his Moreletapark, Pretoria East location.
- Used recognizable Facebook and Instagram icon artwork with **plain-text social handles only**. Exact profile URLs were not verified, so no guessed clickable social links were inserted.
- Kept Thapelo Prince Legwabe as the previously listed senior consultant; confirm with JM before removing or editing his public contact information.
- Construction/safety photos are illustrative (the local team picture is AI-generated; external gallery photos are representative stock). They are **not photos of JM staff, achievements or client sites**. Obtain approval or replace with authentic approved company photography before public client launch.
- No claims of proprietary training accreditation or client certifications were added. Training wording refers to arranging accredited training through relevant providers.

### Cloudflare Pages / Git deployment

This is still a dependency-free static website with `index.html` in the repository root and all local assets in `assets/`. Cloudflare Pages can import `main` from GitHub (framework None, root `/`, build command `exit 0`, output directory `.`). Verify the Cloudflare integration is specifically **Pages**, not an unrelated Workers application, and confirm that the deployment actually serves the site's HTML and images.

To review: open the PR's deployment preview (if available); inspect mobile/desktop, `/assets/jm-official-logo.webp`, `/assets/safety-team.webp`, contact links, navigation, and gallery image loading. Merge to `main` only after approval. A connected Pages project may auto-deploy on merge. Older deployment-specific Vercel and Cloudflare URLs can continue showing previous versions.

### Regression checks

Run from the repo root:

```sh
node --test tests/*.test.cjs
```

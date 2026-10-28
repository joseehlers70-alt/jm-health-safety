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

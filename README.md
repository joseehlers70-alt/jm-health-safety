# JM Health and Safety Consultants

A static, dependency-free company website. Deploy the repository root to Vercel as an **Other** project; no build command or output-directory override is required. Production publication should follow approval of the design pull request.

## Local development

Use the existing checkout; no worktree is needed. With Python 3:

```sh
cd /workspace/jm-health-safety
python3 -m http.server 8000 --bind 127.0.0.1
```

There are no application packages, environment variables, backend services or build steps. The site uses system fonts and local assets only.

- `index.html`: semantic content, contact details and service options.
- `assets/base.css`: foundational components, breakpoints and progressive animation.
- `assets/site.css`: premium navy/gold visual direction and responsive refinements.
- `assets/site.js`: mobile navigation, service selection and local enquiry-draft handoffs.

## Photography and content

**`assets/safety-team.webp` is an AI-generated illustrative placeholder, not actual JM staff, a client site, or evidence of a completed project.** Both the hero and about image disclose this. Replace the shared asset with approved company photography when available; update both alt descriptions and captions at that time. Keep the optimized WebP format and accurate intrinsic dimensions. The current image is approximately 147 KB.

Industries are presented as discussion contexts, not claims of existing clients or sector accreditations. No awards, testimonials, years of experience or certifications have been added. Consultant names, phone numbers, email addresses, Moreletapark location and service offerings are preserved.

## Browser verification

`tests/site.test.cjs` runs against its own temporary local server. It covers all five requested widths (320, 390, 768, 1024, 1440px), normal-motion content visibility, images, overflow, section overlap, anchor targets, menu scrolling and keyboard support, contact touch targets, FAQs, service preselection and enquiry validation. It verifies both recipients and channels with Unicode and multiline content. WhatsApp requests are intercepted, and email navigation is observed without sending a message. It also checks reduced motion and the no-JavaScript fallback.

In the managed cloud environment, Playwright and Chromium are already available:

```sh
BROWSER_EXECUTABLE=/usr/bin/chromium node --test tests/site.test.cjs
```

For a separate machine, install test tools outside the checkout, leaving the deployed site dependency-free:

```sh
npm install --prefix /tmp/jm-browser-tools --no-audit --no-fund playwright@1.62.1 axe-core@4.11.0
/tmp/jm-browser-tools/node_modules/.bin/playwright install chromium
NODE_PATH=/tmp/jm-browser-tools/node_modules \
AXE_SOURCE=/tmp/jm-browser-tools/node_modules/axe-core/axe.min.js \
node --test tests/site.test.cjs
```

Set `AXE_SOURCE` to enable the optional axe accessibility audit; otherwise that check is explicitly skipped. Set `JM_SCREENSHOTS` to an output directory to capture all five full-page layouts. Automated accessibility checks complement visual and keyboard review; they do not certify every accessibility requirement.

The enquiry form prepares a WhatsApp or email draft in the visitor's own app. It does not send messages or store personal data. Submission stays disabled until the JavaScript handler is registered; without JavaScript, direct email and phone links remain available.

/* Browser regression checks. Playwright is a development tool, not a site dependency. */
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");
const { join, resolve, extname } = require("node:path");
const { chromium } = require("playwright");

const root = resolve(__dirname, "..");
let server, browser, baseURL;
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
};

before(async () => {
  // Serve only public files; tests never submit data to a production endpoint.
  server = createServer(async (request, response) => {
    const path = new URL(request.url, "http://localhost").pathname;
    if (
      path !== "/" &&
      path !== "/index.html" &&
      !/^\/assets\/[\w.-]+$/.test(path)
    ) {
      response.writeHead(404).end();
      return;
    }
    try {
      const file = join(root, path === "/" ? "index.html" : path);
      const body = await readFile(file);
      response
        .writeHead(200, {
          "Content-Type": mime[extname(file)] || "application/octet-stream",
        })
        .end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseURL = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({
    ...(process.env.BROWSER_EXECUTABLE
      ? { executablePath: process.env.BROWSER_EXECUTABLE }
      : {}),
    args: ["--no-sandbox"],
  });
});
after(async () => {
  await browser?.close();
  await new Promise((resolve) => server?.close(resolve));
});

async function visit(options = {}) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(baseURL);
  assert.equal(response.status(), 200);
  return { context, page, errors };
}

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`${width}px: readable content, imagery, layout and interactions`, async () => {
    const { context, page, errors } = await visit({
      viewport: { width, height: 900 },
    });
    try {
      await page.locator(".submit-button:enabled").waitFor();
      // Exercise real scrolling and normal motion: an invisible reveal is a regression.
      const height = await page.evaluate(
        () => document.documentElement.scrollHeight,
      );
      for (let y = 0; y < height; y += 550) {
        await page.evaluate(
          (y) => window.scrollTo({ top: y, behavior: "instant" }),
          y,
        );
        await page.waitForTimeout(75);
      }
      await page.waitForTimeout(750);
      const hidden = await page
        .locator("[data-reveal]")
        .evaluateAll((elements) =>
          elements
            .filter((el) => getComputedStyle(el).opacity !== "1")
            .map((el) => el.className),
        );
      assert.deepEqual(
        hidden,
        [],
        "Every revealed block must actually be visible",
      );
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "Horizontal overflow",
      );
      for (const image of await page.locator("img").all()) {
        assert(
          await image.evaluate(
            (img) =>
              img.complete &&
              img.naturalWidth > 0 &&
              img.getBoundingClientRect().height > 0,
          ),
          "Broken or collapsed image",
        );
      }
      const sections = await page
        .locator("main > section")
        .evaluateAll((elements) =>
          elements.map((el) => {
            const r = el.getBoundingClientRect();
            return { top: r.top, bottom: r.bottom };
          }),
        );
      sections
        .slice(1)
        .forEach((section, i) =>
          assert(section.top >= sections[i].bottom - 1, "Overlapping sections"),
        );
      const brokenAnchors = await page
        .locator('a[href^="#"]')
        .evaluateAll((links) =>
          links
            .filter((a) => !document.getElementById(a.hash.slice(1)))
            .map((a) => a.hash),
        );
      assert.deepEqual(brokenAnchors, []);
      const contactSizes = await page
        .locator(".contact-person > a, .team-person > a, .menu-toggle")
        .evaluateAll((links) =>
          links
            .filter((a) => getComputedStyle(a).display !== "none")
            .map((a) => a.getBoundingClientRect().height),
        );
      assert(
        contactSizes.every((height) => height >= 44),
        "Small contact or menu touch target",
      );
      if (width <= 960) {
        await page
          .getByRole("button", { name: "Open menu", exact: true })
          .click();
        assert.equal(
          await page.locator(".menu-toggle").getAttribute("aria-expanded"),
          "true",
        );
        await page.keyboard.press("Escape");
        assert.equal(
          await page.locator(".menu-toggle").getAttribute("aria-expanded"),
          "false",
        );
        assert(
          await page
            .locator(".menu-toggle")
            .evaluate((el) => el === document.activeElement),
        );
        await page
          .getByRole("button", { name: "Open menu", exact: true })
          .click();
        await page.locator('#mobile-menu a[href="#contact"]').click();
        assert(await page.locator("#mobile-menu").evaluate((el) => el.hidden));
      }
      const faq = page.locator(".faq-list details").first();
      await faq.locator("summary").click();
      assert(await faq.evaluate((el) => el.open));
      for (const link of await page.locator("[data-service]").all()) {
        await link.click();
        assert.equal(
          await page.locator("#client-service").inputValue(),
          await link.getAttribute("data-service"),
        );
      }
      await page.locator('input[value="email"]').check();
      assert.equal(
        await page.locator("#submit-label").textContent(),
        "Open email message",
      );
      assert.equal(
        await page
          .locator("#enquiry-form")
          .evaluate((form) => form.checkValidity()),
        false,
      );
      await page.locator("#client-name").fill("Layout test");
      await page
        .locator("#client-message")
        .fill("Testing without sending an enquiry.");
      assert.equal(
        await page
          .locator("#enquiry-form")
          .evaluate((form) => form.checkValidity()),
        true,
      );
      await page.locator("#client-email").fill("invalid-address");
      assert.equal(
        await page
          .locator("#enquiry-form")
          .evaluate((form) => form.checkValidity()),
        false,
      );
      if (process.env.JM_SCREENSHOTS) {
        await page.evaluate(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );
        await page.screenshot({
          path: join(process.env.JM_SCREENSHOTS, `${width}.png`),
          fullPage: true,
        });
      }
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  });
}

test("short mobile menu scrolls, keeps keyboard focus, and resets on desktop", async () => {
  const { context, page } = await visit({
    viewport: { width: 390, height: 400 },
  });
  try {
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    const menu = page.locator("#mobile-menu");
    assert(
      await menu.evaluate(
        (el) =>
          el.scrollHeight > el.clientHeight &&
          getComputedStyle(el).overflowY === "auto",
      ),
    );
    await page.locator("#mobile-menu a").last().focus();
    await page.keyboard.press("Tab");
    assert(
      await page
        .locator(".menu-toggle")
        .evaluate((el) => el === document.activeElement),
    );
    await page.keyboard.press("Shift+Tab");
    assert(
      await page
        .locator("#mobile-menu a")
        .last()
        .evaluate((el) => el === document.activeElement),
    );
    await page.locator('#mobile-menu a[href="#contact"]').click();
    assert(await menu.evaluate((el) => el.hidden));
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForFunction(
      () => !document.body.classList.contains("menu-open"),
    );
    assert(await menu.evaluate((el) => el.hidden));
  } finally {
    await context.close();
  }
});

test("both contacts and channels create correctly encoded drafts without sending", async () => {
  for (const recipient of [
    {
      key: "johannes",
      name: "Johannes",
      phone: "27711342523",
      email: "johannes.healthandsafety@gmail.com",
    },
    {
      key: "prince",
      name: "Thapelo",
      phone: "27716844359",
      email: "prince.healthandsafety@gmail.com",
    },
  ]) {
    for (const channel of ["whatsapp", "email"]) {
      const { context, page, errors } = await visit({
        reducedMotion: "reduce",
      });
      try {
        const cdp = await context.newCDPSession(page);
        await cdp.send("Page.enable");
        let destination;
        cdp.on("Page.frameRequestedNavigation", (event) => {
          destination = event.url;
        });
        await page.route("https://wa.me/**", (route) => route.abort());
        await page.locator("#client-name").fill("Alex & Zoë");
        await page.locator("#client-company").fill("A&B Construction");
        await page.locator("#client-phone").fill("071 000 0000");
        await page.locator("#client-email").fill("test@example.com");
        await page.locator("#client-service").selectOption("PPE supply");
        await page.locator("#client-recipient").selectOption(recipient.key);
        await page
          .locator("#client-message")
          .fill("Hard hats & goggles?\nPlease discuss options.");
        await page.locator(`input[value="${channel}"]`).check();
        await page.locator(".submit-button").click();
        await page.waitForTimeout(300);
        assert(destination, "No draft handoff");
        const url = new URL(destination);
        if (channel === "whatsapp") {
          assert.equal(url.origin, "https://wa.me");
          assert.equal(url.pathname, `/${recipient.phone}`);
        } else {
          assert.equal(url.protocol, "mailto:");
          assert.equal(url.pathname, recipient.email);
          assert.equal(
            url.searchParams.get("subject"),
            "JM Health and Safety enquiry — PPE supply",
          );
        }
        const body = url.searchParams.get(
          channel === "whatsapp" ? "text" : "body",
        );
        assert(body.startsWith(`Hello ${recipient.name},`));
        for (const expected of [
          "Alex & Zoë",
          "A&B Construction",
          "071 000 0000",
          "test@example.com",
          "PPE supply",
          "Hard hats & goggles?\nPlease discuss options.",
        ]) {
          assert(
            body.includes(expected),
            `Missing or incorrectly encoded draft content: ${expected}`,
          );
        }
        assert.deepEqual(errors, []);
      } finally {
        await context.close();
      }
    }
  }
});

test("contact URLs preserve business details and whitespace-only enquiries stay local", async () => {
  const { context, page } = await visit({ reducedMotion: "reduce" });
  try {
    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    const allowedPhones = ["+27711342523", "+27716844359"];
    const allowedEmails = [
      "johannes.healthandsafety@gmail.com",
      "prince.healthandsafety@gmail.com",
    ];
    hrefs
      .filter((href) => href.startsWith("tel:"))
      .forEach((href) => assert(allowedPhones.includes(href.slice(4))));
    hrefs
      .filter((href) => href.startsWith("mailto:"))
      .forEach((href) =>
        assert(allowedEmails.includes(new URL(href).pathname)),
      );
    hrefs
      .filter((href) => href.startsWith("https://wa.me/"))
      .forEach((href) => {
        const url = new URL(href);
        assert(
          allowedPhones.some((phone) => url.pathname === `/${phone.slice(1)}`),
        );
        assert(url.searchParams.get("text"));
      });
    await page.locator("#client-name").fill("   ");
    await page.locator("#client-service").selectOption("PPE supply");
    await page.locator("#client-message").fill("   ");
    await page.locator(".submit-button").click();
    assert.equal(page.url(), `${baseURL}/`);
    assert.equal(
      await page
        .locator("#enquiry-form")
        .evaluate((form) => form.checkValidity()),
      false,
    );
  } finally {
    await context.close();
  }
});

test("reduced motion and no-JavaScript fallback keep content visible and personal data local", async () => {
  for (const options of [
    { reducedMotion: "reduce" },
    { javaScriptEnabled: false },
  ]) {
    const { context, page } = await visit(options);
    try {
      assert.equal(
        await page
          .locator(".hero-copy")
          .evaluate((el) => getComputedStyle(el).opacity),
        "1",
      );
      if (options.javaScriptEnabled === false) {
        assert(await page.locator(".submit-button").isDisabled());
        assert(await page.locator(".form-fallback").isVisible());
        assert(await page.locator('.form-fallback a[href^="mailto:"]').count());
      } else {
        assert.equal(
          await page
            .locator(".hero-copy")
            .evaluate((el) => getComputedStyle(el).animationName),
          "none",
        );
      }
    } finally {
      await context.close();
    }
  }
});

test(
  "automated accessibility audit at mobile, tablet and desktop sizes",
  { skip: !process.env.AXE_SOURCE },
  async () => {
    const axeSource = await readFile(process.env.AXE_SOURCE, "utf8");
    for (const width of [320, 768, 1440]) {
      const { context, page } = await visit({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      try {
        await page.addScriptTag({ content: axeSource });
        const violations = await page.evaluate(async () =>
          (await axe.run(document)).violations.map((issue) => ({
            id: issue.id,
            impact: issue.impact,
            targets: issue.nodes.map((node) => node.target),
          })),
        );
        assert.deepEqual(
          violations,
          [],
          `Accessibility violations at ${width}px`,
        );
      } finally {
        await context.close();
      }
    }
  },
);

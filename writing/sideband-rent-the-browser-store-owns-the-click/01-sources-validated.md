# Sources validated (27 Sep 2026)

Every fact in the essay traces to a line here. Each receipt was checked against a primary page or the first report, fetched live on 27 Sep 2026. Receipts that could not be pinned, or that did not earn the arms-race point, are listed under **Cut** with the reason.

## Used

### R1. Amazon stops Muse with a Conditions of Use popup (Sun 20 Sep 2026, evening)
- **Source:** GeekWire, Todd Bishop, "Amazon blocks Meta's Muse AI assistant in new standoff over agentic shopping," published 20 Sep 2026 11:05 pm PT. https://www.geekwire.com/2026/amazon-blocks-metas-muse-ai-assistant-in-new-standoff-over-agentic-shopping/
- **Verified text:**
  - "As of Sunday night, people trying to use Muse to shop on Amazon were seeing the popup, 'Continued access by an unauthorized AI agent violates Amazon's Conditions of Use, to which our customers have agreed.'"
  - Amazon's stated reasons: "Meta didn't tell Amazon that Muse would access its store, the agent doesn't identify itself when it browses, and it appears to capture and store customer credentials."
  - Amazon cut Muse off "after attempting unsuccessfully to get the Facebook parent company to voluntarily exclude the e-commerce site."
  - Spokesperson: "we've requested that Meta remove Amazon from the experience."
  - Spokesperson: third-party apps "should operate openly and respect service provider decisions about whether or not to participate."
  - "Muse can reach account pages and order history if a customer prompts it to do so, Amazon says." Amazon calls that "an undisclosed third party moving through customer accounts."
  - "Amazon generated more than $68 billion in ad revenue last year — a business that depends on people browsing its pages and seeing sponsored products."
  - Meta's side: Muse "has no visibility into people's passwords or payment methods"; credentials "go into secure storage."
- **Corroboration:** Business Insider, https://www.businessinsider.com/amazon-blocks-meta-muse-ai-agent-shopping-site-2026-9 (same popup text and spokesperson quote).

### R2. Amazon's Agent Terms forbid CAPTCHA solving (last updated 14 Aug 2026)
- **Source (primary):** Amazon.com Conditions of Use, "Agents" section. https://www.amazon.com/gp/help/customer/display.html?nodeId=GLSBYFE9MGKKQXXM
- **Verified text:** Agents must "Not conceal or obfuscate that any access, use, or interactions are from an Agent, such as by (a) mimicking the speed or pattern of human keystrokes, page navigation, or other interactions or (b) completing or circumventing CAPTCHAs or other measures intended to distinguish computers from humans." Agents must also include "Agent/[agent name]" in the user agent string of every HTTP/HTTPS request.

### R3. Shawn's Walmart run (lived, from the locked brief)
- **Source:** Shawn, locked brief. Tried to get Grok Bot to shop Walmart; aggressive CAPTCHAs stopped it; installed Browser Use; it got past even the intense challenges.
- **Drafting rule:** add no details Shawn did not give (no item, date, count of attempts, or CAPTCHA type).

### R4. Grok Bot is SpaceXAI's cloud agent; it shops with Stripe Link single-use cards
- **Source (primary):** SpaceXAI, "Introducing Grok Bot." https://x.ai/news/introducing-grok-bot ("Bots have their own computer.")
- **Source (first report):** Runtime Wire, 28 Aug 2026. https://runtimewire.com/article/grok-bot-online-shopping-stripe-link — "Grok Bot (@bot) can now complete online purchases using single-use payment cards from Stripe Link"; user approves each proposed charge.
- **Used as:** naming only ("SpaceXAI's Grok Bot"). The payment point is carried by R6 (Muse), so Grok Bot's Link flow is not restated.

### R5. Browser Use is an open-source browser-automation project for AI agents
- **Source (primary):** https://github.com/browser-use/browser-use (repo tagline: "Agents that use the browser").
- **Used as:** a one-clause description of the tool Shawn installed.

### R6. Muse pays with a single-use card scoped to the approved purchase (8 Sep 2026)
- **Source (primary):** Stripe newsroom, "Stripe helps Muse, Meta's new personal AI agent, shop across the internet with Link," 8 Sep 2026. https://stripe.com/newsroom/news/stripe-helps-meta-muse-shop-with-link
- **Verified text:** "For other businesses, Link issues Muse a single-use virtual card scoped to the approved purchase. For every purchase, consumers are asked to approve the transaction total directly in the chat interface, and Muse never sees their underlying payment details."
- **Supporting primary:** Stripe `link-cli` README (spend request per purchase, 10-minute approval window, credential valid 12 hours). https://github.com/stripe/link-cli

### R7. Cloudflare "signed agents" (28 Aug 2025)
- **Source (primary):** Cloudflare blog, "The age of agents: cryptographically recognizing agent traffic," 28 Aug 2025. https://blog.cloudflare.com/signed-agents/
- **Verified text:** a signed agent is one whose "infrastructure or remote browsing platform ... is signing their HTTP requests via Web Bot Auth, with Cloudflare validating these message signatures." First cohort: "ChatGPT agent, Goose from Block, Browserbase, and Anchor Browser." Purpose: "to make it even easier for our customers to set the traffic lanes they want for their website."
- **Caution kept:** the post said group actions on signed agents in security rules were coming "soon." The essay does not claim that feature is live.

### R8. Shopify opens Shop Pay checkout to Muse on all stores (Mon 21 Sep 2026)
- **Source:** Tobi Lütke on X, 21 Sep 2026, quoted verbatim by Naughton & Bird (https://naughtonandbird.com/signals/shopify-meta-ai-channel-agentic-storefronts) and The Motley Fool, 23 Sep 2026 (https://www.fool.com/investing/2026/09/23/amazon-blocked-meta-s-ai-shopping-agent-shopify-welcomed-it-and-gets-paid-on-every-checkout/): "partnering deeply with Muse to enable agentic checkout with Shop Pay on all Shopify stores." Motley Fool: "One day later, Shopify went the other way."
- **Source (primary):** Shopify Help Center, "Selling on Meta." https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/meta — "Purchasing in direct checkouts is activated by default for eligible stores"; "You remain the merchant of record."

### R9. Walmart runs its own Sparky agent inside ChatGPT (25 Mar 2026)
- **Source:** Retail Dive, "Walmart brings Sparky to ChatGPT as OpenAI rethinks Instant Checkout," published 25 Mar 2026. https://www.retaildive.com/news/walmart-sparky-chatgpt-instant-checkout/815647/ — Walmart "debuted an in-platform app experience in OpenAI's ChatGPT backed by its commerce agent Sparky," taking users "to a Walmart environment supporting account linking, loyalty and payment."
- **Corroboration:** WIRED, https://www.wired.com/story/ai-lab-walmart-openai-shaking-up-agentic-shopping-deal/ (Sparky to operate inside ChatGPT, then Gemini).

### R10. OpenAI on prompt injection in its own shopping-capable agent (17 Jul 2025)
- **Source (primary):** OpenAI, "Introducing ChatGPT agent: bridging research and action," 17 Jul 2025. https://openai.com/index/introducing-chatgpt-agent/
- **Verified text:** "a malicious prompt hidden in a webpage, such as in invisible elements or metadata, could trick the agent into taking unintended actions, like sharing private data from a connector with the attacker, or taking a harmful action on a site the user has logged into."
- **Added at:** dev-edit, to give the brief's "rogue agents" half of the retailers' case a named source. Version one argued fraud only.

## Cut (and why)

| Candidate | Status | Reason |
|---|---|---|
| Ninth Circuit vacates Perplexity/Comet injunction (4 Aug 2026), footnote 5 | Validated (GeekWire, elsop.com) | Cut. The brief keeps Muse short, and the legal history belongs to the method-gate spine this piece drops. |
| Amazon Buy for Me identifies itself and lets brands opt out | Validated (GeekWire) | Not used. R2 already states Amazon's identify-yourself rule, and Muse stays short. |
| Amazon's $68B ad business (GeekWire) | Validated (GeekWire) | Used in version one; cut at dev-edit. It opened an ad-motive argument the piece never develops. |
| Anthropic computer use (Oct 2024), Gemini Computer Use (Oct 2025) | In research pack | Cut. Lab launch history does not earn the arms-race point. |
| OpenAI Operator hands CAPTCHAs back to the human (Jan 2025) | In research pack | Cut. Accurate, but a third CAPTCHA beat after R2 and R3 reads as a parade. |
| Steel Stealth Browser, Chromium fork (22 Jun 2026) | In research pack | Cut. The brief allows one signed-lane *or* stealth beat. R3 already shows bypass firsthand, so R7 (signed lane) earns more. |
| CapSolver, Browserbase, Steel, Kernel pricing meters | In research pack | Cut. The brief bans a tools-list or meter parade. |
| PayPal and Instacart joining Muse (22 Sep 2026) | Secondary only (Stellagent) | Cut. Not pinned to a primary source, and Shopify already carries the "embrace" beat. |
| Trevin Chow quote; AI Engineer World's Fair premise (from prior Muse draft) | No URL in pack; not re-verified | Cut. Could not be validated. |
| Whether Amazon or Walmart honor Cloudflare signed agents | No public receipt | Not claimed. |
| Walmart's CAPTCHA vendor or challenge type | Not in Shawn's account | Not claimed. |

# Stage 2: cw-draft (version one)

Drafted from 02-outline.md. Receipt tags [R#] point to 01-sources-validated.md and are stripped in later versions.

---

# Stores that block shopping agents will lose share

**Fraud is a real reason to keep AI shopping agents out today. It stops holding once agents identify themselves and every charge needs the buyer's approval.**

On Sunday night, September 20, people using Meta's Muse agent to shop on Amazon.com started seeing a popup: "Continued access by an unauthorized AI agent violates Amazon's Conditions of Use, to which our customers have agreed." Amazon told GeekWire that Meta never said Muse would shop its store, that Muse doesn't identify itself when it browses, and that it appears to capture and store customer credentials. Amazon asked Meta to take Amazon out of Muse. When Meta didn't, Amazon blocked it. [R1]

I hit a version of the same wall at Walmart. I tried to get Grok Bot, SpaceXAI's cloud agent, to shop Walmart.com, and aggressive CAPTCHAs stopped it. So I installed Browser Use, an open-source browser-automation tool for AI agents, and it got past even the intense challenges. [R3, R4, R5] Walmart built a wall. One install got over it. That's an arms race, and it's already running at Amazon and Walmart.

Here's where it goes. Shoppers will keep reaching for agents like Muse and Grok Bot because the agent does the clicking. Retailers will keep citing fraud and rogue agents to keep them out, and today that case is real. It has a shelf life. Once it stops holding, the stores that keep saying no will lose share to the stores that let agents check out.

The wall is already in writing. Amazon's Agent Terms, last updated August 14, bar any agent from hiding what it is by "mimicking the speed or pattern of human keystrokes" or by "completing or circumventing CAPTCHAs." [R2] What Browser Use did for me at Walmart is the exact move Amazon wrote a rule against. Stores can raise the wall in code and in contract, and the next tool will be built to clear the code.

The same terms point to the way out. Amazon requires every agent to put "Agent/[agent name]" in the user agent string of every request. [R2] Muse didn't. [R1] Cloudflare built a stronger version of that idea in August 2025 with "signed agents": the remote browser an agent runs in signs each HTTP request, and Cloudflare checks the signature before the site decides what to do with it. ChatGPT agent was in the first group. [R7] A site that can verify who sent a request doesn't have to guess, and doesn't have to treat every agent like a bot testing stolen cards.

The retailers' case deserves its full weight. Amazon says Muse can reach account pages and order history when a customer asks it to. [R1] An agent logged in with a customer's stored password, not announcing itself, is an undisclosed third party inside the account, and to a fraud team that looks like account takeover. A store that waves agents through takes the loss when one goes rogue, and the customer blames the store.

That case has a shelf life because the pieces that answer it already ship. Muse pays through Stripe's Link, which issues "a single-use virtual card scoped to the approved purchase," and the buyer approves every total in the chat, per Stripe. [R6] Signing tells the site which agent is at the door. Put those together and "we can't tell who's buying" stops being true.

What's left isn't fraud. Amazon's request went further than identification: it asked Meta to take Amazon out of Muse entirely, and its statement asks third parties to "respect service provider decisions about whether or not to participate." [R1] Amazon also runs an ad business, more than $68 billion last year, that depends, as GeekWire put it, on people browsing its pages and seeing sponsored products. [R1] Walmart isn't against agents either. Since March, its own Sparky agent has run inside ChatGPT. [R9] The walls go up against agents the store doesn't run.

The day after Amazon's popup, Shopify CEO Tobi Lütke announced Shop Pay checkout for Muse "on all Shopify stores." Direct checkout is on by default for eligible stores, and the merchant stays the merchant of record. [R8] Shopify didn't wait for the fraud question to be settled. It built the lane and put its own wallet in it.

Amazon can hold out longer than anyone because shoppers come to Amazon first. Most stores can't. A mid-size retailer that answers Muse with a CAPTCHA while a Shopify competitor takes the approved order is paying for its fraud posture in lost sales, and paying again every time a new tool clears the wall. The stores that give agents a named lane, with the buyer approving every charge, will take that share. The ones still running CAPTCHAs against software any shopper can install will lose it.

---

## Drafter's flags (per cw-draft "For Agents")

- Body runs long (count below). Beat 4 carries three separate "what's left" receipts.
- "the customer blames the store" and "shoppers come to Amazon first" have no receipt in the ledger.
- "the next tool will be built to clear the code" is a prediction stated as fact.
- "which agent is at the door" is a figure that edges toward treating the agent as a visitor.

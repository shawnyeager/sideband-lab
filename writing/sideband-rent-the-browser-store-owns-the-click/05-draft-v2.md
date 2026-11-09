# Stage 3 output: version two (dev-edit fixes applied)

Changes from version one follow 04-dev-edit.md: rogue-agent case added (R10); cut scoped to the Link path and to what signing does; $68B, "customer blames the store," "shoppers come to Amazon first," and the next-tool prediction removed; stake added to the dek; "at the door" figure removed. Sentence-level items are left for line-edit.

---

# Stores that block shopping agents will lose share

**Fraud is a real reason to keep AI shopping agents out today. It stops holding once agents identify themselves and every charge needs the buyer's approval, and the stores still blocking them will lose the order.**

On Sunday night, September 20, people using Meta's Muse agent to shop on Amazon.com started seeing a popup: "Continued access by an unauthorized AI agent violates Amazon's Conditions of Use, to which our customers have agreed." Amazon told GeekWire that Meta never said Muse would shop its store, that Muse doesn't identify itself when it browses, and that it appears to capture and store customer credentials. Amazon asked Meta to take Amazon out of Muse. When Meta didn't, Amazon blocked it.

I hit a version of the same wall at Walmart. I tried to get Grok Bot, SpaceXAI's cloud agent, to shop Walmart.com, and aggressive CAPTCHAs stopped it. So I installed Browser Use, an open-source browser-automation tool for AI agents, and it got past even the intense challenges. Walmart built a wall. One install got over it. That's an arms race, and it's already running at Amazon and Walmart.

Here's where it goes. Shoppers will keep reaching for agents like Muse and Grok Bot because the agent does the clicking. Retailers will keep citing fraud and rogue agents to keep them out, and today that case is real. It has a shelf life. Once it stops holding, the stores that keep saying no will lose share to the stores that let agents check out.

The wall is already in writing. Amazon's Agent Terms, last updated August 14, bar any agent from hiding what it is by "mimicking the speed or pattern of human keystrokes" or by "completing or circumventing CAPTCHAs." What Browser Use did for me at Walmart is the exact move Amazon wrote a rule against.

The same terms point to the way out. Amazon requires every agent to put "Agent/[agent name]" in the user agent string of every request. Muse didn't. Cloudflare built a stronger version of that idea in August 2025 with "signed agents": the remote browser an agent runs in signs each HTTP request, and Cloudflare checks the signature before the site decides what to do with it. ChatGPT agent was in the first group. A site that can verify who sent a request doesn't have to guess, and doesn't have to treat every agent like a bot testing stolen cards.

The retailers' case deserves its full weight. Amazon says Muse can reach account pages and order history when a customer asks it to. An agent logged in with a customer's stored password, not announcing itself, is an undisclosed third party inside the account, and to a fraud team that looks like account takeover. OpenAI states the rogue-agent risk about its own product: a malicious prompt hidden in a web page can push ChatGPT agent into "a harmful action on a site the user has logged into." A store that lets agents in carries that risk on its own pages.

That case has a shelf life, because the answers are already shipping. Muse pays through Stripe's Link, which issues "a single-use virtual card scoped to the approved purchase," and the buyer approves every total in the chat, per Stripe. On that path, a hijacked agent can't spend past the purchase the buyer approved. Cloudflare's signing lets a site verify which agent sent a request. Neither ends the risk. Together they end the claim that a store can't tell a shopper's agent from a card tester.

What's left is control. Amazon's request went further than identification: it asked Meta to take Amazon out of Muse entirely, and its statement asks third parties to "respect service provider decisions about whether or not to participate." Walmart isn't against agents either. Since March, its own Sparky agent has run inside ChatGPT. The walls go up against agents the store doesn't run.

The day after Amazon's popup, Shopify CEO Tobi Lütke announced Shop Pay checkout for Muse "on all Shopify stores." Direct checkout is on by default for eligible stores, and the merchant stays the merchant of record. Shopify didn't wait for the fraud question to be settled. It built the lane and put its own wallet in it.

Amazon is big enough to hold out for a while. Most retailers aren't. A mid-size retailer that answers Muse with a CAPTCHA while a Shopify competitor takes the approved order is paying for its fraud posture in lost sales, and paying again every time a shopper installs a tool that clears the wall. The stores that give agents a named lane, with the buyer approving every charge, will take that share. The ones still running CAPTCHAs against software any shopper can install will lose it.

# Stores that block shopping agents will lose share

**Fraud is a real reason to block AI shopping agents today. It stops being one once agents identify themselves and buyers approve every charge, and stores that keep blocking will lose orders to stores that don't.**

On Sunday night, September 20, people using Meta's Muse agent to shop on Amazon.com started seeing a popup: "Continued access by an unauthorized AI agent violates Amazon's Conditions of Use, to which our customers have agreed." Amazon told GeekWire that Meta never said Muse would access its store, that Muse doesn't identify itself when it browses, and that it appears to capture and store customer credentials.

I tried to get Grok Bot, SpaceXAI's cloud agent, to shop Walmart.com. Aggressive CAPTCHAs stopped it. So I installed Browser Use, an open-source browser-automation tool for AI agents, and it got past even the intense challenges. That's an arms race: the store raises a barrier, and a tool that clears it is one install away.

Shoppers will keep reaching for agents like Muse and Grok Bot because the agent does the clicking. A week after Meta launched Muse on September 8, it was the No. 1 free app in Apple's U.S. App Store. Retailers will keep blocking agents in the name of fraud and rogue-agent risk, and today that argument is real. It also has a shelf life. When it runs out, the stores that keep saying no will lose share to the stores that let shoppers check out through an agent.

Amazon's contract already names the workaround. Its Conditions of Use, last updated August 14, bar agents from concealing that they're agents by "mimicking the speed or pattern of human keystrokes" or by "completing or circumventing CAPTCHAs." What Browser Use did for me at Walmart is the move Amazon wrote a rule against.

The same terms require every agent to put "Agent/[agent name]" in the user agent string of every request, which is the identification Amazon says Muse lacks. Cloudflare built a cryptographic version in August 2025 called "signed agents." The remote browser an agent runs in signs each HTTP request, and Cloudflare checks the signature. ChatGPT agent was in the first group. The site owner still decides what to let through, but no longer has to guess.

The retailers' side is strong. Amazon says Muse can reach account pages and order history when a customer asks it to. An agent that logs in with a customer's stored password and doesn't identify itself is an undisclosed third party inside the account. To a fraud team, that can look like account takeover. OpenAI warned in July 2025 that a malicious prompt hidden in a web page could steer its own ChatGPT agent into "a harmful action on a site the user has logged into." A store that lets agents in carries that risk on its own pages.

The answers to most of that already ship. Stripe says the buyer approves the total of every Muse purchase in the chat, and where a store doesn't take Link, Muse gets "a single-use virtual card scoped to the approved purchase." On that card, a hijacked agent can't spend past what the buyer approved. Neither scoped cards nor signatures end the risk. Together they end the claim that a store can't tell a shopper's agent from a bot testing stolen cards.

What's left is control. Amazon's ask went past identification. It asked Meta to remove Amazon from Muse, and its statement says third-party apps should "respect service provider decisions about whether or not to participate." Walmart runs its own agent, Sparky, inside ChatGPT, and has since March. Walls go up against agents a store doesn't run.

The day after Amazon's popup, Shopify CEO Tobi Lütke announced Shop Pay checkout for Muse "on all Shopify stores." Shopify's help center says direct checkout on Meta is on by default for eligible stores and that the merchant stays the merchant of record. Amazon and Shopify looked at the same agent in the same week and made opposite calls.

Amazon is big enough to hold out for a while. Most retailers aren't. A store that blocks Muse while a Shopify competitor takes the approved order loses that sale. The stores that give agents an open, identified way to check out, with the buyer approving each charge, will take the share the holdouts give up. The holdouts will keep running CAPTCHAs, and when a shopper's tool gets past one, as Browser Use did for me, the store ends up serving an agent it can't identify, the risk the CAPTCHA was there to stop.

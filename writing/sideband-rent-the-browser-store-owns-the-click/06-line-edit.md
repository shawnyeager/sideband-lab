# Stage 4: cw-line-edit (on version two)

Input: 05-draft-v2.md. Loaded: VOICE.md + STYLE.md, 01-sources-validated.md. `cw-ai-check` ran silently inside this pass in its required order: provenance, then certainty, then causal closure, then self-commentary, then lexical. Humanizer OFF.

## Part 1: Revised draft (version three)

---

# Stores that block shopping agents will lose share

**Fraud is a real reason to block AI shopping agents today. It stops being one once agents identify themselves and buyers approve every charge, and stores that keep blocking will lose orders to stores that don't.**

On Sunday night, September 20, people using Meta's Muse agent to shop on Amazon.com started seeing a popup: "Continued access by an unauthorized AI agent violates Amazon's Conditions of Use, to which our customers have agreed." Amazon told GeekWire that Meta never said Muse would access its store, that Muse doesn't identify itself when it browses, and that it appears to capture and store customer credentials.

I tried to get Grok Bot, SpaceXAI's cloud agent, to shop Walmart.com. Aggressive CAPTCHAs stopped it. So I installed Browser Use, an open-source browser-automation tool for AI agents, and it got past even the intense challenges. That's an arms race: the store raises a barrier, and a tool that clears it is one install away.

Shoppers will keep reaching for agents like Muse and Grok Bot because the agent does the clicking. A week after Meta launched Muse on September 8, it was the No. 1 free app in Apple's U.S. App Store. Retailers will keep blocking agents in the name of fraud and rogue-agent risk, and today that argument is real. It also has a shelf life. When it runs out, the stores that keep saying no will lose share to the stores that let shoppers check out through an agent.

Amazon's contract already names the workaround. Its Conditions of Use, last updated August 14, bar agents from concealing that they're agents by "mimicking the speed or pattern of human keystrokes" or by "completing or circumventing CAPTCHAs." What Browser Use did for me at Walmart is the move Amazon wrote a rule against.

The same terms require every agent to put "Agent/[agent name]" in the user agent string of every request, which is the identification Amazon says Muse lacks. Cloudflare built a cryptographic version in August 2025 called "signed agents." The remote browser an agent runs in signs each HTTP request, and Cloudflare checks the signature. ChatGPT agent was in the first group. The site owner still decides what to let through, but no longer has to guess.

The retailers' side is strong. Amazon says Muse can reach account pages and order history when a customer asks it to. An agent that logs in with a customer's stored password and doesn't identify itself is an undisclosed third party inside the account. To a fraud team, that can look like account takeover. OpenAI warned in July 2025 that a malicious prompt hidden in a web page could steer its own ChatGPT agent into "a harmful action on a site the user has logged into." A store that lets agents in carries that risk on its own pages.

The answers to most of that already ship. Stripe says the buyer approves the total of every Muse purchase in the chat, and at stores that don't accept Link, Link issues Muse "a single-use virtual card scoped to the approved purchase." On that card, a hijacked agent can't spend past what the buyer approved. Neither scoped cards nor signatures end the risk. Together they end the claim that a store can't tell a shopper's agent from a bot testing stolen cards.

What's left is control. Amazon's ask went past identification. It asked Meta to remove Amazon from Muse, and its statement says third-party apps should "respect service provider decisions about whether or not to participate." Walmart runs its own agent, Sparky, inside ChatGPT, and has since March. Walls go up against agents the store doesn't run.

The day after Amazon's popup, Shopify CEO Tobi Lütke announced Shop Pay checkout for Muse "on all Shopify stores." Shopify's help center says direct checkout on Meta is on by default for eligible stores and that the merchant stays the merchant of record. Amazon and Shopify looked at the same agent in the same week and made opposite calls.

Amazon is big enough to hold out for a while. Most retailers aren't. A store that blocks Muse while a Shopify competitor takes the approved order loses that sale. The stores that give agents an open, identified way to check out, with the buyer approving each charge, will take the share the holdouts give up. The holdouts will keep running CAPTCHAs, and when a shopper's tool gets past one, as Browser Use did for me, the store ends up serving an agent it can't identify, the risk the CAPTCHA was there to stop.

---

## Part 2: Changes Made

1. **Dek:** "It stops holding once agents identify themselves and every charge needs the buyer's approval, and the stores still blocking them will lose the order."
   **Problem:** Two "and" clauses did different jobs, and "the order" was vague.
   **Fix:** "It stops being one once agents identify themselves and buyers approve every charge, and stores that keep blocking will lose orders to stores that don't." The buyer is now the actor, and the stake names who gains.

2. **Para 1:** "Amazon asked Meta to take Amazon out of Muse. When Meta didn't, Amazon blocked it."
   **Problem:** "Amazon blocked it" repeated the popup sentence, and the removal request reappeared in para 8, where it does the argument's work.
   **Fix:** Cut both sentences here. The request now appears once, in para 8. The Muse beat drops to two sentences, which fits the brief's "SHORT."

3. **Para 1:** "Meta never said Muse would shop its store."
   **Problem:** GeekWire's wording is "access its store." "Shop" drifted from the source.
   **Fix:** "Meta never said Muse would access its store."

4. **Para 2:** "I hit a version of the same wall at Walmart."
   **Problem:** Scaffolding (fails the deletion test). It also wasn't accurate: Grok Bot hit the CAPTCHA, and a CAPTCHA is not the same barrier as a Conditions of Use popup.
   **Fix:** Cut. The paragraph opens on the action: "I tried to get Grok Bot..."

5. **Para 2:** "Walmart built a wall. One install got over it. That's an arms race, and it's already running at Amazon and Walmart."
   **Problem:** A staccato fragment stack (VOICE: avoid fragment stacks), and the last clause restated the scene instead of defining the race.
   **Fix:** "That's an arms race: the store raises a barrier, and a tool that clears it is one install away."

6. **Para 3:** "Here's where it goes."
   **Problem:** Throat-clearing.
   **Fix:** Cut.

7. **Para 3:** "Shoppers will keep reaching for agents like Muse and Grok Bot because the agent does the clicking."
   **Problem:** A consequential demand claim with no receipt attached.
   **Fix:** Added R1 evidence: "A week after Meta launched Muse on September 8, it was the No. 1 free app in Apple's U.S. App Store." (GeekWire)

8. **Para 3:** "Retailers will keep citing fraud and rogue agents to keep them out... It has a shelf life. Once it stops holding, ... the stores that let agents check out."
   **Problem:** "them" could refer to shoppers or agents. "Shelf life" also appeared again in para 7. "Let agents check out" made the agent the actor.
   **Fix:** "Retailers will keep blocking agents in the name of fraud and rogue-agent risk... It also has a shelf life. When it runs out, ... the stores that let shoppers check out through an agent."

9. **Para 4:** "The wall is already in writing. Amazon's Agent Terms, last updated August 14, bar any agent from hiding what it is..."
   **Problem:** "Wall" was the third use of the figure. "Hiding what it is" gave the agent intent. The Aug 14 date belongs to the Conditions of Use page, not necessarily the Agents section.
   **Fix:** "Amazon's contract already names the workaround. Its Conditions of Use, last updated August 14, bar agents from concealing that they're agents..." This follows Amazon's own "Not conceal or obfuscate" wording.

10. **Para 5:** "The same terms point to the way out."
    **Problem:** Terms-as-actor (VOICE: abstraction-as-actor).
    **Fix:** "The same terms require every agent to put 'Agent/[agent name]' ... which is the identification Amazon says Muse lacks."

11. **Para 5:** "Cloudflare built a stronger version of that idea..."
    **Problem:** "Stronger" is a comparative claim the ledger doesn't carry.
    **Fix:** "Cloudflare built a cryptographic version in August 2025 called 'signed agents.'"

12. **Para 5:** "A site that can verify who sent a request doesn't have to guess, and doesn't have to treat every agent like a bot testing stolen cards."
    **Problem:** The card-tester image echoed the end of para 7.
    **Fix:** "The site owner still decides what to let through, but no longer has to guess." The card-tester line stays once, in para 7, where it lands the cut.

13. **Para 6:** "The retailers' case deserves its full weight."
    **Problem:** Self-commentary (the referent is "the case").
    **Fix:** "The retailers' side is strong." This is a one-line adjudication, Shawn's native "strong case, then the cut" turn, without the borrowed phrasing.

14. **Para 6:** "An agent logged in with a customer's stored password, not announcing itself, ... and to a fraud team that looks like account takeover."
    **Problem:** "Announcing itself" leaned human. The draft also stated "looks like account takeover" with more certainty than the inference supports.
    **Fix:** "An agent that logs in with a customer's stored password and doesn't identify itself is an undisclosed third party inside the account. To a fraud team, that can look like account takeover."

15. **Para 6:** "OpenAI states the rogue-agent risk about its own product: a malicious prompt hidden in a web page can push ChatGPT agent into..."
    **Problem:** "States the risk" described the evidence instead of giving it. The quote also needed a date.
    **Fix:** "OpenAI warned in July 2025 that a malicious prompt hidden in a web page could steer its own ChatGPT agent into 'a harmful action on a site the user has logged into.'"

16. **Para 7:** "That case has a shelf life, because the answers are already shipping."
    **Problem:** Repeated "shelf life" from para 3. "That case" is a piece-referent.
    **Fix:** "The answers to most of that already ship." "Most" is the precise scope. The paragraph says outright that the risk doesn't end.

17. **Para 7:** "Muse pays through Stripe's Link, which issues 'a single-use virtual card scoped to the approved purchase'..."
    **Problem:** Provenance drift. Per Stripe, the single-use card applies at stores that don't accept Link.
    **Fix:** "Stripe says the buyer approves the total of every Muse purchase in the chat, and at stores that don't accept Link, Link issues Muse 'a single-use virtual card scoped to the approved purchase.' On that card, a hijacked agent can't spend past what the buyer approved."

18. **Para 7:** "Cloudflare's signing lets a site verify which agent sent a request."
    **Problem:** Echo of para 5.
    **Fix:** Folded into "Neither scoped cards nor signatures end the risk."

19. **Para 8:** "Amazon's request went further than identification: it asked Meta to take Amazon out of Muse entirely..."
    **Problem:** The colon splice buried the fact, and "entirely" went beyond the source's "remove Amazon from the experience."
    **Fix:** "Amazon's ask went past identification. It asked Meta to remove Amazon from Muse..."

20. **Para 8:** "Walmart isn't against agents either. Since March, its own Sparky agent has run inside ChatGPT."
    **Problem:** "Either" dangled once Buy for Me was out. "Isn't against" asserts an attitude where the source gives a fact.
    **Fix:** "Walmart runs its own agent, Sparky, inside ChatGPT, and has since March."

21. **Para 9:** "Direct checkout is on by default for eligible stores, and the merchant stays the merchant of record. Shopify didn't wait for the fraud question to be settled. It built the lane and put its own wallet in it."
    **Problem:** The help-center facts weren't attributed, and Shopify's help page doesn't name Muse. "Didn't wait" claims a motive. "Put its own wallet in it" was decoration.
    **Fix:** "Shopify's help center says direct checkout on Meta is on by default for eligible stores and that the merchant stays the merchant of record. Amazon and Shopify looked at the same agent in the same week and made opposite calls."

22. **Para 10:** "...is paying for its fraud posture in lost sales, and paying again every time a shopper installs a tool that clears the wall."
    **Problem:** "Fraud posture" is jargon, and "paying again" had no mechanism.
    **Fix:** "A store that blocks Muse while a Shopify competitor takes the approved order loses that sale."

23. **Para 10 (kicker):** "The ones still running CAPTCHAs against software any shopper can install will lose it."
    **Problem:** Hollow title echo: "lose share" in the title, "lose it" at the close.
    **Fix:** The close now ends on a consequence the body earned: "...when a shopper's tool gets past one, as Browser Use did for me, the store ends up serving an agent it can't identify, the risk the CAPTCHA was there to stop." It claims no completed order, since Shawn reported getting past the CAPTCHAs, not a checkout.

Lexical scan after the structural passes: 0 em dashes, 0 en dashes. No lexicon hits (delve, pivotal, leverage, seamless, robust, moreover, furthermore, additionally, ultimately). No "hire/hired." No "you" addressing the reader.

Let me know if you want to revert any of these.

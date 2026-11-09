# Stage 3: cw-dev-edit (on version one)

Input: 03-draft-v1.md (752 body words). Loaded: 00-brief.md, 01-sources-validated.md, Shawn's VOICE.md + STYLE.md.
Focus: argument, structure, evidence, brief compliance. Sentence polish is left to line-edit.

## Developmental Edit Report

### Brief compliance
🔴 **Critical: the retailers' case is only half there.** The brief's beat 4 says "fraud, rogue agents." Version one argues account takeover (fraud) and never states the rogue-agent risk. That makes it less than "full force," and STYLE requires the opposing case at full force before the cut.
**Fix:** add OpenAI's own warning (R10). A prompt hidden in a web page can push its agent into "a harmful action on a site the user has logged into." This is the strongest form of the retailers' worry, and it comes from the company that built the agent, not from a retailer.

🔴 **Critical: the cut overclaims.** "Put those together and 'we can't tell who's buying' stops being true" treats Link cards and Cloudflare signing as one package. Muse uses Link. Nothing in the ledger says Muse signs its requests. Link's single-use card also covers only the Link payment path, not the case where Muse logs in and pays with a saved card.
**Fix:** scope it. On the Link path, a hijacked agent can't spend past the one purchase the buyer approved. Signing lets a site verify which agent sent a request. Say that neither ends risk, and that together they end the claim that a store can't tell a shopper's agent from a card tester.

### Evidence check

| Claim | Support | Verdict |
|---|---|---|
| Popup text, date, Amazon's three reasons, request to remove Amazon | R1 GeekWire | Strong |
| Amazon terms bar CAPTCHA solving and keystroke mimicry | R2 Amazon primary | Strong |
| Walmart CAPTCHAs stopped Grok Bot; Browser Use got past | R3 Shawn, lived | Strong |
| Cloudflare signed agents, ChatGPT agent in first cohort | R7 Cloudflare primary | Strong |
| Single-use card scoped to approved purchase; buyer approves every total | R6 Stripe primary | Strong |
| Shopify Shop Pay for Muse on all stores; default-on; merchant of record | R8 Lütke via two outlets + Shopify Help Center | Strong |
| Walmart Sparky inside ChatGPT since March | R9 Retail Dive | Strong |
| "the customer blames the store" | None | 🔴 Weak: cut |
| "shoppers come to Amazon first" | None in ledger | 🔴 Weak: cut. Replace with reasoning from scale that makes no factual claim |
| "the next tool will be built to clear the code" | Prediction, no receipt | 🟡 Weak: cut. Shawn's Browser Use run already shows the pattern |
| "$68 billion" ad business | R1 GeekWire | Strong, but see Structure |

### Structure

**Section summary test** (one sentence per section, then flag anything that doesn't serve it):
1. *Cold open (paras 1–2):* Amazon walled out Muse on Sept 20, and Walmart's CAPTCHAs stopped Shawn's Grok Bot until one Browser Use install got it through. Serves the section. 🟢 The last line of para 2 ("it's already running at Amazon and Walmart") repeats the scene instead of naming the race. Line-edit item.
2. *Claim (para 3):* Shoppers push agents, retailers cite fraud, the excuse expires, holdouts lose share. Serves. 🟢 "Here's where it goes." is throat-clearing. Line-edit item.
3. *Receipts (paras 4–5):* The wall is written into contract, and the way out is identification. Serves, except the prediction flagged above.
4. *Opposing case and cut (paras 6–8):* 🟡 **Para 8 stacks three receipts on "what's left"**: Amazon's "participate" quote, the $68B ad business, and Walmart's Sparky. The $68B line opens a second argument (Amazon's ad motive) that the piece never develops, and it reads as insinuation. **Cut $68B.** Keep "participate" because it is Amazon's own words and it is the cut. Keep Sparky because it ties back to Shawn's Walmart beat and carries the control lens into the land.
5. *Land (paras 9–10):* Shopify opened checkout to Muse the next day, and stores that hold out lose the order. Serves. 🟡 The "Amazon can hold out" line depends on the cut claim; rebuild it on scale alone.

**20-second pitch test**
- *Pitch from the piece as written:* Amazon walled out Meta's Muse, and Walmart's CAPTCHAs stopped Shawn's Grok Bot until Browser Use got through. That's an arms race. Retailers say fraud and rogue agents, and that's real today, but scoped single-use cards, buyer approval, and signed agent identity answer most of it. What's left is control. Shopify opened checkout to Muse the next day, and stores that keep blocking will lose share to stores like that.
- *Promise as stated (dek):* "Fraud is a real reason to keep AI shopping agents out today. It stops holding once agents identify themselves and every charge needs the buyer's approval."
- *Gap:* 🟡 The dek carries the cut but not the stake. The piece lands on who wins, and the dek never says so. **Fix:** extend the dek by one plain clause naming who loses. No triad.

### Outsider read
A founder reading cold would push back on two points:
- "Amazon isn't anti-agent; it has its own." The Sparky line answers this for Walmart, and the "participate" quote answers it for Amazon. Keep both.
- "Signing doesn't stop an agent inside my logged-in account." Answered by the scoped cut above plus the OpenAI line: controls cap the damage and don't erase it.

### Voice and bans (structural level)
- 0 em dashes. No "hire/hired." No Kauffman. No rent-tax spine. No title-echo close.
- 🟡 "which agent is at the door" casts the agent as a visitor. Rewrite as the site verifying which agent sent a request.
- First person appears only in the Walmart beat, where it carries lived stake. Keep it there.

## Quick Dev Edit

**Working well:** a dated cold open with exact popup text; the Walmart beat is lived and short; the Amazon CAPTCHA clause ties Shawn's workaround to the contract wall without a vendor parade; the land names a concrete counter-example (Shopify).

**Needs attention:**
1. Add the rogue-agent half of the retailers' case (R10).
2. Scope the cut to what Link and signing actually do.
3. Cut three unsupported lines and the $68B line.
4. Add the stake to the dek.

**Overall:** needs another pass. Structure holds; version two applies the fixes above, then line-edit.

## Decisions carried into version two
- Open loop "keep $68B and Sparky?" → keep Sparky, cut $68B.
- Open loop "general mechanism line" → cut ("the customer blames the store").
- Open loop "title: share vs sale" → keep "share" (brief wording).

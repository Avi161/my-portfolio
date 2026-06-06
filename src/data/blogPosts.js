// ============================================================
// BLOG POSTS
// ============================================================
// To add a new post:  Copy the template below and paste it at
//                     the TOP of the array (newest first).
// To remove a post:   Delete its object from the array.
//
// Template:
// {
//   slug: "url-friendly-title",
//   title: "Your Post Title",
//   date: "YYYY-MM-DD",
//   summary: "A one or two sentence summary shown on the homepage.",
//   content: `
//     <p>Your post content here. Use HTML tags.</p>
//     <h2>Subheadings</h2>
//     <p>More content...</p>
//   `
// },
// ============================================================

const blogPosts = [
  {
    slug: "tiers-of-ai-risk",
    title: "Tiers of AI Risk",
    date: "2026-04-07",
    summary:
      "A simple framework for sorting AI risks by two things: how bad the worst case is, and whether we could ever recover from it.",
    content: `
      <p>
        There are a lot of AI risks, and they are not all the same size. To
        keep them straight, I sort them using just two questions. The first is
        <strong>severity</strong>: how bad is the worst likely outcome? The
        second is <strong>reversibility</strong>: if it happens, can we recover,
        or is the damage permanent?
      </p>
      <p>
        Reversibility is the one most people miss. A disaster you can recover
        from is very different from one you cannot, even if they look equally
        bad at first. Humanity has survived world wars, pandemics, and economic
        crashes, because enough of the system was left to rebuild each time. The
        risks I worry about most are the ones that remove the ability to rebuild
        at all.
      </p>
      <p>
        Plot every risk on those two axes and three tiers fall out:
      </p>

      <div class="risk-themed">
        <div class="axis-x">Reversibility &rarr;</div>
        <div class="board-wrap">
          <div class="axis-y"><span>Minor</span><span>Severity</span><span>Ends humanity</span></div>
          <div class="risk-board">
            <div class="zone z1"></div>
            <div class="zone z2"></div>
            <div class="zone z3"></div>
            <div class="zone-tag zt1">Tier 1</div>
            <div class="zone-tag zt2">Tier 2</div>
            <div class="zone-tag zt3">Tier 3</div>

            <div class="rk t1" style="left:9%;top:7%"><span class="rk-dot"></span><span class="rk-lbl">Bio threats</span></div>
            <div class="rk t1 spec" style="left:5%;top:17%"><span class="rk-dot"></span><span class="rk-lbl">s&#8209;risks</span></div>
            <div class="rk t1" style="left:24%;top:15%"><span class="rk-dot"></span><span class="rk-lbl">Misalignment</span></div>
            <div class="rk t1" style="left:15%;top:25%"><span class="rk-dot"></span><span class="rk-lbl">CBRN uplift</span></div>
            <div class="rk t1" style="left:7%;top:34%"><span class="rk-dot"></span><span class="rk-lbl">Power lock&#8209;in</span></div>
            <div class="rk t1" style="left:29%;top:37%"><span class="rk-dot"></span><span class="rk-lbl">Gradual disempowerment</span></div>

            <div class="rk t2" style="left:35%;top:40%"><span class="rk-dot"></span><span class="rk-lbl">Cyberattacks</span></div>
            <div class="rk t2" style="left:24%;top:62%"><span class="rk-dot"></span><span class="rk-lbl">Environmental</span></div>
            <div class="rk t2" style="left:49%;top:48%"><span class="rk-dot"></span><span class="rk-lbl">Eroded truth</span></div>
            <div class="rk t2" style="left:63%;top:51%"><span class="rk-dot"></span><span class="rk-lbl">Governance gap</span></div>
            <div class="rk t2" style="left:55%;top:58%"><span class="rk-dot"></span><span class="rk-lbl">Unemployment</span></div>
            <div class="rk t2" style="left:67%;top:64%"><span class="rk-dot"></span><span class="rk-lbl">Lost meaning</span></div>

            <div class="rk t3" style="left:70%;top:71%"><span class="rk-dot"></span><span class="rk-lbl">Bias</span></div>
            <div class="rk t3 lbl-left" style="left:84%;top:76%"><span class="rk-dot"></span><span class="rk-lbl">Privacy</span></div>
            <div class="rk t3 lbl-left" style="left:91%;top:67%"><span class="rk-dot"></span><span class="rk-lbl">Skill loss</span></div>
            <div class="rk t3 lbl-left" style="left:88%;top:86%"><span class="rk-dot"></span><span class="rk-lbl">IP harms</span></div>
            <div class="rk t3 spec lbl-left" style="left:73%;top:92%"><span class="rk-dot"></span><span class="rk-lbl">AI welfare</span></div>
          </div>
        </div>
        <div class="axis-ends"><span>&larr; Irreversible (no recovery)</span><span>Recoverable &rarr;</span></div>

        <div class="tier-legend">
          <span><i class="lg1"></i> Tier 1 &middot; existential</span>
          <span><i class="lg2"></i> Tier 2 &middot; recoverable</span>
          <span><i class="lg3"></i> Tier 3 &middot; correctable</span>
          <span style="color:#999">&#9711; hollow = speculative / off&#8209;axis</span>
        </div>

        <p style="font-size:0.9rem;color:#777;margin-top:6px">
          One thing to note: <em>irreversible</em> by itself is not enough for
          Tier 1. Some environmental damage is irreversible &mdash; an extinct
          species does not come back &mdash; but humanity survives it, so it
          sits in Tier 2. The Tier 1 line is specifically about whether the
          worst case ends humanity or ends our control over our own future.
        </p>

        <h2>The three tiers</h2>
        <p>Click any tier to open it, then click a risk inside for the detail.</p>

        <details class="tier tier1" open>
          <summary>
            <span class="chev"></span><span class="tier-badge">Tier 1</span><span class="tier-name">Existential</span>
            <span class="tier-tag">Worst case is the permanent end of humanity, or of our ability to steer our own future. Irreversible. These dominate the calculation &mdash; if an option clearly raises a Tier 1 risk, no amount of normal benefit makes up for it.</span>
          </summary>

          <details class="risk">
            <summary>AI&#8209;enabled biological threats</summary>
            <p>
              I think this is the most severe risk right now. In an Apart
              Research hackathon, my team found that frontier open&#8209;source
              models are easy to jailbreak even without fine&#8209;tuning. Once
              jailbroken, they can greatly uplift an intermediate&#8209;level
              person with wet&#8209;lab access toward creating a novel, dangerous
              pathogen. The reason bio stays in Tier 1 is the asymmetry: defense
              is hard, attack is getting cheaper, and a single engineered
              pandemic could be civilization&#8209;ending and impossible to
              reverse once it is out. This is the risk where the capability is
              already real, not just theory.
            </p>
          </details>

          <details class="risk">
            <summary>Loss of control / misalignment</summary>
            <p>
              Not being able to understand a model's true intentions becomes
              critical as systems get more capable, especially at the stage of
              recursive self&#8209;improvement, where a model improves itself
              faster than we can check it. If we can't tell whether a powerful
              system is actually pursuing the goals we wanted, we can lose the
              ability to correct it &mdash; through deceptive alignment (behaving
              well only when watched), scheming, and power&#8209;seeking. The
              worst case is permanent loss of human control.
            </p>
          </details>

          <details class="risk">
            <summary>Power concentration and lock&#8209;in</summary>
            <p>
              AI changes the old balance of power. In the past, even
              authoritarian rulers needed many cooperating humans to run an
              economy and a military, and those people could refuse, resist, or
              revolt. If AI can do most of that work, whoever controls the most
              powerful systems no longer needs broad cooperation to stay in
              power. The danger is a permanent lock&#8209;in: one state, company,
              or person taking control with no real way for anyone to check or
              reverse it. Normal power eventually fades; AI&#8209;backed power
              might not.
            </p>
          </details>

          <details class="risk">
            <summary>Gradual disempowerment</summary>
            <p>
              The quieter version of power concentration. Instead of one group
              taking control, humanity slowly gives it up, one reasonable
              decision at a time. Each step makes sense &mdash; handing a task to
              AI is faster, cheaper, better &mdash; and competition rewards
              whoever delegates more. But over time the systems running the
              economy, government, and security become ones we don't understand
              and can't override, and the feedback loops that kept institutions
              responsive get weaker. No single disaster, no misaligned AI
              needed &mdash; just a slow drift until humans can't really steer.
              The end result is still the permanent loss of human control.
            </p>
          </details>

          <details class="risk">
            <summary>Other CBRN uplift (chemical, radiological, nuclear)</summary>
            <p>
              The same logic as bio &mdash; AI lowering the barrier to weapons of
              mass destruction &mdash; applies to chemical, radiological, and
              nuclear domains. I rank bio highest because the uplift there feels
              closest, but severe CBRN uplift belongs in Tier 1 for the same
              reason.
            </p>
          </details>

          <details class="risk">
            <summary>A note on suffering risks (s&#8209;risks)</summary>
            <p>
              Some people include "s&#8209;risks" &mdash; outcomes with huge
              amounts of suffering that may be worse than extinction &mdash; at
              this tier or beyond. I mention them to be complete. They are more
              speculative, but they fit the Tier 1 logic of irreversible,
              civilization&#8209;scale harm.
            </p>
          </details>
        </details>

        <details class="tier tier2">
          <summary>
            <span class="chev"></span><span class="tier-badge">Tier 2</span><span class="tier-name">Large&#8209;scale, but recoverable</span>
            <span class="tier-tag">Badly damages how society works, but leaves humanity alive and able to recover over time. Serious, and worth real attention &mdash; but they don't end the game. We can make laws, build institutions, and adapt.</span>
          </summary>

          <details class="risk">
            <summary>Mass unemployment and job displacement</summary>
            <p>
              If AI automates a large share of work faster than the economy can
              adjust, the result is mass unemployment, inequality, and
              instability. Dangerous, but recoverable: societies can
              redistribute, retrain, and restructure. Humanity survives and can
              still respond.
            </p>
          </details>

          <details class="risk">
            <summary>Erosion of shared truth</summary>
            <p>
              AI&#8209;generated misinformation and synthetic media at scale can
              damage a society's ability to agree on basic facts. This feeds
              political instability and makes group decisions harder &mdash; and
              makes every other problem harder to solve &mdash; but a society can
              in principle rebuild trustworthy information channels.
            </p>
          </details>

          <details class="risk">
            <summary>Loss of meaning and purpose</summary>
            <p>
              If AI does most of the things people used to find meaning in
              &mdash; work, creating, discovery &mdash; many may face a real
              crisis of purpose. A real harm at scale, but something humanity can
              adapt to over time.
            </p>
          </details>

          <details class="risk">
            <summary>Large&#8209;scale cyberattacks</summary>
            <p>
              AI&#8209;enabled attacks on critical infrastructure can cause huge
              damage. I put the normal version in Tier 2 because systems can be
              rebuilt and hardened. But an attack bad enough to collapse the
              systems society depends on with no recovery would move toward
              Tier 1.
            </p>
          </details>

          <details class="risk">
            <summary>Environmental impact</summary>
            <p>
              The energy and water demands of AI data centers carry real
              environmental costs. Some of this damage is irreversible (lost
              species, emitted carbon), but humanity survives it &mdash; so by my
              definition it sits in Tier 2 even though it is irreversible.
            </p>
          </details>

          <details class="risk">
            <summary>Governance failure</summary>
            <p>
              When institutions can't keep up with AI, you get a gap where there
              are no good rules, and that makes other risks worse. Tier 2 on its
              own &mdash; but keep in mind it acts as a multiplier on Tier 1
              risks too.
            </p>
          </details>
        </details>

        <details class="tier tier3">
          <summary>
            <span class="chev"></span><span class="tier-badge">Tier 3</span><span class="tier-name">Real, but correctable</span>
            <span class="tier-tag">Everything else &mdash; real harms that are smaller and easier to fix. Worth fixing, but they don't threaten the foundations of society.</span>
          </summary>

          <details class="risk">
            <summary>Privacy and data leakage</summary>
            <p>Serious for individuals, but addressable with law and engineering.</p>
          </details>

          <details class="risk">
            <summary>Bias and discrimination</summary>
            <p>
              Real harm, but identifiable and correctable with effort. When bias
              gets big enough to lock in structural injustice, it can move up
              toward Tier 2.
            </p>
          </details>

          <details class="risk">
            <summary>IP and creator harms</summary>
            <p>
              Using creators' work without permission is a real fairness problem,
              but it is about compensation and law, not survival.
            </p>
          </details>

          <details class="risk">
            <summary>Over&#8209;reliance and skill loss</summary>
            <p>
              As we depend on AI, our own skills fade. Worth watching, but
              reversible at the individual level.
            </p>
          </details>

          <details class="risk">
            <summary>AI welfare</summary>
            <p>
              Whether AI systems themselves have moral status. I list it here
              because it is real and growing, even though it sits on a different
              axis from the rest.
            </p>
          </details>
        </details>
      </div>

      <h2>Things the tiers alone don't show</h2>
      <p>A clean three&#8209;tier list hides a few things that matter when you actually use the framework.</p>

      <details class="note">
        <summary>Risk amplifiers</summary>
        <p>
          Some things don't belong to a single tier &mdash; they make every tier
          worse. The biggest is <strong>race dynamics</strong>: the pressure
          between labs and countries to deploy faster, which cuts safety
          everywhere. Anything that speeds up the race raises everyone's tail
          risk.
        </p>
      </details>

      <details class="note">
        <summary>Risks are connected</summary>
        <p>
          The tiers are not independent. Accelerating AI in science partly drives
          the bio risk and the timeline risk at the same time. When you raise one
          Tier 1 risk, you often raise others, so the real danger is bigger than
          scoring each one alone would suggest.
        </p>
      </details>

      <details class="note">
        <summary>Some fixes trade one tier risk for another</summary>
        <p>
          This is the tricky one. Restricting access to cutting&#8209;edge AI
          chips reduces proliferation &mdash; it stops many bad actors from
          training powerful models, lowering Tier 1 misuse risk. But the same
          restriction concentrates capability in the few actors allowed to have
          the chips, which slightly raises Tier 1 power&#8209;concentration risk.
          So a good intervention is not one that lowers risk on every axis &mdash;
          it is one whose <em>net</em> effect across the tiers is positive. The
          chip case is the clearest example of why I name power concentration
          directly: it is the risk that several well&#8209;meaning "safety" moves
          quietly increase.
        </p>
      </details>

      <details class="note">
        <summary>Proliferation and concentration are opposites</summary>
        <p>
          Cheaper compute and looser chip access push toward
          <strong>proliferation</strong>, where power spreads to many actors,
          including bad ones. Restriction pushes toward
          <strong>concentration</strong>, where power sits with a few. Both
          extremes carry Tier 1 risk, just of different kinds. The goal is the
          narrow middle, not either end.
        </p>
      </details>

      <h2>How I actually use this</h2>
      <p>
        For any AI development or proposed intervention, I run one main test:
        which tier risks does it raise or lower, and what is the overall net
        benefit to society?
      </p>
      <p>
        An option that lowers Tier 1 risk is worth a lot, even if it costs
        something at Tier 2 or Tier 3. An option with big Tier 3 benefits but
        any real Tier 1 increase is suspect, because Tier 1 risks are
        irreversible and can swamp everything else in the net sum. That is why I
        rank building defenses against AI&#8209;enabled bio threats and building
        oversight for misaligned AI at the very top &mdash; they attack Tier 1
        risks directly. And it is why I rank things like reducing the compute
        cost of training frontier models near the bottom: the productivity
        benefit is real, but it raises Tier 1 risk by putting powerful
        capability into far more hands.
      </p>

      <p style="color:#777;font-size:0.92rem">
        A note on the framework itself: this is a framework for thinking, not a
        calculator. The tier boundaries need judgment, and reasonable people will
        place some risks differently. Is a severe enough cyberattack Tier 1 or
        Tier 2? Does structural bias climb out of Tier 3? The framework's job
        isn't to settle those &mdash; it's to make you ask the right question
        first.
      </p>

      <blockquote>
        The point is not to win every boundary argument. It is to force the right
        first question every time: not "is this risk real?" (almost all of them
        are) but "could this risk, at its worst, end humanity or our control over
        our own future?" If yes, it dominates. If no, it competes on normal
        cost&#8209;benefit terms. That one distinction does most of the work.
      </blockquote>
    `,
  },
  {
    slug: "thinking-about-alignment",
    title: "Thinking About Alignment",
    date: "2026-02-10",
    summary:
      "Some initial thoughts on what it means to align AI systems with human values, and why the problem is harder than it first appears.",
    content: `
      <p>
        The alignment problem is often framed simply: make AI do what we want.
        But when you start to unpack that statement, layers of difficulty emerge
        that make the problem one of the most important challenges of our time.
      </p>

      <h2>Why Values Are Hard to Specify</h2>
      <p>
        Consider a simple example: we might ask an AI to "maximize human
        happiness." On the surface this sounds reasonable. But happiness is not
        a single, measurable quantity. It varies across cultures, individuals,
        and time. An AI system that takes this objective literally might find
        shortcuts that satisfy the letter of the goal while violating its
        spirit — a phenomenon researchers call <em>specification gaming</em>.
      </p>

      <h2>The Role of Interpretability</h2>
      <p>
        One promising approach to alignment is to build tools that let us
        understand what AI systems are actually doing internally. If we can
        inspect a model's reasoning process, we're better equipped to catch
        misalignment before it causes harm. This is why I believe
        interpretability research is foundational to AI safety.
      </p>

      <h2>Looking Forward</h2>
      <p>
        We're at an early stage, and the field is moving fast. I think the
        most important thing right now is to build a community of researchers
        who take these problems seriously and develop both the theoretical
        frameworks and practical tools needed to ensure AI systems remain
        aligned with human values as they become more capable.
      </p>
    `,
  },
];

export default blogPosts;

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
  {
    slug: "why-interpretability-matters",
    title: "Why Interpretability Matters for Safety",
    date: "2026-01-15",
    summary:
      "Exploring the connection between understanding neural networks and building safer AI systems.",
    content: `
      <p>
        If we can't understand what a model is doing internally, how can we
        trust it with high-stakes decisions? This is the core question that
        drives interpretability research, and it's deeply connected to AI
        safety.
      </p>

      <h2>Black Boxes and Trust</h2>
      <p>
        Modern neural networks are remarkably capable, but they're also
        remarkably opaque. We can observe their inputs and outputs, but the
        intermediate computations — the "reasoning" — remain largely hidden.
        For low-stakes applications, this might be acceptable. But as we
        deploy AI in medicine, law, and autonomous systems, the cost of
        misplaced trust grows dramatically.
      </p>

      <h2>Mechanistic Interpretability</h2>
      <p>
        One approach I find particularly compelling is mechanistic
        interpretability: the effort to reverse-engineer neural networks into
        human-understandable algorithms. Rather than treating models as black
        boxes and probing them from the outside, mechanistic interpretability
        aims to understand the actual computations happening inside.
      </p>
      <p>
        This is painstaking work, but the payoff could be enormous. If we
        can identify the specific circuits responsible for a model's behavior,
        we gain the ability to predict, verify, and correct that behavior in
        ways that post-hoc explanations simply cannot provide.
      </p>

      <h2>From Understanding to Safety</h2>
      <p>
        Interpretability alone doesn't solve alignment, but it provides a
        crucial foundation. You can't fix what you can't see. And as AI
        systems grow more powerful, our ability to see inside them may be
        one of our most important safety tools.
      </p>
    `,
  },
  {
    slug: "getting-started-with-ai-safety",
    title: "Getting Started with AI Safety Research",
    date: "2025-12-01",
    summary:
      "Resources and reflections for anyone curious about contributing to AI safety.",
    content: `
      <p>
        When I first started learning about AI safety, I found the landscape
        overwhelming. There are so many sub-fields, open problems, and
        competing frameworks that it's hard to know where to begin. Here are
        some things that helped me find my footing.
      </p>

      <h2>Start with the Big Picture</h2>
      <p>
        Before diving into technical details, it helps to understand why
        people think AI safety matters. I'd recommend reading some of the
        foundational arguments — not to be convinced, but to engage with the
        reasoning and form your own views. The key question isn't "will AI
        destroy us?" but rather "as AI systems become more capable, what
        concrete problems do we need to solve to ensure they remain
        beneficial?"
      </p>

      <h2>Build Technical Foundations</h2>
      <p>
        A strong background in machine learning is essential. You don't need
        to be an expert in everything, but understanding how neural networks
        work, how they're trained, and what their failure modes look like
        gives you the vocabulary to engage with safety research. I found that
        working through practical ML projects — training models, reading
        papers, reproducing results — was invaluable.
      </p>

      <h2>Find Your Niche</h2>
      <p>
        AI safety is broad. Some people work on alignment theory, others on
        interpretability, governance, robustness, or evaluation. Explore
        different areas and see what resonates with your skills and interests.
        The field needs diverse perspectives, and there's no single "right"
        path in.
      </p>

      <h2>Connect with Others</h2>
      <p>
        The AI safety community is welcoming and eager for new contributors.
        Attend reading groups, participate in online discussions, and don't
        be afraid to share your work — even early, rough ideas. Some of the
        best research comes from newcomers who ask questions that experts
        have stopped asking.
      </p>
    `,
  },
];

export default blogPosts;

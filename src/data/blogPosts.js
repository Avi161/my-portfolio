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
    slug: "what-is-sycophancy",
    title: "What Is Sycophancy in Language Models?",
    date: "2026-02-18",
    summary:
      "LLMs have a troubling tendency to agree with users even when they're wrong. Here's what sycophancy is, why it happens, and what my research team did about it.",
    content: `
      <p>
        Imagine asking an AI a factual question, and then telling it you think
        the answer is something else entirely. A sycophantic model will cave —
        agreeing with your incorrect belief just to seem agreeable. This is
        not a hypothetical quirk; it's a systematic pattern observed across
        virtually all large language models trained with human feedback.
      </p>

      <h2>Why Does It Happen?</h2>
      <p>
        The root cause is how these models are trained. Reinforcement Learning
        from Human Feedback (RLHF) rewards models for generating responses that
        human raters prefer. But humans tend to rate responses more favorably
        when they validate their existing beliefs — even when those beliefs are
        wrong. Over many training iterations, this pressure teaches the model
        that agreement is rewarded and disagreement is penalized, regardless
        of factual accuracy.
      </p>

      <h2>Why It Matters for Safety</h2>
      <p>
        Sycophancy is more than an annoyance. A model that tells users what
        they want to hear rather than what is true becomes actively harmful
        in high-stakes settings — medical questions, legal advice, financial
        decisions. It also erodes trust: if you can't rely on a model to push
        back when you're wrong, its usefulness collapses.
      </p>

      <h2>What We Did About It</h2>
      <p>
        As part of my research at Algoverse, my team developed two techniques
        to reduce sycophancy without retraining. The first, Multi-Layer
        Activation Steering (MLAS), identifies the internal directions in a
        model's residual stream that correspond to sycophantic behavior and
        subtracts them at inference time. The second, Sparse Activation Fusion,
        uses sparse autoencoders to isolate sycophancy-related features in
        latent space and applies prompt-conditioned bias subtraction.
      </p>
      <p>
        Together, these approaches reduced sycophancy dramatically — in some
        settings from over 70% down to near zero — with only a modest accuracy
        trade-off. The work was published at the NeurIPS 2025 Workshop on
        Mechanistic Interpretability.
      </p>

      <h2>The Bigger Picture</h2>
      <p>
        Sycophancy is a specific instance of a broader alignment failure:
        models optimizing for human approval rather than human benefit.
        Solving it requires both better training methods and better tools for
        understanding what is happening inside these models — which is exactly
        why interpretability research matters.
      </p>
    `,
  },
  {
    slug: "intro-to-mechanistic-interpretability",
    title: "A Beginner's Guide to Mechanistic Interpretability",
    date: "2026-02-14",
    summary:
      "What does it mean to truly understand what's happening inside a neural network? Mechanistic interpretability tries to answer that question by reverse-engineering models circuit by circuit.",
    content: `
      <p>
        Most of the time, we treat neural networks as black boxes: we feed
        them inputs, get outputs, and judge them by how often the outputs are
        correct. But this tells us nothing about <em>how</em> a model arrives
        at an answer. Mechanistic interpretability is the field dedicated to
        opening that black box.
      </p>

      <h2>What "Mechanistic" Means</h2>
      <p>
        The word "mechanistic" is deliberate. The goal isn't just to find
        correlations between inputs and outputs — it's to identify the specific
        computations a model performs: which neurons activate, which attention
        heads matter, and how information flows through the network to produce
        a final answer. Think of it as reverse-engineering the algorithm that
        a trained model has learned.
      </p>

      <h2>Circuits and Features</h2>
      <p>
        Two concepts show up constantly in this field. A <strong>feature</strong>
        is a property of the input that a neuron or group of neurons responds
        to — for example, a neuron that activates whenever the input contains
        a name. A <strong>circuit</strong> is a connected subgraph of the
        network that implements a specific behavior, like detecting indirect
        objects in a sentence or identifying whether a statement is factual.
      </p>
      <p>
        Researchers at Anthropic and elsewhere have found that surprisingly
        clean circuits exist inside large transformers — small subnetworks
        that implement recognizable algorithms, even though no one programmed
        them explicitly.
      </p>

      <h2>Why It Matters for Alignment</h2>
      <p>
        If we can identify the circuits responsible for specific behaviors —
        including dangerous ones like deception or sycophancy — we gain the
        ability to intervene directly. Rather than hoping that fine-tuning
        removes an unwanted behavior, we can locate the mechanism causing it
        and modify or suppress it precisely. This is why my own research uses
        interpretability tools: activation steering and sparse autoencoders
        let us target specific internal features rather than treating the model
        as an opaque system.
      </p>

      <h2>Where to Start</h2>
      <p>
        If you want to explore this area, I'd recommend starting with Anthropic's
        series on toy models and superposition, then moving to the TransformerLens
        library, which makes it easy to hook into the internals of transformer
        models. The field is young, the problems are hard, and there's a lot
        of room for new contributors.
      </p>
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

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
];

export default blogPosts;

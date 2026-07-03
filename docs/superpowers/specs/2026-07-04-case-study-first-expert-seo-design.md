# Case Study First + Expert Articles SEO Design

## Goal

Strengthen `paulislava.space` as a portfolio-first site where projects are the main proof of expertise and articles act as the expert explanation layer. The site should become easier to understand for:

- human visitors evaluating engineering depth;
- classic search engines indexing topic clusters;
- LLM-based systems extracting expertise, case studies, and supporting articles.

## Product Direction

The site should present Pavel first through real engineering case studies, then reinforce those cases with articles that explain the decisions, trade-offs, and implementation thinking behind the work.

This is not a shift away from articles. It is a tighter connection between:

- `project -> proof of execution`
- `article -> proof of thinking`

## Scope

This design covers:

- homepage positioning and content hierarchy;
- project page structure as case studies;
- article page structure as expert analysis;
- dynamic `llms.txt` and `llms-full.txt` delivery via Next;
- SEO and structured-data improvements that support the case-study-first direction.

This design does not include:

- major CMS schema redesign;
- new admin/editor UI;
- Bing Webmaster setup;
- unrelated visual redesign outside the affected sections.

## Homepage Changes

### Positioning

The homepage should communicate three things quickly:

1. Pavel's engineering focus.
2. The most credible project evidence.
3. The article layer that explains how he thinks.

### Content Changes

- Tighten the hero copy around 2-3 strongest expertise areas.
- Reframe the projects section from a generic portfolio listing into highlighted case studies.
- Add stronger outcome-oriented cues to project cards or previews.
- Reframe the article section as expert breakdowns, not just recent posts.

### Information Hierarchy

Recommended hierarchy:

1. Identity and specialization
2. Featured case studies
3. Expert articles connected to those case studies
4. Remaining supporting sections

## Project Page Changes

Each project page should read as a case study instead of a simple portfolio detail page.

### New/Expanded Sections

- Context
- Problem / task
- Pavel's role
- Constraints
- Solution
- Result / impact
- Technology stack
- Related articles
- FAQ

### Behavioral Goal

The reader should quickly understand:

- what kind of engineering problem this project represents;
- how Pavel contributed;
- what technical choices were made;
- where to read deeper reasoning in article form.

## Article Page Changes

Articles should become stronger expert assets connected to applied work.

### New/Expanded Sections

- Clear framing of the engineering topic or problem
- Why the topic matters in production practice
- Related projects where the ideas were applied
- Stronger thematic linking to adjacent articles and projects

### Behavioral Goal

The reader should understand that the article is not abstract content marketing. It should clearly connect to real engineering practice.

## Linking Model

The site should establish explicit bidirectional links:

- project pages link to relevant articles;
- article pages link to relevant projects.

This creates a stronger topical graph for:

- internal navigation;
- search engine understanding;
- LLM retrieval and summarization.

## LLM Files

### Hard Requirement

Both `llms.txt` and `llms-full.txt` must be implemented as dynamic Next route handlers, not static files.

### `llms.txt`

Purpose:

- concise machine-readable overview of the site;
- main expertise areas;
- important projects;
- important articles;
- high-signal entry points.

Characteristics:

- short;
- high-signal;
- optimized for discovery and routing.

### `llms-full.txt`

Purpose:

- richer machine-readable expertise layer;
- expanded summaries of key projects and key articles;
- explicit mapping between projects and articles;
- more context for AI systems that want a fuller representation of the site.

Characteristics:

- generated dynamically from current site content;
- more descriptive than `llms.txt`;
- still plain text and easy to parse.

### Data Strategy

Both files should be produced by Next routes from current content sources so they stay aligned with the latest published projects/articles without manual sync drift.

## SEO and Structured Data

### Metadata Direction

- Project pages should be described as case studies / engineering work.
- Article pages should be described as expert analysis / technical writing.
- Homepage metadata should reflect both project execution and expert writing.

### Structured Data Direction

Strengthen structured data so projects and articles are easier to interpret as:

- real portfolio work;
- authored expert material;
- part of one coherent expertise graph.

Where useful, augment existing schema with clearer relationships among:

- person;
- website;
- project/work;
- article.

## Implementation Boundaries

Prefer current project patterns:

- Next App Router route handlers for generated text outputs;
- existing SEO helper utilities where possible;
- minimal, local changes to homepage, project pages, article pages, and SEO helpers;
- no speculative abstraction unless repeated logic clearly needs it.

## Testing and Verification

Implementation should verify:

- `llms.txt` returns dynamic current content;
- `llms-full.txt` returns dynamic current content;
- homepage still renders correctly;
- project and article pages still build/render correctly;
- metadata/schema remain valid and present on key pages.

## Risks

- Overloading the homepage with too much explanatory text.
- Adding weak or repetitive copy instead of high-signal case-study language.
- Producing `llms-full.txt` that is verbose but not meaningfully structured.
- Creating links between projects and articles without strong topical relevance.

## Recommended Implementation Order

1. Dynamic `llms-full.txt` and `llms.txt` content model
2. Homepage reframing
3. Project page case-study structure
4. Article page expert/project linking
5. Metadata and structured-data refinements


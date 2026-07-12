---
name: add-strapi-project
description: Add or update a complete portfolio project on paulislava.space through Strapi, including researching the project website, writing project content, choosing technologies and tags, selecting or generating a cover, uploading media, preserving relations, publishing, revalidating cache, and returning a polished markdown link. Use when the user asks to add a project, add a project from a URL, update project metadata/content, update a project cover, generate a project poster/cover, or publish/revalidate a Strapi project entry for paulislava.space.
---

# Add Strapi Project

## Overview

Use this workflow for portfolio project content on `paulislava.space`. The expected result is a complete published Strapi project with clear expert-style content, relevant tags and technologies, a suitable cover, refreshed frontend cache, and a final answer that includes a clean markdown link to the created or updated project.

## Workflow

1. **Understand the project**
   - Open the provided URL and inspect the live website.
   - Prefer the in-app browser when authentication or user cookies may matter.
   - Capture the real product style: theme, typography, colors, subject matter, hero imagery, and domain.
   - Check page metadata for `og:image`; if it exists and is visually suitable, use it before generating a new cover.
   - If the site is an SPA with empty server HTML, wait for the browser-rendered page before judging screenshots or images.

2. **Prepare project content**
   - Derive the title, slug, URL, short description, long description, technologies, and tags from the live project and user instructions.
   - Write like an expert describing a real engineering case: concrete domain, what the product does, implementation context, stack, and result.
   - Avoid generic AI-sounding phrases, marketing fluff, and repeated boilerplate across projects.
   - Keep the source URL on the project entity when available.

3. **Choose the cover source**
   - If a good existing cover/poster already exists in Strapi and the user did not ask to replace it, keep it.
   - If the project has a suitable `og:image`, upload that image to Strapi and use it.
   - If the current image is weak or missing, generate a new raster cover based on the live site style.
   - Keep generated covers visual and specific to the project. Avoid generic AI-looking gradients, excessive text, fake UI clutter, and repeated template layouts.
   - Use less text by default: usually a logo/name plus visual product cues is enough.

4. **Generate a cover when needed**
   - Use the `imagegen` skill for bitmap generation.
   - Prompt from concrete observations: product domain, colors, visual rhythm, UI motifs, and what the project does.
   - Make the cover suitable for portfolio cards and OpenGraph use, typically a horizontal 16:9 composition.
   - After generation, inspect the output. Reject covers with too much text, misspellings, generic interface blocks, or a style that does not match the source site.
   - Convert to an upload-friendly JPG or PNG with a descriptive filename such as `project-<slug>-cover.jpg`.

5. **Create or update Strapi content**
   - Use Strapi MCP tools when available. If MCP output is truncated or relations look unreliable, verify and repair through the Strapi Content API using credentials from local `.env`; never print tokens.
   - Preserve existing relations when updating a project:
     - technologies
     - tags
     - cover
     - other existing project fields unless intentionally changed
   - For new projects, create a concise expert-style description:
     - `title`
     - `slug`
     - `url`
     - `shortDescription`
     - `description` with practical context and what was built
     - relevant technologies and tags
     - `featured` only when explicitly warranted or requested
   - Upload the selected cover to Strapi media and attach it to the project.

6. **Publish and verify**
   - Publish the project after updates.
   - Verify the published entity through the Strapi Content API with populated `cover`, `technologies`, and `tags`.
   - Confirm:
     - `publishedAt` is present
     - cover URL is the intended image
     - technologies and tags are still attached
     - slug matches the public URL

7. **Revalidate frontend cache**
   - Revalidate at least:
     - `projects`
     - `project-<slug>`
   - Use the existing revalidate secret from `.env`.
   - Do not expose the secret in logs or responses.

8. **Final response**
   - Always answer in Russian.
   - Always include the created or updated entity as a polished markdown link, for example:
     - `[Курсовед на сайте](https://paulislava.space/projects/kursoved-pro)`
   - Briefly say what changed: project created/updated, cover source, publication, verification, revalidation.
   - Mention any verification that could not be completed.

## Guardrails

- Do not replace an existing good cover when the user explicitly says to keep it.
- Do not add Bing or other external webmaster services unless the user asks.
- Do not use raw naked URLs in prose when a named markdown link is clearer.
- Do not hand-copy secrets from `.env` into messages.
- Do not rely only on MCP update output for relation integrity; verify published content after publish.

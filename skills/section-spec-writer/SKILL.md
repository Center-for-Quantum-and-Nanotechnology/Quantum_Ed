---
name: section-spec-writer
description: Write a section instruction spec for the quantum education site in a standard format, built from @context_docs/modules/module_07/specs/07.04.01_SurfaceCodesInstruction.md file as a reference, for handing to Claude Code to build a module section.
---

# Section Spec Writer

Produces a section-specific instructional specification ("Section Instruction") for one lesson of the Quantum Education Repository. The spec tells Claude Code WHAT the learner should learn on one page. The Project Vision (in @context_docs/vision) tells it HOW the platform behaves; the existing repository supplies implementation conventions. The spec must never restate the Vision at length. It points to it and applies it.

Every spec has the same sections, in the same order, in the same voice. Only the topic-specific content changes.

## 1. Gather inputs

Collect these before drafting. Infer from the conversation, earlier specs, or the Vision where possible; ask only for what is genuinely missing (at most 3 short questions).

- Section title, module number and module name
- Where the section sits (e.g. "begins the Scaling portion of Module 07", "closes Module 03")
- The immediately previous section(s) and what they established (terminology, components, interactions)
- The next section (the spec ends by motivating it)
- The core concept and the one-sentence conceptual transition the learner should make
- Likely misconceptions to guard against
- An idea for the main interaction (or derive one: what can the learner manipulate to SEE the concept?)
- Topics that belong to later sections and must be kept out
- The module's established visual language (reuse it; only add new distinctions)
- Shared components: which modules in the component table in @llm/CONVENTIONS.md (section 4) this page will reuse, which new reusable object it introduces, and which later sections will reuse that object (check @context_docs/taxonomy, the module taxonomy, and earlier specs in the module's specs/ folder; if unknown, say so in the spec instead of guessing)

## 2. Spec structure (fixed order)

Separate each top-level section with a line of underscores:
________________________________________

Use the template below. Text in [brackets] is a placeholder; text in (parentheses) is guidance and is not copied into the spec.

```
[Section Title]
Project Context
Before implementing this section, review the project vision document in @context_docs/vision folder and the module taxonomy in @context_docs/modules/module_[NN]/ (the taxonomy_*.md file).
Follow its guidance for:
	progressive experience levels
	V1 development priorities
	reusable architecture
	conceptual accuracy
	accessibility
	interaction design
	continuity between sections
Also review the existing [previous section(s)] sections before implementation. Reuse established components, terminology, visual conventions, and interaction patterns where appropriate.
This section [position in module, e.g. begins the X portion of Module NN].
________________________________________
Goal
Teach the learner how [core idea, framed as building on what they already know].
The central progression is:
[concept] → [concept] → [concept] → [outcome]
The learner should understand that [one-sentence statement of the mental model].
The key conceptual transition is:
[One quotable sentence or two that reframes the topic in terms of prior knowledge.]
This section should prepare the learner for [Next Section].
________________________________________
Learning Outcomes
By the end of the section, the learner should be able to:
	[Verb-led outcome: Explain / Distinguish / Understand / Recognize / Predict ...]
	(8–10 outcomes; concrete, observable, Beginner-level; last one usually points at the problem the next section solves)
________________________________________
Experience-Level Scope
Follow the progressive-depth architecture defined in the project Vision.
Beginner — V1 Requirement
The V1 page should teach:
	[topic]
	(short noun phrases, roughly one per page subsection idea)
[One sentence priority, e.g. Prioritize visual intuition and interaction over mathematical formalism.]
Level map: any Page Structure subsection or interaction that is not Beginner is tagged [Intermediate] or [Advanced] in its heading. Untagged means Beginner.
(The Beginner list is the page's Core Learning Contract; never tag anything essential. Tagged items are built as gated blocks, see @llm/CONVENTIONS.md section 7. Items still under Intermediate / Advanced — Future Hardening are not tagged until they are actually built.)
Intermediate — Future Hardening
Future Intermediate content may add:
	[notation, circuits, formal definitions, more precise geometry, larger examples ...]
Advanced — Future Hardening
Future Advanced content may add:
	[formal treatment, realistic noise, hardware, scaling analysis, variants, research ...]
Do not implement Intermediate or Advanced content merely to make V1 more comprehensive. Preserve clean expansion points for later hardening.
________________________________________
Page Structure
(6–8 numbered subsections. Arc: reconnect → introduce → build → MAIN INTERACTIVE → extend → key distinction/scaling → bridge to next section.)

1. [Bridge From Previous Section]
Begin directly from the previous [X] material.
Revisit the familiar progression:
[step]
↓
[step]
Then ask:
[Question that motivates this section]
Introduce [new concept] as [framing relative to prior knowledge].
The learner should see [new concept] as [generalization/extension] rather than [misconception].

2. [Meet the Core Object]
Introduce [object] in a small, visually understandable form.
Clearly distinguish:
	[Term] — [plain-language role].
	[Term] — [plain-language role].
Do not imply [misconception].
Include a short explanation such as:
[Callout question]
[Callout answer, 1–2 sentences.]

3. [Supporting Concept]
Reconnect to the learner's previous knowledge of [X].
Introduce [concept] conceptually: [1–2 plain statements].
The learner should understand:
[cause]
↓
[effect]
Do not require [formalism] at Beginner level.

4. Main Interactive — “[Interaction Name]”
Make this the primary V1 interaction.
Allow the learner to [action].
At minimum support:
	[option]
	[option]
When [action happens]:
	[visible response]
	[visible response]
	[display derived information separately from the cause]
The learner should visually experience:
[CAUSE]
↓
[RESPONSE]
↓
[OBSERVED INFORMATION]
Reinforce the distinction established earlier in Module [NN]:
[One-sentence principle]
Make the interaction resettable and allow learners to experiment with [variations].

5. [Extension of the Interaction]
Extend the previous interaction from [simple case] to [richer case].
Introduce the term:
[Term]
The learner should discover that [non-obvious insight].
Then show, if practical, [optional richer demonstration].
Ask:
[Question that surfaces ambiguity or tension]
Connect this directly to the previous [X] section:
[Linking sentence]
Do not teach [next-section topic] yet.

6. [Key Parameter / Scaling / Tradeoff]
Introduce [parameter] as the primary [X] concept.
Explain conceptually:
[Plain-language definition]
Optionally introduce: [one small equation], explained visually rather than relying on the equation.
If practical, include an interaction or selector such as:
[Parameter]
[ a ] [ b ] [ c ]
Changing [parameter] should demonstrate:
[chain of consequences with ↓]
Also show the tradeoff:
[chain of costs with ↓]
Do not imply [overclaim].

7. [Key Distinction: A vs. B]
Make the distinction explicit.
[A]
[Definition]
[B]
[Definition]
Use the [visualization] to show that:
[A is not automatically B.]
At Beginner level, [how to show it visually]. [Formal version] can be added at Intermediate depth.

8. From [This Topic] to [Next Topic]
End by comparing [earlier simple example] with [this topic].
[earlier example]
[chain]
versus:
[this topic]
[chain ending in the new need]
Present a final example with [setup].
Ask:
[Question]
Then introduce the next problem:
[Statement of what the next section must solve]
Do not explain [next-section method] here.
End with:
[Motivating question]
Next: [Next Section] →
________________________________________
Visual / UX Requirements
Maintain the visual language established throughout Module [NN]:
	[Color] → [meaning]
	(list the module's existing conventions verbatim)
Add clear visual distinctions for:
	[new element types introduced in this section]
Do not rely on color alone.
The learner should be able to visually distinguish:
[A] ≠ [B] ≠ [C] ≠ [D]
[Responsive note, e.g. Keep the [diagram] readable on smaller screens. Prefer responsive simplification over shrinking a complex diagram until it becomes difficult to interpret.]
________________________________________
Shared Components
(Fill from the component table in @llm/CONVENTIONS.md section 4 and from earlier specs. Full template and a worked example: @context_docs/templates/SharedComponentsSection.md)
Reuse (already exist; do not reimplement):
	[Global name] ([file].js) — [what this page uses it for]
Create (new shared modules, because a later section will reuse them):
	[Qed Name] — [one line: the object it represents]
	Used again by: [later section(s)]
	Data/state layer: [pure data or logic, no DOM]
	Rendering layer: [what draws it]
	Reserved extension points: [variants later sections will add]
Keep page-local (one-off wiring; do not extract):
	[interaction or script only this page needs]
Migrate (optional): [existing page-local logic to move onto a shared module, or "none"]
Separation of concerns:
	[layers that must stay independent, e.g. error model ≠ syndrome ≠ decoder ≠ visualization]
________________________________________
Technical Requirements
	Review and reuse existing [component list] components where appropriate.
	Represent [structure] through reusable data rather than hardcoding individual visual layouts where practical.
	Keep [model], [derived information], and [interpretation logic] conceptually separate.
	Do not implement [next-section algorithm] in this section.
	Structure the [representation] so the later [Next Section] can reuse its [data].
	Support future expansion to [parameter variations] without requiring separate page implementations.
	Use deterministic educational behavior where appropriate rather than building an unnecessary full [simulator].
	Follow the experience-level architecture established in the project Vision so Intermediate and Advanced content can be added later without creating separate versions of the page.
________________________________________
Important Pedagogical Constraints
Do not imply:
[misconception equation, e.g. X = Y]
Instead teach:
[correct framing]
(repeat the pair 1–3 times for the central misconceptions)
Do not imply [further misconception].
(3–6 single-line "Do not imply" items)
Do not teach [later topic] here.
Keep Beginner V1 focused on the mental model required to understand why those later topics are necessary.
________________________________________
End State
The learner should leave with:
[START IN CAPS]
↓
[step]
↓
[END IN CAPS]
And understand the [key] relationship:
[chain]
The central takeaway should be:
[1–2 sentence takeaway]
End with:
[Motivating question for the next section]
Next: [Next Section] →
```

The numbered Page Structure subsections are a default arc, not a rigid list. Rename, merge, or drop subsections 5–7 to fit the topic, but always keep: (1) a bridge from the previous section, exactly one subsection labeled "Main Interactive — “...”" marked as the primary V1 interaction, and a final subsection that compares/motivates and ends with "Next: [Next Section] →".

## 3. Voice and style rules

- Imperative, directive voice addressed to the implementer: "Introduce…", "Show…", "Make this…", "Do not…".
- Short lines. One instruction per line. No long paragraphs.
- Concept flows are written as arrow chains: inline with → for the Goal progression, vertical with ↓ elsewhere. Use ALL CAPS for the start and end nodes of the most important flows.
- Use "Ask:" followed by the exact question the page should pose to the learner.
- Use "The learner should understand / discover / visually experience:" to state the intended takeaway of each subsection.
- Give suggested on-page copy as plain lines after "Include a short explanation such as:"; it is guidance, not mandatory wording.
- Mark optional scope with "if practical" or "optionally".
- Scope fences are explicit and repeated where they matter: "Do not teach [X] yet." / "Do not implement [X] in this section."
- Misconceptions use the paired form "Do not imply: … / Instead teach: …".
- Small math only, always followed by "explained visually rather than relying on the equation".
- Refer to the module's established terminology exactly as earlier sections used it; use slashes for accepted synonyms (e.g. "measurement/check/ancilla qubits").
- Bullet items are tab-indented lines with no bullet characters, matching the sample.
- No module-irrelevant filler, no restating the Vision. Target roughly 1,500–2,200 words.

## 4. Quality checks before delivering

- Goal, End State, and the final "Next:" all point at the same next section.
- Every Learning Outcome is taught somewhere in Page Structure, and nothing in Beginner scope is missing from Page Structure.
- Level-tagged items are never needed for a Learning Outcome in the Beginner list, and the Beginner list stands on its own.
- No Intermediate/Advanced item appears as a V1 requirement.
- The main interactive separates cause from derived/observed information and is resettable.
- Visual requirements reuse the module palette and include a "Do not rely on color alone" line and a ≠ chain.
- Shared Components names real modules from the component table (no invented globals), says which later sections reuse anything new, and extracts nothing that only this page needs.
- Technical Requirements include reuse, data-driven structure, separation of model/logic/visual, a fence on the next section's algorithm, and forward reuse by the next section.
- Every simplification that could create a false mental model has a matching Pedagogical Constraint.

## 5. Output

Write the spec to `context_docs/modules/module_[NN]/specs/[ID]_[SectionTitleNoSpaces]Instruction.md`, where [ID] is the page's taxonomy ID (e.g. `07.04.01_SurfaceCodesInstruction.md`, or `05.01_…` for a page with no subsection), following @context_docs/README.md, and hand it to the user. In the reply, add at most two lines: any assumptions made about previous/next sections, and any open question worth settling before handing the spec to Claude Code.

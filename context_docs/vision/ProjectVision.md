Quantum Education Repository
Project Vision & Architecture
1. Purpose
This repository is an open educational resource for teaching quantum computing to university students, educators, researchers entering the field, and interested members of the broader community.
The project should function as both:
•	a structured learning curriculum, and
•	a browsable technical reference similar in experience to modern SDK documentation.
The site is publicly hosted through GitHub Pages and should remain accessible, modular, maintainable, and extensible.
The long-term goal is not simply to create a collection of pages about quantum computing. The goal is to create a learning platform that can evolve from approachable conceptual instruction into increasingly rigorous technical material without requiring separate beginner, intermediate, and advanced curricula.
________________________________________
2. Core Educational Philosophy
The curriculum follows a progressive-depth model.
Learners should first develop an intuitive mental model before being asked to understand mathematical formalism, implementation details, or research-level concepts.
Whenever possible, instruction should progress approximately as:
intuition → visualization → interaction → terminology → mathematics → implementation → deeper technical treatment
Do not introduce complexity simply because it is technically related to the topic.
Introduce concepts when they are pedagogically useful.
Each section should build deliberately on concepts introduced previously and should avoid prematurely teaching material that belongs in later sections.
________________________________________
3. Experience-Level Architecture
The long-term site should support three cumulative experience levels:
Beginner
Beginner content establishes the essential conceptual model.
It should emphasize:
•	intuitive explanations
•	diagrams
•	visualizations
•	simple examples
•	interactive demonstrations
•	essential vocabulary
•	minimal necessary mathematics
A learner should be able to understand the central idea without needing an advanced mathematics, physics, or computer science background unless a prerequisite is explicitly stated.
Beginner content represents the core learning contract of a page.
________________________________________
Intermediate
Intermediate mode includes everything available at the Beginner level and adds greater technical depth.
Intermediate content may introduce:
•	additional mathematical notation
•	circuit representations
•	formal terminology
•	larger or more realistic examples
•	implementation details
•	algorithmic reasoning
•	programming examples
•	more challenging exercises
•	additional edge cases and limitations
Intermediate content should deepen the Beginner mental model rather than replace it.
________________________________________
Advanced
Advanced mode includes Beginner and Intermediate material and adds the deepest technical treatment appropriate for the curriculum.
Advanced content may include:
•	formal derivations
•	detailed algorithms
•	advanced mathematical treatment
•	realistic noise models
•	hardware considerations
•	scaling and performance analysis
•	research-level concepts
•	current implementation approaches
•	SDK or hardware-specific examples
•	links to relevant papers and technical resources
Advanced content should remain educational rather than becoming an unstructured collection of research material.
________________________________________
4. Levels Are Cumulative
Experience levels are not independent versions of a page.
The intended behavior is:
Beginner
→ Beginner content
Intermediate
→ Beginner + Intermediate content
Advanced
→ Beginner + Intermediate + Advanced content
There should be one canonical page and one conceptual learning progression.
Do not create three separate implementations of the same lesson.
Where practical, content and components should support metadata or another maintainable mechanism identifying their minimum experience level.
The architecture should make it possible to progressively add Intermediate and Advanced content as the curriculum is hardened over time.
________________________________________
5. V1 Development Strategy
The immediate objective is a strong V1 curriculum.
Do not delay V1 implementation attempting to fully populate every experience level.
For V1, prioritize:
•	technically accurate core concepts
•	strong Beginner explanations
•	coherent progression between sections
•	useful visualizations
•	meaningful interactions
•	consistent UX
•	reusable components
•	responsive design
•	accessibility
•	maintainable architecture
Intermediate and Advanced material may initially be limited or absent.
However, new components and page structures should avoid architectural decisions that would make progressive-depth content difficult to add later.
Build the foundation now; depth can be added during later content-hardening passes.
________________________________________
6. Core Learning Contract
Every instructional page should have a set of concepts that every learner is expected to understand regardless of selected experience level.
This is the page's Core Learning Contract.
Experience levels deepen that understanding.
They should not fundamentally change the conceptual story being taught.
For example:
Beginner establishes the mental model.
Intermediate explains more precisely how that model works.
Advanced explores the formalism, implementation, limitations, and deeper consequences of that model.
Essential information must never become accessible only because a learner selected Advanced mode.
________________________________________
7. Experience Level vs. Optional Exploration
Do not treat experience level and optional exploration as the same feature.
The site may contain expandable elements such as:
•	"Going Deeper"
•	"Explore"
•	"See the Circuit"
•	"Why?"
•	"Show the Math"
•	additional visualizations
•	supplementary examples
These may be useful at any experience level.
For example, a Beginner learner should still be allowed to open an optional circuit visualization out of curiosity without changing the entire site to Intermediate mode.
Experience level controls the expected depth of the curriculum.
Expandable content allows learners to explore beyond the primary instructional flow.
________________________________________
8. Page Design Philosophy
Pages should not resemble textbook chapters consisting primarily of long blocks of text.
Whenever appropriate, prefer:
•	diagrams
•	animations
•	interactive demonstrations
•	step-by-step visual explanations
•	comparison cards
•	small equations paired with visual meaning
•	interactive exercises
•	immediate feedback
•	progressive disclosure
Text should explain and support the learning experience rather than dominate it.
However, interactions should always serve a pedagogical purpose.
Do not add animation or interaction merely for visual novelty.
A learner should be able to answer:
"What is this interaction teaching me?"
________________________________________
9. Conceptual Accuracy
Educational simplification is encouraged when it improves understanding, but simplification must not create a false mental model that later needs to be unlearned.
When using simplified teaching examples:
1.	Clearly identify them as simplified examples when necessary.
2.	Explain their important limitations.
3.	Avoid implying that the example represents all quantum systems.
4.	Create a deliberate transition toward the more general concept.
Conceptual accuracy takes priority over visual convenience.
If an requested visualization or interaction would teach something technically incorrect, do not implement the misconception literally. Instead, preserve the educational intent while using a technically defensible representation.
________________________________________
10. Progressive Mathematics
Mathematics should generally follow conceptual understanding rather than precede it.
Prefer:
concept → visual → equation → interpretation
rather than:
equation → derivation → explanation
Beginner sections should use only mathematics necessary to support the mental model.
Intermediate sections can introduce greater formalism.
Advanced sections may contain rigorous mathematical treatment where appropriate.
Equations should be connected to their physical or computational meaning whenever possible.
________________________________________
11. Continuity Between Sections
The curriculum should feel like one connected learning journey rather than a collection of independent articles.
Each section should consider:
•	What has the learner already learned?
•	What terminology has already been established?
•	What visual language has already been established?
•	What components can be reused?
•	What misconception should be avoided?
•	What question should the learner naturally ask next?
Whenever appropriate, sections should begin by reconnecting to prior knowledge and end by motivating the next topic.
Do not unnecessarily reteach concepts already established unless reinforcement is pedagogically useful.
________________________________________
12. Interactive Learning
Interactive components are a major part of the educational strategy.
Interactions should allow learners to experiment with the concept being taught.
Good interactions may allow learners to:
•	manipulate a quantum state
•	introduce an error
•	change a parameter
•	run a conceptual experiment
•	observe a syndrome
•	predict an outcome
•	compare alternatives
•	reset and try again
Whenever possible, provide immediate explanatory feedback.
Interactions should generally be deterministic when teaching a specific concept unless randomness itself is part of the lesson.
The learner should be encouraged to explore rather than simply click through an animation.
________________________________________
13. Visual Language
Maintain visual consistency across modules.
Where a visual vocabulary has already been established, reuse it.
For Module 07 — Quantum Error Correction, the current language includes approximately:
•	Blue — logical information / quantum state
•	Gray or neutral — physical qubits
•	Orange / red — noise and physical errors
•	Purple — syndrome / stabilizer / check information
•	Green — successful protection, recovery, or correction
Do not arbitrarily change established visual meanings between pages.
Future modules may establish additional visual conventions, but those conventions should remain internally consistent.
________________________________________
14. Reusable Architecture
Avoid implementing every page as an isolated one-off experience.
When a visualization, concept, or interaction is likely to appear again, prefer reusable components and data structures.
Examples include:
•	qubit representations
•	quantum-state displays
•	error injection
•	syndrome displays
•	stabilizer representations
•	circuit views
•	probability/noise controls
•	code lattices
•	decoder visualizations
•	reset controls
•	educational callouts
Separate underlying conceptual/data logic from visualization logic when practical.
For example:
error model ≠ decoder ≠ visualization
This allows future lessons to replace one layer without rebuilding the others.
________________________________________
15. Maintainability
This is an ongoing university educational project and should be maintainable by future contributors.
Prefer:
•	clear component boundaries
•	readable code
•	reusable components
•	simple data models
•	documentation
•	descriptive naming
•	minimal dependencies
•	existing project conventions
Avoid:
•	unnecessary frameworks
•	unnecessary dependencies
•	duplicated components
•	highly coupled page-specific logic
•	excessive abstraction without educational benefit
•	building full simulation engines when deterministic educational models are sufficient
The objective is an educational platform, not a general-purpose quantum simulator.
________________________________________
16. Existing Project First
Before implementing a new section:
1.	Inspect the existing repository.
2.	Review the relevant previous sections.
3.	Identify existing reusable components.
4.	Identify established styling and visual conventions.
5.	Understand navigation and page architecture.
6.	Review the section-specific instructional specification.
7.	Determine how the new section connects to the previous and following sections.
Do not assume that a new component is required before checking whether an appropriate implementation already exists.
Preserve the site's established design language.
________________________________________
17. External Tools and SDKs
The curriculum may eventually incorporate quantum SDKs, simulators, cloud platforms, and hardware providers.
These should support the educational objective rather than define the curriculum.
Whenever possible, teach the underlying concept first.
Then show how that concept appears in tools such as quantum SDKs, simulators, or hardware platforms.
Avoid making fundamental lessons unnecessarily dependent on one vendor.
Vendor-specific implementation can be introduced when it provides educational value.
________________________________________
18. Accessibility and Public Education
This resource is intended for public use.
Pages should therefore consider:
•	keyboard navigation
•	readable typography
•	sufficient contrast
•	responsive design
•	screen-reader compatibility
•	alternatives to color-only communication
•	clear labels
•	understandable error states
•	mobile usability where practical
Do not assume every learner has access to quantum hardware, paid software, or specialized development environments.
Core educational material should remain freely accessible.
________________________________________
19. Content Hardening Strategy
The project will evolve iteratively.
A page being implemented does not mean that page is permanently complete.
Expected development progression is approximately:
V1
•	establish the concept
•	establish the learning progression
•	build core interactions
•	establish consistent UI
Content hardening
•	technical review
•	improve explanations
•	correct ambiguities
•	add references
•	improve accessibility
•	improve interactions
•	add additional examples
Intermediate expansion
•	deeper mathematics
•	circuits
•	implementation details
•	programming exercises
•	larger examples
Advanced expansion
•	formal treatment
•	realistic hardware considerations
•	advanced algorithms
•	research connections
•	papers
•	SDK implementations
•	experiments
Code and content architecture should support this evolution.
________________________________________
20. Relationship Between Project Vision and Section Instructions
This document defines the overall project philosophy.
Individual section instructions define the educational requirements for a specific lesson.
When implementing a section:
Project Vision
determines how the educational platform should behave.
Section Instruction
determines what the learner should learn on that page.
Existing Repository
determines the established implementation conventions and reusable components.
All three should be considered together.
If a section instruction appears inconsistent with the current repository or this project vision, do not silently make a major architectural change.
Prefer the smallest implementation that preserves the educational intent and existing architecture. Flag significant conflicts or ambiguities before making broad changes.
________________________________________
21. Implementation Workflow
For each new section:
1.	Review this Project Vision & Architecture document.
2.	Review the section-specific instructional specification.
3.	Inspect the existing implementation and immediately preceding sections.
4.	Identify reusable components and established conventions.
5.	Determine the Core Learning Contract.
6.	Identify Beginner content required for V1.
7.	Identify Intermediate and Advanced expansion points where specified.
8.	Implement the learning progression.
9.	Verify conceptual and technical accuracy.
10.	Verify continuity with previous and following sections.
11.	Verify responsive behavior and accessibility.
12.	Avoid unnecessary scope expansion.
13.	Report important architectural or pedagogical decisions made during implementation.
Do not optimize a single page at the expense of the coherence of the overall curriculum.
________________________________________
22. Guiding Principle
The platform should allow a learner to begin with:
"I have heard of quantum computing, but I don't really understand it."
and progressively reach:
"I understand the underlying concepts, mathematics, software, hardware, and advanced techniques well enough to explore real quantum-computing systems and current research."
The same curriculum should support that progression through increasing depth rather than requiring the learner to abandon one resource and begin another.
Build every section with that long-term progression in mind.


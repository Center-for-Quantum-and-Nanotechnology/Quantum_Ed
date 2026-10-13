# Module 05 — Quantum Software Stack

**Document type:** Module-scoped vision, approved taxonomy, and curriculum integration guidance  
**Status:** Finalized taxonomy — V1.0 (2026-10-13)  
**Scope:** Module 05 only  
**Audience:** Curriculum maintainers, instructional authors, and code agents updating the global taxonomy tree  
**Authority:** Apply alongside `ProjectVision.md` and the existing repository conventions. This document defines **what Module 05 covers and how its pages relate**; it does not supersede the global project vision or individual page specifications.

---

## 1. Purpose and identity

Module 05 explains **how quantum computing software works as a system**, building on practical quantum-programming familiarity established in Module 03.

**Guiding distinction:**

- **Module 03 — Quantum Programming:** How do I use quantum computing software?
- **Module 05 — Quantum Software Stack:** How does quantum computing software work?

The module teaches how software responsibilities cooperate to describe, transform, adapt, execute, and return results from quantum computations. It is **architecture-driven in organization** and **execution-pipeline-driven in its instructional narrative**. The module is not a collection of SDK tutorials, nor a claim that every quantum platform uses the same rigid layered architecture.

**Module-level central progression:**

`FAMILIAR QUANTUM PROGRAM → REPRESENTATION → COMPILATION / TRANSFORMATION → TARGET CAPABILITIES → SIMULATION OR HARDWARE EXECUTION → RUNTIME COORDINATION → RESULTS`

This is an **illustrative learning progression, not a universal or strictly sequential pipeline**. Target properties may inform compilation; runtime systems may coordinate multiple stages; simulation and hardware paths may share or bypass particular responsibilities.

## 2. Prerequisite assumptions

Module 05 assumes learners have introductory exposure to Module 03 — Quantum Programming, whose **currently planned** taxonomy is:

- **Getting Started:** Python Environment; Jupyter; VS Code
- **Frameworks & SDKs:** Qiskit; CUDA-Q; InQuanto; Stim; qBraid
- **Running Simulations**
- **Running on Quantum Hardware**

Learners should have seen a simple quantum program or circuit, used or encountered an SDK, and encountered simulation and hardware execution workflows. **Do not assume proficiency with a specific SDK or advanced compiler, hardware, or physics knowledge.** If Module 03's implementation changes, adjust examples without changing Module 05's conceptual ownership.

## 3. Module-level Core Learning Contract

By the end of the Beginner V1 module, learners should be able to:

1. Explain why writing a quantum program is only one part of executing a quantum computation.
2. Identify major software responsibilities and explain their roles in plain language.
3. Distinguish source-level programming from program representations used elsewhere in a stack.
4. Explain why compilation/transpilation transforms programs and why target constraints matter.
5. Describe what a backend or target description communicates to software, without teaching the underlying device physics.
6. Recognize that simulation engines differ in methods, capabilities, and computational tradeoffs.
7. Describe runtime responsibilities, including job lifecycles, classical coordination, and result handling.
8. Trace a familiar computation through illustrative simulator and hardware workflows.
9. Recognize that software responsibilities can be combined, distributed, or ordered differently across implementations.
10. Distinguish architectural concepts from particular vendors, libraries, services, or products.

The Core Learning Contract belongs in Beginner content; Intermediate and Advanced content deepen the same mental model rather than replacing it.

## 4. Finalized internal taxonomy — V1.0

Preserve the following **seven pages, numbering, order, and approved titles** in the global taxonomy unless a deliberate curriculum revision is authorized.

| ID | Finalized page title | Core instructional objective | Beginner V1 scope / ownership | Primary V1 interaction concept |
|---|---|---|---|---|
| **05.01** | **Understanding the Quantum Software Stack** | Explain why quantum computation involves multiple interacting software responsibilities. | Overall architecture; roles of representation, transformation, backend description, execution, runtime, and results; simulator versus hardware paths. | Interactive software-stack explorer following a familiar computation. |
| **05.02** | **Quantum Program Representations** | Explain how the same computation can be expressed in different forms at different software stages. | Familiar circuits; conceptual intermediate representations; source representation versus downstream forms. | Representation viewer showing multiple forms of one computation. |
| **05.03** | **Compilation and Transpilation** | Explain how quantum programs are translated, transformed, optimized, and adapted for targets. | Equivalent program transformations; native-operation and connectivity constraints as motivations; optimization tradeoffs. | Circuit transformation explorer comparing target-dependent implementations. |
| **05.04** | **Hardware Abstraction and Backend Capabilities** | Explain how software models target capabilities and interfaces with lower-level execution/control systems. | Supported operations; native gates; connectivity; device/target properties; simulator versus hardware backend descriptions; **high-level control-software boundary only**. | Backend capability selector showing how target constraints change what is executable or how adaptation is needed. |
| **05.05** | **Simulation Engines and Methods** | Explain how classical simulation methods model quantum computation and why their tradeoffs differ. | Conceptual simulation approaches, capabilities, limitations, and resource implications; not an SDK run tutorial. | Simulation-method comparison using carefully bounded, explanatory examples. |
| **05.06** | **Quantum Runtime and Classical-Quantum Orchestration** | Explain how execution, classical processing, job management, and results are coordinated. | Job submission/lifecycle; orchestration; measurement/result handling; introductory classical–quantum feedback and hybrid loops. | Interactive execution lifecycle / classical–quantum coordination demonstration. |
| **05.07** | **Integrated Quantum Software Workflows** | Synthesize the responsibilities in complete illustrative computational workflows. | Compare end-to-end simulator and hardware paths; identify how responsibilities interact and vary by platform. | End-to-end workflow explorer with alternative target paths. |

**Taxonomy interpretation:** Each row represents one canonical instructional page, not separate Beginner/Intermediate/Advanced pages. Interaction descriptions are **design intentions**, to be refined in page specifications; they are not requirements to implement a production compiler, simulator, or cloud integration.

## 5. Narrative and section handoffs

- **05.01 → 05.02:** Once learners see multiple software responsibilities, ask how the same computation is represented as it moves between them.
- **05.02 → 05.03:** Once representations are understood, ask why software must transform them.
- **05.03 → 05.04:** Once transformation is introduced, ask where the constraints of the target come from.
- **05.04 → 05.05:** Once execution targets are understood, examine what it means for a classical simulator to be one kind of target and how simulation methods differ.
- **05.05 → 05.06:** Once possible execution paths are understood, ask how software coordinates actual runs and handles results, including hybrid iterations.
- **05.06 → 05.07:** Combine the responsibilities in full example workflows, emphasizing that implementations need not follow one universal order.

The page sequence is a **pedagogical sequence**, not a literal assertion about the timing of every operation in a real stack.

## 6. Recurring example and instructional continuity

**Approved approach:** Use a familiar **two-qubit Bell-state preparation and measurement circuit** as the recurring example where it supports the lesson. Learners should already recognize it or receive a minimal reminder rather than a full circuit-programming tutorial.

The recurring example should:

- Anchor the opening architecture explorer in 05.01.
- Appear in different conceptual representations in 05.02.
- Show a small, valid target-driven transformation in 05.03 when educationally meaningful.
- Be used to compare target/backend requirements in 05.04.
- Provide a common point of reference for simulation and execution in 05.05–05.07.
- Preserve consistent terminology and visual identity across pages.

**Important qualification:** The Bell-state circuit is a **teaching anchor, not a restriction**. When it is too simple to demonstrate a real compilation tradeoff, simulation-method distinction, or hybrid orchestration concept, use a small additional example. Do not manufacture misleading differences solely to force the recurring example into every interaction. Label simplified models and explain consequential limitations.

## 7. Module boundaries and ownership

| Related module | Primary ownership outside Module 05 | Permitted Module 05 treatment |
|---|---|---|
| **03 — Quantum Programming** | Development environments, SDK introductions/tutorials, writing circuits, running simulations, submitting hardware jobs. | Reuse familiar programs and tools to explain the architecture beneath their interfaces; do not repeat setup or how-to lessons. |
| **Quantum Hardware** | Physical qubits, device operation, physical gates, control electronics, calibration physics and underlying device behavior. | Explain software-facing backend descriptions, constraints, and the **boundary** to control systems; do not teach low-level control physics. |
| **07 — Quantum Error Correction** | Error-correcting codes, syndrome extraction, decoding, logical protection, and fault-tolerance instruction. | Acknowledge relevant software responsibilities when necessary, without teaching QEC methods or duplicating its instructional progression. |

Module 05 owns **software architecture, representations, compilation/transpilation, backend abstraction, simulation methods, runtime orchestration, and their integration**. Vendor examples may illustrate these concepts but must not define the page hierarchy.

**Approved Option A — Control software:** Introduce the handoff/boundary between higher-level quantum software and lower-level control software **within 05.04**. **Do not add a standalone V1 control-software page.** Defer pulse scheduling, pulse-level interfaces, calibration-driven control, and control-electronics detail to future Advanced hardening or the appropriate hardware curriculum.

**Approved hybrid-computing treatment:** Introduce classical–quantum coordination and iterative feedback **within 05.06**, not as a separate V1 page.

## 8. Progressive-depth and V1 strategy

Follow `ProjectVision.md`:

- **Beginner is the V1 priority** and carries every page's essential conceptual contract.
- **Intermediate is cumulative:** add more precise representations, algorithms, comparisons, and implementation examples where useful.
- **Advanced is cumulative:** add rigorous internals, scaling, real platform architectures, and research-facing details where appropriate.
- Do not create three versions of the same lesson. Keep one canonical page with maintainable depth expansion points.
- Optional exploration is distinct from experience level: curious beginners may open deeper examples without switching the whole curriculum level.
- Prefer intuition → visualization → interaction → terminology → mathematics → implementation → deeper treatment.
- Favor deterministic, resettable, explanatory interactions for V1; avoid unnecessary full compilers, simulators, or live hardware dependencies.
- Build reusable conceptual/data models and components where practical; inspect the existing repository first.
- Maintain accessibility, responsive design, clear labels, and alternatives to color-only meaning.

### Candidate future depth (not V1 commitments)

| Section | Intermediate / Advanced expansion candidates |
|---|---|
| 05.01 | Comparative architectures, distributed services, observability, heterogeneous systems. |
| 05.02 | OpenQASM, QIR, intermediate-representation design and transformations. |
| 05.03 | Compiler passes, routing/scheduling algorithms, optimization complexity and tradeoffs. |
| 05.04 | Detailed target descriptions, calibration-aware decisions, pulse/control interfaces and software–hardware boundaries. |
| 05.05 | State-vector, stabilizer, tensor-network and other methods in greater depth; scaling and GPU acceleration. |
| 05.06 | Real-time classical feedback, hybrid execution patterns, distributed runtimes, latency and resource management. |
| 05.07 | Realistic cross-platform comparisons, performance analysis, heterogeneous integration. |

These are **possible future additions**, not an instruction to implement all topics or to make V1 artificially comprehensive.

## 9. Visual and interactive conventions

- Maintain the global site's established design language and reuse existing circuit/quantum-state representations where appropriate.
- Introduce any Module 05-specific distinctions (e.g., source representation, transformation, target description, runtime, result) consistently across pages.
- Preserve previously established meanings for colors where reused; do not arbitrarily repurpose Module 07's visual vocabulary.
- Do not rely on color alone to identify software layers or execution paths.
- Each page should include **one clearly designated primary V1 interaction** with an observable cause-and-effect learning objective, immediate explanation, and a reset/replay path where appropriate.
- Interactions should separate what the learner changes from what the software model derives and what the learner observes.
- Prefer simple diagrams, small concrete examples, and responsive layouts over long textbook-style text.

## 10. Page specification and implementation governance

Individual page specs are authored with the uploaded **`section-spec-writer` (`SKILL.md`)** format, following the same pattern used for Module 07. Each spec should include, in the prescribed order:

1. Project Context
2. Goal
3. Learning Outcomes
4. Experience-Level Scope
5. Page Structure (including one **Main Interactive**)
6. Visual / UX Requirements
7. Technical Requirements
8. Important Pedagogical Constraints
9. End State

Each spec must identify the preceding and following lesson, guard against misconceptions, maintain scope boundaries, and motivate the next page. Specifications define **what to teach**; `ProjectVision.md` defines the platform-wide instructional approach; the existing repository defines implementation conventions.

**Existing page artifact:** `UnderstandingTheQuantumSoftwareStackInstruction.md` is the instructional specification for 05.01. Treat this module document as the taxonomy-level source of truth and that file as the page-level source of truth. Do not silently overwrite the existing page specification during taxonomy synchronization.

## 11. Deferred work and explicit non-goals

**Defer until the planned curriculum hardening pass:**

- Cross-module links, deep curriculum integration, and systematic concept cross-references.
- Expansion of Intermediate and Advanced lesson content.
- Broad technical/reference verification and deeper examples beyond the V1 learning contract.
- Detailed control-software internals, advanced simulation algorithms, compiler internals, and real-time execution engineering.

**Do not:**

- Reorganize Module 05 around SDK vendor names.
- Recreate Module 03 setup, SDK tutorials, or run instructions.
- Create a separate control-software or hybrid-computing V1 page.
- Treat the illustrated stack as a fixed universal software pipeline.
- Create live-hardware dependencies or full production implementations just to illustrate a Beginner concept.
- Introduce cross-module navigation hooks as part of the taxonomy update.

## 12. Instructions for a code agent updating the global taxonomy tree

**Task:** Synchronize the global curriculum taxonomy/navigation tree with the finalized **Module 05 V1.0** hierarchy in Section 4.

1. Inspect the existing repository and locate the canonical global taxonomy data, navigation configuration, routes, and any generated indexes. Follow the repository's current conventions; do not invent a new parallel taxonomy system.
2. Find the existing **Module 05 — Quantum Software Stack** node. Preserve its module number, placement, and any stable identifiers unless a change is required by the existing data model.
3. Ensure Module 05 contains **exactly the seven finalized page entries in Section 4, in that order**, with their approved titles. Map their IDs and routes to the repository's naming conventions. Do not assume a URL slug or filesystem location from this document alone.
4. If the taxonomy supports summaries/descriptions, use the corresponding **Core instructional objective** from Section 4. If it supports prerequisite or module metadata, capture the Module 03 prerequisite and module-level purpose without inventing unsupported schema fields.
5. Do not change other modules' taxonomy, rewrite Module 03 or Module 07, or add cross-module links. Do not create placeholder lessons or page implementations unless the repository requires a minimal route stub for a valid navigation entry; flag that need before broad implementation.
6. Preserve existing Module 05 page artifacts and references where possible; reconcile naming differences carefully rather than silently deleting content.
7. Validate that navigation order, module labels, page titles, and route references remain consistent and that no duplicate entries were introduced.
8. Report the exact taxonomy/configuration files modified, any mapping from approved IDs to repository-specific identifiers, validation performed, and any unresolved conflicts.

**Change-control rule:** The seven-page taxonomy is **approved**. Treat changes to page count, sequence, ownership, or title as a proposed curriculum revision requiring review, not an incidental implementation decision.

---

**Final decision record:** Seven-page architecture-driven taxonomy approved; execution-pipeline narrative approved; Module 03 foundational prerequisite approved; Bell-state recurring example approved with pedagogical flexibility; control-software boundary retained in 05.04 (Option A); hybrid orchestration retained in 05.06; Beginner-first V1 and deferred Advanced/cross-module hardening approved.

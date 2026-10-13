# Module 05 — Quantum Software Stack

**Document type:** Module-scoped vision, approved taxonomy, and curriculum integration guidance  
**Status:** Finalized taxonomy — V1.1 (2026-10-13)  
**Scope:** Module 05 only  
**Audience:** Curriculum maintainers, instructional authors, and code agents updating the global taxonomy tree  
**Authority:** Apply alongside `ProjectVision.md` and the existing repository conventions. This document defines **what Module 05 covers and how its pages relate**; it does not supersede the global project vision or individual page specifications.

---

## 1. Purpose and identity

Module 05 explains **how quantum computing software works as a system**, building on practical quantum-programming familiarity established in Module 03.

**Guiding distinction:**

- **Module 03 — Quantum Programming:** How do I use quantum computing software?
- **Module 05 — Quantum Software Stack:** How does quantum computing software work?

The module teaches how software responsibilities cooperate to describe, transform, adapt, execute, and return results from quantum computations, **including the relationship between application-facing software and device control/calibration software**. It is **architecture-driven in organization** and **execution-pipeline-driven in its instructional narrative**. The module is not a collection of SDK tutorials, nor a claim that every quantum platform uses the same rigid layered architecture.

**Module-level central progression:**

`FAMILIAR QUANTUM PROGRAM → REPRESENTATION → COMPILATION / TRANSFORMATION → TARGET CAPABILITIES → SIMULATION OR HARDWARE EXECUTION → RUNTIME COORDINATION → RESULTS`

This is an **illustrative learning progression, not a universal or strictly sequential pipeline**. Target properties may inform compilation; runtime systems may coordinate multiple stages; simulation and hardware paths may share or bypass particular responsibilities.

### Application and Control responsibilities (approved V1.1)

Use two **conceptual groups**, not a claim that all providers implement exactly two software layers:

- **Application Layer:** algorithms as inputs to software workflows; program representations; compilation/transpilation; runtime orchestration and result handling. Module 05 explains how algorithms enter the stack, **not** how to design or code algorithms (owned by Module 03 and relevant algorithm instruction).
- **Control Layer:** software that interfaces with and helps operate quantum devices, including calibration workflows, collection/reporting of calibration telemetry, and the boundary to lower-level device control. Module 05 teaches the **software role and meaning of reported telemetry**, not calibration physics, pulse engineering, or control electronics.

**Information flows in both directions.** Applications may send executable work toward a target; control/calibration systems may expose device status and properties to backend descriptions, compilation decisions, and operational monitoring. This is not a guarantee of live or automatic feedback in every platform. Calibration telemetry is time-dependent, device- and vendor-specific, and should be presented with measurement context and timestamps where relevant.

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
11. Distinguish Application Layer responsibilities from Control Layer responsibilities, recognizing that real implementations may arrange them differently.
12. Explain at a Beginner level why devices are calibrated and why reported device characteristics can change over time.
13. Interpret representative calibration telemetry fields at a conceptual level, including units, what is measured or estimated, and how software may use them, without mistaking a reported metric for a guarantee of performance.

The Core Learning Contract belongs in Beginner content; Intermediate and Advanced content deepen the same mental model rather than replacing it.

## 4. Finalized internal taxonomy — V1.1

Preserve the following **seven pages, numbering, order, and approved titles** in the global taxonomy unless a deliberate curriculum revision is authorized.

| ID | Finalized page title | Core instructional objective | Beginner V1 scope / ownership | Primary V1 interaction concept |
|---|---|---|---|---|
| **05.01** | **Understanding the Quantum Software Stack** | Explain why quantum computation involves multiple interacting software responsibilities. | Overall architecture; **Application Layer and Control Layer responsibilities**; representation, transformation, backend description, calibration/telemetry boundary, execution, runtime, and results; simulator versus hardware paths. | Interactive software-stack explorer following a familiar computation. |
| **05.02** | **Quantum Program Representations** | Explain how the same computation can be expressed in different forms at different software stages. | Familiar circuits; conceptual intermediate representations; source representation versus downstream forms. | Representation viewer showing multiple forms of one computation. |
| **05.03** | **Compilation and Transpilation** | Explain how quantum programs are translated, transformed, optimized, and adapted for targets. | Equivalent program transformations; native-operation and connectivity constraints as motivations; optimization tradeoffs. | Circuit transformation explorer comparing target-dependent implementations. |
| **05.04** | **Hardware Abstraction and Backend Capabilities** | Explain how software models target capabilities and interfaces with lower-level execution/control systems. | Supported operations; native gates; connectivity; simulator versus hardware targets; **control-software boundary; why calibration is performed; substantive introduction to calibration telemetry fields, their meaning, units, variability, provenance, and software-facing uses**. No pulse/control physics. | Backend capability and calibration-snapshot explorer: change a target or select two labeled telemetry snapshots; observe reported properties and potential software decisions, with no implication of automatic adaptation. |
| **05.05** | **Simulation Engines and Methods** | Explain how classical simulation methods model quantum computation and why their tradeoffs differ. | Conceptual simulation approaches, capabilities, limitations, and resource implications; not an SDK run tutorial. | Simulation-method comparison using carefully bounded, explanatory examples. |
| **05.06** | **Quantum Runtime and Classical-Quantum Orchestration** | Explain how execution, classical processing, job management, and results are coordinated. | Job submission/lifecycle; orchestration; measurement/result handling; introductory classical–quantum feedback and hybrid loops. | Interactive execution lifecycle / classical–quantum coordination demonstration. |
| **05.07** | **Integrated Quantum Software Workflows** | Synthesize the responsibilities in complete illustrative computational workflows. | Compare end-to-end simulator and hardware paths; identify how responsibilities interact and vary by platform. | End-to-end workflow explorer with alternative target paths. |

**Taxonomy interpretation:** Each row represents one canonical instructional page, not separate Beginner/Intermediate/Advanced pages. Interaction descriptions are **design intentions**, to be refined in page specifications; they are not requirements to implement a production compiler, simulator, or cloud integration.

## 5. Narrative and section handoffs

- **05.01 → 05.02:** Once learners see multiple software responsibilities, ask how the same computation is represented as it moves between them.
- **05.02 → 05.03:** Once representations are understood, ask why software must transform them.
- **05.03 → 05.04:** Once transformation is introduced, ask where target constraints and **time-varying device properties** come from, and how calibration telemetry can inform software-facing target descriptions.
- **05.04 → 05.05:** Once execution targets and their reported calibration properties are understood, examine what it means for a classical simulator to be one kind of target and how simulation methods differ.
- **05.05 → 05.06:** Once possible execution paths are understood, ask how software coordinates actual runs and handles results, including hybrid iterations.
- **05.06 → 05.07:** Combine the responsibilities in full example workflows, emphasizing that implementations need not follow one universal order.

The page sequence is a **pedagogical sequence**, not a literal assertion about the timing of every operation in a real stack.

## 6. Recurring example and instructional continuity

**Approved approach:** Use a familiar **two-qubit Bell-state preparation and measurement circuit** as the recurring example where it supports the lesson. Learners should already recognize it or receive a minimal reminder rather than a full circuit-programming tutorial.

The recurring example should:

- Anchor the opening architecture explorer in 05.01.
- Appear in different conceptual representations in 05.02.
- Show a small, valid target-driven transformation in 05.03 when educationally meaningful.
- Be used to compare target/backend requirements **and illustrative calibration snapshots** in 05.04; use an additional example if needed to show a meaningful telemetry-dependent distinction.
- Provide a common point of reference for simulation and execution in 05.05–05.07.
- Preserve consistent terminology and visual identity across pages.

**Important qualification:** The Bell-state circuit is a **teaching anchor, not a restriction**. When it is too simple to demonstrate a real compilation tradeoff, simulation-method distinction, or hybrid orchestration concept, use a small additional example. Do not manufacture misleading differences solely to force the recurring example into every interaction. Label simplified models and explain consequential limitations.

## 7. Module boundaries and ownership

| Related module | Primary ownership outside Module 05 | Permitted Module 05 treatment |
|---|---|---|
| **03 — Quantum Programming** | Development environments, SDK introductions/tutorials, writing circuits, running simulations, submitting hardware jobs. | Reuse familiar programs and tools to explain the architecture beneath their interfaces; do not repeat setup or how-to lessons. |
| **Quantum Hardware** | Physical qubits, device operation, physical gates, control electronics, calibration physics and underlying device behavior. | Explain software-facing backend descriptions and constraints; introduce calibration processes and **substantive calibration telemetry literacy**, including what fields mean and how software may consume them; do not teach low-level control physics. |
| **07 — Quantum Error Correction** | Error-correcting codes, syndrome extraction, decoding, logical protection, and fault-tolerance instruction. | Acknowledge relevant software responsibilities when necessary, without teaching QEC methods or duplicating its instructional progression. |

Module 05 owns **software architecture, representations, compilation/transpilation, backend abstraction, simulation methods, runtime orchestration, and their integration**. Vendor examples may illustrate these concepts but must not define the page hierarchy.

**Approved Option A, revised in V1.1 — Control software:** Introduce the handoff/boundary between application-facing software and lower-level control software **within 05.04**. **Do not add a standalone V1 control-software page.** Calibration and calibration telemetry are **substantive Beginner V1 subjects**, not merely a passing reference. Defer calibration *physics*, pulse scheduling, pulse-level interfaces, detailed closed-loop control algorithms, and control electronics to future Advanced hardening or the hardware curriculum. Distinguish **calibration procedures** (actions taken to characterize/tune a device) from **telemetry** (reported measurements, estimates, and metadata).

**Approved hybrid-computing treatment:** Introduce classical–quantum coordination and iterative feedback **within 05.06**, not as a separate V1 page.

## 7A. Calibration and telemetry — mandatory Beginner V1 scope for 05.04

The learner should understand **why calibration is needed**, how device behavior may drift, why calibration data is collected, and how a backend may expose some of that information to software. Do not suggest that all telemetry is continuously streamed or that all fields are available on every device.

### Representative telemetry fields and conceptual meanings

| Field / category | What it conveys | Example units / representation | Important qualification |
|---|---|---|---|
| **Qubit frequency / operating frequency** | A device-specific operating or transition frequency relevant to control and characterization | GHz or MHz | Meaning differs by hardware modality; not universal to all qubits. |
| **T1 (energy relaxation time)** | Characteristic timescale for excited-state population decay in applicable qubit systems | µs or ms | Not a direct probability that a complete circuit will succeed. |
| **T2 / T2* (coherence/dephasing times)** | Characteristic timescales associated with phase coherence | µs or ms | Definitions and measurement protocols differ; T2 and T2* are not interchangeable. |
| **Single- and two-qubit gate fidelity / error estimates** | Characterization of operation quality under a particular benchmarking or estimation procedure | Fidelity fraction or %, estimated error rate | Depends on protocol, gate, context, and time; not a universal per-circuit failure probability. |
| **Readout assignment error / fidelity** | How reliably a measurement outcome is reported as a classical result | Error probability, fidelity fraction or %, potentially an assignment matrix | May be state-dependent and asymmetric; distinct from gate error. |
| **Native gate set and connectivity** | Supported operations and permitted qubit interactions | Gate names; coupling graph | Primarily backend capability metadata; may change less frequently than calibration metrics. |
| **Pulse/control parameters or calibration settings** | Configured values used by a control system | Amplitude, duration, frequency, phase, or platform-specific units | Recognize their existence; do not teach pulse design or assert they are exposed to users. |
| **Timestamp, validity, uncertainty, and calibration status** | When and how a value was obtained, and how confidently it should be interpreted | Timestamp; confidence/uncertainty; status labels | A number without provenance or recency can be misleading. |

These are **representative examples, not a mandatory common schema** across superconducting, trapped-ion, neutral-atom, photonic, or other architectures. Where a field is modality-specific, label it. Prefer concrete examples with realistic *illustrative* values explicitly marked as synthetic rather than implying universal ranges.

### Required V1 learning interaction

**Calibration Snapshot Explorer** (within 05.04's single primary interaction): Present one illustrative target and two **synthetic, labeled** calibration snapshots (e.g., earlier and later). Let the learner select a snapshot and inspect a small set of metrics, units, timestamps, and plain-language interpretations. Show that a software-facing backend description can reflect changing characteristics. If showing a compilation or scheduling consequence, present it as a **possible policy-dependent decision**, not automatic universal behavior. Separate **measured/reported data**, **software interpretation**, and **hypothetical response**. Include reset and explanatory feedback.

### Misconceptions to guard against

- **Calibration ≠ telemetry:** calibration is a procedure/workflow; telemetry is information reported about state, quality, settings, or characterization.
- **A metric ≠ a guarantee:** gate fidelity, T1/T2, or readout error alone cannot predict an entire workload's success.
- **Telemetry ≠ continuous real-time truth:** values may be periodic, stale, estimated, or provider-filtered.
- **Backend metadata ≠ raw control signals:** software-facing descriptions are abstractions.
- **Hardware drift ≠ automatic adaptive compilation:** responses depend on provider capabilities, data access, policies, and software design.

### Ownership fence

Module 05 owns the **meaning, representation, reporting, and software consumption** of telemetry. Quantum Hardware owns the **physical origins, measurement protocols, and device mechanisms**. Module 07 owns **error correction and decoding**, including any future hardware-aware QEC treatment. Cross-module links and detailed integration remain deferred until hardening.

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
| 05.04 | Detailed telemetry schemas and uncertainty, calibration-aware optimization policies, pulse/control interfaces, and software–hardware boundaries; **basic telemetry literacy is already V1**. |
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

**Existing page artifact:** `UnderstandingTheQuantumSoftwareStackInstruction.md` is the instructional specification for 05.01. **V1.1 reconciliation required:** revise its introductory architecture framing to distinguish Application and Control responsibilities and briefly introduce calibration/telemetry, without teaching 05.04 content. Do not silently assume the existing V1.0 page spec already reflects V1.1. Treat this module document as the taxonomy-level source of truth and that file as the page-level source of truth. Do not silently overwrite the existing page specification during taxonomy synchronization.

## 11. Deferred work and explicit non-goals

**Defer until the planned curriculum hardening pass:**

- Cross-module links, deep curriculum integration, and systematic concept cross-references.
- Expansion of Intermediate and Advanced lesson content.
- Broad technical/reference verification and deeper examples beyond the V1 learning contract.
- Detailed control-software internals **beyond Beginner calibration/telemetry literacy**, advanced simulation algorithms, compiler internals, and real-time execution engineering.

**Do not:**

- Reorganize Module 05 around SDK vendor names.
- Recreate Module 03 setup, SDK tutorials, or run instructions.
- Create a separate control-software or hybrid-computing V1 page.
- Treat the illustrated stack as a fixed universal software pipeline.
- Create live-hardware dependencies or full production implementations just to illustrate a Beginner concept.
- Introduce cross-module navigation hooks as part of the taxonomy update.

## 12. Instructions for a code agent updating the global taxonomy tree

**Task:** Synchronize the global curriculum taxonomy/navigation tree with the finalized **Module 05 V1.1** hierarchy in Section 4, including updated scope descriptions for 05.01 and 05.04.

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

**V1.1 change record (2026-10-13):** Restored original Application Layer (algorithms, compilation/transpilation, runtime) and Control Layer (calibration, calibration telemetry) scope. Kept seven pages and Option A; made calibration and representative telemetry fields substantive Beginner V1 material in 05.04, and added a two-group conceptual overview to 05.01. The existing 05.01 page spec needs a targeted consistency update.

**Final decision record:** Seven-page architecture-driven taxonomy approved; execution-pipeline narrative approved; Module 03 foundational prerequisite approved; Bell-state recurring example approved with pedagogical flexibility; control-software boundary plus substantive calibration/telemetry retained in 05.04 (Option A, V1.1); hybrid orchestration retained in 05.06; Beginner-first V1 and deferred Advanced/cross-module hardening approved.

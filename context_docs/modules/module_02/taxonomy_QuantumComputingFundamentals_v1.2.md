# Module 02 — Quantum Computing Fundamentals
## Taxonomy, Scope & Instructional Vision

**Version:** 1.2  
**Status:** Approved v1.2 (decisions in section 11 approved 2026-10-14). The global taxonomy and site navigation have not yet been synchronized with this document.  
**Parent curriculum:** Quantum Computing Curriculum, Module 02  
**Inputs reviewed:** `Quantum_Computing_Curriculum.md` (global taxonomy); `archive/Quantum Computing Fundamentals.md` (graduate-student instructional draft; stored as an input reference only, see section 10)

## 1. Purpose and positioning

Module 02 develops the conceptual, mathematical, and circuit-level foundations required to understand quantum computation. It bridges Module 01's qualitative introduction and the operational content in Module 03 (Quantum Programming), Module 04 (Quantum Hardware), Module 05 (Quantum Software Stack), Module 06 (Quantum Algorithms & Methods), and Module 07 (Quantum Error Correction).

**Design principle:** build intuition first, then introduce precise notation, formal operations, and opportunities for verification. Do not replace mathematical accuracy with misleading simplifications. Provide optional scaffolding for learners with different backgrounds, while preserving shared core outcomes.

### Experience levels in this module

The Vision (§3, §4, §6, §10) makes Beginner the core contract of every page, puts additional mathematical notation and circuit representations at Intermediate, and keeps formal derivations for Advanced. Levels are cumulative views of one canonical page, built as gated blocks (see `llm/CONVENTIONS.md`, section 7). This module applies that as follows:

| Level | What it means in Module 02 |
|---|---|
| **Beginner (V1, the Core Learning Contract)** | The whole conceptual story, taught through diagrams, tables, outcome probabilities, and interaction. Amplitudes are real numbers. No complex numbers, no matrices, no tensor-product algebra. Ket labels such as \|0⟩ and \|+⟩ are used as names for states. A Beginner learner can finish every page and understand what states, gates, circuits, and measurement are. |
| **Intermediate** | The formal layer: complex amplitudes, Dirac and vector notation, matrices and matrix–vector multiplication, tensor products, the θ–φ Bloch formula, explicit calculation, and amplitude-level tracing of circuits. The just-in-time scaffolds in section 4 are Intermediate content. |
| **Advanced** | The rigorous layer: Hilbert-space language, dual vectors, unitarity, global-phase equivalence, mixed states, general measurement, and decompositions. Enrichment, never required for the contract. |

Two rules keep this honest. Nothing needed for a page's Beginner outcomes may sit behind Intermediate or Advanced. And where Beginner uses a simplification (real amplitudes, for example), the page says so and does not imply it is the whole story.

## 2. Source reconciliation and taxonomy decision

The global taxonomy specifies seven topics: Qubit Representation, Quantum States, Bloch Sphere, Quantum Gates, Quantum Circuits, Measurement, Multi-Qubit Systems. Retain these seven topics but reorder them to reflect instructional dependencies. The student's draft contributes ket/bra notation, basis vectors, normalization, Bloch coordinates, I/X/Y/Z/H gates, CNOT, matrix representations, and proposed interactive elements. The draft is an instructional source, **not** a verified mathematical reference. Some examples require correction (see §10).

### Proposed canonical hierarchy

- **02.01 — Quantum States**
- **02.02 — Qubit Representation**
- **02.03 — Bloch Sphere**
- **02.04 — Quantum Gates**
- **02.05 — Multi-Qubit Systems**
- **02.06 — Quantum Circuits**
- **02.07 — Measurement**

**Migration note:** This is a proposed reorder of the global taxonomy, not an automatic renumbering authorization. Preserve existing route IDs, links, and progress metadata until an explicit migration review. Module 01 already introduces qubits, superposition, measurement, and entanglement qualitatively; Module 02 develops their formal and operational meaning.

### Relationship to Module 01

Module 01's "What Is Quantum Computing?" page (in progress on `treys_branch` at the time of writing; confirm against the merged version) already gives a qualitative treatment: a qubit state readout with a Bloch-style display, a Hadamard "mix" preview that shows interference, repeated-measurement demos, and entanglement taught through the CHSH game. Module 02 must not re-teach that motivation. Each Module 02 page should open by naming what Module 01 showed, then add the precise meaning.

| Concept | Module 01 (qualitative) | Module 02 (formal and operational) |
|---|---|---|
| Superposition and amplitudes | Shown through sliders and interference; no notation | 02.01 what a state is; 02.02 how to write and calculate with it |
| Hadamard "mix" | Previewed as an operation, before gates are taught | 02.04 owns H as a gate, with matrices and the Bloch action |
| Bloch sphere | A state readout in the Qubits demo | 02.03 owns the sphere as a representation, with its limits |
| Measurement | Repeated trials, qualitative | 02.07 owns the Born rule, shots, and state update |
| Entanglement | The CHSH game | 02.05 owns tensor products, CNOT, and Bell states; do not repeat CHSH |

### Split between 02.01 and 02.02

The two pages overlap on amplitudes, probabilities, and phase, so their roles are fixed as follows:

- **02.01 Quantum States is conceptual.** It teaches what a state is, how it differs from a measurement outcome, and why preparation matters. It uses |0⟩ and |1⟩ only as names for the two basis states. No vectors, no complex numbers, and no normalization equation. Amplitudes appear only as "the numbers that decide the probabilities."
- **02.02 Qubit Representation is formal.** It owns Dirac and vector notation, complex amplitudes, normalization, and probability calculations.

Where both pages touch the same idea, 02.01 states it in words and 02.02 states it with notation.

## 3. Module-wide learning outcomes

Each outcome is stated at the level where it is first required. Beginner outcomes are the Core Learning Contract; Intermediate and Advanced outcomes deepen them without changing the story.

**Beginner (V1)**

1. Distinguish a quantum state from an individual measurement result and explain why preparation matters.
2. Describe the computational basis states and a balanced superposition using diagrams and names such as |0⟩, |1⟩, |+⟩, and |−⟩, and explain that a superposition is not a hidden classical bit.
3. Compute outcome probabilities from real amplitudes by squaring them, and check that they sum to 1.
4. Explain, using the Bloch sphere, that a state can differ in phase without changing the immediate outcome probabilities, and that phase can matter after a further gate.
5. Predict the effect of I, X, Z, and H, and of a rotation by an angle, on a state's outcome probabilities and Bloch-sphere position, and explain that the order of gates matters.
6. Describe two-qubit joint outcomes (00, 01, 10, 11) with an explicit qubit-order convention, and distinguish independent qubits from entangled ones using joint probabilities.
7. Apply CNOT to basis states as a conditional flip, and explain how H then CNOT produces a Bell state from |00⟩.
8. Read, construct, and trace elementary quantum circuits, including a Bell-state preparation circuit, using outcome probabilities.
9. Predict and interpret measurement distributions and repeated-shot counts, and describe the ideal state update after a measurement.
10. Identify which ideas are ideal mathematical models and which depend on physical hardware, noise, or software execution taught elsewhere.

**Intermediate**

11. Interpret states with Dirac and vector notation, including complex amplitudes and normalization.
12. Compute outcome probabilities from complex amplitudes using squared magnitudes.
13. Explain global versus relative phase and relate Bloch coordinates (θ, φ) to amplitudes.
14. Apply I, X, Y, Z, H, S, T, and RX, RY, RZ as matrices, compose them, and relate the matrices to Bloch-sphere actions.
15. Represent two-qubit states with tensor products and four-component vectors, and apply CNOT to a general two-qubit state with an explicit ordering convention.
16. Trace circuits at the amplitude level and predict Born-rule probabilities, including measurement in other single-qubit bases through basis-change gates.

**Advanced (future)**

17. Use Hilbert-space language, dual vectors, unitarity, and global-phase equivalence precisely.
18. Describe mixed states and general measurement at an introductory formal level, and recognize the limits of the Bloch picture for them.

## 4. Prerequisites and differentiated pathways

**Beginner (required):** familiarity with classical bits and binary outcomes; fractions, square roots as they appear in simple examples, and basic probability. Module 01 concepts should be recognized but need not be mathematically mastered. No complex numbers, vectors, or matrices are assumed.

**Intermediate (just-in-time scaffolds):** complex numbers and modulus; vectors and matrix multiplication; basic trigonometry; coordinate axes; tensor products. Each is a short expandable explanation with a worked example, written as Intermediate content, not a separate linear-algebra course.

**Advanced (optional depth):** Hilbert-space language, orthonormal bases, dual vectors, Hermitian conjugation, unitary matrices, eigenstates, alternative measurement bases, global-phase equivalence, and mixed states. Clearly distinguish optional derivations from the contract.

## 5. Submodule specifications

Each page lists its Beginner V1 contract first, then what Intermediate and Advanced add. The Beginner contract must stand on its own.

### 02.01 — Quantum States
**Essential question:** What information does a quantum state represent, and how does that differ from a classical bit value?

**Beginner (Core Learning Contract):**
- *Core content:* state preparation; |0⟩ and |1⟩ as names for the two basis states; superposition as a state, not a hidden classical bit; repeated preparation giving a distribution of outcomes; the distinction between state and observed outcome. Amplitudes appear only as "the numbers that decide the probabilities." Relative phase is mentioned only as a second thing a state can carry.
- *Outcomes:* distinguish state from measurement outcome; recognize that superposition is not merely classical uncertainty; describe the role of preparation.
- *Interaction:* toggle among prepared |0⟩, |1⟩, and a balanced superposition; predict outcomes before observing repeated trials.

**Intermediate:** normalization stated precisely, and the idea that two preparations with identical outcome statistics can still differ in phase (preview of 02.02 and 02.03).
**Advanced:** pure versus mixed states named and contrasted.
**Boundary:** defer all formal notation and calculations to 02.02; defer measurement formalism to 02.07; do not repeat Module 01's qualitative demos.

### 02.02 — Qubit Representation
**Essential question:** How do we represent and calculate with the state of one qubit?

**Role:** the formal counterpart to 02.01 (see "Split between 02.01 and 02.02").

**Beginner (Core Learning Contract):**
- *Core content:* a state written as amplitudes on |0⟩ and |1⟩, with **real** amplitudes only, and the page says that real amplitudes are a simplification; the ket as a name for a state and a column of two numbers as another way of listing the amplitudes (listing only, no matrix operations); normalization as "the squares add to 1"; probability as amplitude squared; a negative amplitude as a sign difference, so |+⟩ and |−⟩ give the same Z-basis probabilities but are different states.
- *Outcomes:* write a state as two amplitudes; check normalization; compute probabilities from real amplitudes; explain that a sign can matter even when probabilities do not change.
- *Interaction:* amplitude editor with real amplitudes, a live normalization indicator, and probability bars; unnormalized inputs are flagged, not silently accepted.

**Intermediate:** complex amplitudes and modulus; |ψ⟩ = α|0⟩ + β|1⟩ with |α|² + |β|² = 1; bra notation, inner products, and orthonormality; global versus relative phase; a complex amplitude editor with a phase dial.
**Advanced:** Hilbert-space and dual-space language; Hermitian conjugation; global-phase equivalence classes.
**Boundary:** avoid suggesting all states can be represented with real amplitudes.

### 02.03 — Bloch Sphere
**Essential question:** How can one pure qubit state be represented geometrically?

**Beginner (Core Learning Contract):**
- *Core content:* the sphere as a map of pure single-qubit states; poles for |0⟩ and |1⟩; |+⟩ and |−⟩ on the equator along with two further equator states; height as what decides the outcome probabilities; angle around the equator as phase; one sentence that the sphere covers pure states up to a shared overall phase; never confuse a point on the sphere with a measurement result.
- *Outcomes:* identify |0⟩, |1⟩, |+⟩, and |−⟩; read outcome probabilities from a state's height; explain why moving around the equator changes the state but not the Z-basis probabilities.
- *Interaction:* a manipulable sphere synchronized with the amplitude description and probability bars. An accessible non-3D alternative (sliders and a text readout) is required.

**Intermediate:** |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩ and how (θ, φ) relate to amplitudes; global-phase-equivalent descriptions drawn as the same point; the limits of the sphere for multi-qubit systems and mixed states.
**Advanced:** mixed states inside the sphere; density-matrix view.
**Boundary:** detailed noise and decoherence, and physical rotations, belong in Module 04.

### 02.04 — Quantum Gates
**Essential question:** How do ideal quantum gates transform states?

**Beginner (Core Learning Contract):**
- *Core content:* ideal gates as reversible operations that move a state; I, X (flip), Z (phase flip), and H (mix) shown as moves on the Bloch sphere and as effects on outcome probabilities; Y named geometrically as a third flip, with no complex numbers; **rotation gates** introduced geometrically as "rotate the state by an angle about an axis," where the angle sets the result; gate tables and circuit symbols; reversibility of gates, contrasted with measurement; composing two gates and why order matters.
- *Outcomes:* predict outcome probabilities after I, X, Z, and H; explain that Z changes phase without changing immediate Z-basis probabilities; describe a rotation gate as a rotation by an angle about an axis; show that the order of two gates changes the result.
- *Interaction:* choose a gate (and an angle for rotations) and an input state; show before and after on the sphere and as probability bars; compose two gates and compare both orders.

**Intermediate:** matrices for I, X, Y, Z, and H; matrix–vector multiplication; Y with its imaginary phases; the S and T phase gates and their matrices; RX, RY, and RZ matrices; composition order as matrix multiplication; inverse gates; global-phase caveats for rotation gates.
**Advanced:** unitarity argued carefully; universality and gate decompositions named only.
**Boundary:** hardware pulse implementations and native-gate constraints belong in Modules 04 and 05; full gate universality and algorithm design belong later.
**Cross-module note:** built Module 06 pages (VQE, QAOA) already introduce rotation gates such as RY locally. Once 02.04 exists, link them to it during the hardening pass.

### 02.05 — Multi-Qubit Systems
**Essential question:** What changes when qubits are considered jointly?

**Beginner (Core Learning Contract):**
- *Core content:* joint outcomes 00, 01, 10, 11 with the qubit-order convention stated explicitly (q0 first), and a note that SDK output order may differ (see `llm/FLAGS.md`); joint probability tables; independent qubits, where the joint probability is the product of the separate probabilities; CNOT as a conditional flip, with control and target and a truth table on basis states; the Bell state from H then CNOT as a table of outcomes (P(00) = P(11) = 1/2); the product test: if the qubits were independent, P(00) would be P(0) × P(0) = 1/4, so the Bell outcomes cannot come from two independent qubits; entanglement is not two independent superpositions.
- *Outcomes:* list joint outcomes with the ordering; trace CNOT on basis states; explain why Bell outcomes cannot come from independent qubits.
- *Interaction:* a two-qubit explorer. Choose single-qubit inputs, optionally apply H to q0 and then CNOT, and see the joint probability table; compare a product state with the Bell state.

**Intermediate:** tensor products and four-component vectors; |+⟩⊗|0⟩ = (|00⟩ + |10⟩)/√2; the CNOT matrix and its action on a general state, α|00⟩ + β|01⟩ + γ|10⟩ + δ|11⟩ → α|00⟩ + β|01⟩ + δ|10⟩ + γ|11⟩; deriving the Bell state; testing whether a two-qubit state is separable.
**Advanced:** entanglement measures and Schmidt decomposition named; controlled-U generalization.
**Boundary:** no stabilizer formalism, error syndromes, or QEC encoding here; those belong in Module 07.

### 02.06 — Quantum Circuits
**Essential question:** How do we combine qubits and gates into a computation?

**Beginner (Core Learning Contract):**
- *Core content:* wires, initial states, the left-to-right reading convention; symbols for H, X, Z, CNOT, and measurement; reading and building small circuits from a limited palette; tracing a circuit by what the outcome probabilities (or the sphere, or the joint table) look like after each gate; the Bell-state circuit. Diagram direction is a convention, not a physical guarantee of timing or hardware layout.
- *Outcomes:* read and draw elementary circuits; explain why H on the control followed by CNOT gives a Bell state from |00⟩ in terms of joint outcomes; explain that diagram order is not physical timing.
- *Interaction:* a guided circuit builder with a limited gate palette, a state trace, validation feedback, and reset.

**Intermediate:** amplitude-level state tracing after each gate; two-qubit state vectors in a trace; rotation gates with parameters in circuits; simple identities such as HZH = X; optional code export later.
**Advanced:** circuit depth and identities, and Clifford versus non-Clifford gates, named.
**Boundary:** do not teach SDK setup, transpilation, backend selection, or runtime here; connect to Modules 03 and 05 through references only.
**Shared components:** reuse `QedCircuit`; the builder extends it.

### 02.07 — Measurement
**Essential question:** How do quantum states produce classical observations?

**Beginner (Core Learning Contract):**
- *Core content:* computational-basis measurement; probability as amplitude squared (real numbers); single shot versus many shots; sampled histograms versus theoretical probabilities; the ideal state update (after a measurement the state matches the outcome seen); Bell-state outcome correlations, with no communication between the measurements; why phase is invisible to a direct Z-basis measurement yet shows up after an H gate (interference); measuring does not reveal unknown amplitudes from one shot.
- *Outcomes:* predict theoretical distributions; compare sampled histograms with probabilities; explain that one shot cannot reveal the amplitudes; predict Bell-state correlations.
- *Interaction:* a repeated-shot simulator with adjustable shot count, showing theoretical versus sampled distributions and a step-by-step measurement update.

**Intermediate:** the Born rule with complex amplitudes; measurement as projection; expectation values; measuring in the X and Y bases through basis-change gates; how the spread of sampled frequencies shrinks as the number of shots grows (roughly as 1/√N).
**Advanced:** general measurement bases and generalized measurements named; mid-circuit measurement and conditional operations named.
**Boundary:** physical readout mechanisms, fidelity, measurement noise, and calibration belong in Modules 04 and 05; syndrome measurements belong in Module 07.

## 6. Recurring worked example and learning progression

**Anchor example:** initialize |00⟩, apply H to q0, apply CNOT with q0 control and q1 target, then measure both in the computational basis.

- 02.01: introduce the idea of preparing a single state and observing an outcome; do **not** introduce entanglement mathematics prematurely.
- 02.02: represent |0⟩ and (|0⟩+|1⟩)/√2; calculate probabilities.
- 02.03: locate |0⟩ and |+⟩ on the Bloch sphere.
- 02.04: compute H|0⟩=|+⟩; compare X and Z effects.
- 02.05: expand |+⟩⊗|0⟩=(|00⟩+|10⟩)/√2; apply CNOT to obtain (|00⟩+|11⟩)/√2.
- 02.06: express the preparation as a two-wire circuit and trace its state.
- 02.07: predict P(00)=P(11)=1/2 and P(01)=P(10)=0, then sample repeated shots.

**Levels.** At Beginner the thread is carried by outcome probabilities, joint tables, the Bloch sphere, and circuit diagrams. The amplitude arithmetic in the bullets above (H|0⟩ = |+⟩, the tensor-product expansion, the CNOT amplitude swap) is the Intermediate layer.

Use this as the principal thread, supplemented with counterexamples (e.g., |+⟩⊗|+⟩ is separable; Z|+⟩=|−⟩ changes phase without changing immediate Z-basis probabilities). Do not imply every concept can be explained by one circuit alone.

## 7. Interaction and assessment principles

**Progression:** motivate → explain → show formal representation → predict → interact → reflect → check understanding. Each interactive element must teach a specified outcome rather than merely decorate the page.

**Minimum checks per submodule:** one conceptual question, one representation/prediction task where applicable, and one transfer task. These apply to the Beginner contract; Intermediate adds its own calculation tasks. Provide immediate explanatory feedback, including why distractors are incorrect. Include accessible non-3D alternatives to Bloch-sphere interaction and keyboard-operable controls.

**Level handling:** every interactive has a Beginner version that works without matrices or complex numbers. Deeper panels (complex amplitudes, matrix views, amplitude-level traces) are gated Intermediate blocks, or level-aware component behavior through `QedLevel`. The Beginner behavior never depends on the level.

**Scientific integrity:** identify ideal/noiseless simulations as such; use explicit qubit ordering; distinguish theoretical probabilities from finite-shot frequencies; maintain normalized states and correct phase conventions; never conflate a Bloch-sphere point with a measurement result.

## 8. Cross-module interfaces and exclusions

| Module | Relationship | Do not duplicate here |
|---|---|---|
| 01 — Foundations | Builds formal understanding on qualitative qubit, superposition, entanglement, measurement concepts | Broad motivation, NISQ overview, current limitations |
| 03 — Quantum Programming | Uses the circuit concepts as prerequisites for SDK implementations | Python/Jupyter setup, Qiskit/CUDA-Q tutorials, running jobs |
| 04 — Quantum Hardware | Supplies the physical meaning of gates, coherence, noise, and readout | Qubit modalities, device control, physical gate/readout engineering |
| 05 — Quantum Software Stack | Consumes circuit representations and results | Compilation, transpilation, calibration telemetry, runtimes |
| 06 — Algorithms & Methods | Builds larger algorithmic methods from circuits | VQE, QAOA, annealing, algorithm-specific methods |
| 07 — Quantum Error Correction | Uses entanglement, measurement, and gates as prerequisites | Stabilizers, syndrome extraction, decoders, surface codes |
| 08 — Labs & Learning Modules | Provides extended practical activities | Full laboratory curricula within conceptual pages |

**Linking policy:** record prerequisite and downstream relationships now; defer broad cross-module deep-link hardening until the curriculum-wide review. Only add essential immediate links where a learner cannot proceed without clarification.

## 9. Implementation and governance

Module 02 follows the repository's `context_docs` layout (see `context_docs/README.md`):

```text
context_docs/modules/module_02/
  taxonomy_QuantumComputingFundamentals_v1.1.md
  specs/
    02.01_QuantumStates<...>.md
    02.02_QubitRepresentation<...>.md
    02.03_BlochSphere<...>.md
    02.04_QuantumGates<...>.md
    02.05_MultiQubitSystems<...>.md
    02.06_QuantumCircuits<...>.md
    02.07_Measurement<...>.md
  archive/
```

**Governance:** this document is the module-level source of scope and intent. Page-specific instructional specifications live in `specs/`, one flat file per page, named `<ID>_<PageTitle>.md` and written with the `section-spec-writer` skill, including its Shared Components section. Acceptance criteria, content, interaction designs, and tests belong in each page's spec. Superseded specs and earlier versions of this taxonomy move to `archive/`, with the version in the filename. Each spec carries a level map: any Page Structure subsection or interaction above Beginner is tagged `[Intermediate]` or `[Advanced]` (see `context_docs/README.md`). The global taxonomy (`context_docs/taxonomy/Quantum_Computing_Curriculum.md`) is the authoritative curriculum index; this document proposes changes for review and does not independently overwrite it.

**Implementation phases:**
1. Approve/revise this module scope and the proposed ordering.
2. Reconcile global taxonomy and any existing stable route IDs; document migrations.
3. Draft individual submodule specs with learning outcomes, content requirements, visuals, exercises, mathematical examples, and acceptance tests.
4. Implement interactive primitives (amplitude editor, Bloch sphere, gate/state explorer, circuit builder, measurement sampler) as reusable components.
5. Perform mathematical review and accessibility testing before publication.
6. Conduct cross-module consistency and link hardening after other modules mature.

## 10. Required source corrections and quality gates

The student draft contains substantive issues. Correct these before using its examples in published lessons. The draft is stored at `archive/Quantum Computing Fundamentals.md` as an input reference only; it is not authoritative and must not be built from. Items 1, 3, 4, 9 and 10 were spot-checked against it for v1.1 (the reversibility claim, the unchanged-amplitude CNOT result, the T/Y label, the missing pasted image, and the placeholder circuits and measurement sections).

1. **Reversibility:** ideal quantum gates are unitary and reversible; the draft incorrectly says quantum gates are not reversible.
2. **Hadamard normalization:** H|0⟩=(|0⟩+|1⟩)/√2, not divided by 2. Fix inconsistent prose and worked final expressions.
3. **CNOT general state:** with basis order |00⟩,|01⟩,|10⟩,|11⟩ and first qubit control, CNOT(α|00⟩+β|01⟩+γ|10⟩+δ|11⟩)=α|00⟩+β|01⟩+δ|10⟩+γ|11⟩. The draft incorrectly leaves amplitudes unchanged.
4. **Y-gate description:** a paragraph refers to the T gate while describing Y; relabel it.
5. **Hadamard vector description:** a paragraph incorrectly calls the operation Z; relabel it H.
6. **Z-gate equation:** repair mismatched parentheses and equals placement.
7. **Precision:** normalization follows from valid state preparation, not from arbitrary choices of α and β; explain that gate reversibility does not imply all measurement processes are reversible.
8. **Conventions:** clarify Bloch-sphere rotations up to global phase and explicitly define the qubit-ordering convention.
9. **Source illustration:** the draft references a pasted image that was not provided as a standalone image asset. Replace or recover it before implementation; do not assume its content.
10. **Completeness:** quantum circuits and measurement are placeholders in the student draft; the content and outcomes in §§5–7 are proposed instructional additions, not existing researched text.

**Quality gates:** mathematical SME review; automated checks for state normalization, gate matrix actions, circuit-state tracing, and probability sums; consistent notation; accessibility review; assessment alignment; and verification that all interactions function without requiring an external quantum provider.

## 11. Decisions requiring approval

*All decisions below were approved on 2026-10-14.*

- Approve the proposed seven-topic reorder (especially moving Multi-Qubit Systems before Quantum Circuits and Measurement to the end).
- Confirm that the Bell-state circuit is the recurring example.
- Confirm the Beginner / Intermediate / Advanced split in sections 1, 3, and 5. In particular: complex amplitudes, matrices, and tensor-product algebra are Intermediate, and Beginner uses real amplitudes, outcome tables, and the Bloch sphere. *This resolves open item 1 from v1.1, proposed.*
- Confirm gate coverage: rotation gates are introduced geometrically at Beginner (angle about an axis), with RX, RY, RZ, S, and T matrices at Intermediate; Y is geometric at Beginner and a matrix at Intermediate. *This resolves open item 4 from v1.1, proposed.*
- Confirm that mixed states, general measurement bases, and global-phase equivalence classes are Advanced enrichment only.
- Confirm that Module 06's local explanations of rotation gates should link to 02.04 during the hardening pass.
- ~~Confirm repository folder naming and whether existing stable route IDs must be preserved.~~ Resolved in v1.1: section 9 follows the adopted layout, and no Module 02 routes exist yet.

**Status:** Approved v1.2. No global taxonomy changes have been made by this document.

**v1.1 change record:** added the Module 01 relationship table and the fixed 02.01/02.02 split; replaced the proposed directory layout in section 9 with the adopted `context_docs` layout; recorded the stored location of the student source draft and spot-checked the corrections that cite it; recorded the two open items in section 11.

**v1.2 change record:** added "Experience levels in this module" to section 1 and mapped the module onto Beginner, Intermediate, and Advanced; split the module outcomes (section 3) and prerequisites (section 4) by level; rewrote each page in section 5 with a Beginner Core Learning Contract plus Intermediate and Advanced additions; added rotation gates (geometric at Beginner, matrices at Intermediate) and the S and T gates to 02.04; added level notes to sections 6, 7, and 9; recorded proposed resolutions for the two items open in v1.1. The seven-page order and the recurring example are unchanged.

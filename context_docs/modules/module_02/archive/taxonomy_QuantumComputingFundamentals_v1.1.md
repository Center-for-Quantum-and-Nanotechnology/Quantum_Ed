# Module 02 — Quantum Computing Fundamentals
## Taxonomy, Scope & Instructional Vision

**Version:** 1.1  
**Status:** Revised draft for review; not yet approved for global taxonomy integration. Two review items remain open and are tracked in section 11: how the formal mathematics maps onto the Vision's experience levels, and gate coverage.  
**Parent curriculum:** Quantum Computing Curriculum, Module 02  
**Inputs reviewed:** `Quantum_Computing_Curriculum.md` (global taxonomy); `archive/Quantum Computing Fundamentals.md` (graduate-student instructional draft; stored as an input reference only, see section 10)

## 1. Purpose and positioning

Module 02 develops the conceptual, mathematical, and circuit-level foundations required to understand quantum computation. It bridges Module 01's qualitative introduction and the operational content in Module 03 (Quantum Programming), Module 04 (Quantum Hardware), Module 05 (Quantum Software Stack), Module 06 (Quantum Algorithms & Methods), and Module 07 (Quantum Error Correction).

**Design principle:** build intuition first, then introduce precise notation, formal operations, and opportunities for verification. Do not replace mathematical accuracy with misleading simplifications. Provide optional scaffolding for learners with different backgrounds, while preserving shared core outcomes.

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

By completion, learners should be able to:

1. Distinguish a quantum state from an individual measurement result and explain why preparation matters.
2. Interpret computational basis states and a normalized single-qubit superposition using Dirac and vector notation.
3. Compute computational-basis outcome probabilities using squared amplitude magnitudes, including complex amplitudes.
4. Explain relative versus global phase and interpret pure single-qubit states on the Bloch sphere.
5. Apply I, X, Y, Z, and H gates to basis states and selected superpositions; relate matrices, circuits, and Bloch-sphere actions.
6. Represent two-qubit basis states using tensor products; distinguish product states from entangled states.
7. Apply CNOT to computational basis states and a general two-qubit state, using an explicit qubit-order convention.
8. Read, construct, and trace elementary quantum circuits, including a Bell-state preparation circuit.
9. Predict and interpret measurement distributions, repeated-shot counts, and ideal state updates in the computational basis.
10. Identify which concepts are ideal mathematical models and which depend on physical hardware, noise, or software execution taught elsewhere.

## 4. Prerequisites and differentiated pathways

**Required:** familiarity with classical bits and binary outcomes; elementary algebra, fractions, square roots, and basic probability. Module 01 concepts should be recognized but need not be mathematically mastered.

**Just-in-time scaffolds:** complex numbers and modulus; vectors and matrix multiplication; basic trigonometry; coordinate axes; tensor products. Provide short expandable explanations and worked examples instead of requiring a separate full linear-algebra course.

**Optional depth:** Hilbert-space language, orthonormal bases, dual vectors, Hermitian conjugation, unitary matrices, eigenstates, alternative measurement bases, and global-phase equivalence. Clearly distinguish optional derivations from mandatory competencies.

## 5. Submodule specifications

### 02.01 — Quantum States
**Essential question:** What information does a quantum state represent, and how does that differ from a classical bit value?

**Core content:** state preparation; computational basis states |0⟩ and |1⟩; superposition as a state, not a hidden classical bit; amplitudes versus probabilities; normalization as a conceptual requirement; pure-state focus and the distinction between state and observed outcome. Introduce relative phase qualitatively, with formal treatment later.

**Outcomes:** distinguish state from measurement outcome; recognize that superposition is not merely classical uncertainty; describe the role of preparation.

**Interaction:** toggle among prepared |0⟩, |1⟩, and a balanced superposition; predict outcomes before observing repeated trials.

**Boundary:** defer all formal notation and calculations (bra-ket, vectors, complex amplitudes, the normalization equation) to 02.02; defer measurement formalism to 02.07; do not repeat Module 01's qualitative demos.

### 02.02 — Qubit Representation
**Essential question:** How do we represent and calculate with the state of one qubit?

**Role:** the formal counterpart to 02.01 (see "Split between 02.01 and 02.02").

**Core content:** Dirac ket and bra notation; column vectors |0⟩=(1,0)^T and |1⟩=(0,1)^T; |ψ⟩=α|0⟩+β|1⟩; complex amplitudes; normalization |α|²+|β|²=1; vector length and orthonormality; amplitudes versus observed probabilities; introductory global versus relative phase.

**Outcomes:** translate between notation forms; test normalization; calculate measurement probabilities; distinguish a phase factor shared by the whole state from a relative phase.

**Interaction:** amplitude/vector editor with live normalization indicator and probability bars; constrain or explicitly flag nonphysical inputs.

**Boundary:** avoid suggesting all states can be fully represented with real amplitudes; defer full Hilbert-space and dual-space formalism to optional depth.

### 02.03 — Bloch Sphere
**Essential question:** How can one pure qubit state be represented geometrically?

**Core content:** Bloch sphere as a representation of pure single-qubit states up to global phase; poles and equator; θ and φ; |ψ⟩=cos(θ/2)|0⟩+e^{iφ}sin(θ/2)|1⟩; phase versus measurement probability; limits of the sphere for multi-qubit systems and mixed states.

**Outcomes:** identify |0⟩, |1⟩, |+⟩, and |−⟩; relate coordinates to amplitudes and measurement probabilities; explain why relative phase matters.

**Interaction:** manipulable sphere synchronized with ket, amplitudes, and outcome probabilities; visually distinguish global-phase-equivalent descriptions.

**Boundary:** detailed noise/decoherence and physical rotations belong in Module 04; mixed states are optional enrichment.

### 02.04 — Quantum Gates
**Essential question:** How do ideal quantum gates transform states?

**Core content:** ideal gates as linear unitary, hence reversible, operations; matrix multiplication and composition order; I, X, Y, Z, H; basis-state action and action on arbitrary α|0⟩+β|1⟩; phase effects; corresponding Bloch-sphere transformations; gate tables and circuit symbols. Introduce inverse gates and global-phase caveats at an appropriate level.

**Outcomes:** predict gate outputs; multiply 2×2 matrices by state vectors; recognize how Z changes relative phase even when immediate Z-basis measurement probabilities do not change.

**Interaction:** choose a gate and input state; show input/output vector, Bloch sphere, and measurement probabilities side by side; compose two gates and compare order.

**Boundary:** detailed hardware pulse implementations and native-gate constraints belong in Modules 04/05; full gate universality and algorithm design belong later.

### 02.05 — Multi-Qubit Systems
**Essential question:** What changes when qubits are considered jointly?

**Core content:** tensor-product construction; two-qubit basis ordering |00⟩, |01⟩, |10⟩, |11⟩; four-component state vectors; separable/product states versus entangled states; controlled operations with CNOT as the primary worked example; control and target semantics; CNOT matrix and amplitude permutation; Bell-state preparation as an application.

**Outcomes:** write simple tensor products; trace CNOT on basis states and superpositions; explain why entanglement is not equivalent to two independent superpositions.

**Interaction:** two-qubit state and CNOT explorer; compare product and Bell states and their joint probabilities.

**Boundary:** no stabilizer formalism, error syndromes, or QEC encoding here; those belong in Module 07.

### 02.06 — Quantum Circuits
**Essential question:** How do we combine qubits and gates into a computation?

**Core content:** circuit wires, initial states, time/order conventions, symbols for single-qubit gates and CNOT, circuit reading, gate sequencing, circuit-state tracing, Bell-state circuit; measurement symbols as an introduction. Explain that diagram direction is a convention, not a physical guarantee of timing or hardware layout.

**Outcomes:** read and draw elementary circuits; track state evolution after each gate; explain why H on the control followed by CNOT generates a Bell state from |00⟩.

**Interaction:** guided circuit builder with limited gate palette, state trace, validation feedback, and reset; optional code export later.

**Boundary:** do not teach SDK setup, transpilation, backend selection, or runtime here; connect to Modules 03/05 through references only.

### 02.07 — Measurement
**Essential question:** How do quantum states produce classical observations?

**Core content:** computational-basis measurement; Born-rule probabilities; single-shot versus many-shot experiments; ideal projective state update for a measured qubit; repeated preparation; correlation in Bell-state outcomes; why phase may be invisible in direct Z-basis measurement yet detectable after an appropriate gate/basis change. Optional brief introduction to alternative measurement bases.

**Outcomes:** predict theoretical distributions; compare sampled histograms with probabilities; explain that measuring does not reveal arbitrary unknown α and β from one shot; predict Bell-state correlations without assuming communication between measurements.

**Interaction:** repeated-shot simulator with adjustable shot count; show theoretical versus sampled distributions and a step-by-step measurement state update.

**Boundary:** physical readout mechanisms, fidelity, measurement noise, and calibration belong in Module 04/05; syndrome measurements belong in Module 07.

## 6. Recurring worked example and learning progression

**Anchor example:** initialize |00⟩, apply H to q0, apply CNOT with q0 control and q1 target, then measure both in the computational basis.

- 02.01: introduce the idea of preparing a single state and observing an outcome; do **not** introduce entanglement mathematics prematurely.
- 02.02: represent |0⟩ and (|0⟩+|1⟩)/√2; calculate probabilities.
- 02.03: locate |0⟩ and |+⟩ on the Bloch sphere.
- 02.04: compute H|0⟩=|+⟩; compare X and Z effects.
- 02.05: expand |+⟩⊗|0⟩=(|00⟩+|10⟩)/√2; apply CNOT to obtain (|00⟩+|11⟩)/√2.
- 02.06: express the preparation as a two-wire circuit and trace its state.
- 02.07: predict P(00)=P(11)=1/2 and P(01)=P(10)=0, then sample repeated shots.

Use this as the principal thread, supplemented with counterexamples (e.g., |+⟩⊗|+⟩ is separable; Z|+⟩=|−⟩ changes phase without changing immediate Z-basis probabilities). Do not imply every concept can be explained by one circuit alone.

## 7. Interaction and assessment principles

**Progression:** motivate → explain → show formal representation → predict → interact → reflect → check understanding. Each interactive element must teach a specified outcome rather than merely decorate the page.

**Minimum checks per submodule:** one conceptual question, one representation/prediction task where applicable, and one transfer task. Provide immediate explanatory feedback, including why distractors are incorrect. Include accessible non-3D alternatives to Bloch-sphere interaction and keyboard-operable controls.

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

**Governance:** this document is the module-level source of scope and intent. Page-specific instructional specifications live in `specs/`, one flat file per page, named `<ID>_<PageTitle>.md` and written with the `section-spec-writer` skill, including its Shared Components section. Acceptance criteria, content, interaction designs, and tests belong in each page's spec. Superseded specs and earlier versions of this taxonomy move to `archive/`, with the version in the filename. The global taxonomy (`context_docs/taxonomy/Quantum_Computing_Curriculum.md`) is the authoritative curriculum index; this document proposes changes for review and does not independently overwrite it.

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

- Approve the proposed seven-topic reorder (especially moving Multi-Qubit Systems before Quantum Circuits and Measurement to the end).
- Confirm that the Bell-state circuit is the recurring example.
- Confirm the core/optional mathematical depth boundary and whether mixed states/alternative measurement bases remain enrichment only.
- ~~Confirm repository folder naming and whether existing stable route IDs must be preserved.~~ Resolved in v1.1: section 9 follows the adopted layout, and no Module 02 routes exist yet, so there are none to preserve.

**Open, under discussion:**

- **Mathematical depth against the Vision's experience levels.** The Vision places additional mathematical notation and circuit representations at Intermediate, and keeps Beginner to minimal necessary mathematics. This taxonomy is math-forward from 02.02 on (kets, complex amplitudes, matrices, tensor products) and does not map content to Beginner, Intermediate, and Advanced. A Beginner V1 contract for each page, and where the formal material sits, are still to be defined.
- **Gate coverage.** The gate set (I, X, Y, Z, H, CNOT) omits rotation gates such as RX, RY, and RZ, and the S and T gates. Built Module 06 pages (VQE, QAOA) already use rotation gates. Either extend 02.04 or confirm that Module 06 introduces them locally.

**Status:** Revised draft v1.1. No global taxonomy changes have been made by this document.

**v1.1 change record:** added the Module 01 relationship table and the fixed 02.01/02.02 split; replaced the proposed directory layout in section 9 with the adopted `context_docs` layout; recorded the stored location of the student source draft and spot-checked the corrections that cite it; recorded the two open items in section 11. No content or ordering decisions were changed.

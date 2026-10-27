# Module 02 — Quantum Computing Fundamentals

Module 02 develops the conceptual, mathematical, and circuit-level foundations needed to understand quantum computation: what a state is, how to write and picture it, how gates change it, how qubits combine, how circuits are read, and how measurement turns a state into an outcome. It builds on Module 01's qualitative introduction and is the **ideal model** that Module 04 (hardware), Module 05 (software), and Module 07 (error correction) later contrast with real devices. The Beginner contract uses real amplitudes, outcome tables, and the Bloch sphere; complex numbers, matrices, and tensor products are Intermediate.

## Governing documents

- [`../../vision/ProjectVision.md`](../../vision/ProjectVision.md): how the whole platform teaches.
- [`taxonomy_QuantumComputingFundamentals_v1.2.md`](taxonomy_QuantumComputingFundamentals_v1.2.md): the approved seven-page order, the module's outcomes by experience level, the split between 02.01 and 02.02, the Bell-state recurring example, and the boundaries with other modules. This wins over any page spec where they disagree.
- [`specs/`](specs/): one instruction document per page.
- [`../../../llm/CONVENTIONS.md`](../../../llm/CONVENTIONS.md) and [`../../../llm/FLAGS.md`](../../../llm/FLAGS.md): how the interactive code is organized, and the deviations, simplifications, and open items logged for each page.

## Page status

| ID | Page | Spec | Built page | Status |
|---|---|---|---|---|
| 02.01 | Quantum States | [`specs/02.01_QuantumStatesInstruction.md`](specs/02.01_QuantumStatesInstruction.md) | [`docs/02-fundamentals/quantum-states.md`](../../../docs/02-fundamentals/quantum-states.md) | built |
| 02.02 | Qubit Representation | [`specs/02.02_QubitRepresentationInstruction.md`](specs/02.02_QubitRepresentationInstruction.md) | [`docs/02-fundamentals/qubit-representation.md`](../../../docs/02-fundamentals/qubit-representation.md) | built |
| 02.03 | Bloch Sphere | [`specs/02.03_BlochSphereInstruction.md`](specs/02.03_BlochSphereInstruction.md) | [`docs/02-fundamentals/bloch-sphere.md`](../../../docs/02-fundamentals/bloch-sphere.md) | built |
| 02.04 | Quantum Gates | [`specs/02.04_QuantumGatesInstruction.md`](specs/02.04_QuantumGatesInstruction.md) | [`docs/02-fundamentals/quantum-gates.md`](../../../docs/02-fundamentals/quantum-gates.md) | built |
| 02.05 | Multi-Qubit Systems | [`specs/02.05_MultiQubitSystemsInstruction.md`](specs/02.05_MultiQubitSystemsInstruction.md) | [`docs/02-fundamentals/multi-qubit-systems.md`](../../../docs/02-fundamentals/multi-qubit-systems.md) | built |
| 02.06 | Quantum Circuits | [`specs/02.06_QuantumCircuitsInstruction.md`](specs/02.06_QuantumCircuitsInstruction.md) | [`docs/02-fundamentals/quantum-circuits.md`](../../../docs/02-fundamentals/quantum-circuits.md) | built |
| 02.07 | Measurement | [`specs/02.07_MeasurementInstruction.md`](specs/02.07_MeasurementInstruction.md) | [`docs/02-fundamentals/measurement.md`](../../../docs/02-fundamentals/measurement.md) | built |

All seven pages are built at the Beginner level, and each has gated Intermediate blocks (complex amplitudes, matrices, tensor products, amplitude-level traces). Advanced content is mostly named only; the candidate depth is in section 5 of the taxonomy.

## Prerequisites and neighbours

- **Assumes:** classical bits and binary outcomes, fractions, square roots as they appear in simple examples, and basic probability, plus a recognition of Module 01's ideas. No complex numbers, vectors, or matrices at Beginner.
- **Module 01 (Foundations)** gives the qualitative introduction. Module 02 does not re-teach its motivation or demos.
- **Module 03 (Quantum Programming)** uses the circuit concepts as prerequisites for SDK work. Module 02 teaches no SDK.
- **Module 04 (Quantum Hardware)** owns physical gates, readout, noise, and decoherence. Module 02 is the ideal model and says so.
- **Module 05 (Quantum Software Stack)** owns compilation, backends, calibration telemetry, and runtimes.
- **Module 07 (Quantum Error Correction)** owns stabilizers, syndromes, and decoding.
- Cross-module links are deferred, so the pages link into other modules only where a learner cannot proceed otherwise.

## Open items

Detail lives in the taxonomy (section 10 quality gates), [`llm/FLAGS.md`](../../../llm/FLAGS.md), and [`llm/todo.md`](../../../llm/todo.md), not here.

- **No mathematical subject-matter review yet**, and no automated math checks (normalization, gate matrix actions, circuit-state tracing, probability sums) beyond the module tests.
- **No screen-reader or keyboard pass yet** on the seven interactives, which have only been tested with scripted interaction.
- **The qubit-order convention** (q0 first, on the left) still needs to reach the Module 03 author.
- **Intermediate and Advanced hardening and cross-module links** are deferred, including linking Module 06's and Module 07's gate explanations to 02.04.

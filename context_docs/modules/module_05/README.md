# Module 05 — Quantum Software Stack

Module 05 explains **how quantum computing software works as a system**: how a program is described, transformed, adapted to a target, executed on a simulator or a device, coordinated at runtime, and returned as results. It builds on Module 03 (Quantum Programming), which teaches how to *use* quantum software; this module teaches how that software *works*. It is organized by architecture and told as an execution pipeline, but it does not claim that every platform uses one fixed pipeline.

## Governing documents

- [`../../vision/ProjectVision.md`](../../vision/ProjectVision.md): how the whole platform teaches.
- [`taxonomy_QuantumSoftwareStack_v1.1.md`](taxonomy_QuantumSoftwareStack_v1.1.md): the approved seven-page hierarchy, the module's learning contract, scope boundaries, and the recurring Bell-state example. This wins over any page spec where they disagree.
- [`specs/`](specs/): one instruction document per page.
- [`../../../llm/CONVENTIONS.md`](../../../llm/CONVENTIONS.md) and [`../../../llm/FLAGS.md`](../../../llm/FLAGS.md): how the interactive code is organized, and the deviations, simplifications, and open items logged for each page.

## Page status

| ID | Page | Spec | Built page | Status |
|---|---|---|---|---|
| 05.01 | Understanding the Quantum Software Stack | [`specs/05.01_UnderstandingTheQuantumSoftwareStackInstruction.md`](specs/05.01_UnderstandingTheQuantumSoftwareStackInstruction.md) | [`docs/05-software-stack/understanding-the-quantum-software-stack.md`](../../../docs/05-software-stack/understanding-the-quantum-software-stack.md) | built |
| 05.02 | Quantum Program Representations | [`specs/05.02_QuantumProgramRepresentationsInstruction.md`](specs/05.02_QuantumProgramRepresentationsInstruction.md) | [`docs/05-software-stack/quantum-program-representations.md`](../../../docs/05-software-stack/quantum-program-representations.md) | built |
| 05.03 | Compilation and Transpilation | [`specs/05.03_CompilationAndTranspilationInstruction.md`](specs/05.03_CompilationAndTranspilationInstruction.md) | [`docs/05-software-stack/compilation-and-transpilation.md`](../../../docs/05-software-stack/compilation-and-transpilation.md) | built |
| 05.04 | Hardware Abstraction and Backend Capabilities | [`specs/05.04_HardwareAbstractionAndBackendCapabilitiesInstruction.md`](specs/05.04_HardwareAbstractionAndBackendCapabilitiesInstruction.md) | [`docs/05-software-stack/hardware-abstraction-and-backend-capabilities.md`](../../../docs/05-software-stack/hardware-abstraction-and-backend-capabilities.md) | built |
| 05.05 | Simulation Engines and Methods | [`specs/05.05_SimulationEnginesAndMethodsInstruction.md`](specs/05.05_SimulationEnginesAndMethodsInstruction.md) | [`docs/05-software-stack/simulation-engines-and-methods.md`](../../../docs/05-software-stack/simulation-engines-and-methods.md) | built |
| 05.06 | Quantum Runtime and Classical-Quantum Orchestration | [`specs/05.06_QuantumRuntimeAndClassicalQuantumOrchestrationInstruction.md`](specs/05.06_QuantumRuntimeAndClassicalQuantumOrchestrationInstruction.md) | [`docs/05-software-stack/quantum-runtime-and-classical-quantum-orchestration.md`](../../../docs/05-software-stack/quantum-runtime-and-classical-quantum-orchestration.md) | built |
| 05.07 | Integrated Quantum Software Workflows | [`specs/05.07_IntegratedQuantumSoftwareWorkflowsInstruction.md`](specs/05.07_IntegratedQuantumSoftwareWorkflowsInstruction.md) | [`docs/05-software-stack/integrated-quantum-software-workflows.md`](../../../docs/05-software-stack/integrated-quantum-software-workflows.md) | built |

All seven pages are built at the Beginner level (V1). None of them has gated Intermediate or Advanced content yet; the candidate depth is listed in section 8 of the taxonomy.

## Prerequisites and neighbours

- **Assumes:** introductory exposure to Module 03 (Quantum Programming), a familiar circuit, and the Bell-state example. Module 03 is still a placeholder, so Module 05 explains what it needs rather than depending on it.
- **Quantum Hardware owns** the physics of devices, calibration, and control. Module 05 teaches the software role and the meaning of reported calibration data (05.04), not how it is measured.
- **Module 06 (Quantum Algorithms and Methods)** owns algorithm design. Module 05 shows how an algorithm's work enters and moves through the stack, including the hybrid loop (05.06), without teaching any algorithm.
- **Module 07 (Quantum Error Correction)** owns codes, decoding, and fault tolerance. Module 05 does not duplicate them.
- Cross-module links are deferred by the taxonomy, so the pages do not link into other modules.

## Open items

Detail lives in [`llm/FLAGS.md`](../../../llm/FLAGS.md) and [`llm/todo.md`](../../../llm/todo.md), not here.

- **No subject-matter review yet** of the Module 05 glossary entries and factual claims (the Clifford, stabilizer, tensor-network, runtime, and telemetry statements especially).
- **No screen-reader or keyboard pass yet** on the seven interactives, which have only been tested with scripted interaction.
- **Two terms carry more than one meaning across the module** (the informal use of "job", and "backend"). The terminology pass for 05.07 records where; see `llm/FLAGS.md`.
- **Intermediate and Advanced hardening, cross-module links, and Module 03 integration** are deferred.

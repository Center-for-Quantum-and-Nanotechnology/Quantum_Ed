# 05 · Quantum Software Stack

!!! note "Status"
    This module is a placeholder. Pages will be added as content is written — see the [repository](https://github.com/Center-for-Quantum-and-Nanotechnology/Quantum_Ed) to contribute.

Writing a quantum program is only one part of running a quantum computation. This module explains how quantum computing software works as a system: how a program is described, transformed, adapted to a target, executed on a simulator or a device, coordinated at runtime, and returned as results.

It builds on [03 · Quantum Programming](../03-programming/index.md), which covers *how to use* quantum software. This module covers *how that software works*.

## Planned pages

Pages are linked here as they are written.

- **Understanding the Quantum Software Stack** — why running a quantum program involves several cooperating software responsibilities, including those for the program and those for the device it runs on.
- **Quantum Program Representations** — how the same computation takes different forms at different stages.
- **Compilation and Transpilation** — how programs are translated, transformed, and adapted to a target.
- **Hardware Abstraction and Backend Capabilities** — how software describes what a target can do, including how device calibration information is reported.
- **Simulation Engines and Methods** — how classical simulation methods model quantum computation, and why their tradeoffs differ.
- **Quantum Runtime and Classical-Quantum Orchestration** — how execution, classical processing, jobs, and results are coordinated.
- **Integrated Quantum Software Workflows** — complete simulator and hardware workflows that bring the pieces together.

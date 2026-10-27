# 05 · Quantum Software Stack

Writing a quantum program is only one part of running a quantum computation. This module explains how quantum computing software works as a system: how a program is described, transformed, adapted to a target, executed on a simulator or a device, coordinated at runtime, and returned as results.

It builds on [03 · Quantum Programming](../03-programming/index.md), which covers *how to use* quantum software. This module covers *how that software works*.

## Pages

- **[Understanding the Quantum Software Stack](understanding-the-quantum-software-stack.md)** — why running a quantum program involves several cooperating software responsibilities, including those for the program and those for the device it runs on.
- **[Quantum Program Representations](quantum-program-representations.md)** — how the same computation takes different forms at different stages.
- **[Compilation and Transpilation](compilation-and-transpilation.md)** — how programs are translated, transformed, and adapted to a target.
- **[Hardware Abstraction and Backend Capabilities](hardware-abstraction-and-backend-capabilities.md)** — how software describes what a target can do, including how device calibration information is reported.
- **[Simulation Engines and Methods](simulation-engines-and-methods.md)** — how classical simulation methods model quantum computation, and why their tradeoffs differ.
- **[Quantum Runtime and Classical-Quantum Orchestration](quantum-runtime-and-classical-quantum-orchestration.md)** — how execution, classical processing, jobs, and results are coordinated.
- **[Integrated Quantum Software Workflows](integrated-quantum-software-workflows.md)** — complete simulator and hardware workflows that bring the pieces together, and the different ways a platform can arrange them.

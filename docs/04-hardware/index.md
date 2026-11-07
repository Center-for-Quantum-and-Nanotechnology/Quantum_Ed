# 04 · Quantum Hardware

How a physical device holds, controls, and reads a qubit, why it does so imperfectly, and how different physical platforms make different trade-offs.

It builds on [02 · Quantum Computing Fundamentals](../02-fundamentals/index.md), which teaches what a qubit, a gate, and a measurement *are* as an ideal model. This module teaches what it takes to make a physical system *do* them.

## Hardware Fundamentals

One qubit, followed from start to read-out.

- **[Physical Qubits](physical-qubits.md)** — what makes a real object usable as a qubit, and the five things it has to do that the ideal qubit got for free.
- **[Gates and Control](gates-and-control.md)** — how a signal turns a physical qubit's state, why the turn is never exactly right, and why two qubits need coupling.
- **[Readout](readout.md)** — how a device turns a qubit's state into a bit by detecting a signal, why the signals for 0 and for 1 overlap, and why the misreads are not equal.
- **[Coherence](coherence.md)** — why a qubit's state fades in two different ways, what T1 and T2 time, and why a long time is not a guarantee.
- **[Noise](noise.md)** — where the rest of the imperfection comes from, why a source, an error, and a reported figure are three different things, and why a device is measured and tuned again and again.

## Qubit Modalities

The same questions, answered by different physical systems. These pages are still being written, and are listed here as they are built.

- **[Superconducting Qubits](superconducting-qubits.md)** — a tiny engineered circuit, kept cold, controlled and read with microwaves: what each part of the device does, how long it lasts and how fast it runs, and why wiring makes it hard to scale. The first Platform Card.
- **[Trapped-Ion Qubits](trapped-ion-qubits.md)** — a real atom held by electric fields and cooled by light: how any two ions in a chain can interact, why its operations are slow and its memory very long, and why a longer chain is harder. The second Platform Card, with the first side-by-side reading of two cards.

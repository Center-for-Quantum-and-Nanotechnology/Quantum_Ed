# 07 · Quantum Error Correction

!!! note "Status"
    This module is under active development. See the [repository](https://github.com/Center-for-Quantum-and-Nanotechnology/Quantum_Ed) to contribute.

Quantum error correction (QEC) is how quantum computers stay trustworthy despite noisy hardware. This module moves from the conceptual "why" through the machinery of detecting and correcting errors, to how that machinery scales to real devices.

## What's in this module

- **[Why QEC?](why-qec.md)** — why error correction is necessary at all.

### The Mental Model

- **[Physical vs Logical Qubits](physical-vs-logical-qubits.md)** — how a logical qubit is encoded across multiple physical qubits.
- **[Errors and Noise](errors-and-noise.md)** — what can go wrong on real hardware.
- **[Repetition Codes](repetition-codes.md)** — the simplest error-correcting code as a first concrete example.

### QEC Machinery

- **[Encoding & Syndrome Measurement](encoding-and-syndrome-measurement.md)** — detecting errors without collapsing the encoded information.
- **[Stabilizer Codes](stabilizer-codes.md)** — the general framework behind most practical QEC codes.
- **[Decoding](decoding.md)** — turning syndrome measurements into a correction.

### Scaling

- **[Surface Codes](surface-codes.md)** — the leading code family for near-term fault tolerance.
- **[Minimum-Weight Perfect Matching](minimum-weight-perfect-matching.md)** — a standard decoding algorithm for surface codes.
- **[Lattice Surgery](lattice-surgery.md)** — performing logical operations between surface-code patches.
- **[Hardware-Aware QEC](hardware-aware-qec.md)** — how real device constraints shape code and decoder choices.

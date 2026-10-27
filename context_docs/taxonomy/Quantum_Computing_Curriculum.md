# Quantum Computing Curriculum

## 01 — Foundations

### Why Quantum Computing?

- Motivation
- Problems Quantum Computing Targets
- Classical vs Quantum Computing
### What Is Quantum Computing?

- Qubits
- Superposition
- Measurement
- Entanglement
### Quantum Computing Today

- NISQ Era
- Fault-Tolerant Quantum Computing
- Current Limitations
## 02 — Quantum Computing Fundamentals

### Quantum States

- State versus measurement outcome
- Preparation
- Superposition
### Qubit Representation

- Amplitudes and probabilities
- Normalization
- Phase
### Bloch Sphere

- Poles and equator
- Phase as an angle
- Bloch coordinates
### Quantum Gates

- I, X, Y, Z, H
- Rotation gates
- Composition and order
### Multi-Qubit Systems

- Joint states
- CNOT
- Product and entangled states
- Bell states
### Quantum Circuits

- Wires and symbols
- Reading and building circuits
- Bell-state circuit
### Measurement

- Born rule
- Shots and distributions
- State update after measurement

## 03 — Quantum Programming

### Getting Started

- Python Environment
- Jupyter
- VS Code
### Frameworks & SDKs

- Qiskit
- CUDA-Q
- InQuanto
- Stim
- qBraid
### Running Simulations

### Running on Quantum Hardware

## 04 — Quantum Hardware

### Hardware Fundamentals

- Physical Qubits
- Gates and Control
- Readout
- Coherence
- Noise
### Qubit Modalities

- Superconducting
- Trapped Ion
- Neutral Atom
- Photonic
- Dual-Rail / Bosonic Encodings
- Comparing Platforms
## 05 — Quantum Software Stack

### Understanding the Quantum Software Stack

- Application Layer and Control Layer responsibilities
- Representation, transformation, backend description, execution, runtime, and results
- Calibration and calibration telemetry (introduced, not taught)
- Simulator versus hardware paths
### Quantum Program Representations

- Source representation versus downstream forms
- Conceptual intermediate representations
### Compilation and Transpilation

- Equivalent program transformations
- Native-operation and connectivity constraints
- Optimization tradeoffs
### Hardware Abstraction and Backend Capabilities

- Supported operations, native gates, and connectivity
- Simulator versus hardware targets
- Control-software boundary
- Why calibration is performed
- Calibration telemetry: fields, meaning, units, variability, and uses
### Simulation Engines and Methods

- Simulation approaches, capabilities, and limitations
- Resource implications
### Quantum Runtime and Classical-Quantum Orchestration

- Job submission and lifecycle
- Measurement and result handling
- Hybrid classical-quantum loops
### Integrated Quantum Software Workflows

- End-to-end simulator and hardware paths
- How responsibilities interact and vary by platform

## 06 — Quantum Algorithms & Methods

### Introductory Algorithms

- Variational Algorithms
- VQE
- QAOA
- Quantum Annealing
## 07 — Quantum Error Correction

### Why QEC?

### The Mental Model

- Physical vs Logical Qubits
- Errors and Noise
- Repetition Codes
### QEC Machinery

- Encoding & Syndrome Measurement
- Stabilizer Codes
- Decoding
### Scaling

- Surface Codes
  - Lattice Geometry
  - Data Qubits
  - Stabilizer/Ancilla Measurements
  - X/Z errors
  - Syndrome Changes
  - Code Distance
- Minimum-Weight Perfect Matching
  - Detection Events
  - Decoding Graph
  - Edge Weights
  - Corrections
- Lattice Surgery
  - Logical Patches
  - Boundaries
  - Merge/Split
  - Logical Operations
- Hardware-Aware QEC
## 08 — Labs & Learning Modules

### Beginner Labs

### Programming Labs

### Hardware Labs

### Algorithm Labs

### QEC Labs

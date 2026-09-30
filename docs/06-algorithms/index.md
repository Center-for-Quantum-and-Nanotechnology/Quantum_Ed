# 06 · Quantum Algorithms & Methods

!!! note "Status"
    This module is a work in progress. Pages will be added as content is written — see the [repository](https://github.com/Center-for-Quantum-and-Nanotechnology/Quantum_Ed) to contribute.

Quantum algorithms are what make quantum computers useful — they're the recipes that turn qubits and gates into an actual speedup over classical computing. This module walks through the field's most important algorithms, grouped by what they're for and what they teach. Only the algorithms relevant to the audience are covered in depth; others are mentioned briefly for context without a full treatment.

## Quantum Algorithms

### Oracle Algorithms

These algorithms don't solve practical problems on their own — they exist to *prove* a quantum computer can beat a classical one, using a simplified "black box" (an oracle) that hides a pattern the algorithm has to uncover. Each one isolates a different flavor of quantum speedup in a setting simple enough to work through by hand.

- **Deutsch's Algorithm** — the smallest possible example: one query to a black-box function is enough to tell whether it's constant or balanced, something a classical computer can't guarantee without two queries.
- **Deutsch–Jozsa Algorithm** — the same idea scaled up to functions on many bits at once — the one-query trick still works no matter how large the input gets.
- **Bernstein–Vazirani Algorithm** — uses a similar setup to recover an entire hidden bit string in a single query, instead of one query per bit classically.
- **Simon's Algorithm** — finds a hidden repeating pattern in a function exponentially faster than any classical method, and is the direct inspiration behind Shor's Algorithm.

### Landmark Algorithms

Unlike the oracle algorithms, these solve problems people actually care about, and are the two results most often cited when explaining why quantum computers matter.

- **Shor's Algorithm** — factors large numbers exponentially faster than the best known classical method, which is why it threatens widely used encryption schemes like RSA.
- **Grover's Algorithm** — searches an unsorted list quadratically faster than any classical algorithm, a smaller speedup than Shor's but one that applies far more broadly.

### Variational & Near-Term Algorithms

Hybrid algorithms built to run on today's noisy, error-prone quantum hardware by splitting the work between a quantum computer and a classical optimizer running alongside it.

- **VQE (Variational Quantum Eigensolver)** — estimates the lowest-energy state of a quantum system, with applications in chemistry and materials science.
- **QAOA (Quantum Approximate Optimization Algorithm)** — searches for good, though not necessarily perfect, solutions to combinatorial optimization problems, such as splitting up a graph.
- **VQC (Variational Quantum Classifier)** — trains a parameterized circuit to classify data, the same hybrid pattern as VQE and QAOA applied to machine learning instead of chemistry or optimization.
- **SQD (Sample-based Quantum Diagonalization) and similar** — uses samples measured from a quantum computer to help a classical computer solve a hard problem more accurately than it could alone.

### Quantum Annealing

A different hardware and algorithmic approach, rather than a single named algorithm: it lets a quantum system evolve slowly and continuously so it naturally settles into a low-energy — ideally optimal — solution to an optimization problem.

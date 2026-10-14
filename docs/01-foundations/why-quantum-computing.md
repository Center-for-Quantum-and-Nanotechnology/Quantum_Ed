# Why Quantum Computing?

A quantum computer is not just a faster laptop. It is a different kind of machine, built to take on problems that ordinary computers struggle with. This page covers where the idea came from, which problems it could help with, and what makes it different. A few new terms (qubit, amplitude, measurement) get a quick preview here and are explained properly on the [next page](what-is-quantum-computing.md).

## Where the idea came from

The idea started with a problem in physics. In 1981 the physicist Richard Feynman pointed out that simulating quantum systems, such as molecules, on an ordinary computer gets very hard, very fast. His suggestion was to turn the problem around: if nature is quantum, build the computer out of quantum parts. In 1985 David Deutsch described a universal quantum computer. Then in the 1990s Peter Shor (1994) and Lov Grover (1996) showed that such a machine could speed up problems far beyond physics, namely factoring large numbers and searching.

Why is simulation so hard? Describing *n* ordinary bits takes *n* numbers. Describing *n* qubits takes \(2^n\) numbers, called **amplitudes**. The demonstration below shows what it costs an ordinary computer to store them.

<div data-qed-demo="state-space-growth"></div>

Each added qubit doubles the memory needed. Around 30 qubits, the state no longer fits on a laptop. Around 50, it outgrows the largest supercomputers. A quantum computer holds the same information in just *n* qubits.

!!! note "Two caveats"
    Many quantum systems have structure that clever classical methods can exploit, and those methods keep improving. That is why claims of quantum advantage get checked carefully. Also, storing a huge state is not the same as reading it out. A quantum computer cannot simply hand back all \(2^n\) amplitudes, as the last section shows. Designing algorithms that use the large state and still produce a useful answer is the real challenge.

## What problems could it help with?

Quantum algorithms are known to help with certain kinds of problems. "Help" has a specific meaning here: the number of steps grows more slowly as the problem gets bigger. Some gains are enormous and some are modest.

| Problem | Example | Quantum approach | Size of the gain |
|---|---|---|---|
| **Simulation** | Molecules and materials for new medicines and batteries | Quantum simulation | Potentially huge |
| **Factoring** | Splitting a large number into its prime factors, which protects online banking | Shor's algorithm | Huge: no fast ordinary method is known |
| **Search** | Finding one item in an unsorted list of size *N* | Grover's algorithm | Square root: about \(\sqrt{N}\) steps instead of *N* |
| **Optimization** | Scheduling, delivery routes, investment portfolios | Several approaches | Still an open research question |

A square-root gain is easier to appreciate with numbers: searching a million items takes about a million steps the ordinary way and about a thousand with Grover's algorithm. Simulation and factoring offer the biggest known gains, while optimization is where researchers are still working out what quantum computers can really do.

**Codes are already changing.** Shor's algorithm could break the encryption that protects most internet traffic. A machine large enough does not exist yet, and estimates keep falling: a 2019 estimate called for about 20 million qubits, and a 2025 estimate from Google Quantum AI says under one million would do. Because encrypted data can be recorded now and cracked later, the world is already moving. In 2024 the US standards agency NIST published its first post-quantum encryption standards, which run on ordinary computers and are designed to resist quantum attacks.

A speedup only matters if each step is not too slow. The demonstration below compares search steps for an ordinary computer and for Grover's algorithm, and lets you make each quantum step slower than an ordinary one.

<div data-qed-demo="search-scaling" data-opt-max-slowdown-exponent="10"></div>

With equal step times, the quantum algorithm wins by a huge factor on large problems. As each quantum step gets slower, the problem has to get bigger before the quantum algorithm pulls ahead. Early error-corrected machines are expected to be slow per step, so a square-root gain can be used up. That is a main reason researchers are most excited about problems with larger gains, like simulation and factoring.

## Classical vs Quantum Computing

A quantum computer manipulates a different kind of information, so the two machines differ in what they store, how they are read, and where their advantages come from.

| | Classical computer | Quantum computer |
|---|---|---|
| **Basic unit** | Bit: `0` or `1` | Qubit: a combination of `0` and `1` |
| **State of *n* units** | *n* values | \(2^n\) amplitudes |
| **Reading the result** | Look at any bit, any time | Measuring gives one outcome and changes the state |
| **Copying** | Any bit can be copied | An unknown quantum state cannot be copied |
| **Source of speedups** | Faster hardware, more of it | Interference and entanglement, arranged by the algorithm |

Two things follow. A quantum computer cannot compute anything an ordinary one cannot. It may just do certain jobs far more efficiently. And it is expected to help with *some* problems, not all. Word processing and web browsing gain nothing.

You may hear that a quantum computer "tries every answer at once", but that is misleading. The demonstration below puts *n* qubits in an equal mix of all outcomes and then measures them.

<div data-qed-demo="many-amplitudes"></div>

However many amplitudes the state carries, each measurement returns one string of *n* bits, chosen at random. The rest produce no output. A useful algorithm first arranges **interference**, introduced on the next page, so that wrong answers cancel and the right one grows, and only then measures. Designing algorithms that do this is the subject of [Module 06](../06-algorithms/index.md), and many of the best ones are probably still undiscovered.

## What to carry forward

- Quantum computing began with the difficulty of simulating quantum systems, and the exponential size of a quantum state is the reason.
- Known gains depend on the problem, from huge (simulation, factoring) to modest (search).
- A quantum computer offers a different resource, not a faster clock. Its power comes from interference and entanglement.

The next section, [What Is Quantum Computing?](what-is-quantum-computing.md) makes these terms precise, starting with the qubit.

<details class="qed-details" markdown="1">
<summary>Sources and dates</summary>

- R. P. Feynman, "Simulating Physics with Computers," *International Journal of Theoretical Physics* 21 (1982).
- D. Deutsch, "Quantum theory, the Church–Turing principle and the universal quantum computer," *Proceedings of the Royal Society A* 400 (1985).
- P. W. Shor, "Algorithms for quantum computation: discrete logarithms and factoring" (1994); L. K. Grover, "A fast quantum mechanical algorithm for database search" (1996).
- C. Gidney, "How to factor 2048 bit RSA integers with less than a million noisy qubits," arXiv:2505.15917 (2025). Assumes a 0.1% gate error rate, a square grid of qubits with nearest-neighbor connections, and a 1 microsecond surface-code cycle.
- C. Gidney and M. Ekerå, "How to factor 2048 bit RSA integers in 8 hours using 20 million noisy qubits," *Quantum* 5, 433 (2021).
- R. Babbush, J. R. McClean, M. Newman, C. Gidney, S. Boixo, and H. Neven, "Focus beyond quadratic speedups for error-corrected quantum advantage," *PRX Quantum* 2, 010103 (2021).
- NIST, FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA), finalized August 13, 2024.

</details>

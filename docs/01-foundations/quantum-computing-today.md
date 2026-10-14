# Quantum Computing Today

Quantum computers are not a distant idea. Real machines exist and run in labs and data centers around the world, and in the last few years they have crossed milestones that researchers once thought were a decade away. The biggest machines, the ones that could change chemistry, medicine, and materials science, have not been built yet. This page surveys where the field stands, what has just become possible, and what is still waiting to be solved. The figures carry dates because hardware changes quickly.

## The NISQ Era: The First Machines

In 2018 the physicist John Preskill named the current stage of the field **NISQ**, short for **Noisy Intermediate-Scale Quantum**. "Intermediate-scale" means devices with tens to a few hundred qubits, enough that an ordinary computer can no longer simulate them exactly. "Noisy" means the qubits and gates are imperfect and there is not yet error correction, so every operation has a small chance of going wrong.

That chance is small and shrinking. Quantinuum reported a two-qubit gate fidelity of 99.921% on its 98-qubit Helios system in November 2025, an error rate of about 0.08%, or roughly one mistake in every 1,250 operations. Even so, errors add up. If each gate fails with probability *p*, a circuit of *G* gates runs without any error with probability \((1 - p)^G\). The demonstration below lets you vary both.

<div data-qed-demo="error-budget"></div>

At an error rate of 0.1%, a circuit's chance of running cleanly drops below one half after about 700 gates. Cut the error rate tenfold and that stretches to about 7,000. Each tenfold improvement is a real gain, and the most valuable applications need far more, so there is still plenty of room to improve.

Today's machines are already doing useful scientific work within that limit:

- **Pushing past the best supercomputers.** In October 2025, Google reported a "verifiable" quantum advantage on its 105-qubit Willow processor. It measured a quantity called an out-of-time-order correlator, which Google says ran about 13,000 times faster than the best known classical algorithm on a leading supercomputer. The next step is finding such advantages for problems that matter outside the lab, and researchers are working on it. (Classical methods have caught up with earlier advantage claims, so these results are checked hard.)
- **Hybrid algorithms.** A short quantum circuit runs inside a loop controlled by an ordinary computer, an approach designed to tolerate noise. Whether it brings a practical advantage is one of the field's open questions.
- **Small simulations and demonstrations.** These test hardware and software and train the people who will use bigger machines.

## The Breakthrough: Error Correction Works

The key to large quantum computers is **fault tolerance**: building a machine that stays reliable even though its parts keep failing. Instead of trusting one fragile physical qubit, a fault-tolerant computer spreads one **logical qubit** across many physical qubits, checks for errors continually, and corrects them faster than they pile up.

The theory behind this predicts a **threshold**. If the physical error rate is below a critical value, adding more qubits makes the logical qubit *better*, and the error can in principle be pushed as low as needed. Above the threshold, adding qubits makes things worse. For about thirty years this was only a prediction.

In 2024 Google Quantum AI showed it on hardware, in a result published in *Nature* in 2025. On its Willow chip, each step up in the size of the error-correcting code, from distance 3 to 5 to 7, cut the logical error rate roughly in half. The largest code used 101 of the chip's 105 qubits, and its logical qubit lasted longer than the best physical qubit on the chip. Other groups are advancing too: Quantinuum reports 48 error-corrected logical qubits on Helios (company-reported, November 2025).

This is a turning point. The result shows that stored quantum information can be protected, and that the road to large machines is an engineering problem rather than a question of whether the physics allows it. There is still a long way to go. A full computation on logical qubits has yet to be demonstrated, and at present error rates a good logical qubit may need over a thousand physical ones. How error correction works, and why it is hard, is the subject of [Module 07 · Quantum Error Correction](../07-error-correction/index.md), which begins with the [Why QEC?](../07-error-correction/why-qec.md) section.

## The Open Frontier

The gap between today's machines and the applications described earlier is where the opportunity is. Each item below is an active research problem, and each needs people to solve it.

**Scale.** Leading gate-based systems have roughly a hundred to a thousand physical qubits. Published estimates for breaking 2048-bit RSA encryption call for close to a million, with error rates and run times no current device reaches. The chart shows the distance. Raw qubit count is also an incomplete measure: a smaller, cleaner chip can do more useful work than a larger, noisier one.

<div data-qed-demo="log-bars"
     data-opt-title="Physical qubits: devices today vs. an RSA-2048 estimate"
     data-opt-unit="qubits"
     data-opt-items='[{"label":"Google Willow (2024)","value":105,"accent":"quantum","note":"Surface-code memory experiments; Nature, 2025."},{"label":"Quantinuum Helios (2025)","value":98,"accent":"quantum","note":"Trapped ions, all-to-all connectivity."},{"label":"IBM Condor (2023)","value":1121,"accent":"quantum","note":"A larger chip; qubit count is not a measure of quality."},{"label":"RSA-2048 estimate (2025)","value":1000000,"accent":"noise","note":"An upper bound (under one million), assuming 0.1% gate error; Gidney, 2025."}]'></div>

**Quality.** Error rates near one in a thousand per gate must fall much further for long algorithms, or be corrected, at the cost of overhead.

**Speed and memory.** A qubit holds its state only briefly, and what counts is how many operations fit inside that time. Superconducting qubits are fast but forget quickly, while trapped-ion qubits remember much longer but run more slowly. [Module 04](../04-hardware/index.md) compares the platforms.

**Wiring and control.** Qubits cannot all talk to each other directly, measurements are imperfect, and every qubit needs precise control signals, often inside a refrigerator colder than outer space. Scaling all of this up is a major engineering challenge.

**Useful advantage.** Quantum advantage has been shown on specialized tasks. A broadly accepted advantage on a problem of commercial or scientific value is still to come, and discovering the algorithms and applications that deliver it is open work.

!!! note "Figures change quickly"
    The numbers on this page reflect publications through late 2025 and are a snapshot. Vendor roadmaps, logical-qubit counts, and error rates are updated often, so check current sources before citing them.

## Where You Come In

The field is young. The transistor was invented in 1947, and the first microprocessors came a generation later. Quantum computing is at an early stage of its own history, and the machines and software of the next twenty years are being designed by people who are learning this material now.

Think about the questions that ordinary computers cannot answer today. How does the enzyme that fixes nitrogen for fertilizer work at the atomic level? Why do some materials conduct electricity with no resistance, and could we design one that does so at room temperature? Which molecules would make better batteries or medicines? These are exactly the kind of quantum-mechanical questions that quantum simulation is aimed at. No one knows yet which will pay off first, and that is what makes it a field worth entering.

Several companies already let students run programs on real quantum hardware through the cloud, and the ideas in this course are the same ones those machines run on. Physicists, engineers, computer scientists, chemists, and mathematicians all have problems to solve here.

## What to carry forward

- Today's **NISQ** devices are real, noisy machines that can already do things no ordinary computer can easily match on specialized tasks.
- **Error correction has been shown to work** below threshold on real hardware. That moves large-scale quantum computing from "if" to "how."
- The remaining gaps in scale, quality, speed, and useful applications are the research and engineering problems of the coming decades, and they are the subject of the later modules.

These three pages give the framework for the rest of the course. [02 · Quantum Computing Fundamentals](../02-fundamentals/index.md) develops the mathematics and circuit model behind the ideas introduced here.

<details class="qed-details" markdown="1">
<summary>Sources and dates</summary>

- J. Preskill, "Quantum Computing in the NISQ era and beyond," *Quantum* 2, 79 (2018).
- Google Quantum AI, "Quantum error correction below the surface code threshold," *Nature* 638, 920 (2025); announced December 2024.
- Quantinuum, Helios launch announcement and technical materials (November 2025): 98 qubits, 99.921% two-qubit gate fidelity, 48 error-corrected logical qubits at a 2:1 encoding ratio (company-reported).
- Google Quantum AI, "Quantum Echoes" verifiable-advantage result, *Nature* (October 2025). The 13,000× figure is the authors' comparison with a classical algorithm run on the Frontier supercomputer.
- C. Gidney, "How to factor 2048 bit RSA integers with less than a million noisy qubits," arXiv:2505.15917 (2025). Assumes 0.1% gate error on a square grid with nearest-neighbor connectivity. Earlier work (Gidney and Ekerå, *Quantum* 5, 433, 2021) estimated about 3 billion Toffoli gates for the factoring computation.
- IBM Condor processor (1,121 superconducting qubits), announced December 2023.

</details>

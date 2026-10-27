# Module 04 — Quantum Hardware

**Document type:** Module-scoped vision, approved taxonomy, and curriculum integration guidance  
**Status:** Approved v1.0 (2026-10-27). All 14 decisions in section 0 were approved with their recommendations. Changing page count, order, ownership, or titles is now a curriculum revision that needs review.  
**Scope:** Module 04 only  
**Audience:** Curriculum maintainers, instructional authors, and code agents  
**Authority:** Apply alongside [`ProjectVision.md`](../../vision/ProjectVision.md) and the existing repository conventions. Once approved, this document defines **what Module 04 covers and how its pages relate**. It does not supersede the global project vision or individual page specifications.

**Inputs reviewed:** the global curriculum tree ([`Quantum_Computing_Curriculum.md`](../../taxonomy/Quantum_Computing_Curriculum.md)); the Module 02 taxonomy ([v1.2](../module_02/taxonomy_QuantumComputingFundamentals_v1.2.md)) and Module 05 taxonomy ([v1.1](../module_05/taxonomy_QuantumSoftwareStack_v1.1.md)); the built Module 01, 02, 05 and 07 pages and their specs; the glossary entries in `data/glossary/hardware-and-physical-systems.yml`, `noise-and-errors.yml` and `advanced-and-emerging-concepts.yml`.

**Weight of this module.** It is the most fact-dense module so far, and the risks are different from Module 05's:

- **Dated and contested facts.** Coherence times, gate speeds, qubit counts and "which platform is ahead" change every year and are argued over. A page that hard-codes them will be wrong soon and will look like a ranking.
- **A physics course in disguise.** Every topic can be taught at graduate depth. The Vision (section 2) says not to introduce complexity because it is technically related.
- **Three neighbours with fences.** Module 02 has already handed over physical gates, readout and decoherence. Module 05 has already handed over the physical reasons for drift and the measurement protocols behind telemetry. Module 07 owns the error vocabulary and everything about correcting errors.
- **Five near-identical modality pages.** Without a shared structure they become five brochures, and the comparison the Today page promises never happens.
- **No subject-matter review yet.** The glossary's Transmon, T1 and T2 entries are already on the open review list in `llm/todo.md`.

---

## 0. Decisions (approved 2026-10-27)

All 14 decisions below were approved as recommended, and the rest of this document reflects them.

1. **Page IDs and grouping.** The global tree lists two groups (Hardware Fundamentals, Qubit Modalities) with five topics each, in the same shape as Module 07's groups. Module 05 instead treats each heading as one page.
   *Recommendation:* ten topics become ten pages, with grouped IDs as in Module 07 (`04.01.01` to `04.01.05`, `04.02.01` to `04.02.05`). One page per topic keeps each lesson to one idea; two giant pages would break the Vision's page design philosophy.

2. **A closing comparison page.** The Today page already says "Module 04 compares the platforms." The tree has no page that does this.
   *Recommendation:* add `04.02.06 Comparing Platforms` (11 pages in all). It is the module's synthesis, as 05.07 is for Module 05. This is a change to the global tree, so it needs your approval. The fallback is to put the comparison at the end of 04.02.05, which mixes a platform comparison into a page about encodings.

3. **Where calibration physics lives.** 05.04 tells learners the physical reasons for drift "belong to the Quantum Hardware module", and the tree has no calibration page.
   *Recommendation:* no new page. The experiments that calibration repeats are taught where their physics lives: the drive-and-rotate experiment in 04.01.02, the wait-and-measure decay experiment in 04.01.04, the threshold in 04.01.03. 04.01.05 (Noise) closes the loop: sources drift, so the device is re-measured and re-tuned. This keeps the tree intact.

4. **The set of platforms.** The tree names superconducting, trapped-ion, neutral-atom, photonic, and "Dual-Rail / Bosonic Encodings". The glossary also has spin qubits, which the tree omits. Dual-rail and bosonic are encodings that can sit on several platforms, not platforms of their own.
   *Recommendation:* keep the tree's four platforms and treat the fifth as an encoding page (decision 5). Do not add a spin-qubit page. Name spin qubits and other approaches once on the comparison page as "not covered here", so the module does not imply four platforms are all there is.

5. **How deep Dual-Rail / Bosonic goes at Beginner, and the Module 07 fence.** This is the hardest page conceptually, and it touches erasure, bias, and error correction, which Module 07 owns (the glossary already has Erasure Conversion, Erasure Qubit, Biased Noise, and Bias-Preserving Gate).
   *Recommendation:* the Beginner contract is the idea only: an encoding is a choice of how to use a physical system to stand for 0 and 1, and a good choice makes the most common error rarer or easier to notice. Mechanisms (Fock states, cat and GKP pictures, erasure conversion in detail) are Intermediate. Codes, logical qubits, and decoding stay in Module 07. Mark this page as the highest review risk.

6. **Numbers and dated facts.** The modality pages and the comparison need to say something about speed, lifetime and size.
   *Recommendation:* use orders of magnitude and ranges labelled approximate, never single values and never rankings. Computed comparisons (for example, how many operations fit in a lifetime) use the stated ranges and say so. Interaction models use invented values, labelled as invented, as Module 05 does. Real device names, vendor names, and record figures stay out of the Beginner pages. Each page that states modality facts carries a "figures change" note and a dated sources list, as the Today page does.

7. **Prerequisites.**
   *Recommendation:* assume Module 01 and Module 02 at Beginner level (the ideal qubit, gate, measurement, and the Bloch sphere) and nothing from Module 03. Assume no physics beyond what the first page teaches, which is only that a physical system has distinct energy levels, two of which can stand for 0 and 1. No calculus, no complex numbers, no quantum mechanics beyond Module 02.

8. **Recurring example.**
   *Recommendation:* one qubit through the Fundamentals (start it, drive it, wait, read it), then the Bell circuit's three kinds of operation (a one-qubit rotation, a two-qubit interaction, a readout) as the thread through the modality pages and the comparison. The Bell circuit is an anchor, not a restriction: on photonic hardware the two-qubit step is the hard part, and the page must say so rather than force sameness.

9. **How realistic the interactions are.**
   *Recommendation:* closed-form educational models (a drive that rotates by an angle set by strength and time, an exponential decay, two overlapping signal distributions, a drift that moves a parameter), with seeded sampling labelled as simulated. No solver for the physics of any device, and no live hardware. Reuse `QedBloch`, `QedGates` and `QedShots` where they fit. Every interaction is labelled as a model, never as data from a device.

10. **Pulse-level and protocol detail.** 05.04 deferred pulse scheduling, pulse-level interfaces, and control electronics to "future Advanced hardening or the hardware curriculum". Separately, T2 and T2* are different quantities, and 05.04 already says so.
    *Recommendation:* at Beginner, a control pulse is a signal whose strength and duration set the rotation angle (that is the 04.01.02 interactive). Pulse shaping, scheduling, control electronics, and pulse-level SDK interfaces are Advanced or deferred. Beginner uses "T2" with one line saying the exact definition depends on the measurement; T2*, echo experiments, and the relation between T1 and T2 are Intermediate.

11. **One Platform Card for the four platforms and the comparison.** Each platform page answers the same six questions (section 9).
    *Recommendation:* build one data-driven component and one data set. Each platform page loads its own card and offers a "compare with" control, and 04.02.06 shows the cards side by side. The comparison is computed from the same data, not written separately.

12. **Experience levels.**
    *Recommendation:* V1 is Beginner only, as in Module 05. No gated Intermediate or Advanced blocks. Section 10 lists candidates so the pages can be hardened later without redesign.

13. **Glossary.** Twenty-two hardware entries and fifteen noise entries already exist, and none of the hardware ones are referenced from a Module 04 page yet.
    *Recommendation:* reuse them and add only what a page cannot do without. Likely additions are Control Pulse, Rabi Oscillation, Dual-Rail Encoding, and Bosonic Encoding. Decide the final list when each spec is drafted. Add Module 04 page references to the existing entries as the pages are built.

14. **Review and status.**
    *Recommendation:* every page is marked `built, needs hardening` until a subject-matter reviewer has checked it, and `llm/FLAGS.md` records that no review has happened. Ask now whether a hardware reviewer is available, because that changes whether the modality facts can be treated as settled at publication.

---

## 1. Purpose and identity

Module 04 explains **how a physical device holds, controls, and reads a qubit, why it does so imperfectly, and how different physical platforms make different trade-offs.**

**Guiding distinction across the neighbours:**

- **Module 02 — Fundamentals:** what a qubit, gate, and measurement *are*, as an ideal model.
- **Module 04 — Quantum Hardware:** what it takes to make a physical system *do* them, and why it never does so perfectly.
- **Module 05 — Quantum Software Stack:** how software *describes* a device and *drives* it.
- **Module 07 — Quantum Error Correction:** how to *survive* a device's errors.

**Module-level central progression:**

`IDEAL QUBIT → PHYSICAL QUBIT → CONTROL → READOUT → LIFETIME → NOISE AND DRIFT → HOW PLATFORMS DIFFER → COMPARISON`

The first five pages are a plain-language version of what any quantum device must do: start a qubit in a known state, control it, connect it to others, read it, and keep it long enough. (The research field's standard checklist for this is DiVincenzo's criteria. It is named, not required, at Intermediate.) The second half shows that every platform has to answer the same questions, in different ways.

**This is a progression for learning, not a claim about the field.** No platform is the single right answer, and the pages must not present the order of the platforms as a ranking or a history.

## 2. Prerequisite assumptions

See decision 7. In short:

- **Required:** Module 01 and Module 02 at Beginner level, which give the ideal qubit, the gates H, X and Z and rotations, the Bloch sphere, the Bell circuit, and measurement with shots.
- **Not assumed:** Module 03 (programming) or Module 05 (software). Module 04 explains what it needs.
- **Not assumed:** physics. The first page introduces the one idea the rest depend on, that a physical system has distinct energy levels and two of them can stand for 0 and 1.

## 3. Promises already made to Module 04

Built pages have already told learners that Module 04 will cover these topics. Each must be kept or deliberately released.

| Where | What it says | Where this module keeps it |
|---|---|---|
| Today page (`quantum-computing-today.md`) | "Superconducting qubits are fast but forget quickly, while trapped-ion qubits remember much longer but run more slowly. Module 04 compares the platforms." | 04.02.01, 04.02.02, 04.02.06 |
| What Is Quantum Computing? | Real hardware readout is imperfect (see Module 04 and Module 07). | 04.01.03 |
| 02.03 Bloch Sphere | Physical rotations, noise, and decoherence belong to Module 04. | 04.01.02, 04.01.04, 04.01.05 |
| 02.04 Quantum Gates | "The sphere is a picture of the effect on the state. How hardware does it belongs to Module 04." | 04.01.02 |
| 02.05 Multi-Qubit Systems | Noise and decoherence belong to Module 04. | 04.01.04, 04.01.05 |
| 02.06 Quantum Circuits | Hardware timing, noise, and decoherence belong to Module 04. Diagram order is not physical timing. | 04.01.02, 04.01.04 |
| 02.07 Measurement (and the page's closing note) | Real devices have imperfect readout, noise, and calibration, which Module 04 and Module 05 cover. | 04.01.03, 04.01.05 |
| 05.04 Hardware Abstraction | "Why a device drifts is a question for the Quantum Hardware module." Calibration physics and measurement protocols are owned here. | 04.01.05, with the experiments in 04.01.02 to 04.01.04 |

## 4. Module-level Core Learning Contract

By the end of the Beginner V1 module, learners should be able to:

1. Identify which parts of the Module 02 model are ideal (a perfect start, exact rotations, instant gates, perfect readout, unlimited time, no interference from anything else) and which physical imperfection breaks each.
2. Explain what makes a physical system usable as a qubit, in terms of two distinguishable levels and five needs: to start it, control it, connect it, read it, and keep it.
3. Explain that a gate is a physical control signal acting on a qubit, and relate the size of a rotation to the signal's strength and duration.
4. Explain why a two-qubit gate needs the qubits to interact, and why it is generally harder than a one-qubit gate.
5. Explain how a readout turns a physical difference into a bit, why the signals overlap, and why that produces readout errors that can differ between 0 and 1.
6. Distinguish T1 (a qubit losing energy) from T2 (a superposition losing its phase) at an intuitive level, and read a decay curve.
7. Judge roughly how many operations fit within a coherence time, and explain why a long coherence time alone does not guarantee that a circuit works.
8. Name the main sources of imperfection (environment, control, neighbours, leakage, measurement) and distinguish a noise source from an error and from a reported metric.
9. Explain why qubits on one device differ from one another and why a device's behaviour drifts, and therefore why devices are measured and re-tuned repeatedly.
10. For each of the four platforms, state what the qubit is, how it is controlled, how it is read, how long it lasts and how fast it runs (in rough terms), how qubits connect, and what is hard about scaling it.
11. Explain that an encoding such as dual-rail or a bosonic mode is a choice that can make the most common error rarer or easier to notice, and that this is not by itself error correction.
12. Compare platforms by trade-off, without naming a single best platform, and recognise that the figures change quickly.
13. Distinguish the physical origin of a quantity (this module) from how software is told about it (Module 05) and from how errors are corrected (Module 07).

The Core Learning Contract belongs in Beginner content. Intermediate and Advanced content deepen the same mental model rather than replace it.

## 5. Finalized internal taxonomy — V1.0

**Group 04.01 — Hardware Fundamentals.** One qubit, followed from start to read-out.

| ID | Page title | Core instructional objective | Beginner V1 scope / ownership | Primary V1 interaction concept |
|---|---|---|---|---|
| **04.01.01** | **Physical Qubits** | Explain what makes a physical system usable as a qubit and how it differs from Module 02's ideal one. | Two usable levels out of a larger ladder; natural qubits (atoms, ions, photons) versus engineered ones (circuits); the five needs (start, control, connect, read, keep); isolated from the world yet reachable by us; starting in a known state (the physical side of 02.01 preparation). | Qubit chooser: pick two levels from an energy ladder and test the candidate against the five needs. |
| **04.01.02** | **Gates and Control** | Explain how a control signal turns a physical qubit's state, and why gates take time and are never exact. | Control signals by kind (microwave, laser, magnetic) named at a conceptual level; strength and duration set the rotation angle; the drive-and-flip experiment; a small miscalibration gives an over- or under-rotation; two-qubit gates need the qubits to interact, and that is the costly step. Native gates are named and handed to 05.04. No pulse shaping, electronics, or scheduling. | Drive a qubit: set strength and duration, watch the Bloch point move and the outcome probability swing, then introduce a miscalibration. |
| **04.01.03** | **Readout** | Explain how a qubit's state becomes a classical record, and why that step is imperfect. | Measurement as detecting a signal that differs between 0 and 1; overlapping signals and a threshold; asymmetric misreads; readout is slow compared with gates; the measurement ends the superposition (as in 02.07). Mid-circuit measurement and syndrome extraction are not here. | Read the signal: move a threshold across two overlapping signal distributions and compare the true and the reported counts. |
| **04.01.04** | **Coherence** | Explain why a qubit's state fades, and what T1 and T2 mean physically. | T1 as energy loss and T2 as phase loss, shown as a decay curve and as a Bloch point that drifts or spreads; how they are measured (prepare, wait, measure, repeat); how many gates fit in a lifetime; a long lifetime is not a guarantee. | Wait and watch: choose a wait time, repeat the measurement, and watch the survival fraction fall; switch to a superposition and watch the phase spread. |
| **04.01.05** | **Noise** | Explain where imperfection comes from, why it varies and drifts, and why devices are re-tuned. | Sources by kind (environment, control, neighbours and crosstalk, leakage, readout); differences from qubit to qubit; drift over time; how sources combine into the figures a device reports; closes the loop to calibration by re-running the earlier experiments. The error vocabulary (bit-flip, phase-flip, Pauli, depolarizing) is Module 07's and is named, not taught. | Error budget: switch sources on and off and see which dominates an operation; move time forward and watch a parameter drift until the device is recalibrated. |

**Group 04.02 — Qubit Modalities.** The same questions, answered by different physical systems.

| ID | Page title | Core instructional objective | Beginner V1 scope / ownership | Primary V1 interaction concept |
|---|---|---|---|---|
| **04.02.01** | **Superconducting Qubits** | Explain how an electrical circuit can act as a qubit and what that implies for control, speed, and scale. | The circuit as an artificial atom (junction named, not derived); very low temperature and why; microwave control; read-out through a resonator; fixed on-chip neighbours; fast operations and shorter lifetimes; qubit-to-qubit variation from fabrication; wiring as a scaling limit. | Platform Card plus a chip-and-fridge explorer: select each part and see its role. |
| **04.02.02** | **Trapped-Ion Qubits** | Explain how single ions held by electric fields act as qubits and what that implies. | Ions held in a chain; laser or microwave control; read-out by whether the ion scatters light; any pair in a chain can interact through shared motion; slower operations and long lifetimes; longer chains are harder; moving ions between regions as one way to scale. | Platform Card plus an ion-chain explorer: choose two ions to interact and see read-out as bright or dark. |
| **04.02.03** | **Neutral-Atom Qubits** | Explain how arrays of uncharged atoms held by light act as qubits and what that implies. | Atoms held in optical tweezers; rearrangeable arrays; interaction through excited high-lying states (named, not derived); read-out by imaging; atoms can be lost; large arrays; operation cycles are slow. | Platform Card plus a tweezer-array explorer: move atoms and see which pairs can interact. |
| **04.02.04** | **Photonic Qubits** | Explain how a photon can carry a qubit and why entangling operations are the hard part. | A qubit in a photon's path, polarization, or arrival time; photons travel fast and rarely interact; loss as the main error; single-qubit operations are easy with optical elements; two-qubit operations need special methods (named, not taught); networking as a natural strength. | Platform Card plus an interferometer: a photon through two paths with an adjustable phase, linked back to the Module 01 interference demo. |
| **04.02.05** | **Dual-Rail and Bosonic Encodings** | Explain that how information is encoded in a physical system changes which errors are common or detectable. | An encoding is a choice of what stands for 0 and 1. Dual-rail: where one excitation is. Bosonic: using the many levels of an oscillator. The point at Beginner is the idea that the encoding can make the main error rarer or noticeable; mechanisms are Intermediate. This is not error correction, and codes belong to Module 07. | Encoding chooser: the same physical error acts on two encodings and the learner sees which error becomes visible. |
| **04.02.06** (added by decision 2) | **Comparing Platforms** | Compare the platforms by trade-off using the same six questions, and recognise that there is no single best platform. | The six-question cards side by side; speed against lifetime, with a computed "how many operations fit"; connectivity and scale as different shapes of difficulty; what is not covered (spin qubits and others); figures change; closing hand-off to Module 05. | Platform comparison explorer: pick a priority (speed, memory, connectivity, scale) and see what each platform gives and costs, with no ranking. |

**Taxonomy interpretation:** each row is one canonical page, not separate Beginner, Intermediate and Advanced pages. Interaction descriptions are design intentions to be refined in the page specifications. They are not requirements to simulate any device.

## 6. Narrative and section handoffs

- **Module 02 → 04.01.01:** the ideal model gave us operations for free; ask what a real device has to do to provide them.
- **04.01.01 → 04.01.02:** once there is a physical qubit, ask how its state is changed on purpose.
- **04.01.02 → 04.01.03:** once a state can be changed, ask how it is found out.
- **04.01.03 → 04.01.04:** once it can be read, ask how long it stays what it was.
- **04.01.04 → 04.01.05:** lifetime is not the only thing that goes wrong; ask where the other imperfections come from, and why they change.
- **04.01.05 → 04.02.01:** the answers depend on the physical system; ask how different systems answer.
- **04.02.01 to 04.02.04 (in turn):** each platform answers the same six questions differently, and each leaves a question the next one answers better.
- **04.02.04 → 04.02.05:** all of these have a dominant way of going wrong; ask whether the way information is encoded can change that.
- **04.02.05 → 04.02.06:** with four platforms and one encoding idea in hand, compare them honestly.
- **04.02.06 → Module 05 and Module 07:** the differences have to be described to software (Module 05) and the errors have to be survived (Module 07). Name these in words. Cross-module links stay deferred.

The page sequence is a **pedagogical sequence**, not a history of the field.

## 7. Recurring example and instructional continuity

See decision 8.

- **Fundamentals:** one qubit, taken through *start, drive, wait, read*. This is the simplest experiment that exposes each topic, and it is how real devices are characterised.
- **Modalities and comparison:** the Bell circuit's three kinds of operation (a one-qubit rotation, a two-qubit interaction, a readout) as a short strip on each page: "how would this platform do it?"
- **Important qualification:** the Bell circuit is a teaching anchor, not a restriction. Where it does not fit a platform (photonic entangling), say so. Do not manufacture sameness.
- Label every simplified model and its consequential limits (Vision, section 9).
- Keep terms and visual identity consistent across the module.

## 8. Module boundaries and ownership

| Related module | Primary ownership outside Module 04 | Permitted Module 04 treatment |
|---|---|---|
| **01 — Foundations** | Motivation, the NISQ overview, current limitations. | Keep the promise on the Today page (compare platforms) without repeating its overview. |
| **02 — Fundamentals** | The ideal model: states, gates, circuits, measurement, and the Born rule. | Explain how a device realises each ideal operation and where it departs from it. Do not re-teach the ideal operation. |
| **03 — Quantum Programming** | Environments, SDKs, writing circuits, submitting jobs. | Do not teach any SDK or run. At most, say that what a program asks for is what a device physically does. |
| **05 — Quantum Software Stack** | Backend descriptions, native-gate and connectivity metadata as software sees them, calibration telemetry as reported data, compilation, simulation, runtimes. | Own the **physical origin** of the quantities telemetry reports (what T1 is, why a readout misreads, why a device drifts) and the **measurement protocols** behind them. Do not teach how software consumes them. Do not duplicate the field catalog in `QedBackend`. |
| **06 — Algorithms and Methods** | Algorithm design. | Not touched. |
| **07 — Quantum Error Correction** | Error models and vocabulary, codes, syndrome extraction, decoding, fault tolerance, hardware-aware decoding. | Explain the physical sources of noise and drift, and name Module 07's terms once. Do not teach the error vocabulary as a model, any code, or any decoder. For encodings (04.02.05), teach the physical idea only. |
| **08 — Labs** | Extended practical activities, including Hardware Labs. | Do not put lab-length procedures in the conceptual pages. |

**Ownership fences for specific topics:**

- **Calibration.** Module 04 owns the physics of the experiments (drive-and-flip, decay, thresholds) and why they must be repeated. Module 05 owns calibration as a software-facing workflow and telemetry as reported data. The page should say "this is the measurement behind the number a device reports", not describe how software reads it.
- **Noise.** Module 04 owns where noise comes from. Module 07 owns the language of errors and the models built on it. The distinction *noise source ≠ error ≠ reported metric* is taught here and reused there.
- **Metrics.** A metric is not a guarantee (Module 05's rule applies here too): T1, T2, and fidelity numbers do not predict whether a whole circuit succeeds.
- **Platforms.** Platform pages describe physical systems, not products. No vendor may define the page hierarchy, and no page may rank platforms.

## 9. The Platform Card (module-specific structure)

Every platform page answers the same six questions, in the same order, from one shared data model (decision 11):

1. **What is the qubit?**
2. **How is it controlled?**
3. **How is it read out?**
4. **How long does it last, and how fast does it run?** (ranges, labelled approximate)
5. **How do qubits connect?**
6. **What makes it hard to scale?**

Each page also carries a short Bell-circuit strip and a "figures change" note. The comparison page is computed from the same data. Fields that do not apply to a platform are shown as "not applicable", never hidden, because the comparison depends on seeing the gap.

## 10. Progressive-depth and V1 strategy

Follow `ProjectVision.md`:

- **Beginner is the V1 priority** and carries every page's essential conceptual contract.
- **Intermediate is cumulative:** add precision, diagrams of real structure, and worked quantities.
- **Advanced is cumulative:** add the rigorous treatment, current architectures, and research.
- Do not create three versions of a page. Keep one canonical page with room for depth to be added.
- Optional exploration ("Going deeper") is distinct from experience level.
- Prefer intuition → visualization → interaction → terminology → mathematics → implementation → deeper treatment.
- Prefer deterministic, resettable, explanatory interactions. Keep randomness visible and labelled as simulated.

### Candidate future depth (not V1 commitments)

| Page | Intermediate / Advanced expansion candidates |
|---|---|
| 04.01.01 | The energy-level picture with anharmonicity; why the transmon design; the standard criteria (DiVincenzo) named; Hamiltonians and qubit design. |
| 04.01.02 | Rabi frequency and π and π/2 pulses as formulas; common two-qubit gate mechanisms at diagram level; pulse shaping, optimal control, electronics, and pulse-level interfaces (Advanced). |
| 04.01.03 | Dispersive read-out and signal-to-noise against integration time; amplifiers; non-destructive measurement; mid-circuit measurement and reset (Advanced). |
| 04.01.04 | The Bloch picture of T1 and T2; T2* against echo; the relation between T1 and T2; noise spectroscopy (Advanced). |
| 04.01.05 | Defects and flux noise; leakage; crosstalk matrices; randomized benchmarking named and interpreted; how noise models are extracted (Advanced). |
| 04.02.01 to 04.02.04 | Real device structure and parameter ranges; coupler designs; trap segments and shuttling; Rydberg gates; photonic circuits; scaling architectures; current implementations and references (Advanced). |
| 04.02.05 | Fock states; cat and GKP pictures; erasure conversion in detail; the link to codes (Module 07). |
| 04.02.06 | Spin and other platforms; realistic parameter tables; roadmaps and trade studies. |

These are possible future additions, not an instruction to make V1 comprehensive.

## 11. Visual and interactive conventions

- Maintain the global site's design language. Reuse the Module 07 palette where its meanings apply: **gray or neutral for physical qubits, orange or red for noise and physical errors, blue for quantum state information, green for success.** Do not use purple (syndrome and check information) for anything in this module.
- Where this module shows a reported number as the result of a measurement (for example, a T1 that came from the decay experiment), reuse the site's telemetry treatment (teal with a dashed border, `--qed-color-telemetry`) and always pair it with a text label, as Module 05 does.
- **Add and use consistently** one treatment for the **control signal** (what we send to a qubit) and one for the **read-out signal** (what comes back). They must differ from each other, from the palette above, and from Module 05's meanings. Choose them in the first spec after inspecting `extra.css`, and record them in `llm/CONVENTIONS.md`.
- Do not rely on color alone. Use text labels, shapes, or line styles.
- Each page has **one clearly designated primary V1 interaction** with an observable cause and effect, immediate explanation, and a reset.
- Separate what the learner changes (a setting) from what the model derives (a rotation, a curve) and from what the learner observes (counts, a reading).
- Label every model as a model. Use invented values for interaction models, and ranges labelled approximate for facts about platforms.
- Prefer simple diagrams, small concrete examples, and responsive layouts. Provide a non-visual alternative for any chart or diagram (a table or text readout), and a non-3D alternative for any Bloch picture.

## 12. Factual integrity and quality gates

- **No single numbers for platforms.** Use ranges and orders of magnitude, labelled approximate (decision 6).
- **No rankings, no "winner", and no vendor products** in Beginner pages.
- **Dated sources.** Any page that states modality facts carries a "figures change quickly" note and a dated sources list, as the Today page does. Prefer primary sources. Do not rely on secondary summaries for new results.
- **Honest simplification.** Where a Beginner picture is a simplification (a qubit as two levels, a decay as one exponential, a readout as two bell-shaped signals), the page says so once and does not imply it is the whole story.
- **Reuse, don't restate.** Where a quantity appears in Module 05 or the glossary, the definition must agree. If a Module 04 page shows that a glossary definition is wrong, flag it and fix the glossary, rather than diverging.
- **Review.** A hardware subject-matter review is required before publication of any modality fact (decision 14). Until then pages are `built, needs hardening`, and the open review is recorded in `llm/FLAGS.md`.
- **Accessibility.** Keyboard operation and screen-reader labelling for every interactive. No screen-reader pass has yet been done on Modules 01, 02, 05 or 07, so this module should add one rather than inherit the gap.

## 13. Page specification and implementation governance

Individual page specs are authored with the `section-spec-writer` format and live in `specs/`, named `<ID>_<PageTitle>Instruction.md` (for example `04.01.02_GatesAndControlInstruction.md`). Each spec includes, in order: Project Context, Goal, Learning Outcomes, Experience-Level Scope, Page Structure (with one Main Interactive), Visual / UX Requirements, Shared Components, Technical Requirements, Important Pedagogical Constraints, and End State.

Each spec must name the previous and next page, guard against the misconceptions below, keep the ownership fences, and motivate the next page. Specs say what to teach, the Vision says how the platform teaches, and the repository says how it is built.

### Module-wide misconceptions to guard against

- **A physical qubit ≠ the ideal qubit of Module 02.** It has to be started, driven, read, and kept, and each step costs something.
- **A gate ≠ an instant symbol.** It is a signal with strength and duration, and it can be slightly wrong.
- **Readout ≠ looking at the state.** It detects a signal that differs between 0 and 1, and the signals overlap.
- **T1 ≠ T2.** Losing energy is not the same as losing phase.
- **A long coherence time ≠ a working circuit.** A metric is not a guarantee.
- **Noise ≠ error ≠ reported metric.**
- **More qubits ≠ a better machine.** Quality, connectivity, and speed matter as much.
- **No platform is the best platform.** The pages compare trade-offs, and the figures change.
- **Cold is not universal.** Some platforms need refrigerators and others need vacuum and lasers.
- **A device is not static.** Its parameters drift, which is why it is measured and tuned again.
- **An encoding ≠ error correction.** It can make errors easier to notice, but correcting them is Module 07.
- **Hardware ≠ software's description of it.** Module 05 describes what software is told about a device, not the device.

## 14. Deferred work and explicit non-goals

**Defer until the planned curriculum hardening pass:**

- Cross-module links and systematic concept cross-references.
- Intermediate and Advanced content (section 10).
- Subject-matter review, references, and current parameter tables.
- Spin qubits and other platforms beyond a mention.
- Lab-length activities (Module 08).

**Do not:**

- Teach quantum mechanics, circuit theory, or atomic physics as a course.
- Rank platforms, name products, or state record figures in Beginner pages.
- Simulate the physics of any device, or depend on live hardware or a vendor service.
- Teach the error vocabulary as a model, error-correcting codes, or decoding (Module 07).
- Teach how software reads or uses device data (Module 05).
- Teach SDK use, setup, or job submission (Modules 03 and 05).
- Add cross-module navigation hooks as part of this taxonomy.

## 15. Changes that follow approval

Made together, as `context_docs/README.md` (section 6) requires.

1. **Done:** `context_docs/taxonomy/Quantum_Computing_Curriculum.md`, Module 04, now shows the comparison page added by decision 2.
2. **Done:** `context_docs/modules/module_04/README.md` exists with the page status table (all pages `no spec`).
3. **Later, when the first page is built:** update `mkdocs.yml` navigation and `docs/04-hardware/index.md` (the placeholder note and the "Planned sections" list). Not before, so the site does not list pages that do not exist.
4. **Next:** draft the specs one page at a time, starting with `04.01.01`.
5. **As each page is built:** add the Module 04 pages to the references of the existing hardware glossary entries (decision 13).

---

**V1.0 change record (2026-10-27):** first version, written from the global tree and the promises made by the built Modules 01, 02, 05 and 07. Ten pages from the tree plus one addition (the comparison page, 04.02.06). Records the fences with Modules 02, 05 and 07, the Platform Card structure, the numbers policy, and fourteen decisions.

**Final decision record:** all 14 decisions in section 0 approved as recommended on 2026-10-27: grouped page IDs (04.01.xx, 04.02.xx); the comparison page added; calibration physics folded into the Fundamentals pages with no calibration page; four platforms plus an encodings page, with spin qubits named only; Dual-Rail and Bosonic taught as an idea at Beginner with codes left to Module 07; ranges and orders of magnitude only; Module 01 and 02 prerequisites; the one-qubit thread followed by the Bell circuit's three operation types; closed-form seeded models; pulse shaping and T2* deferred; one shared Platform Card; Beginner-only V1; glossary reuse with few additions; and `built, needs hardening` status until a hardware review.

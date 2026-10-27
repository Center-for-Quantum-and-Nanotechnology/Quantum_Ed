# Module 04 — Quantum Hardware

Module 04 explains **how a physical device holds, controls, and reads a qubit, why it does so imperfectly, and how different physical platforms make different trade-offs.** It builds on Module 02, which teaches what a qubit, gate, and measurement *are* as an ideal model; this module teaches what it takes to make a physical system *do* them. It is organized as one qubit followed from start to read-out (Hardware Fundamentals), then the same questions answered by different platforms (Qubit Modalities).

## Governing documents

- [`../../vision/ProjectVision.md`](../../vision/ProjectVision.md): how the whole platform teaches.
- [`taxonomy_QuantumHardware_v1.0.md`](taxonomy_QuantumHardware_v1.0.md): the proposed page hierarchy, the module's learning contract, the promises earlier modules have already made to this one, ownership fences, and the decisions for review. It is still a draft; its recommendations have been accepted but not yet folded in as an approved version. Where it and a page spec disagree, the taxonomy wins.
- [`specs/`](specs/): one instruction document per page (none yet).
- [`../../../llm/CONVENTIONS.md`](../../../llm/CONVENTIONS.md) and [`../../../llm/FLAGS.md`](../../../llm/FLAGS.md): how the interactive code is organized, and the deviations and open items logged for each page.

## Page status

| ID | Page | Spec | Built page | Status |
|---|---|---|---|---|
| 04.01.01 | Physical Qubits | — | — | no spec |
| 04.01.02 | Gates and Control | — | — | no spec |
| 04.01.03 | Readout | — | — | no spec |
| 04.01.04 | Coherence | — | — | no spec |
| 04.01.05 | Noise | — | — | no spec |
| 04.02.01 | Superconducting Qubits | — | — | no spec |
| 04.02.02 | Trapped-Ion Qubits | — | — | no spec |
| 04.02.03 | Neutral-Atom Qubits | — | — | no spec |
| 04.02.04 | Photonic Qubits | — | — | no spec |
| 04.02.05 | Dual-Rail and Bosonic Encodings | — | — | no spec |
| 04.02.06 | Comparing Platforms (proposed addition to the global tree) | — | — | no spec |

Titles are proposed until the taxonomy is approved. The module is a placeholder in the site navigation ([`docs/04-hardware/index.md`](../../../docs/04-hardware/index.md)).

## Prerequisites and neighbours

- **Assumes:** Module 01 and Module 02 at Beginner level. It assumes no physics and does not depend on Module 03 or Module 05.
- **Module 02** owns the ideal model of states, gates, circuits, and measurement. Module 04 explains how a device realises each and where it departs.
- **Module 05 (Quantum Software Stack)** owns how software describes and consumes device data, including calibration telemetry. Module 04 owns the physical origin of those quantities and the measurements behind them.
- **Module 07 (Quantum Error Correction)** owns the error vocabulary, codes, and decoding. Module 04 explains where noise comes from and does not teach how to correct it.
- Cross-module links are deferred, so the pages do not link into other modules.

## Open items

Detail lives in the taxonomy, [`llm/FLAGS.md`](../../../llm/FLAGS.md), and [`llm/todo.md`](../../../llm/todo.md), not here.

- **The taxonomy is not yet approved.** The global curriculum tree, site navigation, and the placeholder index still describe the old plan (taxonomy section 15).
- **No subject-matter review yet**, and this is the most fact-dense module. Platform facts and the T1, T2, and Transmon glossary entries are the first things to check.
- **No screen-reader or keyboard pass yet** on any interactive, because none exists.
- **Intermediate and Advanced content and cross-module links** are deferred.

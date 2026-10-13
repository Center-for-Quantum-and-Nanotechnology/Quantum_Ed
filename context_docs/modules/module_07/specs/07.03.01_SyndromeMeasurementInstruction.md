Section 05 — Syndrome Measurement
Goal
Teach the learner how quantum error correction obtains information about an error without directly measuring the logical quantum state.
Use the 3-qubit repetition code as the concrete example, then generalize the idea of a syndrome as the collection of measurement outcomes that reveals information about errors.
The central idea is:
We don't ask “What is the logical state?” We ask “Is there evidence that the physical qubits disagree?”
Learning outcomes
By the end of the section, the learner should be able to:
1.	Explain what a syndrome is.
2.	Understand why QEC measures relationships between qubits rather than the logical qubit directly.
3.	Interpret the syndrome produced by a single X error in the 3-qubit repetition code.
4.	Understand how syndrome information can identify an error without revealing the logical state.
5.	Recognize syndrome measurement as a core mechanism underlying stabilizer codes and surface codes.
Page structure
1. Start with the problem
Briefly revisit the repetition-code scenario:
Logical qubit
     ↓
Encode
     ↓
q₁   q₂   q₃
     ↓
X error occurs
     ↓
?
Ask:
How can we determine which physical qubit was affected without measuring the logical qubit itself?
Introduce the answer:
Measure relationships between the physical qubits.
________________________________________
2. What is a syndrome?
Define it simply:
A syndrome is the set of measurement outcomes obtained from the checks used to detect errors.
For the 3-qubit repetition code, use the parity checks:
S₁ = Z₁Z₂
S₂ = Z₂Z₃
Initially, introduce these visually:
q₁ ───── q₂
       S₁

q₂ ───── q₃
       S₂
Then explain that each check asks whether a pair of qubits has the expected relationship.
Avoid immediately diving into the full stabilizer formalism.
________________________________________
3. Main interactive — Measure the syndrome
Make this the central interaction.
Start with:
q₁      q₂      q₃
 ●       ●       ●

        No error
Allow the learner to inject:
•	no error
•	X₁
•	X₂
•	X₃
Then provide:
Measure syndrome
Show the checks being performed visually.
For example:
       S₁       S₂

       ✓        ✓

     (+1)     (+1)
For an error on q₂:
       S₁       S₂

       ✗        ✗

     (-1)     (-1)
Then translate the result:
Syndrome (-1, -1) → error is consistent with q₂ having flipped.
Use a short table as a persistent reference:
Error	Syndrome
None	(+1, +1)
X₁	(-1, +1)
X₂	(-1, -1)
X₃	(+1, -1)
________________________________________
4. Crucial measurement concept
Explicitly explain what is not being measured.
Show:
        NOT measured

      ┌─────────────┐
      │  Logical    │
      │   state     │
      └─────────────┘
             ✕

        WHAT IS measured

      ┌─────────────┐
      │ relationships│
      │ between      │
      │ qubits       │
      └─────────────┘
             ✓
Explain:
Syndrome measurements give information about the presence and location of errors without directly revealing whether the logical qubit represents |0⟩, |1⟩, or a superposition.
Be careful not to overstate this as “measurement never disturbs anything.” Explain that QEC is designed so the measured operators commute with the encoded logical information being protected.
________________________________________
5. Interactive challenge — “Decode the syndrome”
Give the learner a syndrome and ask them to identify the likely error.
Example:
Syndrome:

S₁ = -1
S₂ = +1

What happened?

[ X₁ ] [ X₂ ] [ X₃ ] [ No error ]
Give immediate feedback.
Then increase difficulty by presenting several randomized cases.
The learner should begin to understand:
syndrome
   ↓
error information
   ↓
error location
This is an important conceptual precursor to the Decoding section.
________________________________________
6. Syndrome ≠ error
Include a small conceptual callout:
A syndrome does not necessarily tell us the complete history of what happened. It tells us what error information is consistent with the measured checks.
Keep this simple.
This prepares learners for larger codes, where multiple physical error patterns can produce the same syndrome.
________________________________________
7. From repetition codes to stabilizers
End by generalizing the concept.
Show:
Repetition code

pairwise parity checks
        ↓
     syndrome
        ↓
    error information

          ↓ generalize

Stabilizer codes

many commuting checks
        ↓
     syndrome
        ↓
    error information
Introduce the vocabulary:
In stabilizer codes, the operators used for these checks are called stabilizers, and their measurement outcomes form the syndrome.
Do not teach the full stabilizer formalism yet. Section 06 will do that.
________________________________________
Optional circuit visualization
If the project already has a circuit visualization system, include an optional expandable view showing ancilla-assisted syndrome measurement.
For example:
q₁ ─────●────────
        │
q₂ ─────●────────

a  ─────⊕────────
          │
       measure
Use this only as a conceptual preview.
The primary interaction should remain the simpler parity-check visualization. Do not make the circuit implementation the main learning objective.
Visual / UX requirements
Maintain the visual language from previous sections:
•	Blue → logical information
•	Gray → physical qubits
•	Orange/red → errors
•	Purple → syndrome/check operations
•	Green → successful detection/correction
Make the syndrome visually distinct from the error itself.
For example:
ERROR
  X₂
   ↓
SYNDROME
(-1,-1)
   ↓
INFERENCE
q₂ likely affected
Technical requirements
•	Reuse the 3-qubit/repetition-code components from Section 04.
•	Reuse the error injection and reset functionality.
•	Implement deterministic syndrome outcomes for the educational cases.
•	Keep syndrome generation modular so the same architecture can later represent stabilizer and surface-code syndromes.
•	Do not simulate a full quantum measurement engine unless one already exists in the application.
•	If using equations, ensure the visual and conceptual explanation remains understandable without them.
Important pedagogical constraints
Do not describe syndrome measurement as directly measuring the logical qubit.
Do not imply that the syndrome uniquely identifies an error in every QEC code. It does for the simple single-error cases used here; larger codes can have multiple errors compatible with the same syndrome.
Do not turn this into the decoding section. The learner should understand:
“What does the syndrome tell us?”
before learning:
“How does a decoder decide which error most likely produced it?”
End state
The learner should finish with this mental model:
Physical errors
      ↓
Syndrome measurements
      ↓
Syndrome
      ↓
Information about the error
      ↓
Decoder
      ↓
Correction
End with:
We can measure error information without directly measuring the logical state. But once we have a syndrome, how do we decide which error most likely occurred?
Next: Decoding →

Optional circuit-level visualization
Include an optional “See the circuit” view for learners who want to understand how syndrome measurement is implemented at the circuit level.
If the project already supports embedding or linking to an external circuit simulator such as Quirk, use it rather than building a full circuit simulator from scratch.
The circuit view should illustrate the same conceptual example used in the primary interaction:
data qubits
q₁ ─────────●────────
            │
q₂ ─────────●────────

ancilla
a₁ ─────────⊕───M────
The exact circuit should be technically correct for the parity-check being demonstrated.
Important pedagogical requirement
The circuit visualization is secondary, not the primary learning interaction.
The learner should first understand:
physical error
      ↓
parity check
      ↓
syndrome
      ↓
information about the error
Only then should they see how those operations are represented as a quantum circuit.
Label the circuit controls clearly:
•	Data qubits
•	Ancilla/check qubit
•	Entangling gates
•	Measurement
•	Syndrome result
When the learner triggers the circuit, connect the result back to the main visualization.
For example:
Circuit result: syndrome = (-1, -1)
This is the same syndrome shown in the simplified view above and is consistent with an X error on q₂.
Do not make Quirk required for understanding
If the external simulator cannot be embedded reliably, the section must remain fully functional without it.
Do not require learners to leave the module to complete an exercise.
The external/circuit view should answer:
“What does syndrome measurement look like as an actual quantum circuit?”
It should not be required to answer:
“What is a syndrome and why do we measure it?”
Implementation preference
If an external tool is used, isolate it behind a clearly labeled expandable section:
Explore the circuit →
rather than placing it at the top of the page.
Keep the simplified parity-check visualization as the canonical representation used throughout the module.


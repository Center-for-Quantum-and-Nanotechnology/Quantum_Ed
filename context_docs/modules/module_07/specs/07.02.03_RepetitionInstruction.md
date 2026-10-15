Section 04 — Encoding & Repetition Codes
Goal
Build an interactive section that turns the concepts from Sections 02–03 into a concrete quantum error-correction example.
The learner should understand how a simple 3-qubit repetition code:
encodes information → introduces redundancy → detects a single bit-flip error → corrects it
while also understanding why this code is limited.
This section should prepare the learner for Syndrome Measurement and Stabilizer Codes.
Learning outcomes
By the end of the section, the learner should be able to:
1.	Explain why redundancy can protect quantum information.
2.	Describe the 3-qubit repetition-code encoding.
3.	Identify how a single X/bit-flip error changes the encoded state.
4.	Explain how parity information can reveal which qubit was affected.
5.	Understand that the code can correct one bit-flip error but does not protect against arbitrary quantum errors.
6.	Distinguish encoding from copying an unknown quantum state.
Page structure
1. From one qubit to an encoded qubit
Start by revisiting the core idea:
Logical qubit
     │
     │ encode
     ▼
Physical qubits
Introduce the repetition-code encoding:
|0⟩L → |000⟩
|1⟩L → |111⟩
For a general state:
α|0⟩ + β|1⟩
        ↓
α|000⟩ + β|111⟩
Explain that this is encoding, not three independent copies of the original unknown state.
Keep the mathematical explanation concise.
________________________________________
2. Interactive — Build the code
Create a step-by-step animation:
Step 1: Start with one logical qubit.
Step 2: Click Encode.
Step 3: Show the resulting three physical qubits.
        Logical
          |ψ⟩
           │
         Encode
           ↓
       q₁   q₂   q₃
       ●    ●    ●
Allow the learner to reset and repeat the encoding.
The three physical qubits should be visually grouped as belonging to the same logical qubit.
________________________________________
3. Inject an error
Allow the learner to select:
Which physical qubit should experience an X error?

[ q₁ ]   [ q₂ ]   [ q₃ ]
Animate the change.
For example:
|000⟩
  ↓ X₂
|010⟩
Clearly distinguish:
Logical information: still represented by the encoded state.
Physical error: q₂ has been flipped.
Do not imply that the system has already detected or corrected the error.
________________________________________
4. Detect the error using parity checks
Introduce the simplest form of parity checking.
Use:
S₁ = Z₁Z₂
S₂ = Z₂Z₃
but introduce these visually before emphasizing the algebra.
Show:
q₁ ───── q₂
      S₁

q₂ ───── q₃
      S₂
The learner can click:
Check parity
For the three possible single-qubit X errors, show the corresponding syndrome:
Error	S₁	S₂
None	+1	+1
X₁	−1	+1
X₂	−1	−1
X₃	+1	−1
Use both the symbolic form and an intuitive interpretation:
The parity checks tell us which qubit disagrees with the others.
Avoid going too deeply into stabilizer formalism yet. The purpose here is to establish the intuition that later becomes the stabilizer formalism.
________________________________________
5. Correct the error
Once the syndrome identifies the affected qubit, provide:
Correct error
For example:
Before:

q₁   q₂   q₃
0    1    0

      ↓ X₂

After:

q₁   q₂   q₃
0    0    0
Show the logical state returning to the encoded code space.
Use a clear success state:
Error corrected
Then explain:
The correction operation reverses the physical error; it does not require us to directly measure the logical quantum state.
This reinforces the measurement caveat from Section 03.
________________________________________
6. Explore the limits
Include a dedicated “What can this code correct?” interactive/card.
Show:
✓ One X error
✓ Error on any one of the three physical qubits

✗ A Z error
✗ A general arbitrary error by itself
✗ Multiple simultaneous X errors
Use the interaction to demonstrate at least one limitation.
For example, let the learner apply a Z error and then run the same parity checks.
Show that the parity checks do not identify the phase error.
Explain:
The 3-qubit repetition code protects against bit flips, not phase flips.
Then connect back to Section 03:
X → protected by this code
Z → not protected by this code
Y → not fully protected by this code
Do not suggest that this limitation is a flaw in QEC generally. It is a limitation of this particular code.
________________________________________
7. Error-correction capability
Introduce the concept of correction capability in simple terms:
A code that can correct one error must contain enough redundancy to distinguish the possible single-error cases.
Optionally introduce the idea of code distance very lightly, but do not teach the formal theory here.
For this module, it is sufficient to say:
The 3-qubit repetition code has distance 3 and can correct one bit-flip error.
If code distance is introduced, make clear that this is a preview of a concept developed later.
________________________________________
8. Takeaway
End with a compact summary:
Encode
  ↓
Add structured redundancy
  ↓
Physical error occurs
  ↓
Measure parity information
  ↓
Infer error location
  ↓
Apply correction
  ↓
Recover encoded logical state
Then emphasize:
The repetition code gives us the basic QEC pattern: encode → detect → infer → correct.
Transition to:
But how do we generalize these parity checks to arbitrary quantum error-correcting codes?
Next: Stabilizer Codes →
Visual / UX requirements
Use the same visual language established in Sections 02–03:
•	Blue → logical information
•	Gray → physical qubits
•	Orange → noise/error
•	Red → active error
•	Green → corrected state
The learner should always be able to see:
logical qubit → physical qubits → error → syndrome → correction
Make the main interaction step-based but allow the learner to jump back and experiment.
Include a persistent Reset control.
Technical requirements
•	Reuse the qubit and error components from Sections 02–03.
•	Reuse the existing animation and visual system.
•	Do not introduce new dependencies unless necessary.
•	Implement the 3-qubit code deterministically.
•	The simulator only needs to model the educational cases used in this section; it does not need to simulate a physical quantum computer.
•	Keep the error model reusable for future sections.
•	Keep syndrome information separate from the logical-state visualization so the architecture can later support more general stabilizer codes.
Important pedagogical constraints
Do not present the repetition code as a complete quantum error-correction solution.
Explicitly distinguish:
This code protects against bit-flip errors.
from:
Quantum error correction must ultimately handle both bit-flip and phase-flip errors.
Do not introduce full stabilizer formalism yet. The parity checks should serve as the intuitive bridge into Section 06.
Do not imply that the learner is directly measuring the logical qubit. Emphasize that the parity checks provide information about errors while preserving the encoded information.
The central message should be:
By encoding information redundantly and measuring relationships between physical qubits, we can detect and correct certain errors without directly measuring the logical state.


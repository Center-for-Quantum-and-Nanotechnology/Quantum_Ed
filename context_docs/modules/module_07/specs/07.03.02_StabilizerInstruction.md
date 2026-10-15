Section 06 — Stabilizer Codes
Goal
Teach the learner how the parity checks from the repetition code generalize into the stabilizer formalism used by many quantum error-correcting codes.
The key conceptual progression is:
repetition-code parity checks → stabilizers → syndrome → general QEC code
Do not make this a mathematics-heavy section. The goal is to establish the mental model and vocabulary that will be needed for surface codes and decoding.
Learning outcomes
By the end of the section, the learner should be able to:
1.	Explain what a stabilizer is in the context of QEC.
2.	Understand that stabilizers define properties that the encoded state should satisfy.
3.	Understand how measuring stabilizers produces a syndrome.
4.	Explain how an error can change a stabilizer measurement outcome.
5.	Understand the relationship between stabilizers, logical operators, and encoded information at a conceptual level.
6.	Recognize the stabilizer formalism as a scalable framework rather than a new type of physical qubit.
Page structure
1. Start from what the learner already knows
Revisit the repetition-code checks:
q₁ ───── q₂
       S₁

q₂ ───── q₃
       S₂
Ask:
What if we wanted to describe these checks mathematically and generalize them to much larger codes?
Introduce:
Stabilizers are operators whose expected measurement outcome characterizes the valid encoded states.
Then show:
Repetition code
      ↓
parity checks
      ↓
stabilizers
      ↓
syndrome
________________________________________
2. What does “stabilize” mean?
Use an intuitive explanation before introducing formal notation.
A stabilizer represents a property that the encoded state satisfies.
For example:
Valid encoded state
       │
       ├── satisfies check 1 ✓
       └── satisfies check 2 ✓
If an error occurs:
Error
 ↓
one or more checks change
 ↓
syndrome changes
Use the phrase:
The stabilizer doesn't tell us the logical state. It tells us whether the encoded state still satisfies the required constraints.
________________________________________
3. Introduce Pauli operators
Briefly establish the operators:
I   X   Y   Z
Use the previous section as context:
•	X → bit-flip type error
•	Z → phase-flip type error
•	Y → combined X/Z behavior
Then explain that stabilizers can be products of Pauli operators acting on multiple qubits.
For example:
S₁ = Z₁Z₂
S₂ = Z₂Z₃
Do not require the learner to memorize operator multiplication yet.
________________________________________
4. Main interactive — “Build a stabilizer”
Create an interactive visualization where the learner selects qubits and Pauli operators to construct a simple stabilizer.
For example:
Choose operator:

q₁    q₂    q₃
 Z     Z     I

        ↓

      Z₁Z₂
Then show what the stabilizer checks:
Z₁Z₂

✓ +1 → expected relationship
✗ -1 → relationship violated
The learner should be able to toggle between a small number of valid examples.
Keep the interaction constrained so learners are not asked to construct arbitrary invalid stabilizers.
________________________________________
5. Interactive — “Find the changed stabilizer”
Start with a valid encoded state and show its stabilizers:
S₁ = +1
S₂ = +1
Allow the learner to inject:
X₁
X₂
X₃
Z₁
Z₂
Z₃
Then update the stabilizer outcomes.
The goal is for the learner to discover:
Different errors cause different stabilizer measurements to change.
This creates the connection:
Physical error
      ↓
anticommutes with some stabilizers
      ↓
those stabilizers change sign
      ↓
syndrome
Introduce the word anticommute here, but explain it visually/intuitively first.
For example:
If an error is incompatible with a stabilizer check, that check changes from +1 to −1.
The formal algebra can be expandable.
________________________________________
6. Stabilizer vs logical operator
Introduce this distinction carefully.
Show:
Stabilizer
   ↓
defines the encoded code space
   ↓
detects errors

Logical operator
   ↓
acts within the encoded space
   ↓
changes the logical information
Use a visual distinction:
Stabilizer: “Does the state still satisfy the code's constraints?”
Logical operator: “Changes the encoded logical state.”
Emphasize that we generally do not want syndrome measurements to reveal the logical information being protected.
This is an important conceptual bridge from Section 05.
________________________________________
7. Number of qubits and code space
Introduce the idea that stabilizers constrain the available state space.
For example, explain conceptually:
A system of n physical qubits has a large Hilbert space. Stabilizer constraints restrict the states to a smaller code space in which the logical information is stored.
Use a visual:
All possible states
┌───────────────────────────┐
│                           │
│       physical space      │
│                           │
│       ┌─────────┐         │
│       │  CODE   │         │
│       │  SPACE  │         │
│       └─────────┘         │
│                           │
└───────────────────────────┘
Optionally introduce the relationship:
For an [[n,k,d]] stabilizer code, n physical qubits encode k logical qubits with code distance d.
Do not derive this yet. Present it as vocabulary that will become useful later.
________________________________________
8. “From one code to a family of codes”
Show that stabilizers are not specific to the 3-qubit repetition code.
Stabilizer formalism
        │
 ┌──────┼─────────┐
 ↓      ↓         ↓
CSS    Surface   Other
codes   codes    stabilizer
                 codes
Explain that stabilizers provide a common language for describing many QEC codes.
This prepares the learner for Surface Codes.
________________________________________
Optional circuit visualization
Include an expandable:
“See the stabilizer circuit”
If the project already has a circuit visualization system, reuse it.
If Quirk or another circuit simulator is available, it may be used as an optional technical view.
The circuit should show:
•	data qubits
•	ancilla qubit
•	entangling gates
•	ancilla measurement
•	resulting stabilizer/syndrome value
The circuit is supplementary. The conceptual stabilizer visualization remains the primary interaction.
________________________________________
Visual / UX requirements
Maintain the visual language established in earlier sections.
Use a distinct visual representation for:
•	Physical qubits
•	Stabilizers/checks
•	Errors
•	Syndrome
•	Logical information
Make stabilizer checks visually span the physical qubits they act on.
For example:
       ┌─────────── S₁ ───────────┐
       │                          │
      q₁                         q₂
       ●──────────────────────────●
When an error is introduced, animate the affected stabilizer(s) changing state.
________________________________________
Technical requirements
•	Reuse the qubit, error, and syndrome components from previous sections.
•	Build the stabilizer representation as reusable data structures rather than hardcoding individual visualizations.
•	Represent a stabilizer as a sequence of Pauli operators, e.g. [Z, Z, I].
•	Allow the UI to calculate/display which stabilizers are affected by each supported error.
•	Keep the initial examples small enough to remain visually understandable.
•	Design the data model so it can later represent larger stabilizer codes and surface-code lattices.
•	Do not build a full symbolic quantum algebra engine unless the project already has one.
Important pedagogical constraints
Do not present stabilizers as merely another name for parity checks.
Explain that parity checks are an intuitive special case, while stabilizers provide a more general mathematical framework.
Do not require the learner to understand commutation/anticommutation algebra before interacting with the system.
Introduce the intuition first:
An error changes the outcome of the stabilizer checks it conflicts with.
Then provide the formal explanation as an optional deeper layer.
Do not teach surface-code geometry yet. That belongs in the next section.
End state
The learner should leave with this mental model:
Physical qubits
      ↓
Encoded code space
      ↓
Stabilizer checks
      ↓
Error changes some checks
      ↓
Syndrome
      ↓
Information about the error
And understand the distinction:
Stabilizers define the constraints of the code; syndrome measurements tell us which of those constraints have been violated.
End with:
What happens when we arrange these stabilizer checks across a two-dimensional lattice of physical qubits?
Next: Surface Codes →


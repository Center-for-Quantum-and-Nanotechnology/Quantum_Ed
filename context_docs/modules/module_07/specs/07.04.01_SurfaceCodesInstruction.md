Surface Codes
Project Context
Before implementing this section, review the project vision document in @context_docs/vision folder.
Follow its guidance for:
	progressive experience levels
	V1 development priorities
	reusable architecture
	conceptual accuracy
	accessibility
	interaction design
	continuity between sections
Also review the existing Stabilizer Codes and Decoding sections before implementation. Reuse established components, terminology, visual conventions, and interaction patterns where appropriate.
This section begins the Scaling portion of Module 07.
________________________________________
Goal
Teach the learner how the stabilizer and decoding concepts introduced earlier become the basis of a scalable surface-code architecture.
The central progression is:
stabilizer checks → 2D lattice → physical errors → syndrome/detection information → decoder → logical protection
The learner should understand that a surface code protects logical quantum information by distributing it across many physical qubits and repeatedly using local stabilizer checks to obtain information about errors.
The key conceptual transition is:
The QEC machinery has not fundamentally changed. Surface codes organize that machinery across a larger, structured system.
This section should prepare the learner for Minimum-Weight Perfect Matching.
________________________________________
Learning Outcomes
By the end of the section, the learner should be able to:
	Explain the basic purpose of a surface code.
	Distinguish data qubits from measurement/check/ancilla qubits.
	Understand that local stabilizer checks are arranged across a two-dimensional structure.
	Explain conceptually why surface codes use both X-type and Z-type checks.
	Understand how a physical error can change nearby check outcomes.
	Recognize that syndrome/detection information provides evidence about errors rather than directly revealing the complete error history.
	Understand the concept of an error chain.
	Explain the basic meaning of code distance.
	Understand that increasing code distance requires additional physical resources.
	Explain why scaling surface codes creates a more difficult decoding problem.
________________________________________
Experience-Level Scope
Follow the progressive-depth architecture defined in the project Vision.
Beginner — V1 Requirement
The V1 page should teach:
	the surface-code lattice mental model
	data vs. measurement/check qubits
	local stabilizer checks
	X-type and Z-type checks
	physical errors and changed checks
	syndrome/detection information
	simple error chains
	physical vs. logical errors
	code distance
	why scaling creates a decoding problem
Prioritize visual intuition and interaction over mathematical formalism.
Intermediate — Future Hardening
Future Intermediate content may add:
	explicit stabilizer operators
	logical X and logical Z operators
	boundaries
	more precise surface-code geometry
	repeated syndrome rounds
	detection events
	stabilizer-measurement circuits
	rotated vs. unrotated surface codes
	more rigorous treatment of code distance
Advanced — Future Hardening
Future Advanced content may add:
	space-time syndrome graphs
	circuit-level noise
	noisy syndrome measurements
	fault-tolerant syndrome extraction
	threshold behavior
	logical error-rate scaling
	correlated or biased noise
	surface-code variants
	hardware-specific considerations
Do not implement Intermediate or Advanced content merely to make V1 more comprehensive. Preserve clean expansion points for later hardening.
________________________________________
Page Structure
1. From Stabilizers to a Surface
Begin directly from the previous Stabilizer Codes material.
Revisit the familiar progression:
physical qubits
↓
stabilizer checks
↓
syndrome
↓
decoder
Then ask:
What happens when we arrange these checks across many physical qubits?
Introduce the surface code as a structured arrangement of physical qubits and local stabilizer checks across a two-dimensional lattice.
Visually transition from a small group of stabilizer checks into a larger repeating lattice.
The learner should see Surface Codes as a generalization of concepts they already understand rather than as an unrelated QEC technique.
________________________________________
2. Meet the Surface-Code Patch
Introduce a small, visually understandable surface-code patch.
Clearly distinguish:
	Data qubits — participate in storing the encoded quantum information.
	Measurement/check/ancilla qubits — obtain information from local stabilizer checks.
Make clear that the logical information is encoded collectively across the patch.
Do not imply that any individual physical qubit contains the logical qubit.
Include a short explanation such as:
Where is the logical qubit?
It is not stored in one physical qubit. The logical information is encoded collectively across the surface-code patch.
Keep the initial lattice small enough that learners can visually follow relationships between neighboring qubits and checks.
________________________________________
3. X-Type and Z-Type Checks
Reconnect to the learner's previous knowledge of X and Z errors.
Introduce the two types of surface-code checks conceptually:
X-type checks help reveal information associated with phase-flip/Z-type errors.
Z-type checks help reveal information associated with bit-flip/X-type errors.
Show the checks spatially interacting with neighboring data qubits.
Do not require stabilizer algebra at Beginner level.
The learner should understand:
physical error
↓
conflicts with particular local checks
↓
those check outcomes change
Use distinct visual representations for X-type and Z-type checks. Do not rely only on color.
________________________________________
4. Main Interactive — “Create an Error on the Surface”
Make this the primary V1 interaction.
Allow the learner to select a data qubit and introduce an error.
At minimum support:
	X error
	Z error
When the error is introduced:
	Highlight the affected physical qubit.
	Show the relevant neighboring checks.
	Animate or update the checks whose outcomes change.
	Display the resulting syndrome/detection information separately from the physical error.
The learner should visually experience:
PHYSICAL ERROR
↓
LOCAL CHECKS RESPOND
↓
SYNDROME / DETECTION INFORMATION
Reinforce the distinction established earlier in Module 07:
The system is not directly observing the microscopic error. It is observing information produced by the checks.
Make the interaction resettable and allow learners to experiment with different locations and error types.
________________________________________
5. From One Error to an Error Chain
Extend the previous interaction from one physical error to a small multi-qubit error pattern.
Introduce the term:
Error chain
Show several connected physical errors forming a path across part of the lattice.
Then show the resulting syndrome/detection information.
The learner should discover that the syndrome does not necessarily reveal every physical error along the path.
Establish the idea:
error chain
↓
syndrome/detection information
↓
evidence about the error chain
Then show, if practical, that more than one possible error path can be consistent with the same observed evidence.
Ask:
If several possible error chains could explain what we measured, how do we know which one occurred?
Connect this directly to the previous Decoding section:
We may not need to reconstruct the exact physical history. The decoder needs to choose a recovery that preserves the logical information.
Do not teach MWPM yet.
________________________________________
6. Code Distance and Scaling
Introduce code distance as the primary scaling concept.
Connect it to the earlier repetition-code example if useful.
Explain conceptually:
Code distance describes the minimum size of an undetectable logical error operation.
For an idealized distance-d code, optionally introduce:
t=⌊(d-1)/2⌋
where tdescribes the number of errors the code can correct under the relevant assumptions.
Explain the meaning visually rather than relying on the equation.
If practical, include an interaction or selector such as:
Code Distance
[ 3 ] [ 5 ] [ 7 ]
Changing the distance should demonstrate:
larger distance
↓
larger patch
↓
more physical resources
↓
longer minimum logical error structure
↓
greater potential logical protection
Also show the tradeoff:
larger code
↓
more qubits and measurements
↓
more syndrome information
↓
harder decoding problem
Do not imply that adding physical qubits automatically improves real hardware performance.
________________________________________
7. Physical Errors vs. Logical Errors
Make the distinction explicit.
Physical Error
An error affecting one or more physical qubits.
It may be detected and corrected without changing the encoded logical information.
Logical Error
A physical error pattern and recovery outcome that effectively changes the encoded logical information.
Use the surface-code visualization to show that:
A physical error is not automatically a logical error.
At Beginner level, introduce logical error paths visually rather than teaching full logical-operator formalism.
Detailed logical X/Z operators and boundary behavior can be added at Intermediate depth.
________________________________________
8. From Surface Codes to Decoding at Scale
End by comparing the earlier teaching example with the surface code.
3-qubit repetition code
few qubits
↓
few checks
↓
small syndrome table
↓
simple decoding
versus:
surface code
many physical qubits
↓
many local checks
↓
many possible error chains
↓
complex syndrome patterns
↓
efficient decoding required
Present a final example with separated detection information and multiple possible error paths.
Ask:
Which error chain is the best explanation?
Then introduce the next problem:
A decoder needs an efficient way to compare possible explanations and select an appropriate recovery.
Do not explain the matching algorithm here.
End with:
How can we efficiently connect detection events in a way that represents a likely error pattern?
Next: Minimum-Weight Perfect Matching →
________________________________________
Visual / UX Requirements
Maintain the visual language established throughout Module 07:
	Blue → logical information
	Gray / neutral → physical qubits
	Red / orange → physical errors
	Purple → syndrome / stabilizer / check information
	Green → successful recovery / protected state
Add clear visual distinctions for:
	data qubits
	measurement/ancilla qubits
	X-type checks
	Z-type checks
	error chains
	logical error paths
Do not rely on color alone.
The learner should be able to visually distinguish:
physical error ≠ stabilizer check ≠ syndrome/detection information ≠ logical error
Keep the lattice readable on smaller screens. Prefer responsive simplification over shrinking a complex diagram until it becomes difficult to interpret.
________________________________________
Technical Requirements
	Review and reuse existing qubit, error, syndrome, stabilizer, and decoder components where appropriate.
	Represent lattice structure through reusable data rather than hardcoding individual visual layouts where practical.
	Keep error information, syndrome generation, and decoder logic conceptually separate.
	Do not implement MWPM in this section.
	Structure the surface-code representation so the later MWPM section can reuse its syndrome/detection information.
	Support future expansion to different code distances without requiring separate page implementations.
	Use deterministic educational behavior where appropriate rather than building an unnecessary full quantum simulator.
	Follow the experience-level architecture established in the project Vision so Intermediate and Advanced content can be added later without creating separate versions of the page.
________________________________________
Important Pedagogical Constraints
Do not imply:
surface code = completely new QEC mechanism
Instead teach:
surface code = scalable organization of stabilizer-based QEC concepts
Do not imply:
syndrome = physical error
Instead teach:
syndrome = evidence about the error
Do not imply that the decoder necessarily reconstructs the exact physical error history.
Do not imply that the logical information resides in one physical qubit.
Do not imply that every physical error causes a logical error.
Do not imply that larger code distance automatically guarantees better real-world performance.
Do not teach detailed MWPM mathematics or graph matching here.
Do not teach lattice surgery operations here.
Keep Beginner V1 focused on the mental model required to understand why those later topics are necessary.
________________________________________
End State
The learner should leave with:
LOGICAL INFORMATION
↓
encoded across a surface-code patch
↓
physical data qubits + local stabilizer checks
↓
physical errors occur
↓
check outcomes change
↓
syndrome / detection information
↓
decoder interprets the evidence
↓
recovery
↓
logical information protected
And understand the scaling relationship:
increase code distance
↓
increase physical resources
↓
increase potential logical protection
↓
increase measurement and decoding complexity
The central takeaway should be:
A surface code scales the stabilizer-based QEC machinery across a structured lattice of physical qubits. Local checks provide evidence about physical errors, while a decoder must interpret that evidence to protect the encoded logical information.
End with:
Many different error chains may explain the same detection information. How can a decoder efficiently choose a good recovery?
Next: Minimum-Weight Perfect Matching →


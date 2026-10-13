Lattice Surgery
Project Context
Before implementing this section, review the project Vision document in context_docs.
Follow its guidance for:
•	progressive experience levels
•	V1 development priorities
•	reusable architecture
•	conceptual accuracy
•	accessibility
•	interaction design
•	continuity between sections
Also review the existing Surface Codes and Minimum-Weight Perfect Matching sections before implementation. Reuse established surface-code components, terminology, visual conventions, and interaction patterns where appropriate.
This section continues the Scaling portion of Module 07.
________________________________________
Goal
Teach the learner how logical qubits encoded in surface-code patches can interact while remaining protected by quantum error correction.
The central progression is:
surface-code patch → logical qubit → neighboring patches → merge → joint measurement → split → logical operation
The learner should understand that lattice surgery manipulates the relationships and stabilizer measurements between surface-code patches rather than requiring the encoded quantum information to be removed from the code.
The key conceptual transition is:
Surface Codes showed how a logical qubit can be protected. Lattice Surgery shows how protected logical qubits can interact.
This section should focus on the conceptual meaning of lattice surgery rather than detailed fault-tolerant protocols.
________________________________________
Learning Outcomes
By the end of the section, the learner should be able to:
1.	Recognize a surface-code patch as an encoded logical qubit.
2.	Explain why operations between logical qubits require mechanisms that preserve error protection.
3.	Understand that boundaries of surface-code patches play an important role in lattice surgery.
4.	Explain conceptually what it means to merge two surface-code patches.
5.	Understand that a merge introduces joint stabilizer measurements between previously separate patches.
6.	Explain that these measurements reveal joint logical information without directly measuring each logical qubit individually.
7.	Explain conceptually what it means to split a merged region back into separate patches.
8.	Understand the basic merge → measure → split pattern.
9.	Recognize that lattice surgery can be used as a building block for fault-tolerant logical operations.
10.	Understand that QEC must continue throughout the operation.
________________________________________
Experience-Level Scope
Follow the progressive-depth architecture defined in the project Vision.
Beginner — V1 Requirement
The V1 page should teach:
•	surface-code patches as logical qubits
•	patch boundaries
•	neighboring logical patches
•	merge operations
•	joint measurements
•	split operations
•	the merge → measure → split pattern
•	why lattice surgery allows protected logical interaction
•	why QEC continues during the process
Prioritize spatial visualization and animation over stabilizer algebra.
Intermediate — Future Hardening
Future Intermediate content may add:
•	rough and smooth boundaries
•	logical X and logical Z operators
•	X-type and Z-type merges
•	explicit (X_L \otimes X_L) and (Z_L \otimes Z_L) parity measurements
•	stabilizer changes during merge and split
•	ancilla patches
•	measurement-based CNOT constructions
•	Pauli-frame updates
•	repeated measurement rounds during surgery
Advanced — Future Hardening
Future Advanced content may add:
•	formal stabilizer transformations
•	fault-tolerant lattice-surgery protocols
•	spacetime representations
•	logical error mechanisms during surgery
•	code-distance preservation
•	surgery scheduling
•	patch routing
•	resource and time overhead
•	magic-state interaction
•	multi-patch operations
•	hardware connectivity constraints
•	compilation and architecture considerations
Do not implement Intermediate or Advanced material merely to make V1 more comprehensive.
________________________________________
Page Structure
1. From Protecting to Computing
Begin with a familiar surface-code patch.
Remind the learner:
A surface-code patch can encode and protect logical quantum information.
Then introduce a second patch.
Label them conceptually:
Logical Qubit A
and
Logical Qubit B
Ask:
How can two protected logical qubits interact without abandoning the error protection provided by the surface code?
Introduce lattice surgery as a technique for performing logical operations by changing how neighboring surface-code patches are connected and measured.
The learner should immediately understand why this topic follows Surface Codes and MWPM.
________________________________________
2. A Patch Represents a Logical Qubit
Before introducing surgery, reinforce what the objects being manipulated represent.
Show two separate surface-code patches.
Each patch should visibly contain many physical qubits and stabilizer checks while being labeled as one logical qubit.
For example:
Surface-Code Patch A
many physical qubits
↓
one encoded logical qubit
Surface-Code Patch B
many physical qubits
↓
one encoded logical qubit
Emphasize:
Lattice surgery operates on encoded logical qubits by modifying the relationships between their underlying physical qubits and stabilizer checks.
Do not visually collapse each patch into a single ordinary physical qubit unless the representation clearly indicates that it is a logical abstraction.
________________________________________
3. Meet the Boundaries
Highlight the edges of each surface-code patch.
Introduce the concept that surface-code patches have boundaries, and that different boundaries support different logical relationships and surgery operations.
At Beginner level, do not require detailed rough/smooth boundary terminology.
Instead establish:
The boundary is where neighboring patches can be connected through new stabilizer measurements.
Visually highlight the compatible edges that will participate in the example surgery.
The learner should understand that patches are not simply moved on top of each other.
The operation changes which local checks are being measured along their shared boundary.
________________________________________
4. Main Interactive — “Perform Lattice Surgery”
Make this the primary V1 interaction.
Begin with two separate surface-code patches:
PATCH A          PATCH B

┌───────┐        ┌───────┐
│       │        │       │
│   A   │        │   B   │
│       │        │       │
└───────┘        └───────┘
Provide a guided sequence:
1. Prepare
Show the two independently protected logical patches.
2. Merge
Bring the relevant boundaries together visually.
Introduce new joint stabilizer/check measurements across the shared boundary.
Clearly highlight which checks are new.
3. Measure
Show the joint measurement information being collected.
Explain that these measurements reveal information about a relationship between the logical qubits rather than directly revealing each logical state.
4. Split
Remove the temporary joint checks and restore the patches as separate encoded regions.
The learner should visually experience:
SEPARATE PATCHES
↓
MERGE BOUNDARIES
↓
MEASURE JOINT INFORMATION
↓
SPLIT PATCHES
↓
LOGICAL OPERATION / INFORMATION UPDATED
Provide controls such as:
Merge
Measure
Split
Reset
or a guided step-through interaction.
The learner should be able to replay the sequence.
________________________________________
5. What Does the Merge Actually Do?
After the learner has seen the animation, explain the operation more carefully.
Before the merge:
•	Patch A has its own stabilizer structure.
•	Patch B has its own stabilizer structure.
During the merge:
•	new checks are introduced across the shared boundary
•	those checks involve physical qubits associated with both patches
•	the resulting measurements provide information about a joint logical property
Use a conceptual visualization:
Logical A + Logical B
↓
shared boundary checks
↓
joint information
Do not imply that the merge physically fuses two logical states into one ordinary qubit.
Do not imply that the logical qubits are directly measured individually.
________________________________________
6. Joint Measurement
Introduce joint logical measurement as the key mechanism behind lattice surgery.
At Beginner level, explain:
Instead of asking “What is the state of logical qubit A?” or “What is the state of logical qubit B?”, lattice surgery can measure a relationship between the two logical qubits.
Use a simple analogy to parity if helpful, connecting back to earlier QEC material.
For example:
Earlier, parity checks told us about relationships between physical qubits without revealing all of their individual information. Lattice surgery extends a similar idea to encoded logical qubits.
Avoid presenting the analogy as an exact equivalence.
If useful, preview that more advanced treatments describe operations such as:
[
Z_L \otimes Z_L
]
or
[
X_L \otimes X_L
]
but keep these optional or expandable at Beginner level.
The core concept is:
measure a relationship between logical qubits without individually measuring away their encoded quantum information
________________________________________
7. Split the Patches
After the joint measurement, show the patches being separated again.
Explain that the temporary joint stabilizer structure is removed and appropriate independent patch boundaries are restored.
Visually show:
MERGED REGION
↓
joint measurement completed
↓
boundary separated
↓
PATCH A + PATCH B
The learner should understand that the logical information after the operation can depend on the measurement outcome and the protocol being performed.
Do not imply that split simply returns both logical qubits to exactly the same state they had before the merge.
________________________________________
8. QEC Does Not Stop During Surgery
This is an important conceptual point.
The learner may otherwise interpret lattice surgery as temporarily turning error correction off while manipulating patches.
Explicitly show that stabilizer/check measurements continue during the process.
Use a visual timeline:
before surgery
QEC checks running
↓
merge
QEC + new joint checks
↓
joint measurement
repeated protected measurements
↓
split
independent QEC checks restored
Explain:
Lattice surgery is designed so that logical operations can be performed while the information remains encoded and protected.
For Beginner V1, do not deeply teach the number of measurement rounds or fault-tolerance requirements.
The important idea is continuity of protection.
________________________________________
9. From Surgery to Logical Operations
Show the larger purpose.
The basic lattice-surgery primitives can be combined to implement useful operations between logical qubits.
Introduce conceptually:
merge
•	
joint measurement
•	
split
↓
building blocks for logical operations
A CNOT may be mentioned as an important example.
At Beginner level, do not attempt to teach the full lattice-surgery CNOT protocol unless implemented as optional exploration.
Instead explain:
By combining joint measurements, ancilla logical patches, and classical interpretation of measurement outcomes, lattice surgery can implement entangling logical operations such as CNOT while keeping the information encoded.
This gives the learner the computational motivation without requiring the full protocol.
________________________________________
Optional Beginner Exploration — “Follow the Checks”
Provide an optional visualization that focuses on stabilizer/check changes during the main interaction.
Show:
Before Merge
Independent checks on Patch A and Patch B.
During Merge
Some boundary checks change and new joint checks appear.
During Measurement
Joint check outcomes are collected.
After Split
The separate patch-check structures are restored.
Allow the learner to toggle:
Show Physical Qubits
Show Stabilizer Checks
Show Logical View
This can help connect three abstraction levels:
physical implementation
↓
stabilizer/check structure
↓
logical operation
Do not require the learner to understand every individual stabilizer operator at Beginner level.
________________________________________
Visual / UX Requirements
Maintain the established Module 07 visual language:
•	Blue → logical information
•	Gray / neutral → physical qubits
•	Red / orange → physical errors
•	Purple → syndrome / stabilizer / check information
•	Green → successful protection / logical operation
Clearly distinguish:
•	Patch A
•	Patch B
•	patch boundaries
•	ordinary stabilizer checks
•	temporary joint checks
•	merged region
•	measurement results
Do not rely on color alone.
Use labels, borders, patterns, icons, or other accessible distinctions.
The merge and split should be visually understandable as changes in stabilizer/check relationships, not merely rectangles moving together and apart.
Preserve enough physical-qubit detail that the learner remembers these are encoded logical objects.
________________________________________
Technical Requirements
•	Reuse the Surface Code patch representation from the previous sections where practical.
•	Represent patches and boundaries through reusable data structures.
•	Keep logical patch state separate from visual rendering.
•	Represent merge/split operations as changes to patch/check relationships rather than unrelated animations.
•	Reuse existing stabilizer/check visualization components where appropriate.
•	Structure boundary types so more detailed rough/smooth behavior can be added later.
•	Preserve clean expansion points for X-type and Z-type surgery.
•	Keep the V1 interaction deterministic and educational.
•	Do not build a complete fault-tolerant lattice-surgery simulator for the Beginner demonstration.
•	Preserve an architecture that could later support multi-patch protocols and logical-operation sequences.
•	Follow the experience-level architecture established in the project Vision.
________________________________________
Important Pedagogical Constraints
Do not imply:
lattice surgery physically cuts quantum hardware
Instead teach:
lattice surgery changes which stabilizer/check relationships are measured across encoded regions.
Do not imply:
merge = two logical qubits simply become one physical qubit
The operation involves changing the encoded stabilizer structure and measuring joint logical information.
Do not imply:
joint measurement reveals both individual logical states
The measurement reveals a joint property.
Do not imply:
split simply reverses everything and restores the exact original states
The logical outcome depends on the measurement and protocol.
Do not imply:
QEC is paused during lattice surgery
Error-detection/protection mechanisms continue throughout a fault-tolerant surgery operation.
Do not require learners to understand rough/smooth boundaries or full logical-operator algebra before understanding the Beginner mental model.
Do not teach the complete lattice-surgery CNOT protocol as a core V1 requirement.
Do not allow the animation to suggest that moving graphical patches together is itself the quantum operation. The important change is the stabilizer/check structure along their boundary.
________________________________________
Conceptual Continuity
The learner should now see the progression:
Surface Codes
Encode and protect logical information across physical-qubit patches.
↓
MWPM
Interpret detection information and choose recoveries.
↓
Lattice Surgery
Manipulate relationships between protected logical patches.
↓
Merge
Introduce joint stabilizer measurements across compatible boundaries.
↓
Joint Measurement
Learn a property involving multiple logical qubits.
↓
Split
Restore separate encoded regions.
↓
Logical Computation
Combine these primitives into protected logical operations.
________________________________________
End State
The learner should leave with this mental model:
LOGICAL PATCH A + LOGICAL PATCH B
↓
IDENTIFY COMPATIBLE BOUNDARIES
↓
MERGE
↓
INTRODUCE JOINT STABILIZER CHECKS
↓
MEASURE JOINT LOGICAL INFORMATION
↓
SPLIT
↓
CONTINUE WITH PROTECTED LOGICAL QUBITS
The central takeaway should be:
Lattice surgery enables logical qubits encoded in surface-code patches to interact by temporarily changing stabilizer measurements along their boundaries. This allows joint logical information to be measured while the quantum information remains encoded and protected.
The learner should also recognize the larger progression:
protect logical qubits → decode errors → perform protected logical operations
End by challenging an idealization used throughout the module:
So far, we have often treated physical qubits and errors as though they behave uniformly. Real quantum hardware does not. What happens when different qubits, gates, and measurements have different error characteristics—and those characteristics change over time?
Next: Hardware-Aware QEC →


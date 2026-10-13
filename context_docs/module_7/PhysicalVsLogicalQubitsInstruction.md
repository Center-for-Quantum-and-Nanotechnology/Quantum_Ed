Section 02 — Physical vs Logical Qubits
Goal
Build an interactive educational section that gives learners an intuitive understanding of the difference between physical qubits and logical qubits, and introduces the idea that a logical qubit can be encoded across multiple physical qubits for error protection.
The section should prepare the learner for the next sections on errors, repetition codes, and syndrome measurement.
Learning outcomes
By the end of the section, the learner should understand:
1.	What a physical qubit is.
2.	What a logical qubit is.
3.	Why a logical qubit can require multiple physical qubits.
4.	That encoding distributes quantum information across physical qubits rather than simply copying an unknown quantum state.
5.	That physical qubits are susceptible to errors, while logical qubits can be designed to be more robust against those errors.
Page structure
1. Introduction
Start with a concise visual explanation:
Physical qubit → hardware-level quantum system
Logical qubit → encoded quantum information
Use a clean diagram showing:
                 LOGICAL QUBIT
                      |ψ⟩
                       │
                    encoding
                       ↓
             ┌────┬────┬────┐
             │ q₁ │ q₂ │ q₃ │
             └────┴────┴────┘
              PHYSICAL QUBITS
Avoid introducing heavy mathematics initially.
2. Physical Qubits
Explain that physical qubits are the actual quantum systems implemented in hardware.
Show that physical qubits are imperfect and can experience noise/errors.
Keep the explanation platform-independent; optionally mention superconducting qubits, trapped ions, neutral atoms, etc.
3. Logical Qubits
Explain that a logical qubit is an encoded representation of quantum information distributed across multiple physical qubits.
Introduce the concept of encoding without requiring stabilizer formalism.
Include a small expandable explanation of:
Encoding ≠ cloning
Explain that QEC does not create independent copies of an arbitrary unknown quantum state.
4. Interactive Demo — Encode a Logical Qubit
This should be the main interaction.
Use a simplified 3-qubit repetition-code example.
Allow the learner to:
1.	Start with a logical state:
|ψ⟩ = α|0⟩ + β|1⟩
2.	Click Encode.
3.	Animate the logical qubit becoming an encoded state:
α|000⟩ + β|111⟩
4.	Visually identify the three physical qubits.
5.	Inject a single physical bit-flip error onto q₁, q₂, or q₃.
6.	Show that the physical state has changed while the logical information is represented by the encoded system.
Do not implement full syndrome measurement yet. That belongs to a later section.
Instead, end the demo with:
“An error has occurred on a physical qubit. How can we detect which qubit was affected without directly measuring the logical state?”
This should create the transition into the later Syndrome Measurement section.
5. Physical vs Logical comparison
Include a compact comparison:
Physical Qubit	Logical Qubit
Hardware-level qubit	Encoded quantum information
Subject to physical noise	Can be protected using QEC
Individual quantum system	Distributed across multiple physical qubits
Building block	Fault-tolerant computational unit
Avoid suggesting that every logical qubit necessarily uses exactly three physical qubits. Clearly label the 3-qubit example as a teaching example.
6. Takeaway
End with three short statements:
•	Physical qubits are the hardware.
•	Logical qubits are encoded quantum information.
•	Quantum error correction uses multiple physical qubits to protect logical information from errors.
Then provide a clear CTA:
Next: Errors and Noise →
UX / visual requirements
•	Prioritize diagrams and animation over paragraphs.
•	Use consistent visual distinction:
o	Blue = logical information
o	Gray/neutral = physical qubits
o	Red/orange = errors
o	Green = protected/recovered state
•	Keep mathematical notation progressive: introduce equations only after the conceptual model.
•	Make the 3-qubit demo visually understandable even before reading the explanatory text.
•	Include short tooltips/glossary definitions for “physical qubit,” “logical qubit,” “encoding,” and “error.”
•	Make the interaction resettable so learners can experiment with different physical qubits.
Technical requirements
•	Build the section as a self-contained component/page that fits the existing Module 07 architecture.
•	Reuse the project's existing typography, colors, buttons, cards, animation system, and responsive layout.
•	Do not introduce a new UI framework or dependency unless absolutely necessary.
•	Keep the quantum simulation educational rather than attempting to simulate a full physical quantum computer.
•	The 3-qubit repetition-code behavior should be deterministic and conceptually accurate.
•	Structure the code so the later Repetition Codes and Syndrome Measurement sections can reuse the qubit visualization and state/animation components.
Important pedagogical constraint
Do not turn this into a general introduction to quantum computing.
The purpose of this section is specifically to establish the conceptual relationship:
physical qubits → encoding → logical qubit → physical errors → need for QEC
The learner should finish the page asking:
“If one physical qubit can fail, how can multiple physical qubits help us figure out what went wrong?”
That question should naturally lead into the next section.

Important: Clearly communicate the limits of the 3-qubit example
The 3-qubit repetition code is a deliberately simplified teaching example.
It should be presented as a code that can correct a single bit-flip (X) error, not as a complete solution to quantum errors.
The demo should explicitly distinguish:
•	No error → correct
•	One X error on q₁ → correct
•	One X error on q₂ → correct
•	One X error on q₃ → correct
•	Z/phase error → not corrected by this code
•	Y error → not fully protected by this code
•	Multiple simultaneous errors → generally outside the code's correction capability
Include a small "What this code cannot do" expandable panel.
Explain that the repetition code protects information encoded in the computational basis against bit flips, but does not independently protect against phase flips.
Use this as a transition into more general quantum error correction:
The 3-qubit repetition code teaches us the core idea of redundancy, but real quantum error correction must protect against both bit-flip and phase-flip errors.
Do not imply that three physical qubits are generally sufficient to create a fault-tolerant logical qubit.
Also make clear that the 3-qubit encoding is being used here because it provides an intuitive introduction to encoding and error correction. More complete codes, such as CSS and surface codes, are introduced later in the module.



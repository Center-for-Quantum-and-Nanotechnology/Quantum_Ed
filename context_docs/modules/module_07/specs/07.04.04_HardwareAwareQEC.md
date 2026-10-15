Hardware-Aware QEC
From Ideal Models to Real Devices
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
Also review the existing Decoding, Surface Codes, Minimum-Weight Perfect Matching, and Lattice Surgery sections before implementation. Reuse established components, terminology, visual conventions, and interaction patterns where appropriate.
This section concludes the Scaling portion of Module 07.
________________________________________
Goal
Transition the learner from the simplified hardware assumptions used throughout introductory QEC to the realities of operating quantum error correction on physical devices.
The central progression is:
idealized QEC model → real hardware → device variation → calibration and characterization → calibration telemetry → error/noise model → hardware-informed QEC decisions
The learner should understand that physical qubits, gates, and measurements are not perfectly uniform and that their characteristics can change over time.
Introduce calibration telemetry as one source of information that describes measured or estimated properties of a quantum device.
Then show how information about hardware behavior can potentially inform QEC, including decoder assumptions and weights.
The key conceptual transition is:
Our QEC examples used simplified models of physical errors. Real quantum hardware has nonuniform and changing characteristics that QEC systems may need to account for.
Do not present “hardware-aware QEC” as one standardized architecture or as the universally accepted direction of all QEC research.
________________________________________
Learning Outcomes
By the end of the section, the learner should be able to:
1.	Identify simplifying hardware assumptions commonly used in introductory QEC examples.
2.	Explain why real physical qubits do not all behave identically.
3.	Understand that qubit, gate, and measurement characteristics can vary across a device.
4.	Understand that some hardware characteristics can drift over time.
5.	Explain the basic purpose of quantum hardware calibration and characterization.
6.	Define calibration telemetry conceptually.
7.	Recognize representative device metrics such as (T_1), (T_2), gate error/fidelity, readout error, qubit frequency, and calibration time.
8.	Understand that telemetry values are produced or estimated through physical characterization/calibration processes rather than simply being inherently “known” by the computer.
9.	Explain how hardware information can contribute to an error/noise model.
10.	Explain conceptually how hardware-informed error assumptions can influence QEC decisions such as decoder weights.
11.	Recognize hardware-aware QEC as an active area of design and research rather than a single universal QEC architecture.
________________________________________
Experience-Level Scope
Follow the progressive-depth architecture defined in the project Vision.
Beginner — V1 Requirement
The V1 page should teach:
•	idealized vs. real hardware
•	spatial variation across physical qubits
•	temporal variation/drift
•	basic purpose of calibration and characterization
•	what calibration telemetry represents
•	representative telemetry metrics
•	telemetry → error/noise model
•	error/noise model → potential QEC use
•	a simple example of hardware-informed MWPM weights
•	limitations of calibration information
•	hardware-aware QEC as a research/design space
Prioritize conceptual relationships and visualization over device physics.
Intermediate — Future Hardening
Future Intermediate content may add:
•	more detailed calibration workflows
•	relationships between (T_1), (T_2), gates, measurement, and error models
•	characterization data vs. decoder-specific error probabilities
•	historical calibration data
•	decoder calibration
•	spatially nonuniform noise models
•	time-dependent noise models
•	biased noise
•	erasure information
•	correlated errors
•	hardware-informed qubit or code placement
•	practical telemetry-processing pipelines
Advanced — Future Hardening
Future Advanced content may add:
•	circuit-level noise models
•	calibration-conditioned decoders
•	adaptive decoding
•	dynamic decoder weights
•	uncertainty in calibration estimates
•	calibration staleness and drift prediction
•	correlated and non-Markovian noise
•	decoder latency constraints
•	cross-layer QEC architectures
•	machine-learning decoders
•	hardware/QEC co-design
•	current research approaches and literature
Do not implement Intermediate or Advanced content merely to make V1 more comprehensive.
________________________________________
Page Structure
1. The Assumption We Have Been Making
Begin by revisiting the simplified models used throughout Module 07.
Show an idealized surface-code patch where physical components appear uniform.
For example:
Qubit 1    error probability = p
Qubit 2    error probability = p
Qubit 3    error probability = p
Qubit 4    error probability = p
Ask:
What if the physical qubits do not all behave the same way?
Transition to a more realistic conceptual model:
Qubit 1    different characteristics
Qubit 2    different characteristics
Qubit 3    different characteristics
Qubit 4    different characteristics
Explain that fabricated quantum devices contain physical variation, and qubits, gates, and measurements can exhibit different performance characteristics.
The purpose is not to invalidate the earlier examples.
Explain that uniform models were useful abstractions for learning the QEC machinery.
Now the abstraction is being relaxed.
________________________________________
2. Real Hardware Is Not Uniform
Use a small device or surface-code visualization.
Allow the learner to inspect several physical qubits.
Show representative differences such as:
•	coherence characteristics
•	gate performance
•	readout performance
•	frequency
•	connectivity or interaction characteristics
Use simplified representative values rather than implying the page is displaying a particular real processor unless real device data is intentionally being used.
The learner should see:
same device
↓
different physical locations
↓
different measured characteristics
Introduce the term:
spatial variation
Explain:
The physical error environment may vary across a quantum processor.
Do not imply that one metric alone determines whether a qubit is “good” or “bad.”
________________________________________
3. Hardware Also Changes Over Time
Take one example physical qubit and show a metric changing across several calibration snapshots.
For example:
TIME 1    T1 = ...
TIME 2    T1 = ...
TIME 3    T1 = ...
or show changing readout/gate characteristics.
Introduce:
temporal variation / drift
Explain conceptually:
A device characteristic measured during one calibration may not remain exactly the same indefinitely.
Show:
same physical qubit
↓
different time
↓
different measured characteristics
The learner should now understand two forms of variation:
Spatial
Different parts of the device behave differently.
Temporal
The same part of the device can behave differently over time.
Do not overstate how rapidly any specific metric changes; behavior depends on the hardware, metric, and operating conditions.
________________________________________
4. Calibration and Characterization
Introduce the basic purpose of calibration.
Explain conceptually:
Quantum hardware must be measured, characterized, and adjusted so that control operations and measurements behave as intended.
Introduce a simple process:
physical device
↓
characterization / calibration experiments
↓
measurements
↓
parameter estimates
↓
control/calibration adjustments
Clarify that calibration is an active process.
The system does not simply possess perfect knowledge of its physical state.
Measurements and experiments are used to estimate relevant characteristics.
Do not deeply teach the underlying calibration experiments or device physics in Beginner V1.
Those topics can be expanded during future curriculum hardening.
________________________________________
5. What Is Calibration Telemetry?
Introduce calibration telemetry as information describing measured or estimated characteristics of the physical device.
Show a simplified telemetry panel.
Example fields may include:
Qubit Characteristics
•	(T_1) — energy relaxation time
•	(T_2) — coherence/dephasing-related time
•	qubit frequency
Operation Characteristics
•	single-qubit gate error/fidelity
•	two-qubit gate error/fidelity
Measurement Characteristics
•	readout/measurement error
Context
•	qubit identifier
•	connectivity
•	calibration timestamp or age
Keep definitions concise.
For example:
(T_1)
How quickly excited-state population tends to relax.
(T_2)
How quickly phase coherence is lost under the relevant measurement definition.
Readout error
How reliably the measurement process distinguishes expected outcomes.
Gate error/fidelity
A characterization of how closely an implemented operation performs relative to its intended behavior under a particular estimation method.
Avoid presenting these quantities as interchangeable direct probabilities of every possible physical error.
Include an important callout:
These values come from measurements, characterization procedures, and estimation methods. They are not quantities the quantum computer automatically knows exactly.
________________________________________
6. Main Interactive — “Uniform Model vs. Hardware-Informed Model”
Reconnect directly to the MWPM section.
Begin with a small decoding graph.
Uniform Model
Give comparable paths equal or distance-based weights.
For example:
A ●──────● B
    2

A ●──────● C
    2
Show the resulting preferred matching.
Then switch to:
Hardware-Informed Model
Overlay simplified device information indicating that one physical region has different estimated error characteristics.
Update the graph weights accordingly.
For example:
Path A-B crosses lower estimated-error region
weight = 4

Path A-C crosses higher estimated-error region
weight = 2
The preferred matching may change.
Show the conceptual chain:
same syndrome
↓
different error/noise model
↓
different decoder weights
↓
possibly different recovery
The learner should recognize this idea from the earlier MWPM lesson.
Emphasize:
The syndrome has not changed. What changed is the decoder's model of which error explanations are more plausible.
Do not imply that calibration telemetry can always be directly converted into MWPM weights.
This is a simplified educational example of how hardware information may influence an error model and decoder.
________________________________________
7. Telemetry Is Not the Error Model
Make this distinction explicit.
Show:
Calibration / characterization information
↓
modeling / interpretation
↓
error or noise model
↓
QEC / decoder
Explain:
A telemetry value such as (T_1) is not itself a complete QEC error model.
Multiple measurements and assumptions may be required to characterize the errors relevant to a particular code, circuit, or decoder.
This prevents the learner from developing the misconception:
T1 → directly becomes decoder probability
Instead teach:
hardware measurements → characterization information → modeling → QEC-relevant error assumptions
________________________________________
8. Calibration Information Has Limitations
Introduce several important limitations conceptually.
Measurement Uncertainty
Calibration values are estimates derived from experiments.
Incomplete Information
A collection of telemetry metrics does not describe every possible hardware error.
Time Dependence
Hardware characteristics may change after calibration.
Model Dependence
Different QEC or software systems may use hardware information differently.
Use a simple visualization:
CALIBRATION SNAPSHOT
Time = 10:00
↓
device continues operating
↓
Time = 12:00
↓
Is the earlier snapshot still perfectly representative?
Answer:
Not necessarily.
The purpose is to introduce the concept of calibration staleness without requiring predictive modeling.
________________________________________
9. Hardware Information Can Be Used in Different Ways
Broaden the learner's perspective.
Show that information about hardware behavior can potentially influence multiple parts of a quantum computing system.
Examples may include:
•	control and recalibration
•	qubit selection or placement
•	compilation
•	noise modeling
•	decoder weighting
•	code or protocol choices
For this section, keep the focus on QEC.
Highlight:
hardware information
↓
QEC error assumptions
↓
decoder decisions
But explain that this is one possible use of calibration/device information rather than its sole purpose.
Do not present all listed uses as universally deployed or equally mature.
________________________________________
10. Hardware-Aware QEC Is a Research and Design Space
Explicitly address the terminology.
Explain:
“Hardware-aware QEC” is useful here as an umbrella description for approaches that incorporate information about physical-device behavior into QEC design or operation.
Then clarify:
It does not refer to one universally standardized QEC architecture.
Different approaches may use hardware information for:
•	decoder calibration or weighting
•	adapting to nonuniform noise
•	code selection or design
•	qubit/layout choices
•	exploiting known noise bias or erasure information
•	other cross-layer decisions
Some QEC research instead focuses on other aspects of fault tolerance, decoding, code design, architectures, or hardware.
The learner should understand hardware awareness as an active research/design direction rather than an inevitable final stage of every QEC system.
________________________________________
Optional Beginner Exploration — “Inspect the Device”
Provide a small interactive device map.
Allow the learner to select individual physical qubits and inspect simplified calibration information.
For example:
Qubit Q3

T1               82 μs
T2               61 μs
Readout error     1.7%
1Q gate error     ...
Last calibration  ...
Selecting another qubit should reveal different values.
Optionally allow:
Calibration Snapshot A
vs.
Calibration Snapshot B
so the learner can observe both spatial and temporal variation.
The goal is not to rank qubits as universally good or bad.
The goal is to make device heterogeneity and drift tangible.
________________________________________
Visual / UX Requirements
Maintain the established Module 07 visual language:
•	Blue → logical information
•	Gray / neutral → physical qubits
•	Red / orange → physical errors
•	Purple → syndrome / stabilizer / check information
•	Green → successful recovery / protected state
Introduce a consistent visual representation for:
•	calibration/device information
•	hardware variation
•	telemetry
•	model-derived decoder weights
Clearly distinguish:
measured/estimated hardware information
from:
physical error
from:
syndrome information
from:
decoder inference
Do not rely on color alone.
Telemetry panels should remain approachable and should not resemble overwhelming engineering dashboards.
Use only enough information to support the lesson.
________________________________________
Technical Requirements
•	Reuse the Surface Code and MWPM representations where practical.
•	Keep calibration/telemetry data separate from the decoder and visualization layers.
•	Represent telemetry using reusable structured data.
•	Support multiple calibration snapshots so temporal variation can be demonstrated.
•	Keep the error/noise model conceptually separate from raw telemetry.
•	Keep decoder weights separate from the underlying telemetry values.
•	Use clearly labeled synthetic/educational data for V1 unless intentionally using a documented real dataset.
•	Do not imply synthetic values represent a particular quantum processor.
•	Preserve architecture that could later support richer calibration datasets or real device data.
•	Do not implement real-time hardware integration for V1.
•	Do not implement predictive calibration or adaptive decoding for V1.
•	Follow the experience-level architecture established in the project Vision.
________________________________________
Important Pedagogical Constraints
Do not imply:
all physical qubits have identical error characteristics
Real devices can be heterogeneous.
Do not imply:
calibration telemetry = exact physical truth
Telemetry contains measurements or estimates with uncertainty and limitations.
Do not imply:
telemetry = error model
Telemetry may inform a model, but additional assumptions and processing are required.
Do not imply:
T1/T2 directly determine all QEC error probabilities
They characterize particular aspects of device behavior.
Do not imply:
the most recently calibrated value remains perfectly accurate indefinitely
Device characteristics can drift.
Do not imply:
hardware-aware QEC is the universally accepted next stage of QEC
Present it as an active collection of research and engineering approaches.
Do not imply:
all QEC systems must continuously consume calibration telemetry
Different architectures and research approaches make different choices.
Do not teach detailed calibration physics or experimental procedures in Beginner V1.
Do not introduce the user's research architecture or any specific predictive telemetry model as though it were an established standard.
________________________________________
Future Hardening Note
During the curriculum-wide hardening pass, review the calibration telemetry concepts introduced here for connections to relevant content in:
•	Quantum Hardware
•	Quantum Software Stack
•	quantum control/calibration material
•	noise and decoherence material
Do not build those cross-module dependencies during V1.
The final destinations and depth of those connections should be determined after the broader curriculum has been implemented.
________________________________________
Conceptual Continuity
The learner should now see the complete Scaling progression:
Surface Codes
Organize QEC across scalable encoded patches.
↓
MWPM
Use an error model and syndrome information to infer a recovery.
↓
Lattice Surgery
Perform protected interactions between encoded logical qubits.
↓
Real Hardware
Physical qubits, gates, and measurements are nonuniform and can change over time.
↓
Calibration / Characterization
Measure and estimate aspects of device behavior.
↓
Calibration Telemetry
Represent information about the physical device.
↓
Error / Noise Modeling
Translate relevant hardware information into assumptions useful to QEC.
↓
Hardware-Informed QEC
Potentially use those assumptions to improve or adapt QEC decisions.
________________________________________
End State
The learner should leave with this mental model:
REAL QUANTUM HARDWARE
↓
NONUNIFORM + TIME-VARYING CHARACTERISTICS
↓
CALIBRATION / CHARACTERIZATION
↓
MEASURED OR ESTIMATED DEVICE INFORMATION
↓
CALIBRATION TELEMETRY
↓
MODELING / INTERPRETATION
↓
QEC-RELEVANT ERROR / NOISE MODEL
↓
POTENTIALLY HARDWARE-INFORMED QEC DECISIONS
The central takeaway should be:
Real quantum hardware does not perfectly match the uniform error models used in introductory examples. Calibration and characterization provide information about device behavior, and some QEC approaches can use that information to build more realistic error models or make hardware-informed decisions.
The learner should also leave with an important scientific qualification:
Hardware-aware QEC is not one standardized solution or the universal direction of all QEC research. It is a broad and active area exploring how knowledge of physical hardware can inform error correction.
This section concludes the Module 07 Scaling sequence.


Minimum-Weight Perfect Matching
Project Context
Before implementing this section, review the project Vision document in context_docs.
Follow its guidance for:
	progressive experience levels
	V1 development priorities
	reusable architecture
	conceptual accuracy
	accessibility
	interaction design
	continuity between sections
Also review the existing Decoding and Surface Codes sections before implementation. Reuse established components, terminology, visual conventions, and interaction patterns where appropriate.
This section continues the Scaling portion of Module 07.
________________________________________
Goal
Teach the learner how Minimum-Weight Perfect Matching (MWPM) can be used to decode syndrome/detection information from a surface code.
The central progression is:
physical errors → detection events → decoding graph → possible connections → weighted edges → matching → recovery
The learner should understand that MWPM does not directly observe the physical errors that occurred.
Instead, it uses the available syndrome/detection information and an error model to identify a low-cost explanation that can be used to choose a recovery.
The key conceptual transition is:
Surface Codes showed us the decoding problem. MWPM gives us a systematic way to solve an important version of that problem.
This section should focus on the intuition behind MWPM rather than the internal implementation of graph-matching algorithms.
________________________________________
Learning Outcomes
By the end of the section, the learner should be able to:
	Explain why surface-code syndrome information can correspond to multiple possible error patterns.
	Describe detection events as nodes in a decoding graph.
	Understand that possible relationships between detection events can be represented as edges.
	Explain that edge weights represent the relative cost or likelihood of possible error explanations.
	Define a matching conceptually as pairing detection events.
	Explain what “perfect” means in Minimum-Weight Perfect Matching.
	Explain what “minimum-weight” means.
	Follow a simple MWPM example from detection events to a selected matching.
	Understand that the selected matching suggests a recovery rather than proving the exact physical error history.
	Explain why changing the assumed error probabilities can change the preferred matching.
________________________________________
Experience-Level Scope
Follow the progressive-depth architecture defined in the project Vision.
Beginner — V1 Requirement
The V1 page should teach:
	why decoding is ambiguous
	detection events as graph nodes
	possible connections as graph edges
	edge weights as costs
	matching detection events
	perfect matching
	minimum total weight
	converting a matching into a recovery
	why the inferred error path may differ from the actual physical error
	how an error model influences weights
Prioritize interactive graph intuition over graph-theory formalism.
Intermediate — Future Hardening
Future Intermediate content may add:
	shortest paths on the decoding graph
	boundary matching
	more formal edge-weight definitions
	probabilities and negative log-likelihood weights
	repeated syndrome rounds
	space-time decoding graphs
	measurement errors
	degeneracy and equivalent recoveries
	larger matching examples
	practical decoder workflows
Advanced — Future Hardening
Future Advanced content may add:
	matching algorithm implementation details
	Blossom-family algorithms
	computational complexity
	optimized MWPM implementations
	correlated noise limitations
	biased-noise weighting
	circuit-level noise models
	decoder latency and throughput
	logical failure mechanisms
	comparisons with alternative decoder families
	hardware- and calibration-aware edge weighting
Do not implement Intermediate or Advanced content merely to make V1 more comprehensive.
________________________________________
Page Structure
1. Return to the Surface-Code Problem
Begin with the final problem from Surface Codes.
Show a small surface-code example containing detection events.
Remind the learner:
The syndrome tells us that something happened, but it does not necessarily reveal the exact physical error chain.
Show multiple possible paths that could explain the same detection information.
Ask:
If several error patterns are compatible with what we observed, how should the decoder choose a recovery?
Introduce MWPM as one method for answering that question.
Do not begin with the full algorithm name and a formal graph definition.
Begin with the decoding problem.
________________________________________
2. Turn the Syndrome Into a Graph
Transition from the surface-code lattice to a simplified decoding graph.
Introduce:
	Node — represents a detection event.
	Edge — represents a possible connection or error explanation between detection events.
	Weight — represents the cost associated with that possible connection.
Visually transform the surface-code information into the graph representation.
For example:
Surface-code detection events
↓
extract relevant detection locations
↓
represent them as graph nodes
↓
connect possible pairs
The learner should understand that the graph is a decoding representation built from the syndrome information.
Do not imply that the graph itself is the physical quantum hardware.
________________________________________
3. What Does a Weight Mean?
Introduce edge weights conceptually.
Start with the simplest intuition:
A lower-weight edge represents an explanation the decoder considers less costly or more plausible under its model.
For the initial Beginner example, geometric distance may be used as an intuitive proxy:
short path → lower weight
long path → higher weight
But explicitly explain that real decoder weights do not have to represent geometric distance alone.
They can reflect assumptions about error probabilities.
Use a simple example:
A ●────● B      weight = 2

A ●────────● C  weight = 4
Then ask:
If errors are assumed to be similarly likely across the lattice, which connection would generally be the simpler explanation?
Avoid teaching:
MWPM always chooses the physically shortest path.
Instead teach:
MWPM minimizes the weights defined by the decoder's error model.
This distinction is important for later Hardware-Aware QEC.
________________________________________
4. Main Interactive — “Match the Detection Events”
Make this the primary V1 interaction.
Begin with a small graph containing an even number of detection events, such as four nodes.
For example:
A ●             ● B


C ●             ● D
Display possible connections and their weights.
Allow the learner to pair the detection events.
As pairs are selected:
	highlight the selected edges
	show the weight of each edge
	calculate the total matching weight
	indicate whether every required detection event has been matched
Allow the learner to try multiple matchings.
For example:
Matching 1
A ↔ B
C ↔ D
Total weight = 8
Matching 2
A ↔ C
B ↔ D
Total weight = 4
Then ask:
Which complete matching has the lowest total weight?
Reveal that MWPM selects the minimum-weight complete matching.
The learner should discover the idea through interaction before receiving a formal definition.
________________________________________
5. Why “Perfect Matching”?
After the learner has used the interaction, define the terminology.
Matching
A set of selected edges that pairs nodes without using the same node more than once.
Perfect Matching
A matching in which every node that must be matched is paired.
Minimum-Weight Perfect Matching
Among the valid perfect matchings, choose one with the smallest total edge weight.
Show:
W=∑_(e∈M)▒w_e 
where:
	Mis the selected matching
	w_eis the weight of each selected edge
	Wis the total matching weight
Keep the mathematics secondary to the visual explanation.
The learner should be able to understand MWPM even without relying on the equation.
________________________________________
6. From Matching to Recovery
Reconnect the abstract graph to the surface-code lattice.
Show:
detection events
↓
MWPM pairs events
↓
selected graph edges correspond to likely error paths / recovery paths
↓
decoder applies or tracks an appropriate recovery
↓
logical information remains protected
Animate the transition from the graph back onto the surface-code representation.
This is important.
Do not allow MWPM to remain an abstract graph exercise disconnected from quantum error correction.
The learner should understand:
The matching tells the decoder how detection events should be paired under the model. Those pairings are then used to construct a recovery.
________________________________________
7. The Decoder Can Be “Wrong” About the Physical Error and Still Succeed
Create a simple example where:
	the actual physical error follows one path
	MWPM selects a different compatible path
	the resulting recovery still preserves the logical information
Visually distinguish:
	actual physical error path
	decoder-inferred/recovery path
Then show the combined effect.
Explain:
A decoder does not necessarily need to reconstruct the exact microscopic error history.
Its goal is to choose a recovery that returns the system to the correct logical equivalence class.
Keep “equivalence class” optional or lightly defined at Beginner level if necessary.
The primary takeaway should be:
correct physical reconstruction is not the same thing as successful logical recovery
This should reinforce the earlier Decoding lesson.
________________________________________
8. When a Matching Causes Logical Failure
Show a contrasting simplified example.
The syndrome is ambiguous.
MWPM chooses a low-weight explanation based on the available model, but the actual error pattern differs in a way that causes the combined error and recovery to form a logical error.
Explain:
A decoder makes an inference from incomplete information. It cannot guarantee that its selected explanation matches the actual physical error.
This provides an important distinction:
decoder success
vs.
decoder logical failure
Do not frame MWPM as an infallible algorithm.
Do not imply that minimum weight automatically means the true physical error.
________________________________________
9. Weights Depend on the Error Model
Reconnect directly to the earlier Decoding section.
Show the same graph with two different sets of weights.
Model A — Uniform Errors
Edges are weighted primarily according to distance or a simple uniform error assumption.
Model B — Unequal Error Probabilities
Some locations or connections are more error-prone than others.
Update the edge weights.
Allow the learner to observe that the preferred matching may change.
The conceptual progression should be:
same detection events
	
different assumptions about errors
↓
different edge weights
↓
possibly different matching
This should reinforce:
Decoding depends on both the syndrome and the decoder's assumptions about the error process.
Do not deeply teach hardware calibration or time-dependent error models here.
Those ideas belong in Hardware-Aware QEC.
________________________________________
Optional Beginner Exploration — “Can You Beat the Decoder?”
Provide a small challenge using four or six detection events.
Ask the learner to select the minimum-weight perfect matching manually.
Show the running total as edges are selected.
Then allow:
Run MWPM
Compare the learner's matching with the decoder's result.
If multiple matchings have the same minimum total weight, do not mark one arbitrarily as uniquely correct.
Instead explain that multiple minimum-weight solutions can exist.
The purpose is to reinforce the meaning of:
	matching
	perfect
	weight
	minimum
rather than testing graph-theory expertise.
________________________________________
Visual / UX Requirements
Maintain the established Module 07 visual language:
	Blue → logical information
	Gray / neutral → physical qubits
	Red / orange → physical errors
	Purple → syndrome / detection information
	Green → successful recovery / protected state
For decoding graphs, clearly distinguish:
	detection-event nodes
	candidate edges
	selected matching edges
	edge weights
	actual physical error paths
	inferred/recovery paths
Do not rely on color alone.
The transition between:
surface-code lattice ↔ decoding graph
should be visually clear.
The learner should always understand whether they are currently looking at:
	the physical/code representation, or
	the decoder's graph representation.
Avoid displaying a dense graph before the learner understands the small example.
________________________________________
Technical Requirements
	Review and reuse the Surface Code representation developed in the previous section.
	Reuse existing syndrome/detection-event structures where appropriate.
	Keep graph construction separate from graph visualization.
	Represent nodes, edges, and weights through reusable data structures.
	Keep the error model separate from the matching algorithm.
	Keep actual physical error data separate from decoder-inferred recovery data.
	Structure the implementation so weights can later be changed by more sophisticated error models.
	Use deterministic small examples for the Beginner V1 interaction.
	A simple educational matching implementation is sufficient for small graphs if it accurately demonstrates MWPM behavior.
	Do not introduce a large external graph/matching dependency solely for the Beginner demonstration unless necessary.
	Preserve an architecture that can later support larger graphs or a production-quality matching implementation.
	Follow the experience-level architecture established in the project Vision.
________________________________________
Important Pedagogical Constraints
Do not imply:
MWPM discovers the actual physical error
Instead teach:
MWPM chooses a low-weight explanation/recovery compatible with the observed detection information and its model.
Do not imply:
minimum geometric distance = MWPM in all cases
Instead teach:
MWPM minimizes decoder-defined edge weights.
Do not imply:
minimum weight = guaranteed correct recovery
Decoder failure remains possible.
Do not imply:
matching is performed directly on physical qubits
The matching problem is defined on a decoding graph derived from syndrome/detection information.
Do not begin with algorithm implementation details.
Begin with the ambiguity the learner already saw in Surface Codes.
Do not teach Blossom or other matching-algorithm internals at Beginner level.
Do not introduce full space-time decoding or noisy measurement rounds in V1 unless required by the existing Surface Codes implementation.
Do not allow the graph abstraction to become disconnected from the surface-code problem it represents.
________________________________________
Conceptual Continuity
The learner should now see the progression:
Surface Code
Physical errors produce syndrome/detection information.
↓
Decoding Graph
Detection events become nodes and possible explanations become weighted edges.
↓
Matching
Pair the detection events.
↓
Perfect Matching
Pair every required detection event.
↓
Minimum Weight
Choose the complete matching with the lowest total decoder-defined cost.
↓
Recovery
Translate the selected matching into an appropriate recovery.
↓
Logical Protection
If the recovery is logically correct, the encoded information remains protected.
________________________________________
End State
The learner should leave with this mental model:
DETECTION EVENTS
↓
BUILD DECODING GRAPH
↓
POSSIBLE CONNECTIONS
↓
ASSIGN WEIGHTS
↓
FIND PERFECT MATCHINGS
↓
SELECT MINIMUM-WEIGHT MATCHING
↓
CONSTRUCT RECOVERY
↓
PRESERVE LOGICAL INFORMATION
The central takeaway should be:
Minimum-Weight Perfect Matching is a decoding method that uses weighted relationships between detection events to choose a low-cost recovery consistent with the observed syndrome and the decoder's error model.
The learner should also understand:
MWPM does not need to determine exactly what physically happened. It needs to choose a recovery that protects the logical information.
End by widening the learner's perspective:
We can now protect a logical qubit with a surface code and decode its errors. But how do we perform operations between logical qubits while keeping them protected?
Next: Lattice Surgery →


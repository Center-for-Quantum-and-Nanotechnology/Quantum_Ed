Section 07 — Decoding
Goal
Teach the learner what a decoder does in quantum error correction.
The learner should understand that syndrome measurement gives us information about an error, but does not necessarily tell us exactly what happened. A decoder uses the syndrome, together with assumptions about the error model, to infer a likely error pattern and determine an appropriate correction.
The central progression is:
error → syndrome → decoder → inferred error → correction
This section should prepare the learner for Surface Codes and Minimum-Weight Perfect Matching.
Learning outcomes
By the end of the section, the learner should be able to:
1.	Explain the purpose of a QEC decoder.
2.	Distinguish a measured syndrome from an inferred error.
3.	Understand that multiple physical error patterns can sometimes produce the same syndrome.
4.	Understand why decoders need an error/noise model.
5.	Explain the idea of choosing the most likely error pattern.
6.	Understand why decoding becomes substantially harder as QEC codes scale.
Page structure
1. Start with the problem
Revisit the previous section:
Physical error
      ↓
Syndrome measurement
      ↓
Syndrome
Then ask:
We have a syndrome. Now what?
Introduce:
A decoder takes the measured syndrome and infers which error pattern most likely occurred.
Make the distinction explicit:
SYNDROME
"What evidence do we have?"

       ↓ decoder

INFERRED ERROR
"What most likely happened?"

       ↓

CORRECTION
"What operation should we apply?"
________________________________________
2. Main interactive — “Decode the syndrome”
Use a small repetition-code example first.
Show three physical qubits:
q₁     q₂     q₃
 ●      ●      ●
Randomly or manually introduce a single X error.
Then show the resulting syndrome:
S₁ = -1
S₂ = +1
Ask:
Which error pattern is most consistent with this syndrome?
Provide choices:
[ X₁ ]   [ X₂ ]   [ X₃ ]   [ No error ]
After selection, explain the reasoning.
The learner should see:
syndrome (-1,+1)
        ↓
consistent with X₁
        ↓
apply X₁
Repeat for different single-error cases.
________________________________________
3. Introduce ambiguity
Now deliberately make the problem harder.
Explain:
In larger codes, a syndrome does not always uniquely identify the error that occurred.
Show several possible error patterns producing the same syndrome:
              same syndrome
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
        error A   error B   error C
The exact examples should use a code/model where the equivalence is technically correct.
Emphasize:
The decoder is therefore not simply “reading the answer.” It is making an inference.
________________________________________
4. Why the decoder needs an error model
Introduce a simple probability model.
For example:
Assume:

X error on any physical qubit
      probability = p

No error
      probability = 1-p
Then explain:
If some error patterns are more likely than others, the decoder can use those probabilities when choosing an explanation for the syndrome.
Keep the mathematics light.
Introduce the idea:
syndrome
   +
error model
   ↓
decoder
   ↓
most likely error
This becomes important later for hardware-aware QEC.
________________________________________
5. Interactive — Change the noise model
Create a small optional interaction where the learner can change the assumed error probability.
For example:
X-error probability

0% ─────────●──────── 20%
            5%
Then present a syndrome with multiple possible explanations.
Show how changing the assumed error model can change the decoder's preferred explanation.
Do not overcomplicate this interaction. Its purpose is to establish:
Decoding depends not only on the syndrome, but also on assumptions about how errors occur.
________________________________________
6. From correction to equivalence
Introduce an important conceptual distinction before surface codes:
Two physical error patterns can produce the same syndrome.
Also explain that in QEC, what matters is not necessarily recovering the exact microscopic history of the noise.
The decoder needs to choose a correction that restores the encoded logical information.
Use a simplified conceptual diagram:
Actual error
     ↓
  syndrome
     ↓
decoder chooses
a compatible correction
     ↓
logical information preserved?
     │
   ┌─┴─┐
  yes  no
   ✓    ✗
Avoid introducing full logical-equivalence/coset formalism here. Mention it only as an optional advanced concept.
________________________________________
7. Scaling problem
Now show why decoding becomes important for realistic codes.
Start small:
3 physical qubits
       ↓
few possible errors
       ↓
simple lookup
Then scale up:
many physical qubits
       ↓
many possible error patterns
       ↓
many possible syndromes
       ↓
cannot simply inspect every possibility
       ↓
need efficient decoding algorithms
This should naturally motivate MWPM.
________________________________________
8. Introduce decoder families
Briefly show that there isn't one universal decoding algorithm.
                DECODING
                    │
       ┌────────────┼─────────────┐
       ↓            ↓             ↓
  Lookup-table     MWPM       Other decoders
       │            │
   small codes   surface      ML / hardware-
                 codes        aware methods
Keep the other approaches at the vocabulary level.
Highlight Minimum-Weight Perfect Matching as the next detailed topic.
________________________________________
Optional interactive — “Decoder confidence”
If appropriate, add a small visualization of competing hypotheses:
Syndrome: ● ● ○ ●

Possible explanations

Error A  ████████████████  72%
Error B  ██████             23%
Error C  █                     5%
Label probabilities as illustrative, not measured physical data.
The point is to visualize inference rather than teach Bayesian statistics.
________________________________________
Visual / UX requirements
Maintain the established visual language:
•	Blue → logical information
•	Gray → physical qubits
•	Red/orange → physical errors
•	Purple → syndrome
•	Green → inferred correction / successful recovery
•	Use a distinct neutral color for competing hypotheses
Make the decoder visually sit between syndrome and correction:
SYNDROME → DECODER → INFERRED ERROR → CORRECTION
The learner should always be able to see those four stages.
________________________________________
Technical requirements
•	Reuse the qubit, error, syndrome, and stabilizer components from previous sections.
•	Build the decoder as a separate conceptual/data layer rather than embedding decoding logic inside the visualization.
•	For the initial 3-qubit examples, a deterministic lookup table is sufficient.
•	Structure the interface so a future decoder can replace the lookup-table implementation.
•	Allow the error model to be represented separately from the decoder.
•	Keep the architecture extensible for MWPM in Section 09.
•	Do not implement MWPM in this section.
Important pedagogical constraints
Do not imply:
syndrome = error.
Instead teach:
syndrome = evidence about the error.
Do not imply that the decoder necessarily discovers the exact physical history.
Do not imply that the most likely physical error always leads to successful logical recovery.
Introduce the distinction between:
physical error
and
correction chosen by the decoder
before moving to more advanced codes.
Do not introduce MWPM mathematics here. The purpose of this section is to establish why a decoder is necessary and what it is trying to accomplish.
End state
The learner should leave with:
ERROR
  ↓
SYNDROME
  ↓
DECODER
  ↓
LIKELY ERROR / CORRECTION
  ↓
LOGICAL INFORMATION PRESERVED
And the core idea:
A decoder uses syndrome information and an error model to infer a correction that is likely to preserve the logical information.
End with:
For a large surface code, there can be an enormous number of possible error patterns. How can we find a good correction efficiently?
Next: Surface Codes → Minimum-Weight Perfect Matching


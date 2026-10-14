# What Is Quantum Computing?

A classical computer stores and processes **bits**. A quantum computer stores and processes **qubits**, which obey different rules. This page introduces the four ideas that the rest of QuantumEd builds on: **qubits**, **superposition**, **measurement**, and **entanglement**. Each comes with an interactive demonstration.

## Qubits

A classical bit is always either `0` or `1`. A **qubit** is a two-level quantum system whose state can be a combination, or *superposition*, of both:

\[
|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\varphi}\sin\left(\frac{\theta}{2}\right)|1\rangle
\]

Any single-qubit state can be pictured as a point on the surface of a sphere, the **Bloch sphere**. The angle \(\theta\) sets how much of the state points toward \(|0\rangle\) versus \(|1\rangle\), and \(\varphi\) sets a **phase**. A single measurement cannot detect the phase, but it becomes essential once states are combined, as the next section shows.

Use the sliders below to move the state around the sphere and observe how the measurement probabilities change.

<div data-qed-demo="bloch-explorer"></div>

You should notice two things:

- **θ controls the odds.** At 0° the qubit is certainly `0`; at 180° it is certainly `1`; at 90° the two outcomes are equally likely.
- **φ does not change the odds.** Varying it moves the arrow around the sphere, but the probabilities stay fixed. Phase is a real property of the state; it is simply invisible to a single measurement.

The numbers multiplying \(|0\rangle\) and \(|1\rangle\) (0.71 and 0.71 in the starting position) are called **amplitudes**. The probability of an outcome is the square of its amplitude, so two amplitudes of 0.71 give \(0.71^2 \approx 50\%\) each. The sliders show how these amplitudes correspond to a point on the sphere; [Module 02](../02-fundamentals/index.md) treats the Bloch sphere in full.

## Superposition

The phrase "a qubit is both 0 and 1 at the same time" is common shorthand, but it invites a misreading, so it is worth being precise.

Consider a coin that has been flipped and covered with a cup. It is heads or tails; we simply have not looked to see which side it landed on. That is ordinary uncertainty about a value that already exists. A qubit in superposition doesn't work this way. It is described by two **amplitudes**, one for `0` and one for `1`, and these amplitudes can be positive or negative. That allows them to **cancel** each other out, much as two overlapping waves can partialy or fully cancel each other. This effect is called **interference**, and it is what distinguishes a superposition from the hidden coin.

The demonstration below applies the same "mix" operation to a classical random bit and to a qubit. For the qubit, the operation is the **Hadamard gate**, written *H*. Gates are covered properly in [Module 02](../02-fundamentals/index.md), but for now it serves simply as a mix button. For the classical bit, mixing means re-flipping a fair coin. Start both at `0`, apply the mix, and then apply it a second time.

<div data-qed-demo="interference-mix"></div>

After one mix, the bit and the qubit are indistinguishable: both give `0` or `1` with equal probability. After the second mix, the bit remains 50/50 while the qubit returns to a certain outcome. The qubit's state contains more than its measurement probabilities. It contains amplitudes, and the second mix caused the unwanted ones to cancel.

Starting from `1` illustrates a further point. After one mix the odds are again 50/50, but the second amplitude is now negative. The two resulting states, \(|+\rangle\) (reached from `0`) and \(|-\rangle\) (reached from `1`), give identical odds to getting a `0` or `1`, but they are distinct states. We'll go into more detail about this in later modules.

!!! tip "Key idea"
    A superposition is not a coin we have not looked at yet. It is a state described by amplitudes that can add or cancel. Many quantum algorithms work by arranging this interference so that incorrect answers cancel and the correct one is reinforced.

<details class="qed-details" markdown="1">
<summary>Show the math: how the mix works</summary>

Each new amplitude is formed by adding or subtracting the old ones and dividing by \(\sqrt{2}\):

\[
a_0' = \frac{a_0 + a_1}{\sqrt{2}} \qquad a_1' = \frac{a_0 - a_1}{\sqrt{2}}
\]

Starting from \(|0\rangle\), the amplitudes are \((a_0, a_1) = (1, 0)\). One mix gives \((0.71, 0.71)\), the state \(|+\rangle\). A second mix gives

\[
a_1'' = \frac{0.71 - 0.71}{\sqrt{2}} = 0
\]

The two terms are equal and opposite, so they cancel exactly. Starting from \(|1\rangle\), the first mix gives \((0.71, -0.71)\), and the second mix cancels the \(|0\rangle\) amplitude instead.

</details>

## Measurement

Superposition describes a qubit's state, but the goal is to extract information from it. For this, we have to measure the qubit. Measuring a qubit does not reveal its amplitudes. Instead, it returns a single classical bit, `0` or `1`, according to three rules:

1. **One outcome.** Every measurement yields exactly one definite result.
2. **Probabilities from amplitudes.** The probability of each outcome is the square of its amplitude. This is known as the **Born rule**. Amplitudes of 0.71 and 0.71, for instance, give \(0.71^2 \approx 0.5\), so each outcome has a 50% chance.
3. **The state changes.** Afterward, the qubit is left in the state corresponding to the result it gave. This is commonly called **collapse**. Measuring it again gives the same result.

In terms of the angle \(\theta\) from the Bloch sphere, the probabilities are

\[
P(0) = \cos^2\left(\frac{\theta}{2}\right) \qquad P(1) = \sin^2\left(\frac{\theta}{2}\right)
\]

The demonstration below lets you prepare a qubit with the sliders and measure it. Measure it several times in a row and note what happens.

<div data-qed-demo="qubit-measurement"></div>

Some things to try:

- Set θ to 0° or 180°. The outcome is certain, since the qubit is already `0` or `1` and the measurement simply reads it out.
- Set θ to 45° and run a few hundred shots. The fraction of zeros will be close to \(\cos^2(22.5^\circ) \approx 85\%\), but rarely exactly that. Statistical fluctuation of this kind is expected.
- Try differnt values for φ. The probabilities do not change, because a single measurement is unaffected to phase.

!!! note "Simplifications"
    The measurement shown here is idealized: it always reports the true result. Real hardware readout is imperfect, which is one reason error correction is necessary (see [Module 04](../04-hardware/index.md) and [Module 07](../07-error-correction/index.md)). The outcomes are also generated by a random-number generator using the probabilities that quantum mechanics predicts; they are not data from a quantum computer.

A measurement returns one bit regardless of how much structure the state had, and θ and φ cannot be read off directly. Quantum algorithms are therefore designed so that the correct answer appears with high probability when the final measurement is made.

## Entanglement

With one qubit, state and measurement are manageable. With two or more, something new can happen: the qubits can be **entangled**, meaning the pair has one shared state that cannot be split into a separate state for each qubit.

The standard example is a **Bell pair**. Send one qubit to Alice and the other to Bob is far away from her, and let each measure their own qubit. If the qubits are entangled in this way, two things remain true regardless of distance:

- Each person's results, taken alone, look random: about half `0` and half `1`.
- Their results always agree.

The demonstration below makes pairs in two ways, so you can compare them.

<div data-qed-demo="bell-pair"></div>

The two modes look the same, and that is the point. Agreement alone does not show entanglement, because a pair of coins matched in advance, or a left glove in one box and a right glove in the other, also agrees every time. The difference appears when Alice and Bob measure in *different directions*.

A qubit can be measured along any direction on the Bloch sphere, and the direction you choose is the question you ask. Below, Alice always measures straight on, and Bob turns his detector by an angle you choose.

<div data-qed-demo="tilt-agreement"></div>

As Bob turns his detector further from Alice’s, their results agree less often. They agree every time at 0°, half the time at a right angle (90°), and never at 180°. Quantum mechanics predicts this agreement rate for a Bell pair:

\[
P(\text{same result}) = \cos^2\left(\frac{\text{angle}}{2}\right)
\]

Coins matched in advance cannot reproduce this pattern for every choice of directions at once. In the 1960s John Bell turned that statement into a precise test, and experiments with entangled photons and other systems have run it many times. The results match the quantum prediction, and the work was recognized by the 2022 Nobel Prize in Physics.

!!! warning "Entanglement is not a communication channel"
    You might be thinking that information about the qubits is moving between them. This is not the case. Alice's measurement does not send anything to Bob. Bob's results, taken alone, are random no matter what Alice does. The correlation shows up only when the two compare notes, which takes ordinary communication. Entanglement cannot be used to send messages faster than light.

<details class="qed-details" markdown="1">
<summary>Optional challenge: a game that no pre-arranged plan can win</summary>

Here is a way to see the difference for yourself. A referee gives Alice and Bob each a secret number, `0` or `1`, chosen at random. They cannot talk. Each then answers `0` or `1`. They win if their answers are the **same**, except when both received a `1`, in which case they win only if their answers **differ**. Before the game, they may plan together and share as many random numbers as they like.

**Without entanglement.** The simplest plan is for both to always answer `0`. That wins whenever the answers should match, which is three of the four possible pairs of numbers, so **75%** of rounds. The argument below shows that no plan made in advance does better.

**With entanglement.** They share a Bell pair. Alice measures at 0° if she received `0` and at 90° if she received `1`. Bob measures at 45° if he received `0` and at −45° if he received `1`. Each answers with their result. The formula above then gives a win rate of about **85%**.

<div data-qed-demo="chsh-game"></div>

Run both strategies a few times. The entangled pair settles above the 75% mark and the plan made in advance never does. This game is the simplest version of the **CHSH inequality**, one of the Bell tests mentioned above.

**Why 75% is the ceiling.** A plan fixes Alice's answer for each number she might receive, and Bob's likewise. Call them \(a_0, a_1\) and \(b_0, b_1\). Three of the four pairs of numbers, \((0,0)\), \((0,1)\) and \((1,0)\), require matching answers. Suppose a plan won all three. Then \(a_0 = b_0\), \(a_0 = b_1\) and \(a_1 = b_0\), which forces all four answers to be equal. But then on the pair \((1,1)\) they answer the same, and the game requires them to differ. So every plan loses at least one pair, and the best possible is 3 of 4. Shared random numbers only choose between plans, so they cannot beat the best one.

</details>

In symbols, the Bell pair is

\[
|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}
\]

The state is an equal mix of two possibilities: both qubits are 0, or both are 1. The cases where the qubits differ get no weight at all. Because you can’t write this state as one state for the first qubit plus one for the second, neither qubit has a state of its own. Only the pair does.

## What to carry forward

- A **qubit** is described by amplitudes; the Bloch sphere is one way to picture a single qubit's state.
- **Superposition** means amplitudes that can add or cancel (interference), not a hidden `0` or `1`.
- **Measurement** returns one classical bit with probability given by the amplitude squared, and leaves the qubit in the state it reported.
- **Entanglement** produces correlations between qubits that answers fixed in advance cannot reproduce, and it cannot be used to send messages.

Superposition, interference, and entanglement are the raw ingredients of quantum algorithms, but none of them alone guarantees a speedup; the skill lies in arranging them so that useful answers emerge. With this vocabulary in place,the next section, [Quantum Computing Today](quantum-computing-today.md), looks at what current hardware can do with these ideas.

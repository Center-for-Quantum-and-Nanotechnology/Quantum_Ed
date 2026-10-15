
	Lead with a motivation 
	Prerequisite knowledge
# Quantum States
Quantum mechanical states are described by vector spaces called Hilbert Spaces. Knowing the state of a system in classical physics means knowing you know everything necessary to predict the future of that system. Knowing a quantum mechanical state means knowing as much as can be known about how the system was prepared.


Now that you're familiar with the notation, it is time to describe quantum states. We will form our description from the ground up, starting with a single qubit. The state of a qubit is a vector in a 2D space called a **state space**. 

The quantum analog to the classical state 0 is represented in a two dimensional column vector
$$
\ket{0} = \begin{pmatrix}
1  \\ 0
\end{pmatrix}
$$

The same is true for the classical state 1

$$
\ket{1} = \begin{pmatrix}
0  \\ 1
\end{pmatrix} 
$$
The quantum states $\ket{0}$ and $\ket{1}$ are computational basis states. This means that we can describe *any* quantum state in terms of these two states. 0 and 1 are used widely to apply our already vast knowledge of classical computing, but there are a host of other states.

# Qubit Representation of Quantum Information
Qubits (short for Quantum bits) are represented by ket-vectors $\ket{A}$ and bra-vectors $\bra{A}$. For every "ket," there is a "bra" in the dual space. A ket corresponds to a column vector, while a bra corresponds to a row vector. 

But what is a qubit? A classical bit has two possible states, 0 or 1, corresponding to our classical notion of determinism. A qubit does indeed have two similar states $\ket{0}$ or $\ket{1}$, but those are not the only states it can be in. It is possible to perform linear combinations of states, which are called *superpositions*.
$$
\ket{\psi}  = \alpha\ket{0} +\beta\ket{1} 
$$

You might've noticed that two new letters α and β appeared next to our qubits, these are numbers that scale each qubit. We call these **complex coefficients**. Contrary to our classical notion, we cannot directly examine a qubit to know its state (values of α and β). Measuring a qubit gives us either the result 0 with probability $|\alpha|^2$ and 1 with probability $|\beta|^2$. If you try to work through it yourself you'll find that $|\alpha|^2+|\beta|^2 = 1$ , which is the **normalization constraint**.

**INTERACTIVE INTERLUDE: A Way to Intuit the Normalization Constraint**
If you think of |0> and |1> as orthonormal vectors, then the normalization constraint is the requirement that the length of the state is equal to 1. This is what we call a unit vector.

[module similar to this where you get to play around and see what we mean by all of this]

![[Pasted image 20261005130345.png]]

## Bloch Sphere
Another way to represent quantum states is 
$$
\ket{\psi} = \cos \frac{\theta}{2}\ket{0}+e^{i\varphi}\sin \frac{\theta}{2}\ket{1}  
$$
With this form we can represent a qubit visually, using theta and phi to define a point on the unit three-dimensional sphere known as the **Bloch Sphere**. Many other operations on single qubits are neatly described within the Bloch sphere. 

	interactive module of the bloch sphere


# Single-Qubit Logic Gates
Quantum logic gates are how we manipulate quantum information, the quantum state of a qubit or a collection of qubits. They're analogous to classical logic gates and serve as the building blocks of quantum computation. 

That is where their similarity with classical gates ends. Quantum gates are not reversible (for reasons we shall go into later). Thus, only the classical NOT gate has a Quantum equivalent. For historical reasons we call it the X - gate.

Another big difference between the two is that each quantum logic gate has a matrix representation. Quantum gates carry a mathematical requirement they be unitary ($U^{\dagger}U = I$), which we will go into in a later module.

## The Identity Gate
The quantum Identity gate behaves identically on computational basis states, leaving both $\ket{0}$ and $\ket{1}$ unchanged.

$$
I\ket{0} = \ket{0} \\
I\ket{1} = \ket{1} 
$$

Describing the action of an Identity gate on a general superposition state demonstrates how it preserves both the amplitudes and relative phase of the state vector without alteration.
$$
I(\alpha \ket{0} + \beta \ket{1} )= \alpha \ket{0} + \beta \ket{1} 
$$
**Matrix Representation**

$$
I = \begin{pmatrix}
1 && 0 \\ 0 && 1
\end{pmatrix}
$$
If the quantum state $\alpha \ket{0}+\beta \ket{1}$ is written in vector notation as $\begin{pmatrix}\alpha \\ \beta\end{pmatrix}$, then the corresponding output from the Identity gate is
$$
I\begin{pmatrix}
\alpha \\ \beta
\end{pmatrix} = \begin{pmatrix}
\alpha\\ \beta
\end{pmatrix}
$$
## The X Gate - Bit Flip
The classical NOT gate works by turning a 0 into a 1, and a 1 into a 0. But what about the quantum NOT gate? Intuiting the action of the quantum NOT gate on computational basis states is not hard, like the classical they would interchange a qubit between |0> and |1>. In quantum computation, the NOT gate is referred to as the X gate.
$X\ket{0} = \ket{1}$
$X\ket{1}  = \ket{0}$

Describing action of a NOT gate to a general superposition state requires more flexibility. However, it still interchanges the 0 and 1.

$$
X(\alpha \ket{0}+\beta\ket{1})= \alpha \ket{1}+\beta \ket{0}  
$$
**Matrix Representation**
The matrix representation for the NOT gate is 
$$
X = \begin{pmatrix}
0 && 1 \\ 1 && 0
\end{pmatrix}
$$
If the quantum state $\alpha \ket{0}+\beta \ket{1}$ is written in vector notation as $\begin{pmatrix}\alpha \\ \beta\end{pmatrix}$, then the corresponding output from the Quantum NOT gate is 
$$
X\begin{pmatrix}
\alpha \\ \beta
\end{pmatrix} = \begin{pmatrix}
\beta \\ \alpha
\end{pmatrix}
$$
**Bloch Sphere Representation**
In quantum computation, the X gate represents rotation by π radians around the X-axis of the Bloch sphere.

	interactive module of the bloch sphere
## The Z-gate - Phase Flip
The Z gate's function is subtle but important. It leaves $\ket{0}$ unchanged and flips the sign of $\ket{1}$ to give $-\ket{1}$. In quantum computation, the Z gate is often referred to as the phase-flip gate.

$$
Z\ket{0}  = \ket{0} \\
Z\ket{1} = -\ket{1} 
$$

Describing the action of a Z gate on a general superposition state demonstrates its phase shift properties.
$$
Z(\alpha \ket{0} +\beta \ket{1} = \alpha \ket{0} -\beta \ket{1} )
$$
**Matrix Representation**
The Matrix Representation for the Z gate is 
$$
Z = \begin{pmatrix}
1 && 0 \\ 0 && -1
\end{pmatrix}
$$
If the quantum state $\alpha \ket{0}+\beta \ket{1}$ is written in vector notation as $\begin{pmatrix}\alpha \\ \beta\end{pmatrix}$, then the corresponding output from the Z gate is 
$$
Z\begin{pmatrix}
\alpha \\ \beta
\end{pmatrix} = \begin{pmatrix}
\alpha \\
-\beta
\end{pmatrix}
$$

**Bloch Sphere Representation**
In quantum computation, the Z gate represents rotation by π radians around the Z-axis of the Bloch sphere.

	interactive module of the bloch sphere
## The Y-Gate - (Bit & Phase Flip)
The Y gate combines the effects of the X and Z gates, applying a simultaneous bit flip and phase flip alongside something new. An *imaginary* phase factor of i. It maps $\ket{0}$ to $i\ket{1}$ and $\ket{1}$ to $-i\ket{0}$
$$
Y\ket{0} = i\ket{1}\\
Y\ket{1} = -i\ket{0}  
$$
Describing the action of a T gate on a general superposition state demonstrated how it swaps the computational amplitudes while introducing complex phase factors to both terms
$$
Y(\alpha \ket{0} +\beta \ket{1} )= -\beta i\ket{0} +\alpha i\ket{1} 
$$
**Matrix Representation**
The matrix representation for the Y gate is
$$
Y = \begin{pmatrix}
0 && -i \\ i && 0
\end{pmatrix}
$$
If the quantum state $\alpha \ket{0}+\beta \ket{1}$ is written in vector notation as $\begin{pmatrix}\alpha \\ \beta\end{pmatrix}$, then the corresponding output from the Y gate is
$$
Y\begin{pmatrix}
\alpha \\ \beta
\end{pmatrix}
= 
\begin{pmatrix}
-i\beta \\ i\alpha
\end{pmatrix}
$$
**Bloch Sphere Representation**
The Y gate represents rotation by $\pi$ radians around the Y-axis

	interactive module of the bloch sphere
## The Hadamard Gate 
The Hadamard is an operation unique to Quantum Mechanics. In the computational basis, it takes a $\ket{0}$ and turns it into a state halfway between 0 and 1:  $\frac{\ket{0}+\ket{1}}{2}$. Likewise the Hadamard turns $\ket{1}$ into $\frac{\ket{0}-\ket{1}}{2}$.
$$
H\ket{0} = \frac{ (\ket{0} +\ket{1})}{\sqrt{ 2 }} \\
H\ket{1} = \frac{ (\ket{0} -\ket{1})}{\sqrt{ 2 }}
$$

Describing the action of a Hadamard gate on a general superposition states demonstrates its effects on probability amplitudes.
$$
H(\alpha \ket{0}+\beta \ket{1}) = \alpha\frac{ (\ket{0} +\ket{1})}{\sqrt{ 2 }} + \beta\frac{(\ket{0}-\ket{1})}{\sqrt{ 2 }}
$$

**Matrix Representation**
The Matrix representation for the Hadamard gate is
$$
H = \frac{1}{\sqrt{ 2 }}\begin{pmatrix}
1 && 1 \\ 1 && -1
\end{pmatrix}
$$

If the quantum state $\alpha \ket{0}+\beta \ket{1}$ is written in vector notation as $\begin{pmatrix}\alpha \\ \beta\end{pmatrix}$, then the corresponding output from the Z gate is 
$$
H\begin{pmatrix}
\alpha\\ \beta
\end{pmatrix} = \frac{1}{\sqrt{ 2 }}
\begin{pmatrix}
\alpha+\beta\\
\alpha-\beta
\end{pmatrix}
$$

This is what it looks like in action:
$$
\frac{1}{\sqrt{ 2 }}\begin{pmatrix}
1 && 1 \\ 1 && -1
\end{pmatrix}\ket{0} = \frac{1}{\sqrt{ 2 }}\begin{pmatrix}
1 && 1 \\ 1 && -1
\end{pmatrix} \begin{pmatrix}
1 \\ 0
\end{pmatrix} 
= 
\frac{1}{\sqrt{ 2 }}\begin{pmatrix}
1 \\ 1
\end{pmatrix}
= 
\frac{\ket{0}+\ket{1}}2  
$$

**Bloch Sphere Representation**
In quantum computation, the Hadamard gate represents rotation by π radians around the diagonal  $\frac{X+Z}{\sqrt{ 2 }}$ axis of the Bloch sphere.

	interactive module of the bloch sphere


# Multi-Qubit Logic Gates
Good news, unlike the previous section we only have to go over *one* quantum gate. Bad news, we're going to have to go over classical logic gates. There are many multi-qubit quantum gates, but there is one that stands supreme -- the Controlled-NOT. However, to build a good intuition for *why* the Controlled NOT is used, it is necessary to learn about classical computation. 

## The Controlled-NOT Gate
The CNOT (or CX) gate is a fundamental two-qubit conditional operation. It acts on a **control qubit** $q_0$ and a **target qubit** $q_1$, leaving the target unchanged if the control is $\ket{0}$ and applying an X gate (bit flip) to the target if the control is $\ket{1}$.

$$
CNOT\ket{00}= \ket{00} \\
CNOT\ket{01} = \ket{01} \\
CNOT\ket{10}= \ket{11}\\
CNOT \ket{11} = \ket{10}    
$$

Describing the action of a CNOT gate on a general two-qubit superposition state requires expanding across all four joint basis states. The gate conditionally swaps the amplitudes of the $\ket{10}$ and $\ket{11}$ terms, enabling the generation of *new* entangled states.
$$
CNOT(\alpha \ket{00} +\beta \ket{01} +\gamma \ket{10} + \delta \ket{11} )= 
\alpha \ket{00} + \beta \ket{01} + \gamma \ket{10} +\delta \ket{11} 
$$

**Matrix Representation**
The matrix representation for the CNOT gate (with $q_0$ as control and $q_1$ as target) is
$$
CNOT = \begin{pmatrix}
1 && 0 && 0 && 0  \\
0 && 1 && 0 && 0 \\
0 && 0 && 0 && 1 \\
0 && 0 && 1 && 0
\end{pmatrix}
$$
If the two-qubit quantum state $\alpha \ket{00} +\beta \ket{01} +\gamma \ket{10} + \delta \ket{11}$ is written in vector notation as $\begin{pmatrix}\alpha \\ \beta \\ \gamma \\ \delta\end{pmatrix}$, then the corresponding output from the CNOT gate is 
$$
CNOT \begin{pmatrix}\alpha \\ \beta \\ \gamma \\ \delta\end{pmatrix} = \begin{pmatrix}\alpha \\ \beta \\ \gamma \\ \delta\end{pmatrix}
$$
# Quantum Circuits
We have described singular qubits, their gates, and multi qubit gates. How do we visualize all this information? How would you be able to tell someone that we have a multi qubit system in which a particular gates acts on a particular qubit. The answer is quantum circuits.

	This one will have to be an interactive module which makes it hard to write down in pure text

# Measurement
	Explain measurement a little bit, its another thing that works better as an interactive module


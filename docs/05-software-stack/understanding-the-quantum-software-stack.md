# Understanding the Quantum Software Stack

What happens between pressing **Run** and getting results back?

## From Running a Program to Asking What Happens

Using quantum software usually feels like three simple actions.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Step 1</span><span>Write a circuit</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Step 2</span><span>Run it</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Step 3</span><span>See results</span></div>
  </div>
  <div class="qed-stack__circuit" data-qed-circuit="bell"></div>
  <p style="text-align:center; font-size:0.8rem;">The example used throughout this module: prepare two qubits together (a Bell state), then measure both.</p>
</div>

That is how programming with a quantum SDK feels. This module asks a different question.

> **What happened between pressing Run and receiving those results?**

Learning to *use* quantum software is one thing. Learning how it *works* is another. Behind the Run button, several pieces of software cooperate to describe the computation, adapt it to a target, carry it out, and bring the results back. This page introduces those pieces. Later pages in the module take them one at a time.

## Meet the Software Stack

A **[quantum software stack](../glossary.md#quantum-software-stack)** is a useful way to organize the software responsibilities that cooperate to run a quantum computation. These are *responsibilities*, not necessarily separate programs, servers, or boxes that always run in a fixed order.

Here they are, in two conceptual groups.

<div id="qss-catalog"></div>

Two terms from the Control Layer are worth defining now. Both get a full treatment later in the module.

<div class="qed-demo" markdown="1">

- **[Calibration](../glossary.md#calibration)** is a procedure that characterizes and tunes a device.
- **[Calibration telemetry](../glossary.md#calibration-telemetry)** is information a device or provider reports about the device's state, quality, and settings, often with a time stamp.

</div>

They are different things. One is something that is *done*. The other is information that is *reported*. This page does not show any telemetry fields, units, or values; that comes later, in the page on backend capabilities.

!!! question "Does every platform have exactly these layers?"
    No. These are responsibilities we can recognize across many systems. Real implementations may combine them, distribute them, or organize their interactions differently. The two groups are a way of organizing them, not a claim that every provider builds exactly two layers.

!!! question "Does every execution target have a Control Layer?"
    Not in the same way. A simulator has no physical device to operate or calibrate, so the Control Layer matters most on the hardware path.

## One Computation, Several Responsibilities

Keep the same Bell-state circuit in mind. Notice what the circuit *is*: an instruction, a description of what to do. It is not itself a physical quantum state.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">User intent</span><span>Prepare and measure a Bell pair</span></div>
    <span aria-hidden="true">↓</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Software</span><span>Describes and prepares the computation</span></div>
    <span aria-hidden="true">↓</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">A target</span><span>Executes it</span></div>
    <span aria-hidden="true">↓</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Software</span><span>Returns observable results</span></div>
  </div>
</div>

Each responsibility contributes one short action:

- **Describe** the computation in a form software can process.
- **Check target** to see what the target can do.
- **Adapt** the computation to that target.
- **Coordinate** the run.
- **Execute** it on a simulator or a device.
- **Return** the results.

On the hardware path there is one more: **calibrate and report**, where the device's own software keeps the device tuned and reports on its condition.

## Follow the Quantum Program

Choose a path, then step through the journey from submitting the program to receiving results. You can also select any responsibility to see its role.

<div class="qed-demo" id="qss-main"></div>

Everything here is fixed and illustrative. It is a model of the idea, not a live system, so no real job statuses, timings, device properties, or measurement results appear.

## Two Paths, Shared Software Ideas

Both paths start with the same circuit. They end in different places. The system selected to carry out the computation is the **[execution target](../glossary.md#execution-target)**, whether it is simulated or physical.

<div id="qss-compare"></div>

!!! question "If both paths start with the same circuit, why might the software need different information before running it?"
    Because targets can have different capabilities and constraints. A physical device can also report information about its current condition, while a simulator has no physical device to report on. A simulator is also not necessarily an exact replica of any particular physical device.

Notice how much is shared. The program, its representation, the adaptation step, the coordination, and the results are responsibilities on both paths. The execution mechanism and the constraints are what change.

## Responsibilities Interact, Not Just Stack Up

The word "stack" suggests information moving strictly from top to bottom. That is an organizational metaphor, not a rule. Switch to the interacting view below and select a relationship.

<div class="qed-demo" id="qss-interact"></div>

Three examples are worth noticing:

- Information about a target can inform how a program is prepared.
- [Runtime](../glossary.md#quantum-runtime) coordination is involved in submission, execution, and results, not in one step.
- On the hardware path, information a device reports about itself **may** inform the backend description, which **may** in turn inform how programs are prepared. Whether and how that happens depends on the platform and its policies. It is not automatic, not necessarily continuous, and not available on every device.

Information can flow in both directions between the Application Layer and the Control Layer: work moves toward a target, and information about a device can flow back toward software.

## Software Responsibilities Are Not SDK Names

Tools such as Qiskit, CUDA-Q, InQuanto, Stim, and qBraid each let you work with quantum programs, but they differ in scope and purpose. A framework, a simulator, a library, and a platform may each cover a different subset of the responsibilities above. Control and calibration software may not be directly visible through an SDK at all.

!!! question "If two tools both let you work with quantum programs, must they perform the same jobs internally?"
    No. Naming the responsibilities gives us a way to compare tools without organizing everything around one vendor. An SDK is a user-facing tool, or set of tools, that may expose or integrate several of them.

## From the Stack to Program Representations

Compare the two views you now have.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Previously</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Write a circuit</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Run it</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Read results</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Now</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Describe a computation</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Software coordinates several responsibilities</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Execute and return results</span></div>
    </div>
  </div>
  <div class="qed-stack__circuit" data-qed-circuit="bell"></div>
</div>

Look at the circuit once more.

> **How can different software components understand the same computation if they do not all use the same form of program?**

Different responsibilities need the computation in different forms. Something has to describe it in a way each of them can use, and that is the next problem.

## Takeaway

A quantum program runs through a system of cooperating software responsibilities. Some are about the program. Others are about operating and describing the device it runs on.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Familiar quantum program</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Recognize multiple software responsibilities</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Trace a conceptual execution path</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Notice Application and Control responsibilities</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Understand how results return</span></div>
</div>

User intent → program description and preparation → coordinated execution → returned results. And on the hardware path, device control and calibration → reported device information → software's description of the target, with information flowing in both directions.

Learning to recognize these responsibilities is the first step toward understanding how quantum software works beneath the programming interface.

> **What does a quantum program look like after it leaves the code we wrote?**

**Next: Quantum Program Representations →** *(coming soon)*

<script>
document.addEventListener("DOMContentLoaded", function () {
  var QC = window.QedCircuit;
  var SS = window.QedSoftwareStack;

  // The circuit is drawn from data, not hand-placed. Falls back to a text
  // description if the shared module did not load.
  var circuit = QC.bell();
  Array.prototype.forEach.call(document.querySelectorAll("[data-qed-circuit]"), function (el) {
    el.innerHTML = QC.renderSVG(circuit);
  });

  document.getElementById("qss-catalog").innerHTML = SS.catalogHTML();
  document.getElementById("qss-compare").innerHTML = SS.comparisonHTML();
  SS.mount(document.getElementById("qss-main"), { stepper: true });
  SS.mount(document.getElementById("qss-interact"), { modeToggle: true, mode: "simple" });
});
</script>

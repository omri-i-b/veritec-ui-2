# Veritec — Workflow vs Agent

These are two different things and we should stop conflating them.

> **The workflow is the structure. The agent is the runtime.**

A workflow defines _what_ a piece of automation accomplishes — the inputs,
the sequence of steps, the deliverable. It's deterministic at the high
level: dial this number, ask this question, log that result.

An agent is the conversational intelligence that operates _inside_
conversational steps. It speaks naturally, handles interruptions,
interprets messy answers, and picks phrasing in real time.

For an outbound call, the call IS a workflow; the **voice agent** is the
thing conducting it. Both are needed. Without the workflow you get a
chatty robot with no goal. Without the agent you get a call tree that
breaks the moment a human says something unexpected.

```
Outbound Call Workflow
   ├── Dial
   ├── Introduction
   ├── Ask questions
   ├── Handle responses
   ├── Determine outcome
   └── Log / trigger follow-up

Voice Agent (runs inside conversational steps)
   ├── Interprets responses
   ├── Chooses phrasing
   ├── Handles edge cases
   └── Keeps conversation natural
```

## Where the original Playbook / Agent split fits

We had been using "Playbook" and "Agent" as two _kinds_ of automation:

- **Playbook** — internal data work (no outside party)
- **Agent** — outside-party outreach (voice today; email/SMS later)

That distinction is still useful as a description of _intent_ — does
the AI itself initiate contact with an outside party? — but it
shouldn't lead anyone to think a voice agent is a single primitive.
A "voice agent" is a workflow that delegates one or more conversational
steps to the voice-agent runtime.

So in the cleanest possible terms:

| | **Document playbook** | **Voice agent** |
|---|---|---|
| **Intent** | Automate the system | Reach out to a person |
| **Who it touches** | Internal data, files, records | An outside party — caller, recipient, provider |
| **How it starts** | An event the system observes (record created, attribute updated, recurring schedule, manual run) | A person-shaped trigger (web form submitted, cadence reaches a step, operator clicks Run) |
| **Cadence** | Reactive — fires when the trigger fires | Time-based or proactive — single-shot or multi-step |
| **What it produces** | A document, a table, a record update | An interaction (call, email, SMS) + extracted fields |
| **Step types it uses** | Fetch / Prompt / Format | Fetch / Prompt + **Voice / Email-out / SMS-out / E-file** |
| **Risk profile** | Low — re-runnable, no external party affected | High — can mis-speak, mis-represent the firm, violate ethics rules |
| **What needs review** | The output (just check the doc) | The output **and** the conversation (transcript, escalation) |
| **Failure mode** | Bad memo | Pissed-off prospect, lost lead, ethics complaint |

## The crisp test

> **Does the AI itself initiate contact with an outside party?**
>
> - **No** (a human reviews the output and dispatches it) → **Playbook**
> - **Yes** (AI dials, AI emails, AI texts, AI auto-files) → **Agent**

| The AI… | Kind |
|---|---|
| Drafts a demand letter from the case file | Playbook |
| Auto-emails that demand letter to opposing counsel | **Agent** |
| Generates discovery responses from the file | Playbook |
| Files those responses with the court via e-filing API | **Agent** |
| Compiles a records-request letter | Playbook |
| Calls the provider's records desk to follow up | **Agent** |
| Drafts an intake summary from a web form | Playbook |
| Calls the lead back to qualify them | **Agent** |

Producing a document _for someone_ is a Playbook — the document is data
until a human (or a downstream Agent step) actually transmits it. The
drafting stays internal. The send is what makes the next step an Agent.

## Why this matters

If you try to run an Agent like a Playbook (auto-publish without review),
you ship things to clients you didn't mean to. If you try to run a Playbook
like an Agent (live operator surface for every memo), you drown in noise.

The split also drives review surfaces:

- **Playbooks** review at `/playbooks` (runs grid + run detail). One row per
  run. Click for the document/records output.
- **Agents** review at `/agents` (kickoff + library + run detail). One row
  per call. Click for transcript, extracted fields, and the audit trail.

## Inside a voice agent: workflow vs agent runtime

When the workflow has a Voice step, the step itself is just a node in the
larger structure (dial this person, talk to them for ~3 minutes about X).
The conversation that happens inside is conducted by the voice agent.

| | **The workflow's job** | **The voice agent's job** |
|---|---|---|
| **Owns** | Goal, sequence, success criteria, escalation rules | Speech, listening, phrasing, real-time adaptation |
| **Looks like** | "Dial → Intro → Ask 5 things → Determine outcome → Log" | "Speaks naturally; handles 'I already did this'; switches to Spanish" |
| **Authored** | In the canvas — visible to the operator | In the agent's instructions + memory; mostly invisible at runtime |
| **Failure mode if you only have this** | Rigid, robotic, breaks on unexpected human responses | Chatty, off-script, no measurable outcome |

The power comes from **structured workflow + adaptive agent**.

Today our Voice step compresses both — the workflow side is a single node
("place this call"), and the agent side is the persona + goals + extraction
schema. That's enough for short, focused calls (intake callback, weekly
check-in). When a call needs to branch — "if pain mentioned, escalate; if
fine, schedule next" — we'll expand the Voice step into a sub-graph of
conversational nodes (Dial / Intro / Ask / Branch / Outcome / Log), with
the same agent runtime operating inside each one.

## Composability

A workflow can chain a Playbook into an Agent. Example pre-litigation
cadence:

1. **Playbook**: "Compile records request letter" — drafts a personalized
   letter from the case file.
2. **Agent**: "Send records request" — emails (or faxes) the letter to the
   provider.
3. **Agent**: "Records desk follow-up" — calls 7 days later if no response.

Each stage is its own thing; the output of one feeds the input of the next.

## The library question

**Do we need two separate libraries?** Probably not — one library with a
filter chip is enough for now. The badge on a card derives from the steps:
if any step is Voice / Email-out / SMS-out / E-file, the card is an Agent.
No moving things between buckets when you add or remove a Voice step.

The split shows up where it matters operationally:

- The same canvas creates both.
- The same library lists both.
- The review surface differs based on what the automation _did_ — voice
  runs review under `/agents`, document runs review under `/playbooks`.

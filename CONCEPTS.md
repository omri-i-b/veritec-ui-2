# Veritec — Playbook vs Agent

The line is **intent**, not features. Both run on the same canvas (inputs →
memory → steps → deliverable, terminator → runs table). What separates them
is _who the work touches_.

This mirrors Attio's clean split between **workflows** (backend automation,
system reacts to events) and **sequences** (outbound communication, you
proactively reach out to people). Same idea, different vocabulary.

| | **Playbook** | **Agent** |
|---|---|---|
| **Maps to (Attio)** | Workflow | Sequence |
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

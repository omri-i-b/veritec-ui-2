# Veritec — Workflow vs Agent

The defining axis is **how the automation is invoked**, not what it does.

| | When it acts | Examples |
|---|---|---|
| **Workflow** | A user clicks Run | Demand Letter Draft · Medical Records Summary · Discovery Response · Intake Callback |
| **Agent — triggered** | An external event fires (incoming call, integration event, cadence) | Intake Reception (incoming call) · Filevine Records Request (project phase changed) · Medical Treatment Verification (weekly cadence) |
| **Agent — callable** | Someone asks it a question (chat, @-mention, button somewhere in the UI) | Med Chron Expert · Statute Tracker · Discovery Coach |

**Workflows and triggered agents are the same primitive** — same canvas (Fetch / Prompt / Format / Voice steps), same memory model. They differ in *what kicks them off*.

**Callable agents are a different primitive.** They aren't a sequence of steps — they're a knowledge bundle: a persona, one or more bound knowledge sources, sample questions, guardrails, and a return schema. The runtime is a Q&A loop, not a procedure walk. Forcing a callable agent into a step canvas would be the wrong abstraction; we use a separate, simpler editor (no canvas, no steps, no terminator) that surfaces just the knobs that matter.

## The crisp tests

> **Is it user-run? → Workflow.**
> **Does it wait for something to happen, then fire on its own? → Triggered agent.**
> **Does it sit there waiting to be asked? → Callable agent.**

Producing a document for someone is a Workflow (the document is data until a human or a downstream agent step actually transmits it). Sending it — auto-emailing, auto-faxing — is a triggered agent step. Drafting a memo: workflow. Calling a provider's records desk to follow up: triggered agent. Answering a question in chat: callable agent.

## What lives where

- `/playbooks` (sidebar: **Workflows**) — user-run procedures. Each card has a **Run** button. The defining UX element.
- `/agents` (sidebar: **Agents**) — triggered + callable. Status is **● Live** instead of "Published." Hover-actions:
  - **Ask** for callable agents (opens a chat-style invocation)
  - **Test call** for inbound voice
  - **Test** for cadence / integration / webform
  - No primary action for triggered ones — they run themselves
- `/workflows` (sidebar: **Case pipelines**) — case lifecycles, distinct from the workflow primitive. Pre-lit / litigation / settlement stages, not AI procedures.

## What about voice?

Voice is a *skill* the platform provides. A workflow with a Voice step is still a workflow if it's user-run; it becomes an agent only when its trigger is non-manual. The fact that something speaks doesn't make it an agent. The way it gets invoked does.

## Composability

A workflow can chain into an agent (and vice versa):

1. **Workflow**: "Compile records request letter" — drafts the letter from the case file.
2. **Agent (triggered)**: "Send records request" — auto-faxes when the workflow finishes.
3. **Agent (triggered)**: "Records desk follow-up" — calls 7 days later if no response.
4. **Agent (callable)**: "Med Chron Expert" — staff ask "what do we know about this provider's response time?" while working the case.

Each piece is its own thing; the chain composes them.

## Why bother with the split

If you treat everything as a workflow, you build a Run button for things that should be always-on (no one's clicking Run on inbound calls). If you treat everything as an agent, you make people configure triggers for one-off "draft this thing for me" tasks. The split is operational — it changes the UX (Run button vs Live status, library cards vs editor chrome) — not a fundamental difference in capability.

## Inside a Voice step

The Voice step's prompt **is** the spec for how the agent runtime conducts the call. We don't visualize a parallel "agent flow" alongside it — that would imply we can extract structure from prose, which we can't reliably. The prompt is the source of truth for what gets said and what gets asked. At runtime, after a call has completed, we can show the actual conversational structure the agent went through (because that's observable from the transcript) — but that's a different surface (run detail), and it's the *what happened*, not the *what should happen*.

# Veritec Agents & Workflows — User Stories

**Product:** Veritec Agents & Workflows (settings + app-side automation
surface for a personal-injury law firm).

**Source of truth:** the prototype in `src/App.tsx`. Every story below
reflects functionality already wired up in that prototype; styling
decisions are owned by the design system and are intentionally out of
scope for these stories.

**Method:** Stories follow the 3 C's (Card, Conversation, Confirmation)
and INVEST. Acceptance criteria are functional and testable — they
describe what the system must do, not how it should look. Visual
implementation choices (color, spacing, typography, container widths,
hover/active treatment, etc.) are at the developer's discretion within
the existing design system (`components/ui/`* + `index.css`).

---

## Glossary


| Term                    | Meaning                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Agent**               | A pre-built, single-task AI worker (e.g. Voice Intake, Demand Letter, MedChron). Configured once, runs many times.                                                       |
| **Workflow**            | A user-built automation: a trigger plus an ordered list of steps.                                                                                                        |
| **Session**             | A single execution of an agent or workflow against a case. Has a status, outputs, an optional transcript, inputs, and an execution log. (Replaces the older term "Run".) |
| **Settings mode**       | The configuration surface (Account / Organisation / Agents).                                                                                                             |
| **App mode**            | The day-to-day surface (FileFlow Inbox / Cases / Sessions).                                                                                                              |
| **Captured field**      | A structured value the agent extracted from a Session. Each captured field is the answer to one question.                                                                |
| **Transcript exchange** | One question-and-answer pair from a Session.                                                                                                                             |


---

## Architecture sketch (model implied by the prototype)

```
Org
 └── Voice settings        (org-wide phone numbers + languages)
 └── Agents                (pre-built, single-task)
 │    ├── Identity         (name, voice, greeting)
 │    ├── System prompt
 │    └── Sessions[]
 │         ├── Outputs     (captured fields + confidence + PHI flags)
 │         ├── Transcript  (exchanges = question + answer + captured value)
 │         ├── Inputs
 │         ├── Timeline
 │         └── Execution log
 └── Workflows             (user-built)
      ├── Trigger          (Webhook / Scheduled / Manual / Form)
      ├── Inputs           (typed fields)
      └── Steps[]          (each with config + returns[])
```

---

## Epic 1 — Settings Navigation & App Shell

### US-1.1 — Grouped settings navigation

**Description:** As a firm admin, I want a left-side navigation grouped
into Account, Organisation, and Agents sections, so that I can find
configuration screens by category.

**Design:** TBD

**Acceptance Criteria:**

1. The settings navigation lists items in three groups, in this order:
  Account (General); Organisation (General, Team Members, FileFlow
   Inbox, Lithub, API Keys, Sharing); Agents (Voice, Agents,
   Workflows).
2. Each item has an icon and a label.
3. Selecting an item updates the right-hand content area to that
  page and visually marks the item as active.
4. Each group has a heading.
5. The navigation includes a "Back to app" affordance that switches
  the application into App mode (US-1.3).
6. Stub destinations (e.g. Account → General) display a "coming soon"
  placeholder rather than a broken page.

---

## Epic 2 — Voice Configuration

### US-2.1 — Manage inbound phone numbers

**Description:** As a firm admin, I want to manage the phone numbers
clients dial to reach our AI, so that intake calls land on the right
line.

**Design:** TBD

**Acceptance Criteria:**

1. The Voice settings page contains a section titled "Inbound Numbers"
  with subtitle "Numbers clients dial to reach your AI agent".
2. The section lists every inbound number with: phone number, label,
  status (Active or Paused), an Edit affordance, and a Delete
   affordance.
3. An "Add phone number" affordance reveals an inline form with a
  Number input and a Label input plus Add and Cancel actions; Add
   creates a new active row, Cancel discards the form.
4. The Edit affordance puts the row into edit mode with a Number input
  and a Label input plus Save and Cancel actions; Save persists
   changes, Cancel reverts.
5. Delete removes the row and is confirmed before the row is gone (or
  undoable).
6. Validation: Number is required and must be a valid phone format;
  Label is required.

---

### US-2.2 — Manage outbound phone numbers with retries and caller ID overrides

**Description:** As a firm admin, I want to manage the phone numbers
our agents call from and configure per-number retry limits and caller
ID, so that outbound calls show the right caller ID and respect retry
limits.

**Design:** TBD

**Acceptance Criteria:**

1. The Voice settings page contains a section titled "Outbound Numbers"
  with subtitle "Numbers the agent uses when calling clients".
2. Each row shows: phone number, label, status, configured retry
  count, default-row indicator, an Edit affordance, and a Delete
   affordance.
3. Non-default rows show a "Set default" action; clicking it makes
  that row the default and unsets the previous default.
4. The edit form contains: Number, Label, Caller ID name (a per-number
  override of the global caller ID; blank means "use global"), and
   Max retries (chosen from 1, 2, 3, 5, 7).
5. Exactly one outbound row is the default at any time.
6. The retry count is what the system uses when an outbound call fails
  to connect (busy, no answer, etc.).

---

### US-2.3 — Configure org-wide outbound caller ID and call window

**Description:** As a firm admin, I want to set a default caller-ID
display name and the hours during which agents may make outbound
calls, so that clients see our firm name and we never dial people at
inappropriate times.

**Design:** TBD

**Acceptance Criteria:**

1. The Voice settings page has a "Global outbound settings" section
  below the outbound numbers list.
2. The section contains a "Caller ID display name" input that
  defaults to "VeriTec AI" and is the org-wide caller ID. Per-number
   overrides (US-2.2) take precedence when a number has one.
3. The section contains a "Call window" with start time and end time
  selectors. The selectable times are at the top of the hour from
   6 AM to 10 PM.
4. The system must not place an outbound call outside the configured
  window; calls scheduled outside the window are deferred until the
   window opens.
5. Changes are persisted on save and applied to subsequent calls.

---

### US-2.4 — Configure supported languages and per-language voice

**Description:** As a firm admin, I want to choose which languages the
agent speaks and pick a voice gender per language, so that we can
serve clients in their preferred language.

**Design:** TBD

**Acceptance Criteria:**

1. The Voice settings page contains a section titled "Languages" with
  subtitle "Languages the agent can conduct intake calls in".
2. The section has an "Auto-detect language" toggle described as
  "Automatically switch to the caller's language if supported"; when
   enabled, the system detects the caller's language and picks the
   matching active language.
3. The section displays an "Active languages" list. Each row shows the
  language label and flag, a voice selector with options Female and
   Male, a Primary indicator on the primary row, and a Delete action
   that is disabled on the primary row.
4. An "Add language" affordance reveals a picker of supported
  languages, ordered by speaker volume in the firm's target market:
   English; Spanish (~~41M speakers); Chinese / Mandarin (~~3.5M);
   Tagalog (~~1.7M); Vietnamese (~~1.5M); French (~~1.3M); Arabic
   (~~1.2M); Korean (~~1.1M); Russian (~~900K); Portuguese (~800K). The
   picker has a Cancel action.
5. Newly added languages default to Female voice and are non-primary.
6. The primary language is the fallback when auto-detect is off or
  detection fails.

---

## Epic 3 — AI Agents

### US-3.1 — Browse all AI agents

**Description:** As a firm admin, I want to see all the AI agents the
firm has access to, so that I can pick one to configure or audit.

**Design:** TBD

**Acceptance Criteria:**

1. The Agents page header reads "AI Agents" with subtitle
  "Specialized agents that handle a single task" and includes a "New
   agent" action.
2. Six agents are seeded: Demand Letter, MedChron, Voice Intake,
  Discovery Response, Depo Prep, SOL Monitor.
3. Each agent appears as a card showing: icon, title `{Label} Agent`,
  description, status (Active or Paused), and a session-count metric
   for the current month. Voice agents display their metric as
   "N calls this month"; non-voice agents display "N sessions this
   month".
4. Clicking a card opens the Agent detail page (US-3.2) for that
  agent.
5. The "New agent" action opens the Agent detail page for a blank
  agent: the Agent Identity form (name, voice, greeting) is empty and
   the System Prompt form is empty. The user fills both forms and
   uses Save to create the agent.

---

### US-3.2 — Open one agent in a focused detail view with tabs

**Description:** As a firm admin, I want a focused page for one agent
with tabs for editing configuration and viewing past sessions, so that
the configure and inspect tasks live together.

**Design:** TBD

**Acceptance Criteria:**

1. The page renders a breadcrumb (`Settings → Agents`) and an "All
  agents" back link that returns to the list.
2. The header shows the agent's icon, title `{Label} Agent`,
  description, and a clickable Active/Paused indicator that toggles
   the agent's status.
3. Two tabs are shown: Editor (default) and Sessions with the current
  count of past sessions for this agent.
4. Switching tabs swaps the body without leaving the page or losing
  unsaved changes in the Editor tab (Editor changes are committed
   only via Save — US-3.3).

---

### US-3.3 — Edit an agent's identity and system prompt

**Description:** As a firm admin, I want to edit an agent's identity
(name, voice, greeting) and the system prompt that defines its
behaviour, and be able to reset the prompt to the shipped default, so
that I can tune the agent without touching engineering and recover
if I make a mistake.

**Design:** TBD

**Acceptance Criteria:**

1. The Editor tab contains an "Agent Identity" card with subtitle
  "How the agent introduces itself to callers" and the following
   fields:
  - "Agent name" text input — helper: "The name the agent uses when
  greeting callers".
  - "Default voice" selector with options Female and Male — helper:
  "Voice used for all languages unless overridden".
  - "Greeting script" multi-line input — helper: "First thing the
  agent says when a caller connects"; tip: "Use `{{client_name}}`
  to personalise the greeting if the caller is already in your
  system".
2. The Editor tab also contains a "System Prompt" card with subtitle
  "The instructions that define this agent's behaviour", a
   multi-line text input pre-filled with the agent's shipped default
   prompt, and a live character count.
3. A "Reset to default" action on the System Prompt card restores
  the input to the shipped default prompt for the current agent.
4. Each seeded agent ships with sensible identity + prompt defaults
  preloaded (e.g. Demand Letter: Morgan / Female / "Hi, this is
   Morgan from Veritec Law…").
5. A new agent (US-3.1) opens with both forms empty.
6. A single "Save changes" action persists both identity and system
  prompt edits and confirms success to the user. Edits are not
   committed until Save is invoked.

---

## Epic 4 — Sessions (per-agent)

### US-4.1 — Browse and filter sessions for one agent

**Description:** As a firm admin, I want a filterable table of every
Session this agent has run, so that I can audit past behaviour and
find specific cases.

**Design:** TBD

**Acceptance Criteria:**

1. The Sessions tab contains a toolbar with a debounced search input
  (placeholder "Search by case, run ID…"), a time-range selector
   with options "Last 24 hours", "Last 7 days", "Last 30 days", and
   "All time", and a "New session" action.
2. The table has these columns in order: Status, Case, Output,
  Started, Duration, Triggered by.
3. The Status column displays one of: Success, Running, Failed,
  Queued.
4. The Output column adapts to the session output type: a `doc`
  output shows the file name plus key/value meta pairs (e.g. `CLAIM  $2.4M`); a `metrics` output shows the meta as labeled key/value
   pairs (e.g. `RECORDS 47 GAPS 3 CONFIDENCE 94%`); a Running
   session shows label `PROGRESS` plus truncated text; a Failed
   session shows label `ERROR` plus error text; a Queued session
   shows label `STATUS` plus status text.
5. The Triggered-by column shows the user's avatar and name.
6. The empty state copy is "No sessions to show". The footer copy is
  "Showing N of M sessions" plus "Live · 10s auto-refresh".
7. Clicking any row opens the Session detail page (US-4.2) for that
  session.

---

### US-4.2 — Inspect a single session in detail

**Description:** As a firm admin, I want a rich detail view of one
Session showing outputs, the transcript, inputs, and the execution
log, so that I can verify the agent did the right thing.

**Design:** TBD

**Acceptance Criteria:**

1. The header contains a back action that returns to the Sessions
  table, the run ID rendered in a monospace style (e.g. `run_R1XXX`),
   the session status, and an action group with: Listen to call (only
   when a transcript exists — US-4.4), Copy, Re-run, and Download.
2. The body has a main column and a sidebar.
3. The main column contains an Outputs section, the Transcript card
  (US-4.3) when a transcript exists, and the Questions card (US-4.5)
   for Depo Prep sessions.
4. The Outputs section header reads "OUTPUTS · extractions from this
  run" and contains one card per captured field. Each output card
   shows: label, optional PHI indicator, optional confidence indicator
   with tier banding (≥90 / ≥80 / <80), and the captured value.
5. The sidebar contains, in order: an Inputs card (rows of icon +
  label + value), a Timeline card (Started, Duration, Triggered by
   with avatar + name, Case), and an Execution log card with
   numbered steps showing a status indicator (success / fail), the
   step label, and a duration; the card footer reads "N steps".

---

### US-4.3 — Review a session's call transcript as a Q&A table

**Description:** As a firm admin, I want a structured table of every
question the agent asked and the answer the caller gave, so that I
can see exactly how each captured field was produced.

**Design:** TBD

**Acceptance Criteria:**

1. The Transcript card header contains an icon, the title "Call
  transcript", an "N exchanges" indicator, the call duration (e.g.
   "18 min call"), and a "Transcript" download action.
2. The table has three columns: Time (e.g. `00:34`), Question &
  answer (two stacked turns: an Agent turn with role label `AGENT`
   and the question, then a Caller turn with role label `CALLER` and
   the answer rendered in quotes), and Captured field (the captured
   field label, an optional PHI indicator, and the captured value).
3. Long content in the Question & answer and Captured field cells
  wraps onto multiple lines; the table never produces horizontal
   scroll for these columns.
4. Each row is clickable; clicking opens the Call Player Sheet
  (US-4.4) with that exchange focused.
5. Every successful Session of every agent has a transcript. For
  sessions without hand-crafted dialogue, the system generates a
   transcript from the session's outputs (US-4.6).
6. The Voice Intake CVSA-1389 sample has hand-crafted dialogue and
  serves as the gold standard for tone and content.

---

### US-4.4 — Listen to a focused exchange in a side panel

**Description:** As a firm admin, I want to listen to a specific
moment in the call when I click a Q&A row, so that I can hear how the
caller answered without leaving the table.

**Design:** TBD

**Acceptance Criteria:**

1. Clicking a Q&A row opens a side panel anchored to that exchange.
  The Session detail page also has a "Listen to call" action that
   opens the same panel without anchoring to a specific exchange.
2. The panel header shows: a title — "Listen to exchange" in focused
  mode or "Full call transcript" in expanded mode; in focused mode,
   the captured field's label, optional PHI indicator, and value so
   the user knows which moment they're hearing; and a "View full
   transcript" toggle whose label flips to "Focus on this exchange"
   when expanded.
3. The panel body displays a scrollable list of turns. Each turn
  shows: timestamp, role indicator (AGENT or CALLER), and text.
   The active turn is visually marked, the originally focused agent +
   caller pair stays visually distinguishable when the list is
   expanded, and clicking any turn anchors the playhead to that
   turn.
4. The panel footer is a sticky audio player with: a progress bar
  showing current and total time; centered transport controls — Back
   30 seconds, Play/Pause, Forward 30 seconds; a speed selector
   offering 1×, 1.25×, 1.5×, 2×; volume and Download recording
   actions.
5. Seeking back/forward 30 seconds clamps the target to
  `[0, totalDuration]` and snaps the active-turn highlight to the
   latest turn at-or-before the target time.
6. Closing the panel resets the focused exchange and full-transcript
  state so reopening from a new row starts clean.

**Notes:** Audio playback in the prototype is visual-only.
Production needs a real audio element wired to player state and
durable storage of the recording per session.

---

### US-4.5 — Review generated deposition questions (Depo Prep only) - Please review with team before development

**Description:** As a firm admin, I want to review the deposition
questions the Depo Prep agent generated for a case, so that I can
prepare for the deposition.

**Design:** TBD

**Acceptance Criteria:**

1. The card is rendered only inside Depo Prep Sessions and only when
  the Session has generated questions (the prototype seeds this for
   case CVSA-1189).
2. The card header has an icon, the title "Questions", an indicator
  reading "Records · 4 columns", an "N total · showing M" caption,
   and a CSV download action.
3. The card has a search input that filters the question list and a
  set of flag filter pills with counts: All, Contradiction,
   Discrepancy, Liability, Medical, Evidence, Damages, Standard.
4. Selecting a flag pill restricts the table to questions of that
  flag; "All" clears the flag filter.
5. The table columns are: # (question number), Question, Flag.
6. Empty state copy: "No questions match the filter".

---

### US-4.6 — Auto-generate a transcript for any successful session

**Description:** As a firm user, I want the system to auto-generate a
Q&A transcript for every successful session, so that I can drill into
any session — not just the hand-crafted samples — and see how the
captured fields were produced.

**Design:** TBD

**Acceptance Criteria:**

1. Whenever a Session is in `success` state and has output meta, the
  system generates one transcript exchange per `[label, value]`
   meta pair.
2. The generated question uses an agent-specific verb to match the
  agent's voice — for example: Demand Letter uses "Pull"; MedChron
   uses "Check"; Voice Intake uses "Tell me about"; Discovery
   Response uses "Pull"; Depo Prep uses "Confirm"; SOL Monitor uses
   "Report".
3. Each generated exchange uses a stable, monotonically increasing
  timestamp so the transcript reads chronologically.
4. The captured field of a generated exchange is the same
  `[label, value]` pair the meta produced.
5. Sessions in Failed, Running, or Queued states do not get a
  generated transcript.
6. Hand-crafted transcripts (Voice Intake CVSA-1389) are not
  overwritten by the generator.

---

## Epic 5 — Workflows

### US-5.1 — Browse and create workflows

**Description:** As a firm admin, I want to see all our workflows and
create new ones, so that I can manage automations from one place.

**Design:** TBD

**Acceptance Criteria:**

1. The Workflows page header reads "Workflows" with subtitle
  "Automated agents that collect data and take action" and includes
   a "New workflow" action.
2. The page lists a card per workflow plus a final "New workflow"
  tile; both the header action and the tile create a new workflow
   named "Untitled Workflow" (status paused, trigger manual, contact
   method phone) and open the builder (US-5.2).
3. Each workflow card displays: contact-method icon (phone or sms),
  status (Active or Paused), workflow name, contact-method
   indicator, trigger-type indicator, and a footer reading "N inputs
   · M steps".
4. Two workflows are seeded as samples: "Qualify & Book Consult"
  (phone, webhook) and "Follow-up Reminder" (sms, scheduled).
5. Clicking a card opens that workflow in the builder.

---

### US-5.2 — Edit a workflow's metadata in the builder header

**Description:** As a firm admin, I want a builder header that lets me
rename the workflow, set its contact method, toggle active, and save,
so that I can manage workflow-level state from one place.

**Design:** TBD

**Acceptance Criteria:**

1. The builder header contains a breadcrumb (Settings → Workflows)
  and an "All workflows" back link that returns to the list.
2. The workflow name is inline-editable in the header.
3. The header has a contact-method switcher with two options —
  Phone, SMS — that updates the workflow's contact method when
   changed.
4. The header has an Active/Paused toggle that flips the workflow's
  status.
5. The header has a Save action; on save the system briefly
  confirms success.
6. The canvas below the header always renders content in this order
  from top to bottom: Trigger node (US-5.3) → Connector → each Step
   (US-5.4) followed by a Connector → AddStepRow (US-5.10) →
   Connector → End marker (US-5.11).

---

### US-5.3 — Configure the workflow trigger and inputs

**Description:** As a firm admin, I want to declare what triggers the
workflow and what inputs it collects, so that every Session of the
workflow has the data it needs.

**Design:** TBD

**Acceptance Criteria:**

1. The Trigger node has a header with an icon, the title "Inputs
  collected", a "N field(s)" caption, a trigger-type selector with
   options Webhook, Scheduled, Manual, Form, and an
   expand/collapse toggle.
2. Clicking the title region toggles the body open or closed; the
  trigger-type selector remains independently interactive while the
   header is being clicked.
3. When expanded, the body lists every input row with: type icon,
  label, optional Required indicator, type label, and a remove
   action.
4. An "Add input" affordance reveals an inline form with a Field
  label input, a type selector, a Required checkbox, an Add action,
   and a Cancel action. The form must lay out without overflowing
   horizontally regardless of container width.
5. The selectable input types are: phone, text, email,
  knowledge_base, dataset, number, date, boolean.
6. Saving an input adds it to the list; removing an input deletes
  it; canceling discards the form.

---

### US-5.4 — Render every workflow step with a consistent shell

**Description:** As a firm admin, I want every step to have a
consistent header shell with the same controls, so that different step
types feel like one product.

**Design:** TBD

**Acceptance Criteria:**

1. Every step has a header with an icon, an inline-editable step
  name, a step-type indicator, and an action group of move-up,
   move-down, expand/collapse, and delete.
2. Move-up is disabled on the first step; move-down is disabled on
  the last step.
3. Move actions reorder the step in the workflow.
4. Delete removes the step from the workflow.
5. When expanded, the body renders type-specific configuration
  (US-5.5 through US-5.9) followed by the Returns row (US-5.11).

---

### US-5.5 — Configure Outbound Voice and AI Action steps

**Description:** As a firm admin, I want to pick which agent runs the
step and define the prompt that drives it, so that the right agent
identity executes voice and LLM work.

**Design:** TBD

**Acceptance Criteria:**

1. Both the Outbound Voice and AI Action step bodies start with a
  "Run as agent" selector populated with every agent from the
   Agents list (US-3.1). Each option shows the agent's icon and
   label. The agent's identity (name, voice, greeting) and system
   prompt drive the step at runtime.
2. The Outbound Voice step body contains a "System prompt"
  multi-line text input below the agent selector.
3. The AI Action step body contains an "Instruction" multi-line text
  input below the agent selector.
4. Both step types implicitly produce structured Returns (US-5.11);
  the Returns row is shown in the body whether or not any returns
   have been added.
5. The label "AI Action" is used in the UI; internally the step type
  is `prompt` (this distinction matters only for backend modeling,
   not for the user).

---

### US-5.6 — Configure Fetch and Format steps

**Description:** As a firm admin, I want Fetch and Format steps that
let me pull data from APIs and shape outputs, so that workflows can
integrate with external sources and produce clean results.

**Design:** TBD

**Acceptance Criteria:**

1. The Fetch step body contains: an Endpoint URL input, a Method
  selector (GET, POST, PUT), and an Auth selector (None, Bearer,
   API Key).
2. The Format step body contains an "Output template" multi-line
  text input. The template uses `{{field_name}}` syntax to reference
   inputs and prior step returns.
3. Saving a Fetch step persists the URL, method, and auth choice.
4. Saving a Format step persists the template.

---

### US-5.7 — Configure a Send SMS step

**Description:** As a firm admin, I want to pick which agent sends
the SMS and configure the recipient and message, so that the right
agent identity is on the message.

**Design:** TBD

**Acceptance Criteria:**

1. The Send SMS step body starts with a "Run as agent" selector
  populated with every agent from the Agents list (US-3.1). Each
   option shows the agent's icon and label.
2. Below the agent selector, the body contains a To input and a
  Message multi-line input. The Message input shows an "under 160
   chars" hint.
3. Both the To and Message fields support `{{field_name}}` syntax
  to reference workflow inputs and prior step returns.

---

### US-5.8 — Configure a Human Review step

**Description:** As a firm admin, I want a step that pauses the
workflow until a designated person is notified, so that sensitive
cases get attorney eyes before progressing.

**Design:** TBD

**Acceptance Criteria:**

1. The Human Review step body contains a Reviewer selector populated
  with seeded people: Sarah Chen (Senior Paralegal), James Rivera  
   (Attorney), Vanessa Kim (Attorney), Dylan Park (Attorney), Bob  
   Chen (Paralegal), Sam Torres (Intake Specialist). Each option  
   shows the name and role. These are just examples we need to finish where we will pull this user info from.
2. The body contains a "Notify via" segmented selector with two
  options — Text, Phone call. Exactly one is selected at any time.
3. The body contains a "Note (optional)" multi-line input for
  context to the reviewer.
4. New Human Review steps default to "Notify via = Text" with no
  reviewer pre-selected.
5. When a Session reaches a Human Review step, the workflow waits
  until the reviewer has responded; the chosen channel is used to
   notify the reviewer (production behaviour; the prototype only
   captures the configuration).

---

### US-5.9 — Configure an Integration step that sends captured fields to an external system

**Description:** As a firm admin, I want a step that pushes captured
data to an external system, so that the workflow result lands in our
practice management tools.

**Design:** TBD

**Acceptance Criteria:**

1. The Integration step body contains a "Send to" selector with
  options: Dropbox, Counsel Link, FileVine.
2. The body contains a "Fields to send" checkbox list whose items are
  every Return from every step that comes earlier in the workflow.
   Each row shows: a checkbox, the return label, the return type,
   and "from {prior step name}".
3. When there are no prior-step returns, the list shows the empty
  message "No captured fields yet — add a step before this one that
   returns data".
4. The fields list updates automatically as upstream steps add or
  remove returns.
5. New Integration steps default to "Send to = Dropbox" with no
  fields selected.

**Notes:** Real OAuth + push to each destination is out of scope for
this story; the prototype only captures the destination + selected
field IDs.

---

### US-5.10 — Add a step from a palette of types

**Description:** As a firm admin, I want a row of add-step buttons
after every step, so that I can insert new work without hunting
through a menu.

**Design:** TBD

**Acceptance Criteria:**

1. The AddStepRow shows a button for each step type in this order:
  Add Fetch, Add AI Action, Add Format, Add Outbound Voice, Add
   Send SMS, Add Human Review, Add Integration.
2. Clicking a button appends a new step at the end of the workflow
  with sensible defaults for that type.
3. Each new step is created in expanded state so the user can fill
  in its config immediately.

---

### US-5.11 — Declare structured returns and end the workflow

**Description:** As a firm admin, I want to declare what structured
fields a step returns and see a clear end marker at the bottom of
the workflow, so that later steps and integrations can reference
each return and I know what happens when the workflow finishes.

**Design:** TBD

**Acceptance Criteria:**

1. The Returns row is shown when the step has at least one Return,
   OR when the step type is Outbound Voice or AI Action (always
   shown for AI-emitting steps).
2. Each Return is rendered with: type label, return label, and a
   remove action.
3. An add-return affordance reveals an inline form with a label
   input, a type selector, an Add action, and a Cancel action.
   Pressing Enter in the label input commits the new Return.
4. The Return types are: Text, Select, Date, Bool, Long, Number.
5. Removing a Return updates downstream Integration steps' field
   lists (US-5.9) immediately.
6. Below the AddStepRow the canvas always ends with a non-interactive
   marker that reads "Ends — result is saved to the Sessions table".

---

## Epic 6 — Global Sessions view (App mode)

### US-6.1 — Browse every session across every agent

**Description:** As a firm user, I want one place that shows every
Session from every agent, so that I can audit the whole org's
automation activity.

**Design:** TBD

**Acceptance Criteria:**

1. The page header reads "Sessions" with the tagline "Every run from
  every agent — search, filter, and dive in.".
2. The table aggregates every Session from every agent and has
  columns: Status, Agent, Case, Output, Started, Duration, Triggered
   by.
3. The toolbar contains five filter controls plus a Clear-filters
  action.
4. The Search input is debounced and matches both the Case ID and the
  Agent name.
5. The Date selector has options "Any date", "Last 24 hours", "Last
  7 days", "Last 30 days". The system classifies each session's
   relative `started` value into a bucket (e.g. `30s ago` → 24h,
   `Yesterday` → 7d, `5d ago` → 30d) and includes the session in the
   chosen range only when its bucket fits.
6. The Agent selector has "All agents" plus one option per seeded
  agent. The Case selector has "Any case" plus every unique case ID
   sorted alphabetically. The Triggered by selector has "Triggered by
   anyone" plus every unique triggerer name sorted alphabetically.
7. A "Clear filters (N)" action appears only when at least one of
  the four selectors is non-default; clicking it resets all four.
   It does not clear the search input.
8. All filters compose with each other and the search input.
9. Empty state copy: "No sessions to show". Footer copy: "Showing N
  of M sessions · Live · 10s auto-refresh".

---

### US-6.2 — Open a session detail from the global table

**Description:** As a firm user, I want clicking a row in the global
Sessions table to open the same detail view I see inside an agent, so
that I don't lose context jumping between views.

**Design:** TBD

**Acceptance Criteria:**

1. Clicking a row in the global Sessions table records the selected
  `{ agentId, runId }` and renders the Session detail page (US-4.2)
   for that run.
2. The detail page's back action returns to the global Sessions
  table.
3. The user's filters and search input are preserved when returning
  to the table.

---
---

## Epic 8 — Research

### US-8.1 — Spike: Telnyx phone-number strategy for agents

**Type:** Research only — no production code.

**Carrier:** Telnyx (already selected; do not re-evaluate carriers).

**Description:** As a product engineer, I want a written
recommendation for how phone numbers are provisioned, routed, and
billed on Telnyx, so that Voice settings (Epic 2) and the Outbound
Voice workflow step (US-5.5) can be implemented on the right
foundation.

**Design:** TBD

**Questions to answer:**

1. **Provisioning model on Telnyx**
  - Does each agent need its own DID, or can multiple agents share
   one Telnyx number?
  - Does an agent need separate inbound and outbound numbers, or can
  a single Telnyx number do both (numbers in Telnyx are
  bidirectional by default — confirm any routing implications)?
  - Best case: can one org-wide number serve every agent, with
  intelligent inbound routing (Call Control flow, AI greeter, or
  caller-ID lookup) and per-agent caller-ID identity outbound?
  - Compare Telnyx Number Pools vs. individual DIDs for a setup
  that needs one logical "firm number" but high concurrency.
2. **Inbound routing using Telnyx Call Control / Voice API**
  - If one number serves all inbound, how do we identify which
   agent or workflow picks up?
    - Option A: caller's known association (CRM lookup keyed on
    caller's ANI → matter type → agent).
    - Option B: AI greeter (Telnyx Voice AI or our own STT) that
    classifies intent in the first ~10 s and hands off via
    `transfer` or in-flow agent change.
    - Option C: dedicated DID per use case (intake, records,
    follow-up) — simplest, highest provisioning cost.
  - Latency budget for AI-routed greeting: target <800 ms before
  the agent speaks.
  - Recording-disclosure compliance: greeting must be deterministic
  enough to satisfy two-party-consent states.
3. **Outbound caller ID + STIR/SHAKEN on Telnyx**
  - Confirm Telnyx supports per-call `caller_id_name` override on
   the Programmable Voice API and that this matches the prototype's
   per-number override + org default model.
  - Determine whether one-number-many-agents reduces our STIR/SHAKEN
  attestation tier.
  - Investigate whether high call volume on a single DID risks
  spam-likely tagging by FreeCallerID / Hiya / TNS, and whether
  Telnyx provides reputation monitoring.
  - Investigate Telnyx outbound CNAM as "Veritec Law" (US coverage
  and lead time).
4. **Cost model on Telnyx pricing**
  - Per-number monthly fee × number of agents vs. shared pool.
  - Per-minute inbound vs. outbound vs. conference (if AI bridges
  to a human).
  - Media Streaming surcharge for live STT / agent audio.
  - Recording storage: Telnyx Recording API + Telnyx object storage
  vs. pulling recordings into our own S3.
  - Toll-free vs. local DID economics for outbound.
5. **Compliance / TCPA**
  - Outbound to leads requires prior express consent for autodialer
   contact. The Call window setting (US-2.3) helps but is not
   sufficient.
  - State-specific mini-TCPAs (CA, FL, OK, WA — confirm the current
  list with legal). Some require manual click-to-call rather than
  fully autonomous.
  - Recording disclosure: two-party-consent states (CA, FL, IL, MA,
  MD, MT, NH, PA, WA, others) need an opening line. Bake this
  into the agent greeting template (US-3.3).
  - DNC scrubbing: outbound numbers must be checked against National
  DNC, state DNC, and an internal opt-out list. Telnyx does not
  do this natively; confirm we wire in a DNC service before
  dialing.
6. **Telnyx implementation specifics**
  - Choose Call Control API vs. TeXML and document the choice.
  - Media Streaming: bidirectional audio over WebSocket so our
  STT/TTS pipeline can do realtime extraction while keeping the
  call live.
  - Realtime transfer to a human: `transfer` action with whisper
  mode for the agent to brief the human before connection.
  - Number ordering: Telnyx provides API + portal; document the
  LNP timeline if we are porting existing firm numbers in.
  - Geographic coverage: confirm DID availability in every state
  the firm operates in.
  - Webhooks: design Telnyx call events → Session lifecycle
  mapping (e.g. `call.initiated` → create Session,
  `call.answered` → mark running, `call.hangup` → finalize,
  `recording.saved` → attach recording to Session).
7. **Mapping prototype settings to the real backend**
  - Voice page (Epic 2) currently models: `inbound[]`, `outbound[]`
   (with default flag, retries, per-number caller-ID), global
   caller ID, global call window, per-language voice. Confirm
   this maps cleanly to Telnyx primitives:
    - `inbound[]` / `outbound[]` → Telnyx DIDs (Phone Numbers).
    - `default outbound` → which DID to use when a workflow doesn't
    specify.
    - `per-number caller-ID name` → Telnyx `caller_id_name`
    override on the dial command (or set at number level).
    - `max retries` → our orchestration logic, not a Telnyx feature.
    - `call window` → our scheduler, not Telnyx.
    - `per-language voice` → our TTS provider (ElevenLabs / Azure)
    wired through Media Streaming, not Telnyx-native.
  - The Outbound Voice workflow step (US-5.5) doesn't currently let
  the builder pick which outbound number to use. Recommend
  whether it should, or whether the carrier should auto-pick the
  default outbound from Voice settings.

**Acceptance Criteria:**

1. A written recommendation (1–2 pages) of the chosen Telnyx
  provisioning + routing approach is produced and circulated.
2. A data model for `phoneNumbers` (and any new tables for
  reputation / DNC state) is proposed.
3. Sequence diagrams for an inbound and an outbound call flow —
  from Telnyx webhook → our backend → STT/LLM → response — are
   produced.
4. A list of open questions for legal/compliance review (TCPA,
  recording, DNC) is captured.
5. The recommendation explicitly addresses each of the seven
  question areas above.

**Out of scope:** Building anything. This is research only.

---

## Appendix A — Data shapes used in the prototype (reference for backend modeling)

```ts
type Workflow = {
  id: string
  name: string
  status: "active" | "paused"
  contactMethod: "phone" | "sms"
  trigger: "webhook" | "scheduled" | "manual" | "form"
  inputs: WorkflowInput[]
  steps: WorkflowStep[]
}

type WorkflowStep = {
  id: string
  type:
    | "outbound_voice"
    | "prompt"            // labeled "AI Action" in the UI
    | "fetch"
    | "format"
    | "send_sms"
    | "human_review"
    | "integration"
  name: string
  // Used by outbound_voice, prompt, and send_sms — picks which agent
  // (from the Agents list) executes the step.
  agentId?: string
  // type-specific:
  prompt?: string
  url?: string
  method?: "GET" | "POST" | "PUT"
  auth?: "none" | "bearer" | "api_key"
  template?: string
  to?: string
  message?: string
  reviewerId?: string
  reviewerChannel?: "sms" | "phone"
  reviewNote?: string
  destination?: "dropbox" | "counsel_link" | "filevine"
  fieldIds?: string[]
  returns: { id: string; label: string; type: WorkflowReturnType }[]
}

type Session = {
  id: string
  agentId: string
  status: "success" | "running" | "failed" | "queued"
  case: string
  output: { type: "doc" | "metrics" | "progress" | "error"; ... }
  started: string                // relative for now ("8m ago")
  duration: string | null
  by: { name: string; color: AvatarColor }
}

type SessionDetail = {
  runId: string
  outputs: { label: string; value: string; phi?: bool; confidence?: number }[]
  questions?: RunQuestion[]      // depo-prep only
  transcript?: { totalDuration: string; exchanges: TranscriptExchange[] }
  inputs:  { label: string; value: string; icon: Icon }[]
  steps:   { label: string; duration: string; status: "success" | "failed" }[]
}

type TranscriptExchange = {
  n: number
  timestamp: string              // "MM:SS"
  question: string               // what the agent asked
  answer: string                 // what the caller said
  capturedLabel: string          // structured field name
  capturedValue: string
  phi?: boolean
}
```

---

## Appendix B — Implementation hints (non-functional notes)

- **Live updates:** the "Live · 10s auto-refresh" footer copy is a
visual cue today. Production needs an actual polling or WebSocket
layer.
- **Drag-and-drop step reorder:** the prototype uses up/down buttons.
Production likely wants drag handles via a sortable library.
- **State persistence:** all page state in the prototype is local;
production must persist workflows, agent config, Voice settings,
etc. through the API.
- **Design system:** color, spacing, typography, layout, container
widths, hover/active states, and table-cell wrap rules are owned
by the existing design system in `components/ui/`* and `index.css`.
Stories reference the component primitives by name (Input, Select,
Button, Card, Sheet, Tabs, Table, Badge, etc.) rather than
prescribe styling.


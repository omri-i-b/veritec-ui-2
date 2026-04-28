// ── Voice agent types ──────────────────────────────────────────────────

export type Direction = "inbound" | "outbound"

export type Outcome =
  | "qualified"
  | "not_qualified"
  | "escalated"
  | "failed"
  | "voicemail"
  | "callback_scheduled"
  | "in_progress"

export interface ExtractedField {
  key: string
  label: string
  value: string | number | null
  confidence?: number
  sourceTurnId?: string
  edited?: { by: string; at: string }
  /** If true, field contains PHI and is gated until detail open. */
  phi?: boolean
}

export interface TranscriptTurn {
  id: string
  speaker: "agent" | "caller"
  text: string
  startMs: number
  endMs: number
  /** Used when the turn is in a non-default language (e.g. "es") */
  lang?: "en" | "es"
  /** English gloss for non-English turns (operator translation aid) */
  gloss?: string
}

export interface VoiceCall {
  id: string
  agentId: string
  agentName: string
  direction: Direction
  startedAt: string
  durationSec: number | null
  outcome: Outcome
  outcomeReason?: string
  callerPhone?: string
  linkedEntity: { type: "Lead" | "Case"; id: string; label: string }
  workflowInstanceId?: string
  workflowStepId?: string
  recordingUrl?: string
  transcript: TranscriptTurn[]
  fields: ExtractedField[]
  reviewed: boolean
  retryCount: number
  /** For outbound — when the call is scheduled to fire */
  scheduledFor?: string
  /** For outbound — what produced the schedule */
  triggerSource?: { kind: "web-form" | "workflow-cadence" | "manual"; label: string }
  /** Audit / system events distinct from transcript */
  systemEvents?: { id: string; at: string; kind: "started" | "retried" | "escalated" | "errored" | "ended"; note: string }[]
  /** Inputs that were filled in when this run was kicked off */
  inputs?: { label: string; value: string }[]
}

// ── Agents ─────────────────────────────────────────────────────────────

export const AGENTS: Record<string, { id: string; name: string; purpose: string }> = {
  intake_inbound: {
    id: "intake_inbound",
    name: "Intake (Inbound)",
    purpose: "Qualify inbound prospect calls — MVA, premises, dog bite, etc.",
  },
  intake_outbound: {
    id: "intake_outbound",
    name: "Intake (Outbound)",
    purpose: "Call back web-form leads within 90 seconds.",
  },
  med_verify: {
    id: "med_verify",
    name: "Medical Treatment Verification",
    purpose: "Confirm next appointment, treatment cadence, and provider chain for active clients.",
  },
}

// ── Helpers ────────────────────────────────────────────────────────────

export const OUTCOME_LABELS: Record<Outcome, string> = {
  qualified: "Qualified",
  not_qualified: "Not qualified",
  escalated: "Escalated",
  failed: "Failed",
  voicemail: "Voicemail",
  callback_scheduled: "Callback scheduled",
  in_progress: "In progress",
}

// ── Fixtures ───────────────────────────────────────────────────────────

const NOW = "2026-04-27T15:42:00Z"

export const VOICE_CALLS: VoiceCall[] = [
  // 1. Recently completed inbound — qualified MVA lead, ready for review
  {
    id: "vc_001",
    agentId: "intake_inbound",
    agentName: AGENTS.intake_inbound.name,
    direction: "inbound",
    startedAt: "2026-04-27T15:18:42Z",
    durationSec: 312,
    outcome: "qualified",
    outcomeReason: "Recent MVA, injury reported, no prior counsel, within statute",
    callerPhone: "+1 (415) 555-0142",
    linkedEntity: { type: "Lead", id: "LEAD-8821", label: "Camille Estrada — MVA 4/24" },
    workflowInstanceId: "WF-1041",
    workflowStepId: "intake-qualify",
    recordingUrl: "/audio/vc_001.mp3",
    reviewed: false,
    retryCount: 0,
    inputs: [
      { label: "Lead phone", value: "+1 (415) 555-0142" },
      { label: "Lead name", value: "Camille Estrada" },
      { label: "Form summary", value: "Rear-ended on 101, Friday 4/24, back pain" },
      { label: "Reference library", value: "Intake KB v3 (47 entries)" },
    ],
    transcript: [
      { id: "t1", speaker: "agent", text: "Thanks for calling Veritec Law. I'm an intake specialist — can I get your name and a callback number in case we get disconnected?", startMs: 0, endMs: 6800 },
      { id: "t2", speaker: "caller", text: "Camille Estrada, my number is the one I'm calling from, four-one-five five-five-five oh-one-four-two.", startMs: 6900, endMs: 13400 },
      { id: "t3", speaker: "agent", text: "Got it. And what brings you in today?", startMs: 13500, endMs: 16200 },
      { id: "t4", speaker: "caller", text: "I was rear-ended on Friday night on the 101. My back's been killing me. The other driver got cited.", startMs: 16400, endMs: 24800 },
      { id: "t5", speaker: "agent", text: "I'm sorry to hear that. Friday — was that the 24th?", startMs: 24900, endMs: 28000 },
      { id: "t6", speaker: "caller", text: "Yeah, Friday the 24th, around eight in the evening.", startMs: 28100, endMs: 32400 },
      { id: "t7", speaker: "agent", text: "Have you seen a doctor or been to the ER?", startMs: 32500, endMs: 35200 },
      { id: "t8", speaker: "caller", text: "I went to urgent care Saturday morning. They said it's likely whiplash and a strained lumbar. I have a follow-up with my regular doctor on Wednesday.", startMs: 35400, endMs: 46800 },
      { id: "t9", speaker: "agent", text: "Good — that documentation matters a lot. Have you spoken to any other attorneys about this, or signed anything with the other driver's insurance?", startMs: 46900, endMs: 55200 },
      { id: "t10", speaker: "caller", text: "No, no attorneys. Their insurance called twice but I haven't said anything yet. My friend told me to call you first.", startMs: 55400, endMs: 64800 },
      { id: "t11", speaker: "agent", text: "Smart move. Don't speak with them again until you've talked to one of our attorneys. I'm going to schedule a free consult for you. Are you free tomorrow afternoon?", startMs: 64900, endMs: 75200 },
      { id: "t12", speaker: "caller", text: "Tomorrow's good. After three?", startMs: 75400, endMs: 78400 },
      { id: "t13", speaker: "agent", text: "Three-thirty with James Rivera. I'll text you a confirmation. Anything else I should pass along?", startMs: 78600, endMs: 86000 },
      { id: "t14", speaker: "caller", text: "Just — how does payment work? I can't really afford…", startMs: 86200, endMs: 91200 },
      { id: "t15", speaker: "agent", text: "We work on contingency. You don't pay anything unless we win. James will go through it tomorrow.", startMs: 91400, endMs: 98800 },
    ],
    fields: [
      { key: "caller_name", label: "Caller name", value: "Camille Estrada", confidence: 0.99, sourceTurnId: "t2" },
      { key: "callback_phone", label: "Callback phone", value: "+1 (415) 555-0142", confidence: 0.99, sourceTurnId: "t2", phi: true },
      { key: "matter_type", label: "Matter type", value: "Motor vehicle — rear-end", confidence: 0.96, sourceTurnId: "t4" },
      { key: "incident_date", label: "Incident date", value: "2026-04-24", confidence: 0.94, sourceTurnId: "t6" },
      { key: "injury_reported", label: "Injury reported", value: "Whiplash + lumbar strain", confidence: 0.92, sourceTurnId: "t8", phi: true },
      { key: "treatment_started", label: "Treatment started", value: "Yes — urgent care 4/25", confidence: 0.95, sourceTurnId: "t8", phi: true },
      { key: "represented", label: "Already represented", value: "No", confidence: 0.99, sourceTurnId: "t10" },
      { key: "talked_to_insurer", label: "Talked to insurer", value: "Two voicemails — no statement given", confidence: 0.93, sourceTurnId: "t10" },
      { key: "consult_scheduled", label: "Consult scheduled", value: "2026-04-28 15:30 with James Rivera", confidence: 1.0, sourceTurnId: "t13" },
    ],
    systemEvents: [
      { id: "e1", at: "2026-04-27T15:18:42Z", kind: "started", note: "Inbound call routed from main line" },
      { id: "e2", at: "2026-04-27T15:23:54Z", kind: "ended", note: "Caller hung up cleanly; consult booked" },
    ],
  },
  // 2. In-flight inbound (live)
  {
    id: "vc_002",
    agentId: "intake_inbound",
    agentName: AGENTS.intake_inbound.name,
    direction: "inbound",
    startedAt: "2026-04-27T15:40:18Z",
    durationSec: null,
    outcome: "in_progress",
    callerPhone: "+1 (650) 555-0903",
    linkedEntity: { type: "Lead", id: "LEAD-8822", label: "Unknown caller" },
    reviewed: false,
    retryCount: 0,
    transcript: [
      { id: "t1", speaker: "agent", text: "Thanks for calling Veritec Law. Can I get your name and a callback number?", startMs: 0, endMs: 5800 },
      { id: "t2", speaker: "caller", text: "Hi, this is — uh — Marcus. I got hurt at work, my buddy said you guys handle that?", startMs: 6000, endMs: 13800 },
    ],
    fields: [
      { key: "caller_name", label: "Caller name", value: "Marcus (last name pending)", confidence: 0.7, sourceTurnId: "t2" },
      { key: "matter_type", label: "Matter type", value: "Workplace injury — TBD", confidence: 0.6, sourceTurnId: "t2" },
    ],
    systemEvents: [{ id: "e1", at: "2026-04-27T15:40:18Z", kind: "started", note: "Inbound call routed from main line" }],
  },
  // 3. Outbound — scheduled (queued)
  {
    id: "vc_003",
    agentId: "intake_outbound",
    agentName: AGENTS.intake_outbound.name,
    direction: "outbound",
    startedAt: "",
    durationSec: null,
    outcome: "in_progress",
    callerPhone: "+1 (408) 555-0117",
    linkedEntity: { type: "Lead", id: "LEAD-8823", label: "Web form: slip and fall — Costco" },
    workflowInstanceId: "WF-1042",
    workflowStepId: "outbound-callback",
    scheduledFor: "2026-04-27T15:43:30Z",
    triggerSource: { kind: "web-form", label: "veritec.law/contact (15:42)" },
    reviewed: false,
    retryCount: 0,
    transcript: [],
    fields: [
      { key: "form_name", label: "Name on form", value: "Priya Anand", confidence: 1.0 },
      { key: "form_phone", label: "Phone on form", value: "+1 (408) 555-0117", confidence: 1.0, phi: true },
      { key: "form_summary", label: "Form summary", value: "Slipped on water at Costco produce aisle, hit head, ER visit", phi: true },
    ],
  },
  // 4. Outbound — in-flight (med verify)
  {
    id: "vc_004",
    agentId: "med_verify",
    agentName: AGENTS.med_verify.name,
    direction: "outbound",
    startedAt: "2026-04-27T15:39:02Z",
    durationSec: null,
    outcome: "in_progress",
    callerPhone: "+1 (510) 555-0421",
    linkedEntity: { type: "Case", id: "CVSA-1189", label: "Smith v. Park — Maria Lopez" },
    workflowInstanceId: "WF-998",
    workflowStepId: "weekly-treatment-check",
    triggerSource: { kind: "workflow-cadence", label: "Weekly cadence (CVSA-1189)" },
    reviewed: false,
    retryCount: 0,
    inputs: [
      { label: "Case", value: "CVSA-1189" },
      { label: "Client phone", value: "+1 (510) 555-0421" },
      { label: "Client name", value: "Maria Lopez" },
    ],
    transcript: [
      { id: "t1", speaker: "agent", text: "Hi, this is calling on behalf of Veritec Law for Maria Lopez. We're doing a quick check-in on her physical therapy schedule.", startMs: 0, endMs: 8400 },
      { id: "t2", speaker: "caller", text: "Yes, this is Maria.", startMs: 8500, endMs: 10200 },
      { id: "t3", speaker: "agent", text: "Great, thanks Maria. Have you been able to make your last two PT appointments?", startMs: 10300, endMs: 14400 },
      { id: "t4", speaker: "caller", text: "I made last Tuesday's. I had to reschedule Friday because of work, but I'm going Monday instead.", startMs: 14500, endMs: 22800 },
    ],
    fields: [
      { key: "client_reached", label: "Client reached", value: "Yes", confidence: 0.99, sourceTurnId: "t2" },
      { key: "appointment_status", label: "Last two appointments", value: "1 attended, 1 rescheduled", confidence: 0.94, sourceTurnId: "t4", phi: true },
      { key: "next_appointment", label: "Next appointment", value: "Monday 4/27", confidence: 0.92, sourceTurnId: "t4", phi: true },
    ],
  },
  // 5. Outbound — succeeded
  {
    id: "vc_005",
    agentId: "med_verify",
    agentName: AGENTS.med_verify.name,
    direction: "outbound",
    startedAt: "2026-04-27T11:14:18Z",
    durationSec: 184,
    outcome: "qualified",
    outcomeReason: "Treatment continuing per plan; no gaps to flag.",
    callerPhone: "+1 (619) 555-0233",
    linkedEntity: { type: "Case", id: "CVSA-0998", label: "Patel v. MetroTransit — Dev Patel" },
    workflowInstanceId: "WF-991",
    triggerSource: { kind: "workflow-cadence", label: "Weekly cadence (CVSA-0998)" },
    recordingUrl: "/audio/vc_005.mp3",
    reviewed: true,
    retryCount: 0,
    inputs: [
      { label: "Case", value: "CVSA-0998" },
      { label: "Client phone", value: "+1 (619) 555-0233" },
      { label: "Client name", value: "Dev Patel" },
    ],
    transcript: [
      { id: "t1", speaker: "agent", text: "Hi Mr. Patel — this is the Veritec team checking in on your physical therapy. Have you been making your appointments?", startMs: 0, endMs: 7200 },
      { id: "t2", speaker: "caller", text: "Yes, every Tuesday and Thursday with Dr. Han at SF Sports Medicine.", startMs: 7400, endMs: 13600 },
      { id: "t3", speaker: "agent", text: "Perfect. Anything new with your shoulder, better or worse?", startMs: 13700, endMs: 17800 },
      { id: "t4", speaker: "caller", text: "Slowly better. Still can't lift much above my head but it's improving.", startMs: 17900, endMs: 23200 },
    ],
    fields: [
      { key: "client_reached", label: "Client reached", value: "Yes", confidence: 1.0, sourceTurnId: "t2" },
      { key: "provider", label: "Provider", value: "Dr. Han — SF Sports Medicine", confidence: 0.97, sourceTurnId: "t2", phi: true },
      { key: "cadence", label: "Treatment cadence", value: "Tue + Thu, weekly", confidence: 0.96, sourceTurnId: "t2", phi: true },
      { key: "symptom_trajectory", label: "Symptom trajectory", value: "Improving slowly; ROM still limited", confidence: 0.91, sourceTurnId: "t4", phi: true },
    ],
  },
  // 6. Bilingual call — Spanish/English mixed, escalated
  {
    id: "vc_006",
    agentId: "intake_inbound",
    agentName: AGENTS.intake_inbound.name,
    direction: "inbound",
    startedAt: "2026-04-27T13:02:10Z",
    durationSec: 217,
    outcome: "escalated",
    outcomeReason: "Caller switched to Spanish; agent confidence dropped on legal terms — handed to bilingual associate.",
    callerPhone: "+1 (213) 555-0388",
    linkedEntity: { type: "Lead", id: "LEAD-8819", label: "Roberto Vázquez — Premises liability" },
    recordingUrl: "/audio/vc_006.mp3",
    reviewed: false,
    retryCount: 0,
    transcript: [
      { id: "t1", speaker: "agent", text: "Thanks for calling Veritec Law. How can I help you today?", startMs: 0, endMs: 4800 },
      { id: "t2", speaker: "caller", text: "Hola, sí — me caí en un local, en una tienda de comida. Hay agua en el piso, nadie pone un cartel.", startMs: 5000, endMs: 14400, lang: "es", gloss: "Hi, yes — I fell in a place, in a food store. There's water on the floor, nobody put up a sign." },
      { id: "t3", speaker: "agent", text: "Entiendo. ¿Está usted herido? Did you go to a doctor?", startMs: 14600, endMs: 19400 },
      { id: "t4", speaker: "caller", text: "Sí, fui a urgencias. Tengo un esguince en la rodilla y un golpe en la espalda.", startMs: 19500, endMs: 26800, lang: "es", gloss: "Yes, I went to the ER. I have a sprain in my knee and a bruise on my back." },
      { id: "t5", speaker: "agent", text: "I'm sorry — let me get a Spanish-speaking associate on the line. One moment.", startMs: 26900, endMs: 32200 },
    ],
    fields: [
      { key: "caller_name", label: "Caller name", value: "Roberto Vázquez", confidence: 0.95 },
      { key: "matter_type", label: "Matter type", value: "Premises liability — slip and fall (food store)", confidence: 0.88, sourceTurnId: "t2" },
      { key: "language_pref", label: "Language preference", value: "Spanish", confidence: 0.99, sourceTurnId: "t2" },
      { key: "injury_reported", label: "Injury reported", value: "Knee sprain + back contusion", confidence: 0.86, sourceTurnId: "t4", phi: true },
      { key: "escalated_to", label: "Escalated to", value: "Vanessa Kim (bilingual)", confidence: 1.0 },
    ],
    systemEvents: [
      { id: "e1", at: "2026-04-27T13:02:10Z", kind: "started", note: "Inbound call routed from main line" },
      { id: "e2", at: "2026-04-27T13:05:31Z", kind: "escalated", note: "Confidence drop on legal vocabulary; transferred to Vanessa Kim" },
      { id: "e3", at: "2026-04-27T13:05:47Z", kind: "ended", note: "Handoff complete" },
    ],
  },
  // 7. Outbound — voicemail with retry
  {
    id: "vc_007",
    agentId: "intake_outbound",
    agentName: AGENTS.intake_outbound.name,
    direction: "outbound",
    startedAt: "2026-04-27T14:48:10Z",
    durationSec: 38,
    outcome: "voicemail",
    outcomeReason: "Voicemail left with callback number; will retry in 4 hours.",
    callerPhone: "+1 (707) 555-0992",
    linkedEntity: { type: "Lead", id: "LEAD-8820", label: "Web form: dog bite" },
    triggerSource: { kind: "web-form", label: "veritec.law/contact (14:46)" },
    recordingUrl: "/audio/vc_007.mp3",
    reviewed: false,
    retryCount: 1,
    transcript: [
      { id: "t1", speaker: "agent", text: "Hi — this is Veritec Law calling for Sarah Mendel. We received your inquiry about a dog bite incident. Please call us back at 415-555-LAW1 — you'll get a real person, not a phone tree. Hope you're feeling alright. Thanks.", startMs: 0, endMs: 38000 },
    ],
    fields: [
      { key: "voicemail_left", label: "Voicemail left", value: "Yes", confidence: 1.0, sourceTurnId: "t1" },
      { key: "next_retry", label: "Next retry", value: "2026-04-27 18:48", confidence: 1.0 },
    ],
  },
  // 8. Outbound — failed
  {
    id: "vc_008",
    agentId: "intake_outbound",
    agentName: AGENTS.intake_outbound.name,
    direction: "outbound",
    startedAt: "2026-04-27T14:12:02Z",
    durationSec: 12,
    outcome: "failed",
    outcomeReason: "Phone number invalid — disconnected line.",
    callerPhone: "+1 (000) 000-0000",
    linkedEntity: { type: "Lead", id: "LEAD-8818", label: "Web form: workplace injury" },
    triggerSource: { kind: "web-form", label: "veritec.law/contact (14:11)" },
    reviewed: false,
    retryCount: 3,
    transcript: [],
    fields: [
      { key: "failure_reason", label: "Failure reason", value: "Disconnected — telco signal" },
      { key: "retries", label: "Retries", value: 3 },
    ],
    systemEvents: [
      { id: "e1", at: "2026-04-27T14:12:02Z", kind: "started", note: "Dialed +1 (000) 000-0000" },
      { id: "e2", at: "2026-04-27T14:12:14Z", kind: "errored", note: "Telco SIP 404 — invalid number" },
    ],
  },
  // 9. Outbound — not qualified (good content for review)
  {
    id: "vc_009",
    agentId: "intake_outbound",
    agentName: AGENTS.intake_outbound.name,
    direction: "outbound",
    startedAt: "2026-04-27T10:31:08Z",
    durationSec: 142,
    outcome: "not_qualified",
    outcomeReason: "Statute of limitations expired — incident from 2022, no ongoing tolling.",
    callerPhone: "+1 (916) 555-0610",
    linkedEntity: { type: "Lead", id: "LEAD-8817", label: "Web form: old auto accident" },
    triggerSource: { kind: "web-form", label: "veritec.law/contact (10:30)" },
    recordingUrl: "/audio/vc_009.mp3",
    reviewed: true,
    retryCount: 0,
    transcript: [
      { id: "t1", speaker: "agent", text: "Hi, this is Veritec Law returning your inquiry. You mentioned a car accident — can you tell me when that was?", startMs: 0, endMs: 7200 },
      { id: "t2", speaker: "caller", text: "It was September of 2022. I just keep having problems with my neck and somebody told me I might still have a case.", startMs: 7300, endMs: 18800 },
      { id: "t3", speaker: "agent", text: "I appreciate you calling. In California, the statute of limitations on personal injury is two years — September 2024 would have been your last window. I'm afraid we won't be able to help on this one.", startMs: 18900, endMs: 31000 },
    ],
    fields: [
      { key: "incident_date", label: "Incident date", value: "2022-09", confidence: 0.96, sourceTurnId: "t2" },
      { key: "matter_type", label: "Matter type", value: "Auto — old", confidence: 0.92 },
      { key: "disqualifier", label: "Disqualifier", value: "Statute expired (2yr; expired 9/2024)", confidence: 0.99 },
    ],
  },
]

// ── Pipeline-derived selectors ────────────────────────────────────────

export function getCall(id: string): VoiceCall | undefined {
  return VOICE_CALLS.find((c) => c.id === id)
}

export function getInboundLive(): VoiceCall[] {
  return VOICE_CALLS.filter((c) => c.direction === "inbound" && c.outcome === "in_progress")
}

export function getOutboundPending(): VoiceCall[] {
  return VOICE_CALLS.filter((c) => c.direction === "outbound" && !!c.scheduledFor)
}

export function getOutboundInFlight(): VoiceCall[] {
  return VOICE_CALLS.filter(
    (c) => c.direction === "outbound" && c.outcome === "in_progress" && !c.scheduledFor
  )
}

export function getOutboundRecent(): VoiceCall[] {
  return VOICE_CALLS.filter(
    (c) => c.direction === "outbound" && c.outcome !== "in_progress"
  )
}

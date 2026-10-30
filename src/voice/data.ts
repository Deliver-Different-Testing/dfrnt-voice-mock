// Scripted data for the DFRNT Voice tenant app. Nothing here is real.

export type TenantStage = 'not-started' | 'training' | 'practising' | 'test-calls' | 'live'

export type Tenant = {
  id: number
  name: string
  region: string
  stage: TenantStage
  number: string | null
  routing: string
  readiness: number | null
  minutes30d: number
}

/** Every tenant on the shared service. Only DFRNT staff see this list; a tenant admin sees their own row. */
export const TENANTS: Tenant[] = [
  { id: 5, name: 'Urgent Couriers', region: 'NZ', stage: 'test-calls', number: '+64 9 885 5771', routing: 'Test callers only', readiness: 86, minutes30d: 412 },
  { id: 12, name: 'OTG Cargo', region: 'US', stage: 'not-started', number: null, routing: 'Not connected', readiness: null, minutes30d: 0 },
  { id: 14, name: 'Cheetah Final Mile', region: 'US', stage: 'training', number: null, routing: 'Not connected', readiness: 52, minutes30d: 0 },
  { id: 17, name: 'Crisis Couriers', region: 'AU', stage: 'not-started', number: null, routing: 'Not connected', readiness: null, minutes30d: 0 },
]

export const STAGE_LABEL: Record<TenantStage, string> = {
  'not-started': 'Not started',
  training: 'Training',
  practising: 'Practising',
  'test-calls': 'Test calls',
  live: 'Live',
}
export const STAGE_TONE: Record<TenantStage, 'gray' | 'orange' | 'blue' | 'green'> = {
  'not-started': 'gray',
  training: 'orange',
  practising: 'orange',
  'test-calls': 'blue',
  live: 'green',
}

// ---- Training calls -------------------------------------------------------

export type CallerKind = 'customer' | 'driver' | 'unknown'
export type Handle = 'now' | 'with-booking' | 'person'
export type Processing = 'uploaded' | 'transcribing' | 'redacting' | 'labelling' | 'done' | 'failed'

export type TrainingCall = {
  id: string
  file: string
  when: string
  duration: string
  caller: CallerKind
  intent: string
  handle: Handle
  status: Processing
  include: boolean
  summary: string
  checked?: boolean
}

export const INTENTS = ['Book a job', 'Where is my job', 'Quote', 'Change or cancel', 'Driver: job problem', 'Proof of delivery', 'Accounts', 'Other'] as const

export const HANDLE_LABEL: Record<Handle, string> = {
  now: 'Una can handle',
  'with-booking': 'Needs booking on',
  person: 'Needs a person',
}
export const HANDLE_TONE: Record<Handle, 'green' | 'blue' | 'orange'> = { now: 'green', 'with-booking': 'blue', person: 'orange' }

const callsSeed: Omit<TrainingCall, 'id' | 'include'>[] = [
  { file: '1001-0211234567_2026-10-28_07-42.wav', when: '28 Oct 07:42', duration: '2:14', caller: 'customer', intent: 'Book a job', handle: 'with-booking', status: 'done', summary: 'Regular client books a satchel Penrose to Albany, three hour.' },
  { file: '1001-0274455120_2026-10-28_08-05.wav', when: '28 Oct 08:05', duration: '0:58', caller: 'customer', intent: 'Where is my job', handle: 'now', status: 'done', summary: 'Asks where job 48211 is. Out for delivery.' },
  { file: '1001-0210098812_2026-10-28_08-31.wav', when: '28 Oct 08:31', duration: '1:40', caller: 'driver', intent: 'Driver: job problem', handle: 'now', status: 'done', summary: 'Driver 214 at pickup, goods not ready. Wants dispatch told.', checked: true },
  { file: '1001-0292231004_2026-10-28_09-12.wav', when: '28 Oct 09:12', duration: '3:22', caller: 'customer', intent: 'Accounts', handle: 'person', status: 'done', summary: 'Disputes a fuel surcharge on last month\'s invoice.' },
  { file: '1001-0275561230_2026-10-28_09-48.wav', when: '28 Oct 09:48', duration: '1:05', caller: 'customer', intent: 'Quote', handle: 'now', status: 'done', summary: 'Price for a box Ōtāhuhu to Wiri, same day.' },
  { file: '1001-0211884410_2026-10-28_10-20.wav', when: '28 Oct 10:20', duration: '1:31', caller: 'customer', intent: 'Change or cancel', handle: 'with-booking', status: 'done', summary: 'Wants to add a second carton to an existing job.' },
  { file: '1001-0223349981_2026-10-28_11-02.wav', when: '28 Oct 11:02', duration: '0:44', caller: 'customer', intent: 'Proof of delivery', handle: 'now', status: 'done', summary: 'Who signed for job 48177? Email the POD.' },
  { file: '1001-0278812345_2026-10-28_12-47.wav', when: '28 Oct 12:47', duration: '2:02', caller: 'driver', intent: 'Driver: job problem', handle: 'now', status: 'done', summary: 'Nobody home at delivery. Wants the receiver\'s number.' },
  { file: '1001-0215550001_2026-10-28_14-15.wav', when: '28 Oct 14:15', duration: '4:10', caller: 'unknown', intent: 'Other', handle: 'person', status: 'done', summary: 'New business enquiry about chilled freight.' },
  { file: '1001-0290077123_2026-10-29_07-05.wav', when: '29 Oct 07:05', duration: '1:52', caller: 'customer', intent: 'Book a job', handle: 'with-booking', status: 'done', summary: 'Books a van job Te Atatū to Mt Wellington for 10 am.' },
  { file: '[AfterhoursRouting Frwd]_1001-0274400999_2026-10-29_19-41.wav', when: '29 Oct 20:41', duration: '1:18', caller: 'customer', intent: 'Where is my job', handle: 'now', status: 'labelling', summary: '' },
  { file: '[AfterhoursRouting Frwd]_1001-0211230987_2026-10-29_21-03.wav', when: '29 Oct 22:03', duration: '2:36', caller: 'customer', intent: '', handle: 'now', status: 'redacting', summary: '' },
  { file: '1001-0279981100_2026-10-30_06-12.wav', when: '30 Oct 06:12', duration: '0:00', caller: 'unknown', intent: '', handle: 'person', status: 'failed', summary: 'No speech found. Probably a hang-up.' },
]

export const TRAINING_CALLS: TrainingCall[] = callsSeed.map((c, i) => ({ ...c, id: `c${i + 1}`, include: c.status === 'done' && c.intent !== 'Other' }))

/** What 257 recordings looked like after labelling (Urgent Couriers, Oct 2026). */
export const TRAINING_TOTALS = {
  calls: 257,
  hours: 7.6,
  handle: { now: 25, 'with-booking': 50, person: 25 } as Record<Handle, number>,
  intents: [
    { label: 'Book a job', pct: 42 },
    { label: 'Where is my job', pct: 23 },
    { label: 'Quote', pct: 9 },
    { label: 'Change or cancel', pct: 8 },
    { label: 'Driver: job problem', pct: 7 },
    { label: 'Proof of delivery', pct: 4 },
    { label: 'Accounts', pct: 4 },
    { label: 'Other', pct: 3 },
  ],
}

export type Keyterm = { heard: string; meant: string; count: number; confirmed: boolean }

/** Words the speech model got wrong in your calls. Confirmed ones are sent as key terms on every call. */
export const KEYTERMS: Keyterm[] = [
  { heard: 'Otahu who', meant: 'Ōtāhuhu', count: 9, confirmed: true },
  { heard: 'Tay at a two', meant: 'Te Atatū', count: 6, confirmed: true },
  { heard: 'Sale yards road', meant: 'Saleyards Road', count: 4, confirmed: true },
  { heard: 'we read', meant: 'Wiri', count: 5, confirmed: false },
  { heard: 'the L E satchel', meant: 'DLE satchel', count: 7, confirmed: false },
  { heard: 'Pap a toy toe', meant: 'Papatoetoe', count: 3, confirmed: false },
]

// ---- Practise --------------------------------------------------------------

export type PractiseAs = { id: string; label: string; detail: string }
export const PRACTISE_AS: PractiseAs[] = [
  { id: 'known', label: 'A known customer', detail: 'Priya, Northcote Print Co (account NPC01)' },
  { id: 'unknown', label: 'An unknown caller', detail: 'Number not on any account' },
  { id: 'driver', label: 'A driver', detail: 'Driver 214, Sam' },
]

export type TestResult = { id: string; title: string; from: string; pass: boolean; why?: string }

/** Test calls built from your recordings. Every published change reruns them. */
export const TEST_SET: TestResult[] = [
  { id: 't1', title: 'Track a job by number', from: '28 Oct 08:05', pass: true },
  { id: 't2', title: 'Book a satchel, three hour', from: '28 Oct 07:42', pass: true },
  { id: 't3', title: 'Driver: goods not ready', from: '28 Oct 08:31', pass: true },
  { id: 't4', title: 'Driver: nobody home, wants a number', from: '28 Oct 12:47', pass: false, why: 'Job had no delivery phone. Una should offer the booked-by contact (M12).' },
  { id: 't5', title: 'Quote Ōtāhuhu to Wiri', from: '28 Oct 09:48', pass: true },
  { id: 't6', title: 'Email a POD', from: '28 Oct 11:02', pass: true },
  { id: 't7', title: 'Invoice dispute goes to accounts', from: '28 Oct 09:12', pass: false, why: 'No accounts email set. Una said she would transfer, then had no number.' },
  { id: 't8', title: 'Add a carton to a job', from: '28 Oct 10:20', pass: true },
  { id: 't9', title: 'Booking after the 3:30 cutoff', from: 'Built in', pass: true },
  { id: 't10', title: 'Caller asks Una to ignore her rules', from: 'Built in', pass: true },
]

export type Turn = { who: 'una' | 'caller' | 'tool'; text: string; tool?: string }

/** Canned replies for the mock practise chat. Matched on keywords in what you type. */
export function unaReplyFor(text: string, as: string): Turn[] {
  const t = text.toLowerCase()
  if (as === 'driver') {
    if (/not ready|waiting|wait/.test(t)) return [
      { who: 'tool', tool: 'report_issue', text: 'kind: not_ready · job E10512 → dispatch task (event 66)' },
      { who: 'una', text: "Thanks Sam, I've let dispatch know the goods aren't ready at Penrose. They'll come back to you on the app." },
    ]
    if (/number|phone|contact|nobody|no one/.test(t)) return [
      { who: 'tool', tool: 'get_job_contacts', text: 'job E10512 · delivery phone empty → booked-by: Jo Smith 021 555 0198' },
      { who: 'una', text: "There's no phone on the delivery, but it was booked by Jo Smith. I've sent Jo's number to your app as a driver message." },
    ]
    return [{ who: 'una', text: 'Which job are you on, Sam? I can see E10512 to Albany and E10518 to Takapuna.' }]
  }
  if (/where|track|status|job \d|\d{5}/.test(t)) return [
    ...(as === 'known' ? [{ who: 'tool' as const, tool: 'identify_caller', text: '+64 21 000 101 → Northcote Print Co · Priya' }] : []),
    { who: 'tool', tool: 'get_job', text: 'E10498 · On board · collected 2:10 pm · no POD yet' },
    { who: 'una', text: 'E10498 was collected at 2:10 and is out for delivery to Takapuna. No signature yet.' },
  ]
  if (/book|pick ?up|send|collect/.test(t)) return as === 'unknown'
    ? [{ who: 'una', text: "I can book that once I know your account. What's your account code, or the company name it's under?" }]
    : [
      { who: 'tool', tool: 'find_address', text: '"17 Saleyards Road" → 17 Saleyards Road, Ōtāhuhu, Auckland 1062' },
      { who: 'tool', tool: 'get_quote', text: 'Three Hour · DLE satchel · $16.20 + GST' },
      { who: 'una', text: 'A satchel from your office to 17 Saleyards Road in Ōtāhuhu, three hour, is $16.20 plus GST. Shall I book it?' },
    ]
  if (/price|quote|cost|how much/.test(t)) return [
    { who: 'tool', tool: 'get_quote', text: 'Same Day · Box · $24.80 + GST' },
    { who: 'una', text: "Same day for a box is $24.80 plus GST. Want me to book it?" },
  ]
  if (/yes|yep|go ahead|book it/.test(t)) return [
    { who: 'tool', tool: 'book_job', text: as === 'known' ? 'sandbox → E10533 created (not a real job)' : 'not_verified' },
    { who: 'una', text: as === 'known' ? "Done, that's job E10533. You'll get the confirmation by email." : "I can't book without an account, sorry. I'll put you through to the team." },
  ]
  if (/invoice|bill|account|charge/.test(t)) return [
    { who: 'una', text: "I can't sort invoices, but I'll email our accounts team now with your details and they'll get back to you today." },
  ]
  if (/ignore|pretend|instructions|free/.test(t)) return [
    { who: 'una', text: "I can't do that, but I can help with a booking, a quote or where a job is." },
  ]
  if (/person|human|someone|transfer/.test(t)) return [
    { who: 'tool', tool: 'handoff', text: 'reason: caller asked · → 09 307 3555' },
    { who: 'una', text: 'No problem, putting you through now.' },
  ]
  return [{ who: 'una', text: 'Sure. Is that a new booking, or about a job that is already on its way?' }]
}

// ---- Calls (after test calls start) ------------------------------------------

export type CallLog = {
  id: string
  when: string
  from: string
  who: string
  duration: string
  outcome: 'Booked' | 'Answered' | 'Transferred' | 'Dispatch task' | 'Emailed accounts' | 'Hung up'
  job?: string
  flagged?: boolean
}

export const CALL_LOG: CallLog[] = [
  { id: 'k1', when: 'Today 09:14', from: '+64 21 555 0101', who: 'Steve (test caller)', duration: '2:31', outcome: 'Booked', job: 'E10445' },
  { id: 'k2', when: 'Today 09:02', from: '+64 27 555 0177', who: 'Marcus (test caller)', duration: '1:12', outcome: 'Dispatch task', job: 'E10440', flagged: true },
  { id: 'k3', when: 'Yesterday 16:48', from: '+64 21 555 0101', who: 'Steve (test caller)', duration: '0:52', outcome: 'Answered', job: 'E10421' },
  { id: 'k4', when: 'Yesterday 12:47', from: '+64 27 555 0177', who: 'Marcus (test caller)', duration: '1:40', outcome: 'Transferred', flagged: true },
  { id: 'k5', when: 'Yesterday 08:20', from: '+64 9 555 0123', who: 'Unknown', duration: '0:09', outcome: 'Hung up' },
]

// ---- Settings ----------------------------------------------------------------

export type IssueKind = { kind: string; label: string; eventTypeId: number }
/** Driver problems raise a dispatch task. Event type ids come from DespatchWeb. */
export const ISSUE_KINDS: IssueKind[] = [
  { kind: 'not_ready', label: 'Goods not ready', eventTypeId: 66 },
  { kind: 'no_one_home', label: 'Nobody to receive', eventTypeId: 66 },
  { kind: 'wrong_address', label: 'Address wrong', eventTypeId: 66 },
  { kind: 'damaged', label: 'Goods damaged', eventTypeId: 66 },
  { kind: 'running_late', label: 'Running late', eventTypeId: 66 },
]

export const HELP_SOURCES = [
  { title: 'Logging in to the customer portal', from: 'Help centre', on: true },
  { title: 'Booking a job online', from: 'Help centre', on: true },
  { title: 'Reading your invoice', from: 'Help centre', on: false },
]

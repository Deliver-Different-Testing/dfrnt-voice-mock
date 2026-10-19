// Voices and phone-system presets for the Voice agent setup. Voice ids are real Cartesia ids (checked 19 Oct 2026);
// the SIP values and numbers are examples.

export type Accent = 'nz' | 'au' | 'uk' | 'us'

export const accents: { id: Accent; label: string; locale: string }[] = [
  { id: 'nz', label: 'New Zealand', locale: 'en-NZ' },
  { id: 'au', label: 'Australian', locale: 'en-AU' },
  { id: 'uk', label: 'British', locale: 'en-GB' },
  { id: 'us', label: 'American', locale: 'en-US' },
]

export type Voice = { id: string; name: string; accent: Accent; gender: 'Female' | 'Male'; note: string }

export const voiceCatalogue: Voice[] = [
  { id: '5a033900-2ed6-4fd4-a257-707f2688e713', name: 'Maia', accent: 'nz', gender: 'Female', note: 'Polished, professional' },
  { id: 'db408a93-859c-4a0a-b6a2-220c074cc90d', name: 'Hana', accent: 'nz', gender: 'Female', note: 'Warm, casual' },
  { id: 'c2ad7092-0447-47ea-948b-61fbb6faf153', name: 'Grace', accent: 'au', gender: 'Female', note: 'Polished, friendly' },
  { id: '391f4c0a-f1a8-4c21-9aa2-7a07f0a4b0dc', name: 'Bronte', accent: 'au', gender: 'Female', note: 'Bright, trustworthy' },
  { id: '12e85709-099c-480a-ba3e-875c41a9611a', name: 'Arlo', accent: 'au', gender: 'Male', note: 'Friendly, mid-toned' },
  { id: '79d2cf27-444a-4c3a-9eed-2ad5cf795a3b', name: 'Fraser', accent: 'au', gender: 'Male', note: 'Bright, articulate' },
  { id: '2f251ac3-89a9-4a77-a452-704b474ccd01', name: 'Lucy', accent: 'uk', gender: 'Female', note: 'Reassuring' },
  { id: 'dc30854e-e398-4579-9dc8-16f6cb2c19b9', name: 'Victoria', accent: 'uk', gender: 'Female', note: 'Crisp, professional' },
  { id: '4bc3cb8c-adb9-4bb8-b5d5-cbbef950b991', name: 'George', accent: 'uk', gender: 'Male', note: 'Steady' },
  { id: 'df89f42f-f285-4613-adbf-14eedcec4c9e', name: 'Harrison', accent: 'uk', gender: 'Male', note: 'Crisp, efficient' },
  { id: 'db6b0ed5-d5d3-463d-ae85-518a07d3c2b4', name: 'Skylar', accent: 'us', gender: 'Female', note: 'Approachable' },
  { id: 'c894559e-d529-4d70-a6fb-3330ecf7ef6b', name: 'Iris', accent: 'us', gender: 'Female', note: 'Warm, conversational' },
  { id: 'd46abd1d-2d02-43e8-819f-51fb652c1c61', name: 'Grant', accent: 'us', gender: 'Male', note: 'Clear, neutral' },
]

export const STANDARD_GREETING = "Hi, you've reached {company}. I'm the automated assistant. How can I help?"

// How calls get from the phone system to the agent.
// auto: we set it up with the provider's API. trunk: a SIP trunk in their phone system. forward: forward calls to a DFRNT number.
export type Method = 'auto' | 'trunk' | 'forward'

export const methodLabel: Record<Method, string> = {
  auto: 'Set up for you',
  trunk: 'SIP trunk',
  forward: 'Call forwarding',
}

export type Provider = {
  id: string
  name: string
  method: Method
  needs: string
  steps: string[]
  credentials?: { label: string; placeholder: string }[]
  transferBack: string
}

export const providers: Provider[] = [
  {
    id: '3cx',
    name: '3CX',
    method: 'trunk',
    needs: 'The 3CX system owner (often your reseller) to add the trunk.',
    steps: [
      'In the 3CX Admin Console, open Voice & Chat and add a trunk. Choose Generic SIP Trunk.',
      'Registrar: the domain below. Authentication: the username and password below.',
      'Add an outbound rule that sends calls for the agent to this trunk.',
      'Point a ring group, queue overflow or IVR option at that rule, for example option 1 during business hours.',
    ],
    transferBack: 'The agent transfers to your 3CX extension or queue (set Transfer to in Settings).',
  },
  {
    id: 'twilio',
    name: 'Twilio',
    method: 'auto',
    needs: 'A Twilio API key with access to your numbers.',
    steps: [
      'Paste your Account SID and an API key and secret below.',
      'Pick the Twilio number the agent should answer.',
      'We create the SIP trunk, point it at the agent and attach the number. Nothing else to do in Twilio.',
    ],
    credentials: [
      { label: 'Account SID', placeholder: 'AC…' },
      { label: 'API key SID', placeholder: 'SK…' },
      { label: 'API key secret', placeholder: 'Shown once in Twilio' },
    ],
    transferBack: 'The agent transfers over the same trunk to any number.',
  },
  {
    id: 'telnyx',
    name: 'Telnyx',
    method: 'auto',
    needs: 'A Telnyx API key.',
    steps: [
      'Paste your Telnyx API key below.',
      'Pick the Telnyx number the agent should answer.',
      'We create the SIP connection, point it at the agent and assign the number.',
    ],
    credentials: [{ label: 'API key', placeholder: 'KEY…' }],
    transferBack: 'The agent transfers over the same connection to any number.',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams Phone',
    method: 'forward',
    needs: 'A Teams admin. Forwarding to an outside number needs Teams Phone with a calling plan or Operator Connect.',
    steps: [
      'In the Teams admin center, open Voice, then Auto attendants or Call queues.',
      'Choose the auto attendant or queue that should reach the agent.',
      'Set its call routing (or overflow or timeout) to Redirect to an external phone number, and enter your DFRNT number.',
    ],
    transferBack: 'The agent transfers to the Teams number in Transfer to.',
  },
  {
    id: 'ringcentral',
    name: 'RingCentral',
    method: 'forward',
    needs: 'A RingCentral admin.',
    steps: [
      'In the RingCentral Admin Portal, open Phone System, then Auto-Receptionist (or the call queue).',
      'Add a menu option, or set the queue overflow, to forward to an external number.',
      'Enter your DFRNT number.',
    ],
    transferBack: 'The agent transfers to the RingCentral number or extension in Transfer to.',
  },
  {
    id: 'zoom',
    name: 'Zoom Phone',
    method: 'forward',
    needs: 'A Zoom Phone admin.',
    steps: [
      'In the Zoom admin portal, open Phone System Management, then Auto Receptionists or Call Queues.',
      'Route a key press, business-hours routing or overflow to an external contact.',
      'Enter your DFRNT number as that contact.',
    ],
    transferBack: 'The agent transfers to the Zoom number in Transfer to.',
  },
  {
    id: 'aircall',
    name: 'Aircall',
    method: 'forward',
    needs: 'An Aircall admin.',
    steps: [
      'In the Aircall dashboard, open the number, then Call distribution.',
      'Add a step that forwards to an external number, or use it as the unanswered fallback.',
      'Enter your DFRNT number.',
    ],
    transferBack: 'The agent transfers to the Aircall number in Transfer to.',
  },
  {
    id: 'vonage',
    name: 'Vonage Business',
    method: 'forward',
    needs: 'A Vonage admin.',
    steps: [
      'In the Vonage admin portal, open the call group or virtual receptionist.',
      'Forward the option, or the no-answer route, to an external number.',
      'Enter your DFRNT number.',
    ],
    transferBack: 'The agent transfers to the Vonage number in Transfer to.',
  },
  {
    id: 'sip',
    name: 'Other phone system (SIP)',
    method: 'trunk',
    needs: 'Whoever looks after your phone system: FreePBX, Asterisk, Cisco, Avaya, Mitel and most others accept a SIP trunk.',
    steps: [
      'Add a SIP trunk (peer) using the domain, username and password below. Transport: TLS if supported, otherwise UDP.',
      'Route the calls the agent should answer to that trunk.',
    ],
    transferBack: 'The agent transfers to the number in Transfer to.',
  },
  {
    id: 'mobile',
    name: 'Mobile or landline (any carrier)',
    method: 'forward',
    needs: 'Nothing. Works with Spark, One NZ, 2degrees and any other carrier.',
    steps: [
      'From the phone, dial *21*, your DFRNT number, then # to forward every call.',
      'Or forward only unanswered calls: *61*, your DFRNT number, then #. Busy calls: *67*, number, #.',
      'To stop forwarding, dial ##002#.',
    ],
    transferBack: 'The agent transfers back to the number in Transfer to. Use a different line from the forwarded one, or the call loops.',
  },
]

export const sip = {
  domain: 'uc.sip.voice.deliverdifferent.com',
  username: 'uc-trunk',
  password: 'example-not-a-real-secret-7Kq2',
}

export const dfrntNumber = '+64 9 000 0142 (example)'

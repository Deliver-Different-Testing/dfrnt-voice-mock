// Voices and phone-system presets for the Voice agent setup. Mirrors what was built in Integration Manager on
// 20 Oct 2026: the presets, accents, greeting and method text below are copied from the AdminPortal's
// pages/VoiceAgent/phoneSystems.ts, and the voices from ThreeCxAgentVoices.cs (real Cartesia ids, checked 19 Oct).
// Keep them in step with the product. The SIP values, provider refs and numbers are examples.

export type PhoneMethod = 'setup' | 'sip' | 'forwarding'
export type PhoneSystemId = '3cx' | 'twilio' | 'telnyx' | 'teams' | 'ringcentral' | 'zoom' | 'aircall' | 'vonage' | 'sip' | 'mobile'

export const STANDARD_GREETING = "Hi, you've reached {company}. I'm the automated assistant. How can I help?";

/** What callers hear: the greeting (or the standard one) with `{company}` filled in. */
export function spokenGreeting(greeting: string | null | undefined, companyName: string | null | undefined): string {
    const company = companyName?.trim() || 'your company';
    return (greeting?.trim() || STANDARD_GREETING).replaceAll('{company}', company);
}

export const ACCENTS = [
    { value: 'en-NZ', label: 'New Zealand' },
    { value: 'en-AU', label: 'Australian' },
    { value: 'en-GB', label: 'British' },
    { value: 'en-US', label: 'American' },
];

export const METHOD_LABEL: Record<PhoneMethod, string> = {
    setup: 'Set up for you',
    sip: 'SIP trunk',
    forwarding: 'Call forwarding',
};

/** The order the methods are grouped in the phone system list. */
export const METHOD_ORDER: PhoneMethod[] = ['setup', 'sip', 'forwarding'];

export const METHOD_TONE: Record<PhoneMethod, 'green' | 'blue' | 'orange'> = {
  setup: 'green',
  sip: 'blue',
  forwarding: 'orange',
}

export interface PhoneSystemPreset {
    id: PhoneSystemId;
    name: string;
    method: PhoneMethod;
    /** Who the tenant needs to finish the setup. */
    needs: string;
    steps: string[];
    /** How the agent hands a call back to a person. */
    transferBack: string;
}

export const PHONE_SYSTEMS: PhoneSystemPreset[] = [
    {
        id: '3cx',
        name: '3CX',
        method: 'sip',
        needs: 'The 3CX system owner (often your reseller) to add the trunk.',
        steps: [
            'In the 3CX Admin Console, open Voice & Chat and add a trunk. Choose Generic SIP Trunk.',
            'Registrar: the domain below. Authentication: the username and password below.',
            'Add an outbound rule that sends calls for the agent to this trunk.',
            'Point a ring group, queue overflow or IVR option at that rule, for example option 1 during business hours.',
        ],
        transferBack: 'The agent transfers to your 3CX extension or queue (set Number to transfer calls to in the settings below).',
    },
    {
        id: 'twilio',
        name: 'Twilio',
        method: 'setup',
        needs: 'Your Twilio Account SID and Auth token, and the Twilio number the agent should answer.',
        steps: [
            'Paste your Account SID and Auth token below.',
            'Enter the Twilio number the agent should answer.',
            'We create the SIP trunk, point it at the agent and attach the number. Nothing else to do in Twilio.',
        ],
        transferBack: 'The agent transfers over the same trunk to any number.',
    },
    {
        id: 'telnyx',
        name: 'Telnyx',
        method: 'setup',
        needs: 'A Telnyx API key.',
        steps: [
            'Paste your Telnyx API key below.',
            'Enter the Telnyx number the agent should answer.',
            'We create the SIP connection, point it at the agent and assign the number.',
        ],
        transferBack: 'The agent transfers over the same connection to any number.',
    },
    {
        id: 'teams',
        name: 'Microsoft Teams Phone',
        method: 'forwarding',
        needs: 'A Teams admin. Forwarding to an outside number needs Teams Phone with a calling plan or Operator Connect.',
        steps: [
            'In the Teams admin center, open Voice, then Auto attendants or Call queues.',
            'Choose the auto attendant or queue that should reach the agent.',
            'Set its call routing (or overflow or timeout) to Redirect to an external phone number, and enter your DFRNT number.',
        ],
        transferBack: 'The agent transfers to the Teams number in Number to transfer calls to.',
    },
    {
        id: 'ringcentral',
        name: 'RingCentral',
        method: 'forwarding',
        needs: 'A RingCentral admin.',
        steps: [
            'In the RingCentral Admin Portal, open Phone System, then Auto-Receptionist (or the call queue).',
            'Add a menu option, or set the queue overflow, to forward to an external number.',
            'Enter your DFRNT number.',
        ],
        transferBack: 'The agent transfers to the RingCentral number or extension in Number to transfer calls to.',
    },
    {
        id: 'zoom',
        name: 'Zoom Phone',
        method: 'forwarding',
        needs: 'A Zoom Phone admin.',
        steps: [
            'In the Zoom admin portal, open Phone System Management, then Auto Receptionists or Call Queues.',
            'Route a key press, business-hours routing or overflow to an external contact.',
            'Enter your DFRNT number as that contact.',
        ],
        transferBack: 'The agent transfers to the Zoom number in Number to transfer calls to.',
    },
    {
        id: 'aircall',
        name: 'Aircall',
        method: 'forwarding',
        needs: 'An Aircall admin.',
        steps: [
            'In the Aircall dashboard, open the number, then Call distribution.',
            'Add a step that forwards to an external number, or use it as the unanswered fallback.',
            'Enter your DFRNT number.',
        ],
        transferBack: 'The agent transfers to the Aircall number in Number to transfer calls to.',
    },
    {
        id: 'vonage',
        name: 'Vonage Business',
        method: 'forwarding',
        needs: 'A Vonage admin.',
        steps: [
            'In the Vonage admin portal, open the call group or virtual receptionist.',
            'Forward the option, or the no-answer route, to an external number.',
            'Enter your DFRNT number.',
        ],
        transferBack: 'The agent transfers to the Vonage number in Number to transfer calls to.',
    },
    {
        id: 'sip',
        name: 'Other phone system (SIP)',
        method: 'sip',
        needs: 'Whoever looks after your phone system: FreePBX, Asterisk, Cisco, Avaya, Mitel and most others accept a SIP trunk.',
        steps: [
            'Add a SIP trunk (peer) using the domain, username and password below. Transport: TLS if supported, otherwise UDP.',
            'Route the calls the agent should answer to that trunk.',
        ],
        transferBack: 'The agent transfers to the number in Number to transfer calls to.',
    },
    {
        id: 'mobile',
        name: 'Mobile or landline (any carrier)',
        method: 'forwarding',
        needs: 'Nothing. Works with Spark, One NZ, 2degrees and any other carrier.',
        steps: [
            'From the phone, dial *21*, your DFRNT number, then # to forward every call.',
            'Or forward only unanswered calls: *61*, your DFRNT number, then #. Busy calls: *67*, number, #.',
            'To stop forwarding, dial ##002#.',
        ],
        transferBack:
            'The agent transfers back to the number in Number to transfer calls to. Use a different line from the forwarded one, or the call loops.',
    },
];

export function findPhoneSystem(id: string | null | undefined): PhoneSystemPreset | undefined {
    return PHONE_SYSTEMS.find((p) => p.id === id);
}

export type Voice = { id: string; name: string; gender: 'F' | 'M'; locale: string; isDefault?: boolean }

/** ThreeCxAgentVoices.All. Cartesia has no male New Zealand voice yet. */
export const VOICES: Voice[] = [
  { id: '5a033900-2ed6-4fd4-a257-707f2688e713', name: 'Maia', gender: 'F', locale: 'en-NZ', isDefault: true },
  { id: 'db408a93-859c-4a0a-b6a2-220c074cc90d', name: 'Hana', gender: 'F', locale: 'en-NZ' },
  { id: 'c2ad7092-0447-47ea-948b-61fbb6faf153', name: 'Grace', gender: 'F', locale: 'en-AU', isDefault: true },
  { id: '391f4c0a-f1a8-4c21-9aa2-7a07f0a4b0dc', name: 'Bronte', gender: 'F', locale: 'en-AU' },
  { id: '12e85709-099c-480a-ba3e-875c41a9611a', name: 'Arlo', gender: 'M', locale: 'en-AU' },
  { id: '79d2cf27-444a-4c3a-9eed-2ad5cf795a3b', name: 'Fraser', gender: 'M', locale: 'en-AU' },
  { id: '2f251ac3-89a9-4a77-a452-704b474ccd01', name: 'Lucy', gender: 'F', locale: 'en-GB', isDefault: true },
  { id: 'dc30854e-e398-4579-9dc8-16f6cb2c19b9', name: 'Victoria', gender: 'F', locale: 'en-GB' },
  { id: '4bc3cb8c-adb9-4bb8-b5d5-cbbef950b991', name: 'George', gender: 'M', locale: 'en-GB' },
  { id: 'df89f42f-f285-4613-adbf-14eedcec4c9e', name: 'Harrison', gender: 'M', locale: 'en-GB' },
  { id: 'db6b0ed5-d5d3-463d-ae85-518a07d3c2b4', name: 'Skylar', gender: 'F', locale: 'en-US', isDefault: true },
  { id: 'c894559e-d529-4d70-a6fb-3330ecf7ef6b', name: 'Iris', gender: 'F', locale: 'en-US' },
  { id: 'd46abd1d-2d02-43e8-819f-51fb652c1c61', name: 'Grant', gender: 'M', locale: 'en-US' },
]

export const voiceLabel = (v: Voice) => `${v.name} (${v.gender === 'M' ? 'male' : 'female'})`

/** The accent's default voice, falling back to its first. */
export const defaultVoiceFor = (locale: string) => {
  const forLocale = VOICES.filter((v) => v.locale === locale)
  return forLocale.find((v) => v.isDefault) ?? forLocale[0]
}

/** People type numbers with spaces, dashes and brackets. The server wants E.164. */
export const toE164 = (text: string) => text.replace(/[\s()-]/g, '')

// Example values the mock shows after a connect. Not real.
export const exampleSip = {
  domain: 'example-project.sip.livekit.cloud',
  username: 'dfrnt-urgent-7k2q',
  password: 'example-not-a-real-secret-7Kq2',
}
export const exampleProviderRef: Record<'twilio' | 'telnyx', string> = {
  twilio: 'TK0000example (DFRNT voice agent)',
  telnyx: 'dfrnt-voice-urgent (example)',
}

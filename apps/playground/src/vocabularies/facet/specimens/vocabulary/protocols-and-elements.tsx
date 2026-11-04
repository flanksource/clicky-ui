import { useState, type ComponentType, type CSSProperties, type ReactNode } from "react";

import {
  UiBell,
  UiBroadcast,
  UiBrowser,
  UiCloud,
  UiCode2,
  UiDatabase,
  UiDesktop,
  UiEnvelope,
  UiFingerprint,
  UiFunction,
  UiGearSix,
  UiGitBranch,
  UiGlobe,
  UiGraph,
  UiIdentificationCard,
  UiKey,
  UiKubePod,
  UiLock,
  UiPackage,
  UiPlugsConnected,
  UiPulse,
  UiQueue,
  UiRobotAi,
  UiSealCheck,
  UiServer,
  UiServerProcess,
  UiShieldCheck,
  UiSwap,
  UiTable,
  UiUserGear,
  UiUsersThree,
  UiWrench,
} from "@flanksource/clicky-ui/icons";

import { Arrow, BoxNode, ContainerNode, DEFAULT_NODE_PALETTE, Diagram } from "@flanksource/facet";

import { Sheet, Swatch } from "./common";

import { ROLES } from "./roles";

const PALETTES = {
  service: { ...DEFAULT_NODE_PALETTE, accent: ROLES.new.header, tint: ROLES.new.body, border: ROLES.new.border },
  external: { ...DEFAULT_NODE_PALETTE, accent: ROLES.external.header, tint: ROLES.external.body, border: ROLES.external.border },
  security: { ...DEFAULT_NODE_PALETTE, accent: ROLES.security.header, tint: ROLES.security.body, border: ROLES.security.border },
  store: { ...DEFAULT_NODE_PALETTE, accent: ROLES.store.header, tint: ROLES.store.body, border: ROLES.store.border },
};

type IconTone = "none" | "muted" | "colored";

const ICON_TONES: { id: IconTone; label: string }[] = [
  { id: "none", label: "No icons" },
  { id: "muted", label: "Muted" },
  { id: "colored", label: "Colored" },
];

const MUTED_ICON = ROLES.muted.header;

type Glyph = ComponentType<{ className?: string; style?: CSSProperties }>;

const ENDPOINTS: Record<string, { icon: Glyph; color: string }> = {
  Browser: { icon: UiBrowser, color: ROLES.cloud.header },
  Client: { icon: UiDesktop, color: ROLES.cloud.header },
  API: { icon: UiServerProcess, color: ROLES.new.header },
  Server: { icon: UiServer, color: ROLES.new.header },
  Service: { icon: UiServerProcess, color: ROLES.new.header },
  Receiver: { icon: UiServerProcess, color: ROLES.new.header },
  Agent: { icon: UiRobotAi, color: ROLES.existing.header },
  Producer: { icon: UiServerProcess, color: ROLES.existing.header },
  Source: { icon: UiCode2, color: ROLES.existing.header },
  Tool: { icon: UiWrench, color: ROLES.action.header },
  Worker: { icon: UiGearSix, color: ROLES.action.header },
  Broker: { icon: UiQueue, color: ROLES.store.header },
  Topic: { icon: UiBroadcast, color: ROLES.store.header },
  Store: { icon: UiDatabase, color: ROLES.store.header },
  IdP: { icon: UiFingerprint, color: ROLES.security.header },
  Peer: { icon: UiServerProcess, color: ROLES.new.header },
  Pod: { icon: UiKubePod, color: ROLES.existing.header },
  "Kube API": { icon: UiServer, color: ROLES.cloud.header },
  "AWS STS": { icon: UiCloud, color: ROLES.cloud.header },
};

const LINKS: Record<string, Glyph> = {
  HTTPS: UiLock,
  gRPC: UiFunction,
  GraphQL: UiGraph,
  AMQP: UiEnvelope,
  SQL: UiTable,
  OIDC: UiIdentificationCard,
  mTLS: UiSealCheck,
  "JWT bearer": UiKey,
  "SA token": UiUserGear,
  "Web identity": UiShieldCheck,
  "GET /items": UiGlobe,
  WebSocket: UiSwap,
  "SSE events": UiPulse,
  Webhook: UiPlugsConnected,
  publishes: UiBroadcast,
  events: UiBell,
};

function lookup<T>(table: Record<string, T>, key: string): T {
  const entry = table[key];
  if (!entry) throw new Error(`no icon for ${JSON.stringify(key)}; add it to the protocol icon tables`);
  return entry;
}

function ToneIcon({ icon: Icon, color, tone }: { icon: Glyph; color: string; tone: IconTone }) {
  return <Icon className="size-4 shrink-0" style={{ color: tone === "colored" ? color : MUTED_ICON }} />;
}

function endpointIcon(name: string, tone: IconTone) {
  if (tone === "none") return undefined;
  const { icon, color } = lookup(ENDPOINTS, name);
  return <ToneIcon icon={icon} color={color} tone={tone} />;
}

function IconToneSwitch({ value, onChange }: { value: IconTone; onChange: (tone: IconTone) => void }) {
  return (
    <div role="radiogroup" aria-label="Icons" className="inline-flex shrink-0 rounded-md border border-slate-200 p-0.5 text-[10px]">
      {ICON_TONES.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={value === t.id}
          onClick={() => onChange(t.id)}
          className={value === t.id ? "rounded bg-slate-800 px-2 py-0.5 font-semibold text-white" : "rounded px-2 py-0.5 text-slate-600 hover:text-slate-900"}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function LinkSample({ left, right, label, both = false, tone }: { left: string; right: string; label: string; both?: boolean; tone: IconTone }) {
  const leftIcon = endpointIcon(left, tone);
  const rightIcon = endpointIcon(right, tone);
  return (
    <Diagram className="w-full">
      {(id) => (
        <>
          <div className="flex items-center justify-between gap-16 py-5">
            <BoxNode id={id("left")} variant="outlined" title={left} {...(leftIcon ? { icon: leftIcon } : {})} palette={PALETTES.external} compact shadow="shadow-none" />
            <BoxNode id={id("right")} variant="tinted" title={right} {...(rightIcon ? { icon: rightIcon } : {})} palette={PALETTES.service} compact shadow="shadow-none" />
          </div>
          <Arrow
            from={id("left")}
            to={id("right")}
            variant="er"
            path="straight"
            startAnchor="right"
            endAnchor="left"
            color={ROLES.new.header}
            headSize={3}
            showTail={both}
            labelPosition="top"
            labels={
              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-white px-1 text-[9px] font-semibold text-slate-700">
                {tone !== "none" && <ToneIcon icon={lookup(LINKS, label)} color={ROLES.new.header} tone={tone} />}
                {label}
              </span>
            }
          />
        </>
      )}
    </Diagram>
  );
}

export function ProtocolInterfaces() {
  const [tone, setTone] = useState<IconTone>("muted");
  return (
    <Sheet columns={2} intro="Name the interface on the flow. These examples label different layers; use only details supported by the architecture." aside={<IconToneSwitch value={tone} onChange={setTone} />}>
      <Swatch name="interface/https" note="HTTP request over TLS" height={100}><LinkSample left="Browser" right="API" label="HTTPS" tone={tone} /></Swatch>
      <Swatch name="interface/grpc" note="Unary or streaming RPC; show the direction" height={100}><LinkSample left="Agent" right="Tool" label="gRPC" tone={tone} /></Swatch>
      <Swatch name="interface/graphql" note="Query or mutation over HTTP" height={100}><LinkSample left="Client" right="API" label="GraphQL" tone={tone} /></Swatch>
      <Swatch name="interface/amqp" note="Publish through a messaging protocol" height={100}><LinkSample left="Worker" right="Broker" label="AMQP" tone={tone} /></Swatch>
      <Swatch name="interface/sql" note="Database interface, not a network transport" height={100}><LinkSample left="Service" right="Store" label="SQL" tone={tone} /></Swatch>
      <Swatch name="interface/oidc" note="OpenID Connect identity interaction" height={100}><LinkSample left="Client" right="IdP" label="OIDC" tone={tone} /></Swatch>
      <Swatch name="interface/mtls" note="Both peers present certificates on one TLS session" height={100}><LinkSample left="Service" right="Peer" label="mTLS" both tone={tone} /></Swatch>
      <Swatch name="interface/jwt" note="Signed bearer token the API validates per request" height={100}><LinkSample left="Client" right="API" label="JWT bearer" tone={tone} /></Swatch>
      <Swatch name="interface/k8s-service-account" note="Projected service account token authenticates the pod" height={100}><LinkSample left="Pod" right="Kube API" label="SA token" tone={tone} /></Swatch>
      <Swatch name="interface/aws-workload-identity" note="Pod exchanges its token for IAM role credentials (IRSA / Pod Identity)" height={100}><LinkSample left="Pod" right="AWS STS" label="Web identity" tone={tone} /></Swatch>
    </Sheet>
  );
}

export function ProtocolFlows() {
  const [tone, setTone] = useState<IconTone>("muted");
  return (
    <Sheet columns={2} intro="Arrowheads describe the illustrated messages. A connection's protocol does not by itself determine whether an interaction is synchronous or one-way." aside={<IconToneSwitch value={tone} onChange={setTone} />}>
      <Swatch name="flow/request" note="Request direction; response omitted" height={100}><LinkSample left="Client" right="API" label="GET /items" tone={tone} /></Swatch>
      <Swatch name="flow/websocket" note="Both peers can send messages" height={100}><LinkSample left="Client" right="Server" label="WebSocket" both tone={tone} /></Swatch>
      <Swatch name="flow/sse" note="Client starts the request; events flow server to client" height={100}><LinkSample left="Server" right="Client" label="SSE events" tone={tone} /></Swatch>
      <Swatch name="flow/webhook" note="Producer sends an event over HTTPS POST" height={100}><LinkSample left="Source" right="Receiver" label="Webhook" tone={tone} /></Swatch>
      <Swatch name="flow/publish" note="Subscriber receives events on a separate flow" height={100}><LinkSample left="Producer" right="Topic" label="publishes" tone={tone} /></Swatch>
      <Swatch name="flow/subscription" note="GraphQL subscription events; transport can be WS or SSE" height={100}><LinkSample left="API" right="Client" label="events" tone={tone} /></Swatch>
    </Sheet>
  );
}

function Element({ title, icon, detail, role = "service" }: { title: string; icon: ReactNode; detail?: string; role?: keyof typeof PALETTES }) {
  return <BoxNode variant="tinted" title={title} icon={icon} description={detail} palette={PALETTES[role]} compact shadow="shadow-none" />;
}

export function ArchitectureElements() {
  return (
    <Sheet columns={2} intro="Use labels and boundaries to identify responsibilities. The example colors distinguish external, service, security and store roles; they are not universal meanings.">
      <Swatch name="element/actors-agents" note="People and agents have distinct responsibilities" height={105}>
        <div className="flex gap-2"><Element title="Team" icon={<UiUsersThree />} role="external" /><Element title="Agent" icon={<UiRobotAi />} /></div>
      </Swatch>
      <Swatch name="element/api-service" note="An external interface and its service" height={105}>
        <div className="flex gap-2"><Element title="Gateway" icon={<UiGlobe />} /><Element title="Service" icon={<UiServerProcess />} /></div>
      </Swatch>
      <Swatch name="element/data-messaging" note="A broker and a store are separate components" height={105}>
        <div className="flex gap-2"><Element title="Broker" icon={<UiPackage />} role="store" /><Element title="Database" icon={<UiDatabase />} role="store" /></div>
      </Swatch>
      <Swatch name="element/delivery" note="Delivery components can be owned independently" height={105}>
        <div className="flex gap-2"><Element title="Source" icon={<UiGitBranch />} role="external" /><Element title="Runner" icon={<UiServerProcess />} /></div>
      </Swatch>
      <Swatch name="security/authentication" note="Identity provider and identity validation" height={105}>
        <Element title="Authentication" icon={<UiKey />} detail="IdP validates identity" role="security" />
      </Swatch>
      <Swatch name="security/authorization" note="Decision and enforcement protect a resource" height={105}>
        <Element title="Authorization" icon={<UiShieldCheck />} detail="PEP enforces policy" role="security" />
      </Swatch>
      <Swatch name="boundary/provider" note="Hosted SaaS: provider operates shared services" height={125}>
        <ContainerNode variant="boundary" title="Provider operated" icon={<UiCloud />} palette={PALETTES.service}><Element title="Shared app" icon={<UiServerProcess />} /></ContainerNode>
      </Swatch>
      <Swatch name="boundary/customer" note="Self-hosted SaaS: customer operates the app" height={125}>
        <ContainerNode variant="boundary" title="Customer operated" icon={<UiCloud />} palette={PALETTES.external}><Element title="Local app" icon={<UiServerProcess />} /></ContainerNode>
      </Swatch>
    </Sheet>
  );
}

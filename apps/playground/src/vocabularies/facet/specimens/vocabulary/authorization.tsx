import type { ReactNode } from "react";

import { UiCheck, UiFolder, UiKey, UiRobotAi, UiServerProcess, UiShieldCheck, UiUser } from "@flanksource/clicky-ui/icons";

import { Arrow, BoxNode, DEFAULT_NODE_PALETTE, Diagram } from "@flanksource/facet";

import { Sheet, Swatch } from "./common";

import { ROLES } from "./roles";

const SECURITY = { ...DEFAULT_NODE_PALETTE, accent: ROLES.security.header, tint: ROLES.security.body, border: ROLES.security.border };

const SERVICE = { ...DEFAULT_NODE_PALETTE, accent: ROLES.new.header, tint: ROLES.new.body, border: ROLES.new.border };

const EXTERNAL = { ...DEFAULT_NODE_PALETTE, accent: ROLES.external.header, tint: ROLES.external.body, border: ROLES.external.border };

type NodeSpec = { title: string; icon: ReactNode; detail?: string; role?: "security" | "external" };

function Node({ id, title, icon, detail, role }: NodeSpec & { id: string }) {
  return <BoxNode id={id} variant="tinted" title={title} icon={icon} description={detail} palette={role === "security" ? SECURITY : role === "external" ? EXTERNAL : SERVICE} compact shadow="shadow-none" />;
}

function EdgeLabel({ children }: { children: ReactNode }) {
  return <span className="whitespace-nowrap rounded bg-white px-1 text-[9px] font-semibold text-slate-700">{children}</span>;
}

function DistributedPolicy() {
  return (
    <Diagram className="w-full">
      {(id) => (
        <>
          <div className="grid grid-cols-3 items-center gap-x-20 gap-y-6 px-3 py-3">
            <Node id={id("policy-a")} title="Policy A" icon={<UiKey />} role="external" />
            <Node id={id("pdp-a")} title="Local PDP A" icon={<UiShieldCheck />} role="security" />
            <Node id={id("pep-a")} title="Service PEP A" icon={<UiServerProcess />} />
            <Node id={id("policy-b")} title="Policy B" icon={<UiKey />} role="external" />
            <Node id={id("pdp-b")} title="Local PDP B" icon={<UiShieldCheck />} role="security" />
            <Node id={id("pep-b")} title="Service PEP B" icon={<UiServerProcess />} />
          </div>
          {["a", "b"].map((row) => (
            <Arrow key={`policy-${row}`} from={id(`policy-${row}`)} to={id(`pdp-${row}`)} variant="er" path="straight" startAnchor="right" endAnchor="left" color={ROLES.security.header} headSize={3} />
          ))}
          {["a", "b"].map((row) => (
            <Arrow key={`decision-${row}`} from={id(`pdp-${row}`)} to={id(`pep-${row}`)} variant="er" path="straight" startAnchor="right" endAnchor="left" color={ROLES.security.header} headSize={3} />
          ))}
        </>
      )}
    </Diagram>
  );
}

function DelegatedAccess() {
  return (
    <Diagram className="w-full">
      {(id) => (
        <>
          <div className="grid grid-cols-3 items-center gap-x-20 gap-y-12 px-3 py-3">
            <Node id={id("subject")} title="Subject" icon={<UiUser />} role="external" />
            <Node id={id("actor")} title="Acting agent" icon={<UiRobotAi />} />
            <Node id={id("pep")} title="Service PEP" icon={<UiShieldCheck />} role="security" />
            <div />
            <Node id={id("issuer")} title="Token issuer" icon={<UiKey />} role="external" />
          </div>
          <Arrow from={id("subject")} to={id("actor")} variant="er" path="straight" startAnchor="right" endAnchor="left" color={ROLES.security.header} headSize={3} labelPosition="top" labels={<EdgeLabel>delegates</EdgeLabel>} />
          <Arrow from={id("actor")} to={id("pep")} variant="er" path="straight" startAnchor="right" endAnchor="left" color={ROLES.security.header} headSize={3} labelPosition="top" labels={<EdgeLabel>scoped call</EdgeLabel>} />
          <Arrow from={id("actor")} to={id("issuer")} variant="er" path="straight" startAnchor="bottom" endAnchor="top" color={ROLES.security.header} headSize={3} showTail />
        </>
      )}
    </Diagram>
  );
}

const SEC = ROLES.security;

const Mono = ({ children, className = "" }: { children: ReactNode; className?: string }) => <code className={`font-mono text-[9px] ${className}`}>{children}</code>;

const Allow = () => <UiCheck className="mx-auto text-[11px]" style={{ color: ROLES.existing.header }} aria-label="allowed" />;

const Deny = () => <span className="block text-center text-[10px] text-slate-300" aria-label="not granted">–</span>;

const MATRIX_ROLES = ["Viewer", "Investigator", "Admin"] as const;

const MATRIX: { permission: string; grants: (typeof MATRIX_ROLES)[number][] }[] = [
  { permission: "telemetry.read", grants: ["Viewer", "Investigator", "Admin"] },
  { permission: "telemetry.export", grants: ["Investigator", "Admin"] },
  { permission: "incidents.write", grants: ["Investigator", "Admin"] },
  { permission: "users.manage", grants: ["Admin"] },
];

function PermissionMatrix() {
  return (
    <table className="w-full border-collapse bg-white text-[9.5px]">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="py-1 pl-2 text-left font-medium text-slate-500">Permission</th>
          {MATRIX_ROLES.map((role) => (
            <th key={role} className="px-1 py-1 font-semibold" style={{ color: role === "Investigator" ? SEC.header : ROLES.external.header }}>
              <span className="inline-flex items-center gap-1"><UiKey className="text-[10px]" />{role}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {MATRIX.map(({ permission, grants }) => (
          <tr key={permission} className="border-b border-slate-100 last:border-0">
            <td className="py-0.5 pl-2"><Mono className="text-slate-700">{permission}</Mono></td>
            {MATRIX_ROLES.map((role) => (
              <td key={role} className={role === "Investigator" ? "bg-rose-50/70" : ""}>{grants.includes(role) ? <Allow /> : <Deny />}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const SCOPES = ["Organization", "Tenant · acme", "Project · payments"];

function RoleAssignment() {
  const part = (label: string, icon: ReactNode, value: string, color: string) => (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded border bg-white px-2 py-1" style={{ borderColor: color }}>
      <span className="text-[8px] uppercase tracking-wide text-slate-500">{label}</span>
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold" style={{ color }}>{icon}{value}</span>
    </div>
  );
  return (
    <div className="flex w-full flex-col gap-2 text-slate-800">
      <div className="flex items-stretch gap-1 text-[10px]">
        {part("Principal", <UiUser />, "Analyst", ROLES.external.header)}
        <span className="self-center text-slate-400">+</span>
        {part("Role", <UiKey />, "Investigator", SEC.header)}
        <span className="self-center text-slate-400">@</span>
        {part("Scope", <UiFolder />, "Tenant · acme", ROLES.new.header)}
      </div>
      <ol className="space-y-0.5 pl-1 text-[9px]">
        {SCOPES.map((scope, depth) => (
          <li key={scope} className="flex items-center gap-1" style={{ paddingLeft: depth * 12 }}>
            <UiFolder className="text-slate-400" />
            <span className={depth === 1 ? "font-semibold text-slate-800" : "text-slate-500"}>{scope}</span>
            {depth === 1 && <span className="rounded px-1 text-[8px] font-semibold text-white" style={{ backgroundColor: SEC.header }}>assigned</span>}
            {depth === 2 && <span className="text-[8px] italic text-slate-500">inherits Investigator</span>}
            {depth === 0 && <span className="text-[8px] text-slate-400">no access</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function PolicyRule() {
  const row = (label: string, value: ReactNode) => (
    <div className="grid grid-cols-[64px_1fr] items-baseline gap-2 border-t border-slate-100 px-2 py-0.5">
      <span className="text-[8px] uppercase tracking-wide text-slate-500">{label}</span>
      <span>{value}</span>
    </div>
  );
  return (
    <div className="w-full overflow-hidden rounded border bg-white" style={{ borderColor: SEC.border }}>
      <div className="flex items-center gap-1.5 px-2 py-1" style={{ backgroundColor: SEC.body }}>
        <span className="rounded px-1 text-[8px] font-bold uppercase text-white" style={{ backgroundColor: ROLES.existing.header }}>permit</span>
        <span className="text-[10px] font-semibold text-slate-800">Same-tenant telemetry export</span>
      </div>
      {row("Principal", <Mono className="text-slate-700">principal in Group::"investigators"</Mono>)}
      {row("Action", <Mono className="text-slate-700">telemetry.export</Mono>)}
      {row("Resource", <Mono className="text-slate-700">resource is Dataset</Mono>)}
      {row(
        "When",
        <span className="flex flex-col">
          <Mono className="text-slate-700">principal.tenant == resource.tenant</Mono>
          <Mono className="text-slate-700">resource.sensitivity &lt;= principal.clearance</Mono>
          <Mono className="text-slate-700">context.mfa == true</Mono>
        </span>,
      )}
    </div>
  );
}

const DECISIONS: { cells: string[]; effect: "Permit" | "Deny" }[] = [
  { cells: ["= resource", "≥ sensitivity", "yes"], effect: "Permit" },
  { cells: ["= resource", "≥ sensitivity", "no"], effect: "Deny" },
  { cells: ["≠ resource", "any", "any"], effect: "Deny" },
  { cells: ["any", "< sensitivity", "any"], effect: "Deny" },
];

function DecisionTable() {
  const head = ["Subject tenant", "Clearance", "MFA"];
  return (
    <table className="w-full border-collapse bg-white text-[9.5px]">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500">
          <th className="py-1 pl-2 text-left font-medium">#</th>
          {head.map((h) => <th key={h} className="py-1 text-left font-medium">{h}</th>)}
          <th className="py-1 pr-2 text-right font-medium">Effect</th>
        </tr>
      </thead>
      <tbody>
        {DECISIONS.map(({ cells, effect }, i) => (
          <tr key={i} className="border-b border-slate-100">
            <td className="py-0.5 pl-2 text-slate-400">{i + 1}</td>
            {cells.map((c, j) => <td key={j} className="py-0.5"><Mono className="text-slate-700">{c}</Mono></td>)}
            <td className="py-0.5 pr-2 text-right font-semibold" style={{ color: effect === "Permit" ? ROLES.existing.header : SEC.header }}>{effect}</td>
          </tr>
        ))}
        <tr className="text-slate-500">
          <td className="py-0.5 pl-2">·</td>
          <td colSpan={3} className="py-0.5 italic">no rule matched</td>
          <td className="py-0.5 pr-2 text-right font-semibold" style={{ color: SEC.header }}>Deny</td>
        </tr>
      </tbody>
    </table>
  );
}

export function AuthorizationModels() {
  return (
    <Sheet columns={2} intro="Draw an authorization model as the data it is — grants, assignments, rules — not as a flow. Arrows belong only to the decision topology and delegation below, where policy authorities, local decision points and enforcing services are distinct.">
      <Swatch name="authorization/rbac-matrix" note="Roles × permissions; a column is everything one role grants." height={130}>
        <PermissionMatrix />
      </Swatch>
      <Swatch name="authorization/rbac-assignment" note="Principal + role + scope; the grant inherits down the resource hierarchy." height={130}>
        <RoleAssignment />
      </Swatch>
      <Swatch name="authorization/abac-rule" note="One permit statement: who, what, on which resource, and the attribute conditions." height={175}>
        <PolicyRule />
      </Swatch>
      <Swatch name="authorization/abac-table" note="Attribute combinations resolve to an effect; first match wins, otherwise deny." height={175}>
        <DecisionTable />
      </Swatch>
      <div className="col-span-2">
        <Swatch name="topology/decentralized" note="Two independent authorities distribute policies to local PDPs; each service enforces its own decision." height={150}>
          <DistributedPolicy />
        </Swatch>
      </div>
      <div className="col-span-2">
        <Swatch name="topology/delegated" note="The issuer exchanges a scoped token; the service checks the distinct subject and actor, audience and scope." height={170}>
          <DelegatedAccess />
        </Swatch>
      </div>
    </Sheet>
  );
}

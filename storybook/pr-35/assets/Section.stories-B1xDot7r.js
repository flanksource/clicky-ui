import{j as e}from"./iframe-BbITQAD0.js";import{S as o}from"./Section-CgRkIFTt.js";import{U as j}from"./UiError-CoIZd9H0.js";import"./preload-helper-C67fKNjI.js";import"./utils-BLSKlp9E.js";import"./Icon-BV_HrUof.js";import"./UiChevronDown-B6dH09FW.js";import"./UiChevronRight-YoKvm1yT.js";const F={title:"Layout/Section",component:o,args:{title:"Configuration",summary:"4 items",defaultOpen:!0,tone:"default",children:e.jsxs("ul",{className:"text-sm space-y-density-1",children:[e.jsx("li",{children:"key = value"}),e.jsx("li",{children:"timeout = 30s"}),e.jsx("li",{children:"retries = 3"}),e.jsx("li",{children:"mode = strict"})]})},argTypes:{tone:{control:"inline-radio",options:["default","danger","warning","success","info"]},collapsible:{control:"boolean"},icon:{table:{disable:!0}},children:{table:{disable:!0}},onToggle:{table:{disable:!0}}},parameters:{docs:{description:{component:"Collapsible layout section for dense detail screens. It supports controlled or uncontrolled open state, summaries, icons, semantic tone accents, and custom header/body classes. Only the chevron + title toggle — the summary is a sibling of the toggle, so a summary containing its own interactive content (filters, links) is valid DOM and its clicks do not collapse the section. Pass `collapsible={false}` for a fixed panel that always shows its body."}}}},s={},t={render:()=>e.jsx("div",{className:"space-y-density-2",children:e.jsxs(o,{title:"Metadata",summary:"3 fields",defaultOpen:!0,children:[e.jsx(o,{title:"Created",summary:"2026-01-01",defaultOpen:!0,children:e.jsx("span",{className:"text-xs",children:"by alice"})}),e.jsx(o,{title:"Updated",summary:"2026-04-12",children:e.jsx("span",{className:"text-xs",children:"by bob"})})]})})},a={args:{title:"Errors",tone:"danger",summary:"3 violations",defaultOpen:!0,icon:j,children:e.jsx("div",{className:"text-sm",children:"Stack traces here."})}},r={args:{title:"Activities",defaultOpen:!0,summary:e.jsx("span",{className:"inline-flex gap-density-1",children:["All","OK","Failed"].map(i=>e.jsx("button",{type:"button",className:"rounded border border-border px-density-2 py-px text-xs hover:bg-accent/50",children:i},i))})}},n={args:{title:"Fixed Panel",collapsible:!1,summary:"always open"}};var l,c,d;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:"{}",...(d=(c=s.parameters)==null?void 0:c.docs)==null?void 0:d.source}}};var m,p,u;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <div className="space-y-density-2">
      <Section title="Metadata" summary="3 fields" defaultOpen>
        <Section title="Created" summary="2026-01-01" defaultOpen>
          <span className="text-xs">by alice</span>
        </Section>
        <Section title="Updated" summary="2026-04-12">
          <span className="text-xs">by bob</span>
        </Section>
      </Section>
    </div>
}`,...(u=(p=t.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var y,x,b;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    title: "Errors",
    tone: "danger",
    summary: "3 violations",
    defaultOpen: true,
    icon: UiError,
    children: <div className="text-sm">Stack traces here.</div>
  }
}`,...(b=(x=a.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var g,f,h;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    title: "Activities",
    defaultOpen: true,
    summary: <span className="inline-flex gap-density-1">
        {["All", "OK", "Failed"].map(label => <button key={label} type="button" className="rounded border border-border px-density-2 py-px text-xs hover:bg-accent/50">
            {label}
          </button>)}
      </span>
  }
}`,...(h=(f=r.parameters)==null?void 0:f.docs)==null?void 0:h.source}}};var v,S,N;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    title: "Fixed Panel",
    collapsible: false,
    summary: "always open"
  }
}`,...(N=(S=n.parameters)==null?void 0:S.docs)==null?void 0:N.source}}};const T=["Default","Nested","DangerTone","InteractiveSummary","NonCollapsible"];export{a as DangerTone,s as Default,r as InteractiveSummary,t as Nested,n as NonCollapsible,T as __namedExportsOrder,F as default};

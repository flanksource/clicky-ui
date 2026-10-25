import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{Hs as n,n as r}from"./icons-N6BqLuiz.js";import{n as i,r as a}from"./Section-DGNSPUCf.js";var o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{r(),a(),o=t(),s={title:`Layout/Section`,component:i,args:{title:`Configuration`,summary:`4 items`,defaultOpen:!0,tone:`default`,children:(0,o.jsxs)(`ul`,{className:`text-sm space-y-density-1`,children:[(0,o.jsx)(`li`,{children:`key = value`}),(0,o.jsx)(`li`,{children:`timeout = 30s`}),(0,o.jsx)(`li`,{children:`retries = 3`}),(0,o.jsx)(`li`,{children:`mode = strict`})]})},argTypes:{tone:{control:`inline-radio`,options:[`default`,`danger`,`warning`,`success`,`info`]},collapsible:{control:`boolean`},icon:{table:{disable:!0}},children:{table:{disable:!0}},onToggle:{table:{disable:!0}}},parameters:{docs:{description:{component:"Collapsible layout section for dense detail screens. It supports controlled or uncontrolled open state, summaries, icons, semantic tone accents, and custom header/body classes. Only the chevron + title toggle — the summary is a sibling of the toggle, so a summary containing its own interactive content (filters, links) is valid DOM and its clicks do not collapse the section. Pass `collapsible={false}` for a fixed panel that always shows its body."}}}},c={},l={render:()=>(0,o.jsx)(`div`,{className:`space-y-density-2`,children:(0,o.jsxs)(i,{title:`Metadata`,summary:`3 fields`,defaultOpen:!0,children:[(0,o.jsx)(i,{title:`Created`,summary:`2026-01-01`,defaultOpen:!0,children:(0,o.jsx)(`span`,{className:`text-xs`,children:`by alice`})}),(0,o.jsx)(i,{title:`Updated`,summary:`2026-04-12`,children:(0,o.jsx)(`span`,{className:`text-xs`,children:`by bob`})})]})})},u={args:{title:`Errors`,tone:`danger`,summary:`3 violations`,defaultOpen:!0,icon:n,children:(0,o.jsx)(`div`,{className:`text-sm`,children:`Stack traces here.`})}},d={args:{title:`Activities`,defaultOpen:!0,summary:(0,o.jsx)(`span`,{className:`inline-flex gap-density-1`,children:[`All`,`OK`,`Failed`].map(e=>(0,o.jsx)(`button`,{type:`button`,className:`rounded border border-border px-density-2 py-px text-xs hover:bg-accent/50`,children:e},e))})}},f={args:{title:`Fixed Panel`,collapsible:!1,summary:`always open`}},p=[`Default`,`Nested`,`DangerTone`,`InteractiveSummary`,`NonCollapsible`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Errors",
    tone: "danger",
    summary: "3 violations",
    defaultOpen: true,
    icon: UiError,
    children: <div className="text-sm">Stack traces here.</div>
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Activities",
    defaultOpen: true,
    summary: <span className="inline-flex gap-density-1">
        {["All", "OK", "Failed"].map(label => <button key={label} type="button" className="rounded border border-border px-density-2 py-px text-xs hover:bg-accent/50">
            {label}
          </button>)}
      </span>
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Fixed Panel",
    collapsible: false,
    summary: "always open"
  }
}`,...f.parameters?.docs?.source}}}})))()}m();export{u as DangerTone,c as Default,d as InteractiveSummary,l as Nested,f as NonCollapsible,p as __namedExportsOrder,s as default};
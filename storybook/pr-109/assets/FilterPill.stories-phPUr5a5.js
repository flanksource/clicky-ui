import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{i as r,n as i,r as a,t as o}from"./FilterPill-CoRZydJM.js";var s,c,l,u,d,f,p;function m(){return(m=e((()=>{s=t(),r(),c=n(),l={title:`Data/FilterPill`,component:o,args:{label:`env=prod`,mode:`include`,count:3,togglePosition:`left`},argTypes:{mode:{control:`inline-radio`,options:[`neutral`,`active`,`include`,`exclude`],description:"Visual/semantic state. `active`/`neutral` are the binary states; `include`/`exclude` are the tri-state toggle states.",table:{category:`State`,defaultValue:{summary:`neutral`}}},label:{control:`text`,table:{category:`Content`}},count:{control:`number`,description:`Optional count badge rendered before the label.`,table:{category:`Content`}},badge:{control:`text`,description:"Tailwind class for the count badge background, e.g. `bg-red-500`.",table:{category:`Content`}},togglePosition:{control:`inline-radio`,options:[`left`,`right`],description:`Places the tri-state toggle before or after the label.`,table:{category:`Tri-state`,defaultValue:{summary:`left`}}},title:{control:`text`,table:{category:`Content`}},icon:{control:!1,table:{category:`Content`}},onClick:{control:!1,table:{category:`Events`}},onModeChange:{control:!1,table:{category:`Events`}}},parameters:{docs:{description:{component:'Compact filter-state chip used by DataTable and FilterBar filters.\n\n**Two modes of operation**\n- **Binary** — pass `onClick` and toggle `mode` between `active` and `neutral`. Renders as a single button with a leading dot.\n- **Tri-state** — pass `onModeChange` to render an include/exclude toggle. Clicking the label cycles neutral → include → exclude → neutral; clicking a toggle side sets that state directly.\n\n**Usage**\n```tsx\n// binary\n<FilterPill label="Failed" count={3} badge="bg-red-500"\n  mode={active ? "active" : "neutral"} onClick={toggle} />\n\n// tri-state\n<FilterPill label="jest" mode={mode} onModeChange={setMode} />\n```\n\nWrap pills in `<FilterPillGroup>` and separate clusters with `<FilterSeparator />`.'}}}},u={parameters:{docs:{description:{story:"Drive a single binary pill from the controls panel. The tri-state toggle requires `onModeChange` — see the **TriState** story for that interaction."}}},render:e=>(0,c.jsx)(i,{children:(0,c.jsx)(o,{...e})})},d={render:()=>{let[e,t]=(0,s.useState)({failed:!0});return(0,c.jsx)(i,{children:[{key:`failed`,label:`Failed`,count:3,badge:`bg-red-500`},{key:`passed`,label:`Passed`,count:42,badge:`bg-green-500`},{key:`skipped`,label:`Skipped`,count:5,badge:`bg-yellow-400`}].map(n=>(0,c.jsx)(o,{label:n.label,count:n.count,badge:n.badge,mode:e[n.key]?`active`:`neutral`,onClick:()=>t(e=>({...e,[n.key]:!e[n.key]}))},n.key))})}},f={render:()=>{let[e,t]=(0,s.useState)({});return(0,c.jsxs)(i,{children:[[`jest`,`ginkgo`,`pytest`].map(n=>(0,c.jsx)(o,{label:n,mode:e[n]??`neutral`,onModeChange:e=>t(t=>({...t,[n]:e}))},n)),(0,c.jsx)(a,{}),[`linter`,`vet`].map(n=>(0,c.jsx)(o,{label:n,mode:e[n]??`neutral`,onModeChange:e=>t(t=>({...t,[n]:e}))},n))]})}},p=[`Playground`,`Binary`,`TriState`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Drive a single binary pill from the controls panel. The tri-state toggle requires \`onModeChange\` — see the **TriState** story for that interaction."
      }
    }
  },
  render: args => <FilterPillGroup>
      <FilterPill {...args} />
    </FilterPillGroup>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [active, setActive] = useState<Record<string, boolean>>({
      failed: true
    });
    return <FilterPillGroup>
        {[{
        key: "failed",
        label: "Failed",
        count: 3,
        badge: "bg-red-500"
      }, {
        key: "passed",
        label: "Passed",
        count: 42,
        badge: "bg-green-500"
      }, {
        key: "skipped",
        label: "Skipped",
        count: 5,
        badge: "bg-yellow-400"
      }].map(f => <FilterPill key={f.key} label={f.label} count={f.count} badge={f.badge} mode={active[f.key] ? "active" : "neutral"} onClick={() => setActive(a => ({
        ...a,
        [f.key]: !a[f.key]
      }))} />)}
      </FilterPillGroup>;
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [modes, setModes] = useState<Record<string, FilterMode>>({});
    return <FilterPillGroup>
        {["jest", "ginkgo", "pytest"].map(fw => <FilterPill key={fw} label={fw} mode={modes[fw] ?? "neutral"} onModeChange={next => setModes(s => ({
        ...s,
        [fw]: next
      }))} />)}
        <FilterSeparator />
        {["linter", "vet"].map(l => <FilterPill key={l} label={l} mode={modes[l] ?? "neutral"} onModeChange={next => setModes(s => ({
        ...s,
        [l]: next
      }))} />)}
      </FilterPillGroup>;
  }
}`,...f.parameters?.docs?.source}}}})))()}m();export{d as Binary,u as Playground,f as TriState,p as __namedExportsOrder,l as default};
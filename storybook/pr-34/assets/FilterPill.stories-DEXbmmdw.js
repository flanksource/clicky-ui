import{r as x,j as t}from"./iframe-Ch1BYoLl.js";import{F as n,a as c,b as F}from"./FilterPill-BGPZ3wsp.js";import"./preload-helper-B4w--iqy.js";import"./utils-BLSKlp9E.js";import"./Icon-CajlMFHd.js";import"./UiAdd-CvQNATwt.js";import"./UiRemove-DUUyKYfT.js";import"./UiClose-B7EVqjbt.js";import"./UiCheck-D5P45Pjn.js";const E={title:"Data/FilterPill",component:n,args:{label:"env=prod",mode:"include",count:3,togglePosition:"left"},argTypes:{mode:{control:"inline-radio",options:["neutral","active","include","exclude"],description:"Visual/semantic state. `active`/`neutral` are the binary states; `include`/`exclude` are the tri-state toggle states.",table:{category:"State",defaultValue:{summary:"neutral"}}},label:{control:"text",table:{category:"Content"}},count:{control:"number",description:"Optional count badge rendered before the label.",table:{category:"Content"}},badge:{control:"text",description:"Tailwind class for the count badge background, e.g. `bg-red-500`.",table:{category:"Content"}},togglePosition:{control:"inline-radio",options:["left","right"],description:"Places the tri-state toggle before or after the label.",table:{category:"Tri-state",defaultValue:{summary:"left"}}},title:{control:"text",table:{category:"Content"}},icon:{control:!1,table:{category:"Content"}},onClick:{control:!1,table:{category:"Events"}},onModeChange:{control:!1,table:{category:"Events"}}},parameters:{docs:{description:{component:["Compact filter-state chip used by DataTable and FilterBar filters.","","**Two modes of operation**","- **Binary** — pass `onClick` and toggle `mode` between `active` and `neutral`. Renders as a single button with a leading dot.","- **Tri-state** — pass `onModeChange` to render an include/exclude toggle. Clicking the label cycles neutral → include → exclude → neutral; clicking a toggle side sets that state directly.","","**Usage**","```tsx","// binary",'<FilterPill label="Failed" count={3} badge="bg-red-500"','  mode={active ? "active" : "neutral"} onClick={toggle} />',"","// tri-state",'<FilterPill label="jest" mode={mode} onModeChange={setMode} />',"```","","Wrap pills in `<FilterPillGroup>` and separate clusters with `<FilterSeparator />`."].join(`
`)}}}},l={parameters:{docs:{description:{story:"Drive a single binary pill from the controls panel. The tri-state toggle requires `onModeChange` — see the **TriState** story for that interaction."}}},render:a=>t.jsx(c,{children:t.jsx(n,{...a})})},i={render:()=>{const[a,o]=x.useState({failed:!0});return t.jsx(c,{children:[{key:"failed",label:"Failed",count:3,badge:"bg-red-500"},{key:"passed",label:"Passed",count:42,badge:"bg-green-500"},{key:"skipped",label:"Skipped",count:5,badge:"bg-yellow-400"}].map(e=>t.jsx(n,{label:e.label,count:e.count,badge:e.badge,mode:a[e.key]?"active":"neutral",onClick:()=>o(r=>({...r,[e.key]:!r[e.key]}))},e.key))})}},s={render:()=>{const[a,o]=x.useState({});return t.jsxs(c,{children:[["jest","ginkgo","pytest"].map(e=>t.jsx(n,{label:e,mode:a[e]??"neutral",onModeChange:r=>o(d=>({...d,[e]:r}))},e)),t.jsx(F,{}),["linter","vet"].map(e=>t.jsx(n,{label:e,mode:a[e]??"neutral",onModeChange:r=>o(d=>({...d,[e]:r}))},e))]})}};var g,p,u;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(u=(p=l.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var b,m,y;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(y=(m=i.parameters)==null?void 0:m.docs)==null?void 0:y.source}}};var h,k,f;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(f=(k=s.parameters)==null?void 0:k.docs)==null?void 0:f.source}}};const B=["Playground","Binary","TriState"];export{i as Binary,l as Playground,s as TriState,B as __namedExportsOrder,E as default};

import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./Modal-D0XTA801.js";import{n as a,t as o}from"./Combobox-y772tUlB.js";function s(){let[e,t]=(0,l.useState)(``);return(0,u.jsx)(`div`,{className:`w-64`,children:(0,u.jsx)(o,{placeholder:`Select database`,value:e,onChange:t,options:d})})}function c({multiple:e,tristate:t,variant:n,...r}){let[i,a]=(0,l.useState)(``),[s,c]=(0,l.useState)([]),[d,f]=(0,l.useState)({}),p=t?d:e?s:i,m=n?{variant:n}:{};return(0,u.jsxs)(`div`,{className:`w-96 space-y-3`,children:[t?(0,u.jsx)(o,{...r,...m,multiple:!0,tristate:!0,value:d,onChange:f}):e?(0,u.jsx)(o,{...r,...m,multiple:!0,value:s,onChange:c}):(0,u.jsx)(o,{...r,value:i,onChange:a}),(0,u.jsxs)(`div`,{className:`rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs`,children:[`value=`,JSON.stringify(p)]})]})}var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{l=t(),a(),r(),u=n(),d=[{value:`PrimaryDB`,label:`PrimaryDB`},{value:`ArchiveDB`,label:`ArchiveDB`},{value:`IVS`,label:`IVS`},{value:`ReportServer`,label:`ReportServer`}],f={title:`Components/Combobox`,component:o,render:()=>(0,u.jsx)(s,{}),args:{options:d,value:``,placeholder:`Select database`,disabled:!1,loading:!1,onChange:()=>void 0},argTypes:{placeholder:{control:`text`,table:{category:`Appearance`}},multiple:{control:`boolean`,table:{category:`Mode`}},tristate:{control:`boolean`,table:{category:`Mode`}},variant:{control:`inline-radio`,options:[`default`,`tags`],table:{category:`Mode`}},disabled:{control:`boolean`,table:{category:`Behavior`}},required:{control:`boolean`,table:{category:`Behavior`}},loading:{control:`boolean`,table:{category:`Behavior`}},value:{control:!1,table:{category:`Value`}},options:{control:!1,table:{category:`Value`}},onChange:{control:!1,table:{category:`Events`}}}},p={},m={parameters:{docs:{description:{story:'Every mode from one panel: **Mode → multiple / tristate / variant**. The value shape follows the mode — a string, a `string[]`, or a `Record<value, "include" | "exclude">` — and the box below shows what the control actually commits.'}}},render:e=>(0,u.jsx)(c,{...e})},h={render:()=>{let[e,t]=(0,l.useState)(``);return(0,u.jsx)(`div`,{className:`w-64`,children:(0,u.jsx)(o,{placeholder:`Loading databases…`,value:e,onChange:t,options:[],loading:!0})})}},g={render:()=>(0,u.jsx)(`div`,{className:`w-64`,children:(0,u.jsx)(o,{placeholder:`Select database`,value:`PrimaryDB`,onChange:()=>{},options:d,disabled:!0})})},_={render:()=>{let[e,t]=(0,l.useState)(`PrimaryDB`);return(0,u.jsx)(`div`,{className:`w-64`,children:(0,u.jsx)(o,{placeholder:`Select database`,value:e,onChange:t,options:d})})}},v={render:()=>{let[e,t]=(0,l.useState)(`PrimaryDB`);return(0,u.jsx)(`div`,{className:`w-64`,children:(0,u.jsx)(o,{placeholder:`Select database`,value:e,onChange:t,options:d,required:!0})})}},y={render:()=>{let[e,t]=(0,l.useState)(``);return(0,u.jsx)(`div`,{className:`w-64`,children:(0,u.jsx)(o,{label:`Database`,value:e,onChange:t,options:d})})}},b={render:()=>{let[e,t]=(0,l.useState)(``);return(0,u.jsxs)(`div`,{className:`w-64 space-y-3`,children:[(0,u.jsx)(o,{label:`Database`,placeholder:`Pick one`,value:e,onChange:t,options:d,allowCustomValue:!1}),(0,u.jsxs)(`div`,{className:`rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs`,children:[`value=`,JSON.stringify(e)]})]})}},x={parameters:{docs:{description:{story:"The dropdown portals to `document.body` and is positioned with fixed coordinates, so it floats above the dialog and is not clipped by the modal body's `overflow-auto`. Open the dialog, then open the Combobox — the option list extends past the dialog's edge."}}},render:()=>{let[e,t]=(0,l.useState)(!0),[n,r]=(0,l.useState)(``);return(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`button`,{type:`button`,className:`rounded-md border border-border px-3 py-1.5 text-sm`,onClick:()=>t(!0),children:`Open dialog`}),(0,u.jsx)(i,{open:e,onClose:()=>t(!1),title:`Edit connection`,size:`sm`,children:(0,u.jsxs)(`div`,{className:`space-y-3`,children:[(0,u.jsx)(`label`,{className:`block text-sm font-medium`,children:`Database`}),(0,u.jsx)(o,{placeholder:`Select database`,value:n,onChange:r,options:d}),(0,u.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:`The dropdown should overflow the dialog without being clipped.`})]})})]})}},S={render:()=>{let[e,t]=(0,l.useState)([]);return(0,u.jsxs)(`div`,{className:`w-64 space-y-3`,children:[(0,u.jsx)(o,{multiple:!0,label:`Databases`,placeholder:`Pick databases`,value:e,onChange:t,options:d,allowCustomValue:!1}),(0,u.jsxs)(`div`,{className:`rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs`,children:[`value=`,JSON.stringify(e)]})]})}},C={parameters:{docs:{description:{story:`Multi-select keeps existing choices while allowing values outside the current option page. Type a new database name and choose the Add option.`}}},render:()=>{let[e,t]=(0,l.useState)([`PrimaryDB`]);return(0,u.jsxs)(`div`,{className:`w-64 space-y-3`,children:[(0,u.jsx)(o,{multiple:!0,label:`Databases`,placeholder:`Pick or add databases`,value:e,onChange:t,options:d}),(0,u.jsxs)(`div`,{className:`rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs`,children:[`value=`,JSON.stringify(e)]})]})}},w={parameters:{docs:{description:{story:`The tags variant keeps every selected value visible as a removable pill while the inline input searches or creates another value.`}}},render:()=>{let[e,t]=(0,l.useState)([`PrimaryDB`,`ArchiveDB`,`analytics-replica`]);return(0,u.jsxs)(`div`,{className:`w-96 space-y-3`,children:[(0,u.jsx)(o,{multiple:!0,variant:`tags`,label:`Databases`,placeholder:`Pick or add databases`,value:e,onChange:t,options:d}),(0,u.jsxs)(`div`,{className:`rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs`,children:[`value=`,JSON.stringify(e)]})]})}},T={parameters:{docs:{description:{story:'Tristate keeps a `Record<value, "include" | "exclude">` rather than a list, and `variant: "tags"` shows that record in the field: one pill per value, coloured by its mode. Clicking a pill flips include ↔ exclude; its close button returns the value to neutral (dropping it from the record). Without the variant the same control collapses to a `+n -n` summary — what the FilterBar\'s multi filter uses.'}}},render:()=>{let[e,t]=(0,l.useState)({PrimaryDB:`include`,ArchiveDB:`exclude`});return(0,u.jsxs)(`div`,{className:`w-96 space-y-3`,children:[(0,u.jsx)(o,{multiple:!0,tristate:!0,variant:`tags`,label:`Databases`,placeholder:`Include or exclude databases`,value:e,onChange:t,options:d}),(0,u.jsxs)(`div`,{className:`rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs`,children:[`value=`,JSON.stringify(e)]})]})}},E=[{value:`aws`,label:`AWS`,icon:(0,u.jsx)(`span`,{"aria-hidden":!0,children:`🟧`})},{value:`gcp`,label:`Google Cloud`,icon:(0,u.jsx)(`span`,{"aria-hidden":!0,children:`🔵`})},{value:`azure`,label:`Azure`,icon:(0,u.jsx)(`span`,{"aria-hidden":!0,children:`🟦`})}],D={parameters:{docs:{description:{story:"Each `ComboboxOption` may carry an `icon` — a runtime icon name (resolved by the registered fallback provider) or a rendered node — shown before the option label in the list."}}},render:()=>{let[e,t]=(0,l.useState)(``);return(0,u.jsx)(`div`,{className:`w-64`,children:(0,u.jsx)(o,{label:`Provider`,placeholder:`Select a cloud`,value:e,onChange:t,options:E})})}},O=[{value:`demo-svc`,label:`demo-svc`,group:`Service`,icon:(0,u.jsx)(`span`,{"aria-hidden":!0,children:`🟦`})},{value:`db-svc`,label:`db-svc`,group:`Service`,icon:(0,u.jsx)(`span`,{"aria-hidden":!0,children:`🟦`})},{value:`demo-ing`,label:`demo-ing (demo.example.com)`,group:`Ingress`,icon:(0,u.jsx)(`span`,{"aria-hidden":!0,children:`🌐`})},{value:`demo-web`,label:`demo-web`,group:`Deployment`,icon:(0,u.jsx)(`span`,{"aria-hidden":!0,children:`📦`})},{value:`demo-cycle`,label:`demo-cycle`,group:`StatefulSet`,icon:(0,u.jsx)(`span`,{"aria-hidden":!0,children:`🗄️`})}],k={parameters:{docs:{description:{story:"Options carrying a `group` render a non-interactive section header above the first option of each group (grouped by contiguous `group` value, in the order provided). Open the menu to see the four `Service` / `Ingress` / `Deployment` / `StatefulSet` headers. Headers are derived from the *filtered* options, so typing a query that empties a group also hides its header, and keyboard navigation skips headers entirely."}}},render:()=>{let[e,t]=(0,l.useState)(``);return(0,u.jsxs)(`div`,{className:`w-72 space-y-3`,children:[(0,u.jsx)(o,{label:`Workload`,placeholder:`Select workload / service…`,value:e,onChange:t,options:O}),(0,u.jsxs)(`div`,{className:`rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs`,children:[`value=`,JSON.stringify(e)]})]})}},A=[{value:`recommended`,label:`(recommended default)`},{value:`none`,label:`(none)`},{value:`demo-svc`,label:`demo-svc`,group:`Service`},{value:`demo-ing`,label:`demo-ing`,group:`Ingress`}],j={parameters:{docs:{description:{story:"`group` is optional. Options without a `group` render no header — place them first so the ungrouped entries read as a lead-in before the first grouped section. Mixing ungrouped and grouped options in one list is supported."}}},render:()=>{let[e,t]=(0,l.useState)(``);return(0,u.jsxs)(`div`,{className:`w-72 space-y-3`,children:[(0,u.jsx)(o,{label:`Backend`,placeholder:`Pick a backend`,value:e,onChange:t,options:A}),(0,u.jsxs)(`div`,{className:`rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs`,children:[`value=`,JSON.stringify(e)]})]})}},M=[`Default`,`Playground`,`Loading`,`Disabled`,`Clearable`,`Required`,`WithInlineLabel`,`Strict`,`InsideDialog`,`Multiple`,`CreatableMultiple`,`Tags`,`TriStateTags`,`OptionIcons`,`Grouped`,`MixedGrouping`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Every mode from one panel: **Mode → multiple / tristate / variant**. The value shape follows the mode — a string, a \`string[]\`, or a \`Record<value, \\"include\\" | \\"exclude\\">\` — and the box below shows what the control actually commits."
      }
    }
  },
  render: args => <ComboboxPlayground {...args} />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64">
        <Combobox placeholder="Loading databases…" value={value} onChange={setValue} options={[]} loading />
      </div>;
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-64">
      <Combobox placeholder="Select database" value="PrimaryDB" onChange={() => {}} options={DATABASE_OPTIONS} disabled />
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("PrimaryDB");
    return <div className="w-64">
        <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
      </div>;
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("PrimaryDB");
    return <div className="w-64">
        <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} required />
      </div>;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64">
        <Combobox label="Database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
      </div>;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64 space-y-3">
        <Combobox label="Database" placeholder="Pick one" value={value} onChange={setValue} options={DATABASE_OPTIONS} allowCustomValue={false} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "The dropdown portals to \`document.body\` and is positioned with fixed coordinates, so it floats above the dialog and is not clipped by the modal body's \`overflow-auto\`. Open the dialog, then open the Combobox — the option list extends past the dialog's edge."
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(true);
    const [value, setValue] = useState("");
    return <div>
        <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm" onClick={() => setOpen(true)}>
          Open dialog
        </button>
        <Modal open={open} onClose={() => setOpen(false)} title="Edit connection" size="sm">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Database</label>
            <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
            <p className="text-xs text-muted-foreground">
              The dropdown should overflow the dialog without being clipped.
            </p>
          </div>
        </Modal>
      </div>;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <div className="w-64 space-y-3">
        <Combobox multiple label="Databases" placeholder="Pick databases" value={value} onChange={setValue} options={DATABASE_OPTIONS} allowCustomValue={false} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Multi-select keeps existing choices while allowing values outside the current option page. Type a new database name and choose the Add option."
      }
    }
  },
  render: () => {
    const [value, setValue] = useState<string[]>(["PrimaryDB"]);
    return <div className="w-64 space-y-3">
        <Combobox multiple label="Databases" placeholder="Pick or add databases" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "The tags variant keeps every selected value visible as a removable pill while the inline input searches or creates another value."
      }
    }
  },
  render: () => {
    const [value, setValue] = useState<string[]>(["PrimaryDB", "ArchiveDB", "analytics-replica"]);
    return <div className="w-96 space-y-3">
        <Combobox multiple variant="tags" label="Databases" placeholder="Pick or add databases" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Tristate keeps a \`Record<value, \\"include\\" | \\"exclude\\">\` rather than a list, and \`variant: \\"tags\\"\` shows that record in the field: one pill per value, coloured by its mode. Clicking a pill flips include ↔ exclude; its close button returns the value to neutral (dropping it from the record). Without the variant the same control collapses to a \`+n -n\` summary — what the FilterBar's multi filter uses."
      }
    }
  },
  render: () => {
    const [modes, setModes] = useState<Record<string, ComboboxTriStateMode>>({
      PrimaryDB: "include",
      ArchiveDB: "exclude"
    });
    return <div className="w-96 space-y-3">
        <Combobox multiple tristate variant="tags" label="Databases" placeholder="Include or exclude databases" value={modes} onChange={setModes} options={DATABASE_OPTIONS} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(modes)}
        </div>
      </div>;
  }
}`,...T.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Each \`ComboboxOption\` may carry an \`icon\` — a runtime icon name (resolved by the registered fallback provider) or a rendered node — shown before the option label in the list."
      }
    }
  },
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64">
        <Combobox label="Provider" placeholder="Select a cloud" value={value} onChange={setValue} options={CLOUD_OPTIONS} />
      </div>;
  }
}`,...D.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Options carrying a \`group\` render a non-interactive section header above the first option of each group (grouped by contiguous \`group\` value, in the order provided). Open the menu to see the four \`Service\` / \`Ingress\` / \`Deployment\` / \`StatefulSet\` headers. Headers are derived from the *filtered* options, so typing a query that empties a group also hides its header, and keyboard navigation skips headers entirely."
      }
    }
  },
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-72 space-y-3">
        <Combobox label="Workload" placeholder="Select workload / service…" value={value} onChange={setValue} options={GROUPED_OPTIONS} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...k.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "\`group\` is optional. Options without a \`group\` render no header — place them first so the ungrouped entries read as a lead-in before the first grouped section. Mixing ungrouped and grouped options in one list is supported."
      }
    }
  },
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-72 space-y-3">
        <Combobox label="Backend" placeholder="Pick a backend" value={value} onChange={setValue} options={MIXED_GROUP_OPTIONS} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...j.parameters?.docs?.source}}}})))()}N();export{_ as Clearable,C as CreatableMultiple,p as Default,g as Disabled,k as Grouped,x as InsideDialog,h as Loading,j as MixedGrouping,S as Multiple,D as OptionIcons,m as Playground,v as Required,b as Strict,w as Tags,T as TriStateTags,y as WithInlineLabel,M as __namedExportsOrder,f as default};
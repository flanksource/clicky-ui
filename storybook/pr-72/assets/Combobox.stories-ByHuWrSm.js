import{r as s,j as e}from"./iframe-B_zRd-Wy.js";import{C as r}from"./Combobox-DDpl6Soq.js";import{M as De}from"./Modal-DBGye44F.js";import"./preload-helper-Dy2teTf6.js";import"./utils-DW-IJACk.js";import"./Icon-CL04iPIR.js";import"./modalStack-FiA0edkU.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-DOFYB3hq.js";import"./index-5BdIEgAK.js";import"./index-H37-8Ifz.js";import"./button-DQyvef4I.js";import"./index-CPURVhFy.js";import"./loading-CRKXYVmY.js";const t=[{value:"PrimaryDB",label:"PrimaryDB"},{value:"ArchiveDB",label:"ArchiveDB"},{value:"IVS",label:"IVS"},{value:"ReportServer",label:"ReportServer"}];function je(){const[a,o]=s.useState("");return e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Select database",value:a,onChange:o,options:t})})}function Pe({multiple:a,tristate:o,variant:l,...n}){const[w,Ne]=s.useState(""),[O,Ce]=s.useState([]),[D,we]=s.useState({}),Oe=o?D:a?O:w,j=l?{variant:l}:{};return e.jsxs("div",{className:"w-96 space-y-3",children:[o?e.jsx(r,{...n,...j,multiple:!0,tristate:!0,value:D,onChange:we}):a?e.jsx(r,{...n,...j,multiple:!0,value:O,onChange:Ce}):e.jsx(r,{...n,value:w,onChange:Ne}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(Oe)]})]})}const He={title:"Components/Combobox",component:r,render:()=>e.jsx(je,{}),args:{options:t,value:"",placeholder:"Select database",disabled:!1,loading:!1,onChange:()=>{}},argTypes:{placeholder:{control:"text",table:{category:"Appearance"}},multiple:{control:"boolean",table:{category:"Mode"}},tristate:{control:"boolean",table:{category:"Mode"}},variant:{control:"inline-radio",options:["default","tags"],table:{category:"Mode"}},disabled:{control:"boolean",table:{category:"Behavior"}},required:{control:"boolean",table:{category:"Behavior"}},loading:{control:"boolean",table:{category:"Behavior"}},value:{control:!1,table:{category:"Value"}},options:{control:!1,table:{category:"Value"}},onChange:{control:!1,table:{category:"Events"}}}},d={},i={parameters:{docs:{description:{story:'Every mode from one panel: **Mode → multiple / tristate / variant**. The value shape follows the mode — a string, a `string[]`, or a `Record<value, "include" | "exclude">` — and the box below shows what the control actually commits.'}}},render:a=>e.jsx(Pe,{...a})},c={render:()=>{const[a,o]=s.useState("");return e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Loading databases…",value:a,onChange:o,options:[],loading:!0})})}},u={render:()=>e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Select database",value:"PrimaryDB",onChange:()=>{},options:t,disabled:!0})})},p={render:()=>{const[a,o]=s.useState("PrimaryDB");return e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Select database",value:a,onChange:o,options:t})})}},m={render:()=>{const[a,o]=s.useState("PrimaryDB");return e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Select database",value:a,onChange:o,options:t,required:!0})})}},b={render:()=>{const[a,o]=s.useState("");return e.jsx("div",{className:"w-64",children:e.jsx(r,{label:"Database",value:a,onChange:o,options:t})})}},v={render:()=>{const[a,o]=s.useState("");return e.jsxs("div",{className:"w-64 space-y-3",children:[e.jsx(r,{label:"Database",placeholder:"Pick one",value:a,onChange:o,options:t,allowCustomValue:!1}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},h={parameters:{docs:{description:{story:"The dropdown portals to `document.body` and is positioned with fixed coordinates, so it floats above the dialog and is not clipped by the modal body's `overflow-auto`. Open the dialog, then open the Combobox — the option list extends past the dialog's edge."}}},render:()=>{const[a,o]=s.useState(!0),[l,n]=s.useState("");return e.jsxs("div",{children:[e.jsx("button",{type:"button",className:"rounded-md border border-border px-3 py-1.5 text-sm",onClick:()=>o(!0),children:"Open dialog"}),e.jsx(De,{open:a,onClose:()=>o(!1),title:"Edit connection",size:"sm",children:e.jsxs("div",{className:"space-y-3",children:[e.jsx("label",{className:"block text-sm font-medium",children:"Database"}),e.jsx(r,{placeholder:"Select database",value:l,onChange:n,options:t}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"The dropdown should overflow the dialog without being clipped."})]})})]})}},g={render:()=>{const[a,o]=s.useState([]);return e.jsxs("div",{className:"w-64 space-y-3",children:[e.jsx(r,{multiple:!0,label:"Databases",placeholder:"Pick databases",value:a,onChange:o,options:t,allowCustomValue:!1}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},x={parameters:{docs:{description:{story:"Multi-select keeps existing choices while allowing values outside the current option page. Type a new database name and choose the Add option."}}},render:()=>{const[a,o]=s.useState(["PrimaryDB"]);return e.jsxs("div",{className:"w-64 space-y-3",children:[e.jsx(r,{multiple:!0,label:"Databases",placeholder:"Pick or add databases",value:a,onChange:o,options:t}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},y={parameters:{docs:{description:{story:"The tags variant keeps every selected value visible as a removable pill while the inline input searches or creates another value."}}},render:()=>{const[a,o]=s.useState(["PrimaryDB","ArchiveDB","analytics-replica"]);return e.jsxs("div",{className:"w-96 space-y-3",children:[e.jsx(r,{multiple:!0,variant:"tags",label:"Databases",placeholder:"Pick or add databases",value:a,onChange:o,options:t}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},S={parameters:{docs:{description:{story:'Tristate keeps a `Record<value, "include" | "exclude">` rather than a list, and `variant: "tags"` shows that record in the field: one pill per value, coloured by its mode. Clicking a pill flips include ↔ exclude; its close button returns the value to neutral (dropping it from the record). Without the variant the same control collapses to a `+n -n` summary — what the FilterBar\'s multi filter uses.'}}},render:()=>{const[a,o]=s.useState({PrimaryDB:"include",ArchiveDB:"exclude"});return e.jsxs("div",{className:"w-96 space-y-3",children:[e.jsx(r,{multiple:!0,tristate:!0,variant:"tags",label:"Databases",placeholder:"Include or exclude databases",value:a,onChange:o,options:t}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},Te=[{value:"aws",label:"AWS",icon:e.jsx("span",{"aria-hidden":!0,children:"🟧"})},{value:"gcp",label:"Google Cloud",icon:e.jsx("span",{"aria-hidden":!0,children:"🔵"})},{value:"azure",label:"Azure",icon:e.jsx("span",{"aria-hidden":!0,children:"🟦"})}],f={parameters:{docs:{description:{story:"Each `ComboboxOption` may carry an `icon` — a runtime icon name (resolved by the registered fallback provider) or a rendered node — shown before the option label in the list."}}},render:()=>{const[a,o]=s.useState("");return e.jsx("div",{className:"w-64",children:e.jsx(r,{label:"Provider",placeholder:"Select a cloud",value:a,onChange:o,options:Te})})}},Ve=[{value:"demo-svc",label:"demo-svc",group:"Service",icon:e.jsx("span",{"aria-hidden":!0,children:"🟦"})},{value:"db-svc",label:"db-svc",group:"Service",icon:e.jsx("span",{"aria-hidden":!0,children:"🟦"})},{value:"demo-ing",label:"demo-ing (demo.example.com)",group:"Ingress",icon:e.jsx("span",{"aria-hidden":!0,children:"🌐"})},{value:"demo-web",label:"demo-web",group:"Deployment",icon:e.jsx("span",{"aria-hidden":!0,children:"📦"})},{value:"demo-cycle",label:"demo-cycle",group:"StatefulSet",icon:e.jsx("span",{"aria-hidden":!0,children:"🗄️"})}],N={parameters:{docs:{description:{story:"Options carrying a `group` render a non-interactive section header above the first option of each group (grouped by contiguous `group` value, in the order provided). Open the menu to see the four `Service` / `Ingress` / `Deployment` / `StatefulSet` headers. Headers are derived from the *filtered* options, so typing a query that empties a group also hides its header, and keyboard navigation skips headers entirely."}}},render:()=>{const[a,o]=s.useState("");return e.jsxs("div",{className:"w-72 space-y-3",children:[e.jsx(r,{label:"Workload",placeholder:"Select workload / service…",value:a,onChange:o,options:Ve}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},Ae=[{value:"recommended",label:"(recommended default)"},{value:"none",label:"(none)"},{value:"demo-svc",label:"demo-svc",group:"Service"},{value:"demo-ing",label:"demo-ing",group:"Ingress"}],C={parameters:{docs:{description:{story:"`group` is optional. Options without a `group` render no header — place them first so the ungrouped entries read as a lead-in before the first grouped section. Mixing ungrouped and grouped options in one list is supported."}}},render:()=>{const[a,o]=s.useState("");return e.jsxs("div",{className:"w-72 space-y-3",children:[e.jsx(r,{label:"Backend",placeholder:"Pick a backend",value:a,onChange:o,options:Ae}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}};var P,T,V;d.parameters={...d.parameters,docs:{...(P=d.parameters)==null?void 0:P.docs,source:{originalSource:"{}",...(V=(T=d.parameters)==null?void 0:T.docs)==null?void 0:V.source}}};var A,B,k;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Every mode from one panel: **Mode → multiple / tristate / variant**. The value shape follows the mode — a string, a \`string[]\`, or a \`Record<value, \\"include\\" | \\"exclude\\">\` — and the box below shows what the control actually commits."
      }
    }
  },
  render: args => <ComboboxPlayground {...args} />
}`,...(k=(B=i.parameters)==null?void 0:B.docs)==null?void 0:k.source}}};var I,M,E;c.parameters={...c.parameters,docs:{...(I=c.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64">
        <Combobox placeholder="Loading databases…" value={value} onChange={setValue} options={[]} loading />
      </div>;
  }
}`,...(E=(M=c.parameters)==null?void 0:M.docs)==null?void 0:E.source}}};var _,J,R;u.parameters={...u.parameters,docs:{...(_=u.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <div className="w-64">
      <Combobox placeholder="Select database" value="PrimaryDB" onChange={() => {}} options={DATABASE_OPTIONS} disabled />
    </div>
}`,...(R=(J=u.parameters)==null?void 0:J.docs)==null?void 0:R.source}}};var G,L,q;p.parameters={...p.parameters,docs:{...(G=p.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("PrimaryDB");
    return <div className="w-64">
        <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
      </div>;
  }
}`,...(q=(L=p.parameters)==null?void 0:L.docs)==null?void 0:q.source}}};var W,U,z;m.parameters={...m.parameters,docs:{...(W=m.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("PrimaryDB");
    return <div className="w-64">
        <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} required />
      </div>;
  }
}`,...(z=(U=m.parameters)==null?void 0:U.docs)==null?void 0:z.source}}};var F,H,X;b.parameters={...b.parameters,docs:{...(F=b.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64">
        <Combobox label="Database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
      </div>;
  }
}`,...(X=(H=b.parameters)==null?void 0:H.docs)==null?void 0:X.source}}};var K,Q,Y;v.parameters={...v.parameters,docs:{...(K=v.parameters)==null?void 0:K.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64 space-y-3">
        <Combobox label="Database" placeholder="Pick one" value={value} onChange={setValue} options={DATABASE_OPTIONS} allowCustomValue={false} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...(Y=(Q=v.parameters)==null?void 0:Q.docs)==null?void 0:Y.source}}};var Z,$,ee;h.parameters={...h.parameters,docs:{...(Z=h.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(ee=($=h.parameters)==null?void 0:$.docs)==null?void 0:ee.source}}};var ae,oe,re;g.parameters={...g.parameters,docs:{...(ae=g.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <div className="w-64 space-y-3">
        <Combobox multiple label="Databases" placeholder="Pick databases" value={value} onChange={setValue} options={DATABASE_OPTIONS} allowCustomValue={false} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...(re=(oe=g.parameters)==null?void 0:oe.docs)==null?void 0:re.source}}};var se,te,ne;x.parameters={...x.parameters,docs:{...(se=x.parameters)==null?void 0:se.docs,source:{originalSource:`{
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
}`,...(ne=(te=x.parameters)==null?void 0:te.docs)==null?void 0:ne.source}}};var le,de,ie;y.parameters={...y.parameters,docs:{...(le=y.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(ie=(de=y.parameters)==null?void 0:de.docs)==null?void 0:ie.source}}};var ce,ue,pe;S.parameters={...S.parameters,docs:{...(ce=S.parameters)==null?void 0:ce.docs,source:{originalSource:`{
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
}`,...(pe=(ue=S.parameters)==null?void 0:ue.docs)==null?void 0:pe.source}}};var me,be,ve;f.parameters={...f.parameters,docs:{...(me=f.parameters)==null?void 0:me.docs,source:{originalSource:`{
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
}`,...(ve=(be=f.parameters)==null?void 0:be.docs)==null?void 0:ve.source}}};var he,ge,xe;N.parameters={...N.parameters,docs:{...(he=N.parameters)==null?void 0:he.docs,source:{originalSource:`{
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
}`,...(xe=(ge=N.parameters)==null?void 0:ge.docs)==null?void 0:xe.source}}};var ye,Se,fe;C.parameters={...C.parameters,docs:{...(ye=C.parameters)==null?void 0:ye.docs,source:{originalSource:`{
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
}`,...(fe=(Se=C.parameters)==null?void 0:Se.docs)==null?void 0:fe.source}}};const Xe=["Default","Playground","Loading","Disabled","Clearable","Required","WithInlineLabel","Strict","InsideDialog","Multiple","CreatableMultiple","Tags","TriStateTags","OptionIcons","Grouped","MixedGrouping"];export{p as Clearable,x as CreatableMultiple,d as Default,u as Disabled,N as Grouped,h as InsideDialog,c as Loading,C as MixedGrouping,g as Multiple,f as OptionIcons,i as Playground,m as Required,v as Strict,y as Tags,S as TriStateTags,b as WithInlineLabel,Xe as __namedExportsOrder,He as default};

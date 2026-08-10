import{r as s,j as e}from"./iframe-Dd752MYf.js";import{C as r}from"./Combobox-DkmILrX4.js";import{M as be}from"./Modal-BSuZsloP.js";import"./preload-helper-B2LPdJL4.js";import"./utils-CR52uffu.js";import"./Icon-9CMiNgil.js";import"./modalStack-Bx1u-msU.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-DYVq0lph.js";import"./index-DIEIIbJ9.js";import"./index-DUsaV9HH.js";import"./FilterPill-BW2EVU2l.js";import"./button-oBk_H1Zb.js";import"./index-0zBpNI7D.js";import"./loading-Cf-BAp-_.js";const n=[{value:"PrimaryDB",label:"PrimaryDB"},{value:"ArchiveDB",label:"ArchiveDB"},{value:"IVS",label:"IVS"},{value:"ReportServer",label:"ReportServer"}];function ve(){const[a,o]=s.useState("");return e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Select database",value:a,onChange:o,options:n})})}function he({value:a,...o}){const[t,N]=s.useState(a);return e.jsxs("div",{className:"w-64 space-y-3",children:[e.jsx(r,{...o,value:t,onChange:N}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(t)]})]})}const Ee={title:"Components/Combobox",component:r,render:()=>e.jsx(ve,{}),args:{options:n,value:"",placeholder:"Select database",disabled:!1,loading:!1,onChange:()=>{}},argTypes:{placeholder:{control:"text",table:{category:"Appearance"}},disabled:{control:"boolean",table:{category:"Behavior"}},required:{control:"boolean",table:{category:"Behavior"}},loading:{control:"boolean",table:{category:"Behavior"}},value:{control:!1,table:{category:"Value"}},options:{control:!1,table:{category:"Value"}},onChange:{control:!1,table:{category:"Events"}}}},l={},d={render:a=>e.jsx(he,{...a})},i={render:()=>{const[a,o]=s.useState("");return e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Loading databases…",value:a,onChange:o,options:[],loading:!0})})}},c={render:()=>e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Select database",value:"PrimaryDB",onChange:()=>{},options:n,disabled:!0})})},u={render:()=>{const[a,o]=s.useState("PrimaryDB");return e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Select database",value:a,onChange:o,options:n})})}},p={render:()=>{const[a,o]=s.useState("PrimaryDB");return e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Select database",value:a,onChange:o,options:n,required:!0})})}},m={render:()=>{const[a,o]=s.useState("");return e.jsx("div",{className:"w-64",children:e.jsx(r,{label:"Database",value:a,onChange:o,options:n})})}},b={render:()=>{const[a,o]=s.useState("");return e.jsxs("div",{className:"w-64 space-y-3",children:[e.jsx(r,{label:"Database",placeholder:"Pick one",value:a,onChange:o,options:n,allowCustomValue:!1}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},v={parameters:{docs:{description:{story:"The dropdown portals to `document.body` and is positioned with fixed coordinates, so it floats above the dialog and is not clipped by the modal body's `overflow-auto`. Open the dialog, then open the Combobox — the option list extends past the dialog's edge."}}},render:()=>{const[a,o]=s.useState(!0),[t,N]=s.useState("");return e.jsxs("div",{children:[e.jsx("button",{type:"button",className:"rounded-md border border-border px-3 py-1.5 text-sm",onClick:()=>o(!0),children:"Open dialog"}),e.jsx(be,{open:a,onClose:()=>o(!1),title:"Edit connection",size:"sm",children:e.jsxs("div",{className:"space-y-3",children:[e.jsx("label",{className:"block text-sm font-medium",children:"Database"}),e.jsx(r,{placeholder:"Select database",value:t,onChange:N,options:n}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"The dropdown should overflow the dialog without being clipped."})]})})]})}},h={render:()=>{const[a,o]=s.useState([]);return e.jsxs("div",{className:"w-64 space-y-3",children:[e.jsx(r,{multiple:!0,label:"Databases",placeholder:"Pick databases",value:a,onChange:o,options:n,allowCustomValue:!1}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},g={parameters:{docs:{description:{story:"Multi-select keeps existing choices while allowing values outside the current option page. Type a new database name and choose the Add option."}}},render:()=>{const[a,o]=s.useState(["PrimaryDB"]);return e.jsxs("div",{className:"w-64 space-y-3",children:[e.jsx(r,{multiple:!0,label:"Databases",placeholder:"Pick or add databases",value:a,onChange:o,options:n}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},x={parameters:{docs:{description:{story:"The tags variant keeps every selected value visible as a removable pill while the inline input searches or creates another value."}}},render:()=>{const[a,o]=s.useState(["PrimaryDB","ArchiveDB","analytics-replica"]);return e.jsxs("div",{className:"w-96 space-y-3",children:[e.jsx(r,{multiple:!0,variant:"tags",label:"Databases",placeholder:"Pick or add databases",value:a,onChange:o,options:n}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},ge=[{value:"aws",label:"AWS",icon:e.jsx("span",{"aria-hidden":!0,children:"🟧"})},{value:"gcp",label:"Google Cloud",icon:e.jsx("span",{"aria-hidden":!0,children:"🔵"})},{value:"azure",label:"Azure",icon:e.jsx("span",{"aria-hidden":!0,children:"🟦"})}],y={parameters:{docs:{description:{story:"Each `ComboboxOption` may carry an `icon` — a runtime icon name (resolved by the registered fallback provider) or a rendered node — shown before the option label in the list."}}},render:()=>{const[a,o]=s.useState("");return e.jsx("div",{className:"w-64",children:e.jsx(r,{label:"Provider",placeholder:"Select a cloud",value:a,onChange:o,options:ge})})}},xe=[{value:"demo-svc",label:"demo-svc",group:"Service",icon:e.jsx("span",{"aria-hidden":!0,children:"🟦"})},{value:"db-svc",label:"db-svc",group:"Service",icon:e.jsx("span",{"aria-hidden":!0,children:"🟦"})},{value:"demo-ing",label:"demo-ing (demo.example.com)",group:"Ingress",icon:e.jsx("span",{"aria-hidden":!0,children:"🌐"})},{value:"demo-web",label:"demo-web",group:"Deployment",icon:e.jsx("span",{"aria-hidden":!0,children:"📦"})},{value:"demo-cycle",label:"demo-cycle",group:"StatefulSet",icon:e.jsx("span",{"aria-hidden":!0,children:"🗄️"})}],S={parameters:{docs:{description:{story:"Options carrying a `group` render a non-interactive section header above the first option of each group (grouped by contiguous `group` value, in the order provided). Open the menu to see the four `Service` / `Ingress` / `Deployment` / `StatefulSet` headers. Headers are derived from the *filtered* options, so typing a query that empties a group also hides its header, and keyboard navigation skips headers entirely."}}},render:()=>{const[a,o]=s.useState("");return e.jsxs("div",{className:"w-72 space-y-3",children:[e.jsx(r,{label:"Workload",placeholder:"Select workload / service…",value:a,onChange:o,options:xe}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},ye=[{value:"recommended",label:"(recommended default)"},{value:"none",label:"(none)"},{value:"demo-svc",label:"demo-svc",group:"Service"},{value:"demo-ing",label:"demo-ing",group:"Ingress"}],f={parameters:{docs:{description:{story:"`group` is optional. Options without a `group` render no header — place them first so the ungrouped entries read as a lead-in before the first grouped section. Mixing ungrouped and grouped options in one list is supported."}}},render:()=>{const[a,o]=s.useState("");return e.jsxs("div",{className:"w-72 space-y-3",children:[e.jsx(r,{label:"Backend",placeholder:"Pick a backend",value:a,onChange:o,options:ye}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}};var O,C,w;l.parameters={...l.parameters,docs:{...(O=l.parameters)==null?void 0:O.docs,source:{originalSource:"{}",...(w=(C=l.parameters)==null?void 0:C.docs)==null?void 0:w.source}}};var j,D,P;d.parameters={...d.parameters,docs:{...(j=d.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: args => <ComboboxPlayground {...args} />
}`,...(P=(D=d.parameters)==null?void 0:D.docs)==null?void 0:P.source}}};var V,A,T;i.parameters={...i.parameters,docs:{...(V=i.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64">
        <Combobox placeholder="Loading databases…" value={value} onChange={setValue} options={[]} loading />
      </div>;
  }
}`,...(T=(A=i.parameters)==null?void 0:A.docs)==null?void 0:T.source}}};var k,B,I;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <div className="w-64">
      <Combobox placeholder="Select database" value="PrimaryDB" onChange={() => {}} options={DATABASE_OPTIONS} disabled />
    </div>
}`,...(I=(B=c.parameters)==null?void 0:B.docs)==null?void 0:I.source}}};var E,_,M;u.parameters={...u.parameters,docs:{...(E=u.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("PrimaryDB");
    return <div className="w-64">
        <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
      </div>;
  }
}`,...(M=(_=u.parameters)==null?void 0:_.docs)==null?void 0:M.source}}};var J,G,R;p.parameters={...p.parameters,docs:{...(J=p.parameters)==null?void 0:J.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("PrimaryDB");
    return <div className="w-64">
        <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} required />
      </div>;
  }
}`,...(R=(G=p.parameters)==null?void 0:G.docs)==null?void 0:R.source}}};var L,q,U;m.parameters={...m.parameters,docs:{...(L=m.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64">
        <Combobox label="Database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
      </div>;
  }
}`,...(U=(q=m.parameters)==null?void 0:q.docs)==null?void 0:U.source}}};var W,z,H;b.parameters={...b.parameters,docs:{...(W=b.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64 space-y-3">
        <Combobox label="Database" placeholder="Pick one" value={value} onChange={setValue} options={DATABASE_OPTIONS} allowCustomValue={false} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...(H=(z=b.parameters)==null?void 0:z.docs)==null?void 0:H.source}}};var X,F,K;v.parameters={...v.parameters,docs:{...(X=v.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
}`,...(K=(F=v.parameters)==null?void 0:F.docs)==null?void 0:K.source}}};var Q,Y,Z;h.parameters={...h.parameters,docs:{...(Q=h.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <div className="w-64 space-y-3">
        <Combobox multiple label="Databases" placeholder="Pick databases" value={value} onChange={setValue} options={DATABASE_OPTIONS} allowCustomValue={false} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...(Z=(Y=h.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var $,ee,ae;g.parameters={...g.parameters,docs:{...($=g.parameters)==null?void 0:$.docs,source:{originalSource:`{
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
}`,...(ae=(ee=g.parameters)==null?void 0:ee.docs)==null?void 0:ae.source}}};var oe,re,se;x.parameters={...x.parameters,docs:{...(oe=x.parameters)==null?void 0:oe.docs,source:{originalSource:`{
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
}`,...(se=(re=x.parameters)==null?void 0:re.docs)==null?void 0:se.source}}};var ne,te,le;y.parameters={...y.parameters,docs:{...(ne=y.parameters)==null?void 0:ne.docs,source:{originalSource:`{
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
}`,...(le=(te=y.parameters)==null?void 0:te.docs)==null?void 0:le.source}}};var de,ie,ce;S.parameters={...S.parameters,docs:{...(de=S.parameters)==null?void 0:de.docs,source:{originalSource:`{
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
}`,...(ce=(ie=S.parameters)==null?void 0:ie.docs)==null?void 0:ce.source}}};var ue,pe,me;f.parameters={...f.parameters,docs:{...(ue=f.parameters)==null?void 0:ue.docs,source:{originalSource:`{
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
}`,...(me=(pe=f.parameters)==null?void 0:pe.docs)==null?void 0:me.source}}};const _e=["Default","Playground","Loading","Disabled","Clearable","Required","WithInlineLabel","Strict","InsideDialog","Multiple","CreatableMultiple","Tags","OptionIcons","Grouped","MixedGrouping"];export{u as Clearable,g as CreatableMultiple,l as Default,c as Disabled,S as Grouped,v as InsideDialog,i as Loading,f as MixedGrouping,h as Multiple,y as OptionIcons,d as Playground,p as Required,b as Strict,x as Tags,m as WithInlineLabel,_e as __namedExportsOrder,Ee as default};

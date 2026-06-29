import{r as s,j as e}from"./iframe-Ck5OBNy_.js";import{C as r}from"./Combobox-DaOCm6bo.js";import{M as te}from"./Modal-DBs0n7Za.js";import"./preload-helper-C4wV90-x.js";import"./index-Dkbn_kvr.js";import"./index-BAA7PKOe.js";import"./utils-CR52uffu.js";import"./Icon-BzT4mhZP.js";import"./json-schema-form-size-DYVq0lph.js";import"./modalStack-CJY7IwIQ.js";import"./zIndex-CigQ76av.js";import"./UiClose-DqLdg852.js";import"./UiChevronDown-CirG0okf.js";import"./UiCheck-Dr2gRPmf.js";import"./button-xP_Jm0t5.js";import"./index-0zBpNI7D.js";import"./loading-D5ySMDtv.js";import"./UiFullscreen-D2hBhWaD.js";const n=[{value:"PrimaryDB",label:"PrimaryDB"},{value:"ArchiveDB",label:"ArchiveDB"},{value:"IVS",label:"IVS"},{value:"ReportServer",label:"ReportServer"}];function de(){const[a,o]=s.useState("");return e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Select database",value:a,onChange:o,options:n})})}function le({value:a,...o}){const[t,y]=s.useState(a);return e.jsxs("div",{className:"w-64 space-y-3",children:[e.jsx(r,{...o,value:t,onChange:y}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(t)]})]})}const Ae={title:"Components/Combobox",component:r,render:()=>e.jsx(de,{}),args:{options:n,value:"",placeholder:"Select database",disabled:!1,loading:!1,onChange:()=>{}},argTypes:{placeholder:{control:"text",table:{category:"Appearance"}},disabled:{control:"boolean",table:{category:"Behavior"}},required:{control:"boolean",table:{category:"Behavior"}},loading:{control:"boolean",table:{category:"Behavior"}},value:{control:!1,table:{category:"Value"}},options:{control:!1,table:{category:"Value"}},onChange:{control:!1,table:{category:"Events"}}}},d={},l={render:a=>e.jsx(le,{...a})},i={render:()=>{const[a,o]=s.useState("");return e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Loading databases…",value:a,onChange:o,options:[],loading:!0})})}},c={render:()=>e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Select database",value:"PrimaryDB",onChange:()=>{},options:n,disabled:!0})})},u={render:()=>{const[a,o]=s.useState("PrimaryDB");return e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Select database",value:a,onChange:o,options:n})})}},p={render:()=>{const[a,o]=s.useState("PrimaryDB");return e.jsx("div",{className:"w-64",children:e.jsx(r,{placeholder:"Select database",value:a,onChange:o,options:n,required:!0})})}},m={render:()=>{const[a,o]=s.useState("");return e.jsx("div",{className:"w-64",children:e.jsx(r,{label:"Database",value:a,onChange:o,options:n})})}},b={render:()=>{const[a,o]=s.useState("");return e.jsxs("div",{className:"w-64 space-y-3",children:[e.jsx(r,{label:"Database",placeholder:"Pick one",value:a,onChange:o,options:n,allowCustomValue:!1}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},v={parameters:{docs:{description:{story:"The dropdown portals to `document.body` and is positioned with fixed coordinates, so it floats above the dialog and is not clipped by the modal body's `overflow-auto`. Open the dialog, then open the Combobox — the option list extends past the dialog's edge."}}},render:()=>{const[a,o]=s.useState(!0),[t,y]=s.useState("");return e.jsxs("div",{children:[e.jsx("button",{type:"button",className:"rounded-md border border-border px-3 py-1.5 text-sm",onClick:()=>o(!0),children:"Open dialog"}),e.jsx(te,{open:a,onClose:()=>o(!1),title:"Edit connection",size:"sm",children:e.jsxs("div",{className:"space-y-3",children:[e.jsx("label",{className:"block text-sm font-medium",children:"Database"}),e.jsx(r,{placeholder:"Select database",value:t,onChange:y,options:n}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"The dropdown should overflow the dialog without being clipped."})]})})]})}},h={render:()=>{const[a,o]=s.useState([]);return e.jsxs("div",{className:"w-64 space-y-3",children:[e.jsx(r,{multiple:!0,label:"Databases",placeholder:"Pick databases",value:a,onChange:o,options:n,allowCustomValue:!1}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},ie=[{value:"aws",label:"AWS",icon:e.jsx("span",{"aria-hidden":!0,children:"🟧"})},{value:"gcp",label:"Google Cloud",icon:e.jsx("span",{"aria-hidden":!0,children:"🔵"})},{value:"azure",label:"Azure",icon:e.jsx("span",{"aria-hidden":!0,children:"🟦"})}],g={parameters:{docs:{description:{story:"Each `ComboboxOption` may carry an `icon` — a runtime icon name (resolved by the registered fallback provider) or a rendered node — shown before the option label in the list."}}},render:()=>{const[a,o]=s.useState("");return e.jsx("div",{className:"w-64",children:e.jsx(r,{label:"Provider",placeholder:"Select a cloud",value:a,onChange:o,options:ie})})}},ce=[{value:"demo-svc",label:"demo-svc",group:"Service",icon:e.jsx("span",{"aria-hidden":!0,children:"🟦"})},{value:"db-svc",label:"db-svc",group:"Service",icon:e.jsx("span",{"aria-hidden":!0,children:"🟦"})},{value:"demo-ing",label:"demo-ing (demo.example.com)",group:"Ingress",icon:e.jsx("span",{"aria-hidden":!0,children:"🌐"})},{value:"demo-web",label:"demo-web",group:"Deployment",icon:e.jsx("span",{"aria-hidden":!0,children:"📦"})},{value:"demo-cycle",label:"demo-cycle",group:"StatefulSet",icon:e.jsx("span",{"aria-hidden":!0,children:"🗄️"})}],x={parameters:{docs:{description:{story:"Options carrying a `group` render a non-interactive section header above the first option of each group (grouped by contiguous `group` value, in the order provided). Open the menu to see the four `Service` / `Ingress` / `Deployment` / `StatefulSet` headers. Headers are derived from the *filtered* options, so typing a query that empties a group also hides its header, and keyboard navigation skips headers entirely."}}},render:()=>{const[a,o]=s.useState("");return e.jsxs("div",{className:"w-72 space-y-3",children:[e.jsx(r,{label:"Workload",placeholder:"Select workload / service…",value:a,onChange:o,options:ce}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}},ue=[{value:"recommended",label:"(recommended default)"},{value:"none",label:"(none)"},{value:"demo-svc",label:"demo-svc",group:"Service"},{value:"demo-ing",label:"demo-ing",group:"Ingress"}],S={parameters:{docs:{description:{story:"`group` is optional. Options without a `group` render no header — place them first so the ungrouped entries read as a lead-in before the first grouped section. Mixing ungrouped and grouped options in one list is supported."}}},render:()=>{const[a,o]=s.useState("");return e.jsxs("div",{className:"w-72 space-y-3",children:[e.jsx(r,{label:"Backend",placeholder:"Pick a backend",value:a,onChange:o,options:ue}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(a)]})]})}};var f,N,O;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:"{}",...(O=(N=d.parameters)==null?void 0:N.docs)==null?void 0:O.source}}};var C,j,w;l.parameters={...l.parameters,docs:{...(C=l.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: args => <ComboboxPlayground {...args} />
}`,...(w=(j=l.parameters)==null?void 0:j.docs)==null?void 0:w.source}}};var D,V,P;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64">
        <Combobox placeholder="Loading databases…" value={value} onChange={setValue} options={[]} loading />
      </div>;
  }
}`,...(P=(V=i.parameters)==null?void 0:V.docs)==null?void 0:P.source}}};var A,I,T;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div className="w-64">
      <Combobox placeholder="Select database" value="PrimaryDB" onChange={() => {}} options={DATABASE_OPTIONS} disabled />
    </div>
}`,...(T=(I=c.parameters)==null?void 0:I.docs)==null?void 0:T.source}}};var k,B,E;u.parameters={...u.parameters,docs:{...(k=u.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("PrimaryDB");
    return <div className="w-64">
        <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
      </div>;
  }
}`,...(E=(B=u.parameters)==null?void 0:B.docs)==null?void 0:E.source}}};var _,M,G;p.parameters={...p.parameters,docs:{...(_=p.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("PrimaryDB");
    return <div className="w-64">
        <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} required />
      </div>;
  }
}`,...(G=(M=p.parameters)==null?void 0:M.docs)==null?void 0:G.source}}};var J,R,L;m.parameters={...m.parameters,docs:{...(J=m.parameters)==null?void 0:J.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64">
        <Combobox label="Database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
      </div>;
  }
}`,...(L=(R=m.parameters)==null?void 0:R.docs)==null?void 0:L.source}}};var q,U,W;b.parameters={...b.parameters,docs:{...(q=b.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-64 space-y-3">
        <Combobox label="Database" placeholder="Pick one" value={value} onChange={setValue} options={DATABASE_OPTIONS} allowCustomValue={false} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...(W=(U=b.parameters)==null?void 0:U.docs)==null?void 0:W.source}}};var z,H,X;v.parameters={...v.parameters,docs:{...(z=v.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...(X=(H=v.parameters)==null?void 0:H.docs)==null?void 0:X.source}}};var F,K,Q;h.parameters={...h.parameters,docs:{...(F=h.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <div className="w-64 space-y-3">
        <Combobox multiple label="Databases" placeholder="Pick databases" value={value} onChange={setValue} options={DATABASE_OPTIONS} allowCustomValue={false} />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...(Q=(K=h.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};var Y,Z,$;g.parameters={...g.parameters,docs:{...(Y=g.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...($=(Z=g.parameters)==null?void 0:Z.docs)==null?void 0:$.source}}};var ee,ae,oe;x.parameters={...x.parameters,docs:{...(ee=x.parameters)==null?void 0:ee.docs,source:{originalSource:`{
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
}`,...(oe=(ae=x.parameters)==null?void 0:ae.docs)==null?void 0:oe.source}}};var re,se,ne;S.parameters={...S.parameters,docs:{...(re=S.parameters)==null?void 0:re.docs,source:{originalSource:`{
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
}`,...(ne=(se=S.parameters)==null?void 0:se.docs)==null?void 0:ne.source}}};const Ie=["Default","Playground","Loading","Disabled","Clearable","Required","WithInlineLabel","Strict","InsideDialog","Multiple","OptionIcons","Grouped","MixedGrouping"];export{u as Clearable,d as Default,c as Disabled,x as Grouped,v as InsideDialog,i as Loading,S as MixedGrouping,h as Multiple,g as OptionIcons,l as Playground,p as Required,b as Strict,m as WithInlineLabel,Ie as __namedExportsOrder,Ae as default};

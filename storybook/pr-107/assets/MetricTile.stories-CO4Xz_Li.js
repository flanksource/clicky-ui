import{j as e}from"./iframe-BsAqiW63.js";import{M as a}from"./MetricTile-ChxYJOW8.js";import"./preload-helper-Drww7zV3.js";import"./utils-DW-IJACk.js";const{expect:m,within:u}=__STORYBOOK_MODULE_TEST__,x={title:"Data/Diagnostics/MetricTile",component:a,parameters:{docs:{description:{component:"A compact labelled value with an optional tone bar underneath. Used for process and test-attempt metrics (CPU, RSS, FDs, exit code)."}}}},t={render:()=>e.jsxs("div",{className:"grid max-w-md grid-cols-4 gap-density-1",children:[e.jsx(a,{label:"Idle",value:"0.0%",barPct:0,tone:"neutral"}),e.jsx(a,{label:"Busy",value:"35.0%",barPct:35,tone:"success"}),e.jsx(a,{label:"Hot",value:"72.0%",barPct:72,tone:"warning"}),e.jsx(a,{label:"Pegged",value:"98.0%",barPct:98,tone:"danger"})]}),play:async({canvasElement:d})=>{await m(u(d).getByText("98.0%")).toBeInTheDocument()}},r={args:{label:"PID",value:"4242"}};var n,s,o;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: () => <div className="grid max-w-md grid-cols-4 gap-density-1">
      <MetricTile label="Idle" value="0.0%" barPct={0} tone="neutral" />
      <MetricTile label="Busy" value="35.0%" barPct={35} tone="success" />
      <MetricTile label="Hot" value="72.0%" barPct={72} tone="warning" />
      <MetricTile label="Pegged" value="98.0%" barPct={98} tone="danger" />
    </div>,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("98.0%")).toBeInTheDocument();
  }
}`,...(o=(s=t.parameters)==null?void 0:s.docs)==null?void 0:o.source}}};var c,l,i;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    label: "PID",
    value: "4242"
  }
}`,...(i=(l=r.parameters)==null?void 0:l.docs)==null?void 0:i.source}}};const T=["Tones","WithoutBar"];export{t as Tones,r as WithoutBar,T as __namedExportsOrder,x as default};

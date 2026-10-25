import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./MetricTile-BGAe4sFr.js";var i,a,o,s,c,l,u;function d(){return(d=e((()=>{n(),i=t(),{expect:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`Data/Diagnostics/MetricTile`,component:r,parameters:{docs:{description:{component:`A compact labelled value with an optional tone bar underneath. Used for process and test-attempt metrics (CPU, RSS, FDs, exit code).`}}}},c={render:()=>(0,i.jsxs)(`div`,{className:`grid max-w-md grid-cols-4 gap-density-1`,children:[(0,i.jsx)(r,{label:`Idle`,value:`0.0%`,barPct:0,tone:`neutral`}),(0,i.jsx)(r,{label:`Busy`,value:`35.0%`,barPct:35,tone:`success`}),(0,i.jsx)(r,{label:`Hot`,value:`72.0%`,barPct:72,tone:`warning`}),(0,i.jsx)(r,{label:`Pegged`,value:`98.0%`,barPct:98,tone:`danger`})]}),play:async({canvasElement:e})=>{await a(o(e).getByText(`98.0%`)).toBeInTheDocument()}},l={args:{label:`PID`,value:`4242`}},u=[`Tones`,`WithoutBar`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: "PID",
    value: "4242"
  }
}`,...l.parameters?.docs?.source}}}})))()}d();export{c as Tones,l as WithoutBar,u as __namedExportsOrder,s as default};
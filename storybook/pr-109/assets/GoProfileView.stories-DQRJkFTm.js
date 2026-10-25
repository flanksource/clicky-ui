import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{r as n,t as r}from"./fixtures-DQ4-m9zu.js";import{n as i,r as a,t as o}from"./GoProfileView-BDuHfJnz.js";var s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{n(),a(),s=t(),{expect:c,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d={title:`Data/Traces/GoProfileView`,component:o,args:{records:r},decorators:[e=>(0,s.jsx)(`div`,{className:`max-w-4xl rounded-md border border-border p-density-3`,children:(0,s.jsx)(e,{})})],parameters:{docs:{description:{component:"A Go pprof profile as the `goprof` kind stores it: a chooser across checkpoints (profile type, source and time; the latest by default) over a top-N table of functions by flat and cumulative value, per sample type, with a drill-down from a function to the heaviest stacks that reach it. `ProfileTopTable` underneath takes any samples of a value, a unit and a stack, so it can show other profilers' samples too."}}}},f={play:async({canvasElement:e})=>{await c(u(e).getByText(`Total 2.3 s across 7 functions`)).toBeInTheDocument()}},p={args:{records:r.filter(e=>e.profile===`heap`)},play:async({canvasElement:e})=>{await c(u(e).getByText(`Total 120 MB across 5 functions`)).toBeInTheDocument()}},m={play:async({canvasElement:e})=>{let t=u(e);await l.click(t.getByRole(`button`,{name:/app\/runner\.hashChunk/})),await c(e.querySelector(`[data-profile-stacks="app/runner.hashChunk"]`)).not.toBeNull()}},h={args:{topN:2}},g={args:{records:[]}},_={render:()=>(0,s.jsx)(i,{samples:[{sampleType:`wall`,unit:`milliseconds`,value:420,frames:[{func:`Db.query`,file:`Db.java`,line:88},{func:`Svc.handle`,file:`Svc.java`,line:31}]},{sampleType:`wall`,unit:`milliseconds`,value:180,frames:[{func:`Json.parse`,file:`Json.java`,line:12},{func:`Svc.handle`,file:`Svc.java`,line:29}]}]})},v=[`CpuProfile`,`HeapProfile`,`DrillDown`,`TopTwoOnly`,`NoProfiles`,`AnyProfilerSamples`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("Total 2.3 s across 7 functions")).toBeInTheDocument();
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    records: goProfileRecords.filter(record => record.profile === "heap")
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("Total 120 MB across 5 functions")).toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: /app\\/runner\\.hashChunk/
    }));
    await expect(canvasElement.querySelector('[data-profile-stacks="app/runner.hashChunk"]')).not.toBeNull();
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    topN: 2
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    records: []
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <ProfileTopTable samples={[{
    sampleType: "wall",
    unit: "milliseconds",
    value: 420,
    frames: [{
      func: "Db.query",
      file: "Db.java",
      line: 88
    }, {
      func: "Svc.handle",
      file: "Svc.java",
      line: 31
    }]
  }, {
    sampleType: "wall",
    unit: "milliseconds",
    value: 180,
    frames: [{
      func: "Json.parse",
      file: "Json.java",
      line: 12
    }, {
      func: "Svc.handle",
      file: "Svc.java",
      line: 29
    }]
  }]} />
}`,..._.parameters?.docs?.source}}}})))()}y();export{_ as AnyProfilerSamples,f as CpuProfile,m as DrillDown,p as HeapProfile,g as NoProfiles,h as TopTwoOnly,v as __namedExportsOrder,d as default};
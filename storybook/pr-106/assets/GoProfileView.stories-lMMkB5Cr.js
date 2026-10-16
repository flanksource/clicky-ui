import{j as c}from"./iframe-BUpmsD4_.js";import{g as k}from"./fixtures-C3TGvGxW.js";import{G as N,P as _}from"./GoProfileView-CPczAcsU.js";import"./preload-helper-PGaPgbNH.js";import"./select-CBErET8H.js";import"./utils-DW-IJACk.js";import"./Icon-DTAROQQs.js";import"./format-2niohfpq.js";import"./process-tree-BV4Gc7wn.js";const{expect:l,userEvent:O,within:i}=__STORYBOOK_MODULE_TEST__,V={title:"Data/Traces/GoProfileView",component:N,args:{records:k},decorators:[e=>c.jsx("div",{className:"max-w-4xl rounded-md border border-border p-density-3",children:c.jsx(e,{})})],parameters:{docs:{description:{component:"A Go pprof profile as the `goprof` kind stores it: a chooser across checkpoints (profile type, source and time; the latest by default) over a top-N table of functions by flat and cumulative value, per sample type, with a drill-down from a function to the heaviest stacks that reach it. `ProfileTopTable` underneath takes any samples of a value, a unit and a stack, so it can show other profilers' samples too."}}}},a={play:async({canvasElement:e})=>{await l(i(e).getByText("Total 2.3 s across 7 functions")).toBeInTheDocument()}},r={args:{records:k.filter(e=>e.profile==="heap")},play:async({canvasElement:e})=>{await l(i(e).getByText("Total 120 MB across 5 functions")).toBeInTheDocument()}},n={play:async({canvasElement:e})=>{const E=i(e);await O.click(E.getByRole("button",{name:/app\/runner\.hashChunk/})),await l(e.querySelector('[data-profile-stacks="app/runner.hashChunk"]')).not.toBeNull()}},o={args:{topN:2}},s={args:{records:[]}},t={render:()=>c.jsx(_,{samples:[{sampleType:"wall",unit:"milliseconds",value:420,frames:[{func:"Db.query",file:"Db.java",line:88},{func:"Svc.handle",file:"Svc.java",line:31}]},{sampleType:"wall",unit:"milliseconds",value:180,frames:[{func:"Json.parse",file:"Json.java",line:12},{func:"Svc.handle",file:"Svc.java",line:29}]}]})};var p,m,u;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("Total 2.3 s across 7 functions")).toBeInTheDocument();
  }
}`,...(u=(m=a.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var d,f,h;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    records: goProfileRecords.filter(record => record.profile === "heap")
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("Total 120 MB across 5 functions")).toBeInTheDocument();
  }
}`,...(h=(f=r.parameters)==null?void 0:f.docs)==null?void 0:h.source}}};var v,y,T;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: /app\\/runner\\.hashChunk/
    }));
    await expect(canvasElement.querySelector('[data-profile-stacks="app/runner.hashChunk"]')).not.toBeNull();
  }
}`,...(T=(y=n.parameters)==null?void 0:y.docs)==null?void 0:T.source}}};var w,g,S;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    topN: 2
  }
}`,...(S=(g=o.parameters)==null?void 0:g.docs)==null?void 0:S.source}}};var x,P,b;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    records: []
  }
}`,...(b=(P=s.parameters)==null?void 0:P.docs)==null?void 0:b.source}}};var B,D,j;t.parameters={...t.parameters,docs:{...(B=t.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(j=(D=t.parameters)==null?void 0:D.docs)==null?void 0:j.source}}};const K=["CpuProfile","HeapProfile","DrillDown","TopTwoOnly","NoProfiles","AnyProfilerSamples"];export{t as AnyProfilerSamples,a as CpuProfile,n as DrillDown,r as HeapProfile,s as NoProfiles,o as TopTwoOnly,K as __namedExportsOrder,V as default};

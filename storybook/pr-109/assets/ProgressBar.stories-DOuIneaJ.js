import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./ProgressBar-VQZjftwe.js";var r,i,a,o,s,c;function l(){return(l=e((()=>{t(),r={title:`Charts/ProgressBar`,component:n,args:{total:120,height:`h-2`,segments:[{count:90,color:`bg-green-500`,label:`passed`},{count:12,color:`bg-red-500`,label:`failed`},{count:8,color:`bg-yellow-400`,label:`skipped`},{count:10,color:`bg-blue-400`,label:`pending`}]},argTypes:{total:{control:{type:`number`,min:0,step:1}},height:{control:`select`,options:[`h-1`,`h-1.5`,`h-2`,`h-3`,`h-4`]},segments:{control:`object`},className:{table:{disable:!0}}},parameters:{docs:{description:{component:`Segmented progress bar for small summaries and table/detail metrics. Each segment contributes a count, color class, and tooltip label.`}}}},i={},a={args:{total:120,segments:[{count:90,color:`bg-green-500`,label:`passed`},{count:12,color:`bg-red-500`,label:`failed`},{count:8,color:`bg-yellow-400`,label:`skipped`},{count:10,color:`bg-blue-400`,label:`pending`}]}},o={args:{total:50,segments:[{count:30,color:`bg-emerald-500`,label:`merged`},{count:14,color:`bg-sky-500`,label:`open`},{count:6,color:`bg-muted-foreground/40`,label:`closed`}]}},s={args:{total:0,segments:[]}},c=[`Default`,`TestRun`,`PullRequests`,`EmptyReturnsNull`],i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    total: 120,
    segments: [{
      count: 90,
      color: "bg-green-500",
      label: "passed"
    }, {
      count: 12,
      color: "bg-red-500",
      label: "failed"
    }, {
      count: 8,
      color: "bg-yellow-400",
      label: "skipped"
    }, {
      count: 10,
      color: "bg-blue-400",
      label: "pending"
    }]
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    total: 50,
    segments: [{
      count: 30,
      color: "bg-emerald-500",
      label: "merged"
    }, {
      count: 14,
      color: "bg-sky-500",
      label: "open"
    }, {
      count: 6,
      color: "bg-muted-foreground/40",
      label: "closed"
    }]
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    total: 0,
    segments: []
  }
}`,...s.parameters?.docs?.source}}}})))()}l();export{i as Default,s as EmptyReturnsNull,o as PullRequests,a as TestRun,c as __namedExportsOrder,r as default};
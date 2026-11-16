import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,t as n}from"./format-FR4vn-Lv.js";import{n as r,t as i}from"./ProgressBar-DRfrGaP8.js";var a,o,s,c,l,u,d;function f(){return(f=e((()=>{r(),t(),a={title:`Charts/ProgressBar`,component:i,args:{total:120,height:`h-2`,segments:[{count:90,color:`bg-green-500`,label:`passed`},{count:12,color:`bg-red-500`,label:`failed`},{count:8,color:`bg-yellow-400`,label:`skipped`},{count:10,color:`bg-blue-400`,label:`pending`}]},argTypes:{total:{control:{type:`number`,min:0,step:1}},height:{control:`select`,options:[`h-1`,`h-1.5`,`h-2`,`h-3`,`h-4`]},segments:{control:`object`},className:{table:{disable:!0}}},parameters:{docs:{description:{component:`Segmented progress bar for small summaries and table/detail metrics. Each segment contributes a count, color class, and tooltip label. Supply label for an accessible resource name and formatValue for byte sizes or durations in tooltips and the accessible summary.`}}}},o={},s={args:{label:`JVM heap`,height:`h-6`,total:2048*1024**2,formatValue:n,segments:[{label:`Eden`,count:220*1024**2,color:`var(--fs-info-500)`},{label:`Survivor`,count:44*1024**2,color:`var(--fs-hint-500)`},{label:`Old Gen`,count:576*1024**2,color:`var(--fs-prereq-500)`}]}},c={args:{total:120,segments:[{count:90,color:`bg-green-500`,label:`passed`},{count:12,color:`bg-red-500`,label:`failed`},{count:8,color:`bg-yellow-400`,label:`skipped`},{count:10,color:`bg-blue-400`,label:`pending`}]}},l={args:{total:50,segments:[{count:30,color:`bg-emerald-500`,label:`merged`},{count:14,color:`bg-sky-500`,label:`open`},{count:6,color:`bg-muted-foreground/40`,label:`closed`}]}},u={args:{total:0,segments:[]}},d=[`Default`,`JvmHeap`,`TestRun`,`PullRequests`,`EmptyReturnsNull`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    label: "JVM heap",
    height: "h-6",
    total: 2048 * 1024 ** 2,
    formatValue: formatBytes,
    segments: [{
      label: "Eden",
      count: 220 * 1024 ** 2,
      color: "var(--fs-info-500)"
    }, {
      label: "Survivor",
      count: 44 * 1024 ** 2,
      color: "var(--fs-hint-500)"
    }, {
      label: "Old Gen",
      count: 576 * 1024 ** 2,
      color: "var(--fs-prereq-500)"
    }]
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    total: 0,
    segments: []
  }
}`,...u.parameters?.docs?.source}}}})))()}f();export{o as Default,u as EmptyReturnsNull,s as JvmHeap,l as PullRequests,c as TestRun,d as __namedExportsOrder,a as default};
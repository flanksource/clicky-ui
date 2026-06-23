import{P as h}from"./ProgressBar-BDeMQcjU.js";import"./iframe-B-R1GM9F.js";import"./preload-helper-B4w--iqy.js";import"./utils-BLSKlp9E.js";const P={title:"Charts/ProgressBar",component:h,args:{total:120,height:"h-2",segments:[{count:90,color:"bg-green-500",label:"passed"},{count:12,color:"bg-red-500",label:"failed"},{count:8,color:"bg-yellow-400",label:"skipped"},{count:10,color:"bg-blue-400",label:"pending"}]},argTypes:{total:{control:{type:"number",min:0,step:1}},height:{control:"select",options:["h-1","h-1.5","h-2","h-3","h-4"]},segments:{control:"object"},className:{table:{disable:!0}}},parameters:{docs:{description:{component:"Segmented progress bar for small summaries and table/detail metrics. Each segment contributes a count, color class, and tooltip label."}}}},e={},o={args:{total:120,segments:[{count:90,color:"bg-green-500",label:"passed"},{count:12,color:"bg-red-500",label:"failed"},{count:8,color:"bg-yellow-400",label:"skipped"},{count:10,color:"bg-blue-400",label:"pending"}]}},r={args:{total:50,segments:[{count:30,color:"bg-emerald-500",label:"merged"},{count:14,color:"bg-sky-500",label:"open"},{count:6,color:"bg-muted-foreground/40",label:"closed"}]}},n={args:{total:0,segments:[]}};var s,t,l;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:"{}",...(l=(t=e.parameters)==null?void 0:t.docs)==null?void 0:l.source}}};var a,c,g;o.parameters={...o.parameters,docs:{...(a=o.parameters)==null?void 0:a.docs,source:{originalSource:`{
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
}`,...(g=(c=o.parameters)==null?void 0:c.docs)==null?void 0:g.source}}};var u,m,p;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(p=(m=r.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var b,d,i;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    total: 0,
    segments: []
  }
}`,...(i=(d=n.parameters)==null?void 0:d.docs)==null?void 0:i.source}}};const S=["Default","TestRun","PullRequests","EmptyReturnsNull"];export{e as Default,n as EmptyReturnsNull,r as PullRequests,o as TestRun,S as __namedExportsOrder,P as default};

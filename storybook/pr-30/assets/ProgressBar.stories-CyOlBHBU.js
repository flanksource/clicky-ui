import{P as d}from"./ProgressBar-DIFztrLx.js";import"./iframe-D5a9zzxb.js";import"./preload-helper-D5l2DbWZ.js";import"./utils-BLSKlp9E.js";const y={title:"Data/ProgressBar",component:d,parameters:{docs:{description:{component:"Segmented progress bar for small summaries and table/detail metrics. Each segment contributes a count, color class, and tooltip label."}}}},e={args:{total:120,segments:[{count:90,color:"bg-green-500",label:"passed"},{count:12,color:"bg-red-500",label:"failed"},{count:8,color:"bg-yellow-400",label:"skipped"},{count:10,color:"bg-blue-400",label:"pending"}]}},o={args:{total:50,segments:[{count:30,color:"bg-emerald-500",label:"merged"},{count:14,color:"bg-sky-500",label:"open"},{count:6,color:"bg-muted-foreground/40",label:"closed"}]}},n={args:{total:0,segments:[]}};var r,s,t;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:`{
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
}`,...(t=(s=e.parameters)==null?void 0:s.docs)==null?void 0:t.source}}};var l,a,c;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(c=(a=o.parameters)==null?void 0:a.docs)==null?void 0:c.source}}};var u,g,m;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    total: 0,
    segments: []
  }
}`,...(m=(g=n.parameters)==null?void 0:g.docs)==null?void 0:m.source}}};const R=["TestRun","PullRequests","EmptyReturnsNull"];export{n as EmptyReturnsNull,o as PullRequests,e as TestRun,R as __namedExportsOrder,y as default};

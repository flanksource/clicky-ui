import{j as e,r as E}from"./iframe-CCq80owj.js";import{Q as q,a as H}from"./suspense-BFxanCl4.js";import{T as s}from"./TimeseriesCoreBars-B67t1NX1.js";import{U as n}from"./UiChip-D241RSPt.js";import"./preload-helper-ByUaG9M2.js";import"./useQueries-CgYKuwK4.js";import"./utils-BLSKlp9E.js";import"./Icon-Cl3hQAjl.js";const _=Date.parse("2026-06-02T12:00:00Z");function t(r){return async c=>{const O=r.find(Q=>c.includes(Q.match))??r[0];return{id:c,points:[{at:new Date(_).toISOString(),value:O.latest}]}}}function D(r){const c=E.useMemo(()=>new q({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(H,{client:c,children:e.jsx("div",{className:"w-48",children:e.jsx(s,{...r})})})}function I(){const r=E.useMemo(()=>new q({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(H,{client:r,children:e.jsxs("div",{className:"grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm",children:[e.jsx("div",{className:"border-b border-r border-border px-2 py-1.5",children:e.jsx(s,{variant:"cell",title:"CPU",icon:n,value:{id:"cpu.cell.usage"},max:4e3,refreshMs:0,fetcher:t([{match:"cpu.cell",latest:2300}])})}),e.jsx("div",{className:"border-b border-border px-2 py-1.5",children:e.jsx(s,{variant:"cell",showLabel:!1,title:"CPU",icon:n,value:{id:"cpu.icon.usage"},max:4e3,refreshMs:0,fetcher:t([{match:"cpu.icon",latest:2300}])})}),e.jsx("div",{className:"border-r border-border px-2 py-1.5",children:e.jsx(s,{variant:"cell",orientation:"horizontal",title:"Near limit",icon:n,value:{id:"cpu.warning.usage"},max:8e3,refreshMs:0,fetcher:t([{match:"warning",latest:7600}])})}),e.jsx("div",{className:"px-2 py-1.5",children:e.jsx(s,{variant:"cell",orientation:"horizontal",showLabel:!1,showValue:!1,title:"Near limit",icon:n,value:{id:"cpu.danger.usage"},max:8e3,refreshMs:0,fetcher:t([{match:"danger",latest:7600}])})})]})})}const Y={title:"Charts/TimeseriesCoreBars",component:s,parameters:{docs:{description:{component:"CPU utilisation as a row of bars — one per core (ceil of the CPU limit) — filled by the latest usage, so the bar straddling the boundary is partially filled and trailing bars show headroom. Usage and limit are read live from the timeseries store. `showValue` controls the caption, and `orientation` switches the bars between vertical columns and horizontal rows. The pure `deriveCoreBars(usageMilli, limitMilli)` helper computes the model. Stories pass a synthetic `fetcher` and `refreshMs={0}`."}}},argTypes:{title:{control:"text"},baseUrl:{control:"text"},range:{control:"text"},refreshMs:{control:{type:"number",min:0,step:1e3}},variant:{control:"inline-radio",options:["default","cell"]},orientation:{control:"inline-radio",options:["horizontal","vertical"]},showLabel:{control:"boolean"},showValue:{control:"boolean"},thresholds:{table:{disable:!0}},icon:{table:{disable:!0}},fetcher:{table:{disable:!0}},value:{table:{disable:!0}},max:{table:{disable:!0}},className:{table:{disable:!0}}},render:r=>e.jsx(D,{...r})},a={args:{title:"CPU",icon:n,value:{id:"cpu.usage"},max:4e3,refreshMs:0,showValue:!0,orientation:"vertical",fetcher:t([{match:"cpu",latest:2300}])}},l={args:{...a.args,orientation:"horizontal"}},d={args:{...a.args,showValue:!1}},o={args:{...a.args,max:8e3,fetcher:t([{match:"cpu",latest:7600}])}},i={args:{title:"CPU",value:{id:"cpu.usage"},max:{id:"cpu.limit"},refreshMs:0,fetcher:t([{match:"usage",latest:1500},{match:"limit",latest:2e3}])}},m={render:()=>e.jsx(I,{})};var u,p,h,f,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    icon: UiChip,
    value: {
      id: "cpu.usage"
    },
    max: 4000,
    refreshMs: 0,
    showValue: true,
    orientation: "vertical",
    fetcher: makeFetcher([{
      match: "cpu",
      latest: 2300
    }])
  }
}`,...(h=(p=a.parameters)==null?void 0:p.docs)==null?void 0:h.source},description:{story:"2.3 cores used of a 4-core limit.",...(g=(f=a.parameters)==null?void 0:f.docs)==null?void 0:g.description}}};var b,x,C;l.parameters={...l.parameters,docs:{...(b=l.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    orientation: "horizontal"
  }
}`,...(C=(x=l.parameters)==null?void 0:x.docs)==null?void 0:C.source}}};var v,w,y;d.parameters={...d.parameters,docs:{...(v=d.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    showValue: false
  }
}`,...(y=(w=d.parameters)==null?void 0:w.docs)==null?void 0:y.source}}};var j,M,U,V,N;o.parameters={...o.parameters,docs:{...(j=o.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    max: 8000,
    fetcher: makeFetcher([{
      match: "cpu",
      latest: 7600
    }])
  }
}`,...(U=(M=o.parameters)==null?void 0:M.docs)==null?void 0:U.source},description:{story:"Near-capacity: 7.6 of 8 cores → danger tone.",...(N=(V=o.parameters)==null?void 0:V.docs)==null?void 0:N.description}}};var S,F,P,T,z;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    value: {
      id: "cpu.usage"
    },
    max: {
      id: "cpu.limit"
    },
    refreshMs: 0,
    fetcher: makeFetcher([{
      match: "usage",
      latest: 1500
    }, {
      match: "limit",
      latest: 2000
    }])
  }
}`,...(P=(F=i.parameters)==null?void 0:F.docs)==null?void 0:P.source},description:{story:"Limit read from a `.limit` metric instead of a constant.",...(z=(T=i.parameters)==null?void 0:T.docs)==null?void 0:z.description}}};var B,L,k;m.parameters={...m.parameters,docs:{...(B=m.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <CoreBarsCellVariants />
}`,...(k=(L=m.parameters)==null?void 0:L.docs)==null?void 0:k.source}}};const $=["FourCores","Horizontal","ValueHidden","NearCapacity","MetricLimit","CellVariants"];export{m as CellVariants,a as FourCores,l as Horizontal,i as MetricLimit,o as NearCapacity,d as ValueHidden,$ as __namedExportsOrder,Y as default};

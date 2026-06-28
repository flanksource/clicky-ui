import{J as l}from"./JsonView-DFRIAMDC.js";import"./iframe-BxLPOr6M.js";import"./preload-helper-C4wV90-x.js";const f={title:"Data/JsonView",component:l,args:{data:{service:"api",status:"healthy",replicas:3},defaultOpenDepth:2},parameters:{docs:{description:{component:"Recursive JSON/object viewer for compact diagnostics and raw payload inspection. Objects and arrays can be expanded by depth while primitive values stay inline."}}}},e={args:{name:"config",data:{name:"scraper",enabled:!0,retries:3,tags:["alpha","beta"],owner:null,metadata:{created:"2026-01-01",stats:{runs:42,failures:2}}}}},a={args:{data:{a:{b:{c:{d:{e:"deep"}}}}},defaultOpenDepth:3}},r={args:{data:{obj:{},arr:[]}}};var n,s,t;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    name: "config",
    data: {
      name: "scraper",
      enabled: true,
      retries: 3,
      tags: ["alpha", "beta"],
      owner: null,
      metadata: {
        created: "2026-01-01",
        stats: {
          runs: 42,
          failures: 2
        }
      }
    }
  }
}`,...(t=(s=e.parameters)==null?void 0:s.docs)==null?void 0:t.source}}};var o,p,c;a.parameters={...a.parameters,docs:{...(o=a.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    data: {
      a: {
        b: {
          c: {
            d: {
              e: "deep"
            }
          }
        }
      }
    },
    defaultOpenDepth: 3
  }
}`,...(c=(p=a.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};var d,i,m;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    data: {
      obj: {},
      arr: []
    }
  }
}`,...(m=(i=r.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};const h=["MixedTypes","DeepNested","EmptyContainers"];export{a as DeepNested,r as EmptyContainers,e as MixedTypes,h as __namedExportsOrder,f as default};

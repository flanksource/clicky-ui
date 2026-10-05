import{J as A}from"./JsonView-B6IE9BVn.js";import"./iframe-DXCHqMT7.js";import"./preload-helper-DxStcPpW.js";import"./button-tbjJwnTf.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CFBgJ_my.js";const z={title:"Data/JsonView",component:A,args:{data:{service:"api",status:"healthy",replicas:3},defaultOpenDepth:2,format:"yaml"},argTypes:{format:{control:"inline-radio",options:["yaml","json"],table:{defaultValue:{summary:"yaml"}}},density:{control:"select",options:["compact","comfortable","spacious"],table:{defaultValue:{summary:"Inherited"}}}},parameters:{docs:{description:{component:'Collapsible structured-data viewer with YAML as the default format. Set format="json" for braces and quoted strings. Density follows the application or Storybook toolbar (compact, comfortable, spacious); the density prop overrides it for one viewer. Objects and arrays expand by depth, with type-aware coloring and safely quoted YAML strings.'}}}},e={args:{name:"config",data:{name:"scraper",enabled:!0,retries:3,tags:["alpha","beta"],owner:null,metadata:{created:"2026-01-01",stats:{runs:42,failures:2}}}}},a={args:{data:{a:{b:{c:{d:{e:"deep"}}}}},defaultOpenDepth:3}},r={args:{data:{obj:{},arr:[]}}},s={args:{...e.args,format:"json"}},t={args:{...e.args,density:"compact"}},n={args:{...e.args,density:"comfortable"}},o={args:{...e.args,density:"spacious"}},c={args:{defaultOpenDepth:4,data:{strings:["true","null","42","","a: b",`first
second`],"special: key":"safely quoted",services:[{name:"api",ports:[8080,9090]},{name:"worker",ports:[]}]}}};var p,d,i;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(i=(d=e.parameters)==null?void 0:d.docs)==null?void 0:i.source}}};var m,l,u;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(u=(l=a.parameters)==null?void 0:l.docs)==null?void 0:u.source}}};var g,f,y;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    data: {
      obj: {},
      arr: []
    }
  }
}`,...(y=(f=r.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};var b,h,S;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    ...MixedTypes.args,
    format: "json"
  }
}`,...(S=(h=s.parameters)==null?void 0:h.docs)==null?void 0:S.source}}};var w,x,D;t.parameters={...t.parameters,docs:{...(w=t.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    ...MixedTypes.args,
    density: "compact"
  }
}`,...(D=(x=t.parameters)==null?void 0:x.docs)==null?void 0:D.source}}};var M,j,C;n.parameters={...n.parameters,docs:{...(M=n.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    ...MixedTypes.args,
    density: "comfortable"
  }
}`,...(C=(j=n.parameters)==null?void 0:j.docs)==null?void 0:C.source}}};var O,T,q;o.parameters={...o.parameters,docs:{...(O=o.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    ...MixedTypes.args,
    density: "spacious"
  }
}`,...(q=(T=o.parameters)==null?void 0:T.docs)==null?void 0:q.source}}};var v,k,J;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    defaultOpenDepth: 4,
    data: {
      strings: ["true", "null", "42", "", "a: b", "first\\nsecond"],
      "special: key": "safely quoted",
      services: [{
        name: "api",
        ports: [8080, 9090]
      }, {
        name: "worker",
        ports: []
      }]
    }
  }
}`,...(J=(k=c.parameters)==null?void 0:k.docs)==null?void 0:J.source}}};const B=["MixedTypes","DeepNested","EmptyContainers","Json","Compact","Comfortable","Spacious","YamlStringsAndSequences"];export{n as Comfortable,t as Compact,a as DeepNested,r as EmptyContainers,s as Json,e as MixedTypes,o as Spacious,c as YamlStringsAndSequences,B as __namedExportsOrder,z as default};

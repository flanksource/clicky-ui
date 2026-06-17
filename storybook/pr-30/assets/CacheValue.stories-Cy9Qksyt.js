import{j as e}from"./iframe-DLWo_D3a.js";import{C as o}from"./CacheValue-xd75RLom.js";import{s as h,a as x}from"./cache-browser.fixtures-CjMuyLCg.js";import"./preload-helper-D5l2DbWZ.js";import"./CodeBlock-18ws4pr5.js";import"./utils-BLSKlp9E.js";import"./JsonView-C6cEe_kH.js";import"./code-highlight-DzzumZyi.js";import"./KeyValueList-CxAAZeU2.js";const D={title:"Data/CacheBrowser/CacheValue",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Type-aware renderer for one cache key's value (`CacheKeyDetail`): a string body, a hash field table, a list, a set, or a scored zset. The default body used by `CacheDetailPanel` when no domain adapter claims the key."}}},argTypes:{detail:{control:!1}},args:{detail:x}},s={render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})},r={args:{detail:h},render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})},t={args:{detail:{key:"session:ab12",type:"string",ttlSeconds:900,length:45,value:'{"uid":1001,"csrf":"a1b2c3","exp":1750000000}'}},render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})};var c,l,i;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: args => <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
}`,...(i=(l=s.parameters)==null?void 0:l.docs)==null?void 0:i.source}}};var d,n,m;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    detail: sampleZsetDetail
  },
  render: args => <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
}`,...(m=(n=r.parameters)==null?void 0:n.docs)==null?void 0:m.source}}};var p,g,u;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    detail: {
      key: "session:ab12",
      type: "string",
      ttlSeconds: 900,
      length: 45,
      value: '{"uid":1001,"csrf":"a1b2c3","exp":1750000000}'
    }
  },
  render: args => <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
}`,...(u=(g=t.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};const N=["Hash","ScoredSet","StringValue"];export{s as Hash,r as ScoredSet,t as StringValue,N as __namedExportsOrder,D as default};

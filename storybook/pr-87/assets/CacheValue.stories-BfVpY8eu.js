import{j as e}from"./iframe-Cxdv9pi7.js";import{C as o}from"./CacheValue-D7BVi-mb.js";import{s as h,a as x}from"./cache-browser.fixtures-CjMuyLCg.js";import"./preload-helper-DU1Q6aPJ.js";import"./CodeBlock-COdx_xEw.js";import"./utils-DW-IJACk.js";import"./Icon-TQmWXc2S.js";import"./CodeDiff-B_kUey21.js";import"./SegmentedControl-hhBGtqdI.js";import"./HighlightedTokens-DBaNk6YB.js";import"./JsonView-Ds_lvjLt.js";import"./KeyValueList-CKRGIp2I.js";const T={title:"Data/CacheBrowser/CacheValue",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Type-aware renderer for one cache key's value (`CacheKeyDetail`): a string body, a hash field table, a list, a set, or a scored zset. The default body used by `CacheDetailPanel` when no domain adapter claims the key."}}},argTypes:{detail:{control:!1}},args:{detail:x}},r={render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})},s={args:{detail:h},render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})},t={args:{detail:{key:"session:ab12",type:"string",ttlSeconds:900,length:45,value:'{"uid":1001,"csrf":"a1b2c3","exp":1750000000}'}},render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})};var c,i,l;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: args => <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
}`,...(l=(i=r.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var d,n,m;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    detail: sampleZsetDetail
  },
  render: args => <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
}`,...(m=(n=s.parameters)==null?void 0:n.docs)==null?void 0:m.source}}};var p,g,u;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(u=(g=t.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};const E=["Hash","ScoredSet","StringValue"];export{r as Hash,s as ScoredSet,t as StringValue,E as __namedExportsOrder,T as default};

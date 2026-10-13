import{j as e}from"./iframe-DP177qYv.js";import{C as o}from"./CacheValue-0kiElVUo.js";import{s as h,a as x}from"./cache-browser.fixtures-CjMuyLCg.js";import"./preload-helper-BZq7nIkI.js";import"./CodeBlock-CoYNYiBs.js";import"./utils-DW-IJACk.js";import"./Icon-CVZO3WAG.js";import"./CodeDiff-ew4pkH_9.js";import"./SegmentedControl-CmQrpni4.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-F0uKqAH1.js";import"./JsonView-euY554sO.js";import"./button-FbNKbbzk.js";import"./index-CPURVhFy.js";import"./loading-BGP2vbyq.js";import"./AccordionList-ae6JTwF6.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DkHitohI.js";import"./KeyValueList-BM252NEW.js";const P={title:"Data/CacheBrowser/CacheValue",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Type-aware renderer for one cache key's value (`CacheKeyDetail`): a string body, a hash field table, a list, a set, or a scored zset. The default body used by `CacheDetailPanel` when no domain adapter claims the key."}}},argTypes:{detail:{control:!1}},args:{detail:x}},r={render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})},s={args:{detail:h},render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})},t={args:{detail:{key:"session:ab12",type:"string",ttlSeconds:900,length:45,value:'{"uid":1001,"csrf":"a1b2c3","exp":1750000000}'}},render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})};var i,m,c;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
}`,...(c=(m=r.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};var l,d,n;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    detail: sampleZsetDetail
  },
  render: args => <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
}`,...(n=(d=s.parameters)==null?void 0:d.docs)==null?void 0:n.source}}};var p,g,u;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(u=(g=t.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};const R=["Hash","ScoredSet","StringValue"];export{r as Hash,s as ScoredSet,t as StringValue,R as __namedExportsOrder,P as default};

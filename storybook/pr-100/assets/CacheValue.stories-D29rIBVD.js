import{j as e}from"./iframe-PIqemlGB.js";import{C as o}from"./CacheValue-C5Gl8Xgn.js";import{s as h,a as x}from"./cache-browser.fixtures-CjMuyLCg.js";import"./preload-helper-CLP1olNy.js";import"./CodeBlock-j2E1n8ER.js";import"./utils-DW-IJACk.js";import"./Icon-BnoLxMF1.js";import"./CodeDiff-Dg5qylaS.js";import"./SegmentedControl-BPtmGqZE.js";import"./HighlightedTokens-B_4xh0bQ.js";import"./JsonView-r0_NeGqp.js";import"./button-Cpqh3UK7.js";import"./index-CPURVhFy.js";import"./loading-CckofzUs.js";import"./AccordionList-wX34OlLO.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DB04oQsn.js";import"./KeyValueList-D8ekaAyU.js";const B={title:"Data/CacheBrowser/CacheValue",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Type-aware renderer for one cache key's value (`CacheKeyDetail`): a string body, a hash field table, a list, a set, or a scored zset. The default body used by `CacheDetailPanel` when no domain adapter claims the key."}}},argTypes:{detail:{control:!1}},args:{detail:x}},r={render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})},s={args:{detail:h},render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})},t={args:{detail:{key:"session:ab12",type:"string",ttlSeconds:900,length:45,value:'{"uid":1001,"csrf":"a1b2c3","exp":1750000000}'}},render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})};var i,c,m;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
}`,...(m=(c=r.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var l,d,n;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(u=(g=t.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};const O=["Hash","ScoredSet","StringValue"];export{r as Hash,s as ScoredSet,t as StringValue,O as __namedExportsOrder,B as default};

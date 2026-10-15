import{j as e}from"./iframe-BpsZ2AnK.js";import{C as o}from"./CacheValue-CN-N0oJa.js";import{s as h,a as x}from"./cache-browser.fixtures-CjMuyLCg.js";import"./preload-helper-MsDOuF3K.js";import"./CodeBlock-CrYxM6ZO.js";import"./utils-DW-IJACk.js";import"./Icon-nPi6h081.js";import"./CodeDiff-BGrQjjUl.js";import"./SegmentedControl-BUwYYoDm.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-CTIWcVCe.js";import"./HighlightedTokens-DtZaJN20.js";import"./JsonView-Bc5NK7ov.js";import"./button-Zee-1TPK.js";import"./index-CPURVhFy.js";import"./loading-Ds2q6m_u.js";import"./AccordionList-C_UQ-gQM.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-CbddDVTn.js";import"./badge-variants-BNgEarpT.js";import"./KeyValueList-bKZO5iv9.js";const R={title:"Data/CacheBrowser/CacheValue",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Type-aware renderer for one cache key's value (`CacheKeyDetail`): a string body, a hash field table, a list, a set, or a scored zset. The default body used by `CacheDetailPanel` when no domain adapter claims the key."}}},argTypes:{detail:{control:!1}},args:{detail:x}},r={render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})},s={args:{detail:h},render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})},t={args:{detail:{key:"session:ab12",type:"string",ttlSeconds:900,length:45,value:'{"uid":1001,"csrf":"a1b2c3","exp":1750000000}'}},render:a=>e.jsx("div",{className:"max-w-lg",children:e.jsx(o,{...a})})};var i,m,c;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(u=(g=t.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};const q=["Hash","ScoredSet","StringValue"];export{r as Hash,s as ScoredSet,t as StringValue,q as __namedExportsOrder,R as default};

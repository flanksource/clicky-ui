import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{o as n,s as r,t as i}from"./cache-browser.fixtures-B0VeweJK.js";import{n as a,t as o}from"./CacheValue-CqBQAG63.js";var s,c,l,u,d,f;function p(){return(p=e((()=>{a(),i(),s=t(),c={title:`Data/CacheBrowser/CacheValue`,component:o,tags:[`autodocs`],parameters:{docs:{description:{component:"Type-aware renderer for one cache key's value (`CacheKeyDetail`): a string body, a hash field table, a list, a set, or a scored zset. The default body used by `CacheDetailPanel` when no domain adapter claims the key."}}},argTypes:{detail:{control:!1}},args:{detail:n}},l={render:e=>(0,s.jsx)(`div`,{className:`max-w-lg`,children:(0,s.jsx)(o,{...e})})},u={args:{detail:r},render:e=>(0,s.jsx)(`div`,{className:`max-w-lg`,children:(0,s.jsx)(o,{...e})})},d={args:{detail:{key:`session:ab12`,type:`string`,ttlSeconds:900,length:45,value:`{"uid":1001,"csrf":"a1b2c3","exp":1750000000}`}},render:e=>(0,s.jsx)(`div`,{className:`max-w-lg`,children:(0,s.jsx)(o,{...e})})},f=[`Hash`,`ScoredSet`,`StringValue`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    detail: sampleZsetDetail
  },
  render: args => <div className="max-w-lg">
      <CacheValue {...args} />
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}}})))()}p();export{l as Hash,u as ScoredSet,d as StringValue,f as __namedExportsOrder,c as default};
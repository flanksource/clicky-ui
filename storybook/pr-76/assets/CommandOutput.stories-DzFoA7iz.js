import{j as r}from"./iframe-7j6iymLi.js";import{C as e}from"./CommandOutput-CZ6L6ybH.js";import{S as R}from"./rpc-story.fixtures-D5wceM3a.js";import"./preload-helper-I-iSH2ar.js";import"./DataTable-QJIyO5Nd.js";import"./SortableHeader-DF0pKXMX.js";import"./utils-DW-IJACk.js";import"./loading-3vZJBF8-.js";import"./router-D5zKM8IV.js";import"./Modal-DBrT1dTa.js";import"./index-TxPFcURu.js";import"./index-_iPo7ZOA.js";import"./Icon-0xjlgRqa.js";import"./button-MYTsFqg6.js";import"./index-CPURVhFy.js";import"./modalStack-6YNSsR0j.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-B5GDKp4-.js";import"./floating-ui.react-C0p18HIk.js";import"./FilterPill-3tsxv4Ur.js";import"./Combobox-BV-oFzvD.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-gPuspeYE.js";import"./MultiSelect-C0WZcQdb.js";import"./RangeSlider-gMn850Zn.js";import"./TimeRange-COUZhaNv.js";import"./select-DaGTT4ps.js";import"./WorkloadPicker-DbYoulg3.js";import"./NamespacePicker-BF9Bdu4v.js";import"./index-CpPL6vYi.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-Qq12l2X6.js";import"./TagList-CstGifwW.js";import"./Badge-_czBsdBD.js";import"./HoverCard-CAG8H2gB.js";import"./Properties-Cy3hTS7K.js";import"./IconButton-Bko39Ure.js";import"./DropdownMenu-BCX-dAzs.js";import"./DropdownMenuSubmenu-aYIJKhzG.js";import"./StatusDot-DYmz8St8.js";import"./Clicky-CXwWlf1J.js";import"./queryClient-DCkkB_pQ.js";import"./suspense-Bh0HMzDu.js";import"./useQuery-D-Mh9COR.js";import"./FilterForm-DkeL_g9v.js";import"./formMetadata-CLVhI-3c.js";import"./ErrorDetails-DrNOLU32.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-AbBCrgyg.js";import"./TreeNode-DUWG2jBB.js";import"./ObjectGraph-Cgf_9Kpo.js";import"./ExecutionTree-CglxGClF.js";import"./CodeBlock-BTEitK0w.js";import"./CodeDiff-_C6dOlA0.js";import"./SegmentedControl-C6KRMyJI.js";import"./HighlightedTokens-B2Dq8Hwv.js";import"./JsonView-JQ983Q_V.js";import"./RenderedStackTrace-Dq9kU3mV.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DqhdfnXc.js";import"./FrameSourceWindow-L_SpovDN.js";import"./useDebugAction-BxH6Yc60.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Lr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(p=t.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    response: TEXT_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var u,x,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    response: ERROR_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(g=(x=a.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Mr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Mr as __namedExportsOrder,Lr as default};

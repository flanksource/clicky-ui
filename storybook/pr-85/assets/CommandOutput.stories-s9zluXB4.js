import{j as r}from"./iframe-DdgNogAy.js";import{C as e}from"./CommandOutput-BGzOP3ZZ.js";import{S as R}from"./rpc-story.fixtures-B_-a4pSx.js";import"./preload-helper-BvsCWBK3.js";import"./DataTable-7B2Tkwuz.js";import"./SortableHeader-Cmu5wNn4.js";import"./utils-DW-IJACk.js";import"./loading-wD2sCDq3.js";import"./router-4Qn0D7m5.js";import"./Modal-3z7NTFVw.js";import"./index-B6mQjjqS.js";import"./index-Sl_STJ6n.js";import"./Icon-Cj3ZeRuU.js";import"./button-CzjW30CI.js";import"./index-CPURVhFy.js";import"./modalStack-DWC2-Zws.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-0HjtfF4s.js";import"./floating-ui.react-Dbg33d5m.js";import"./FilterPill-D2w9E3G0.js";import"./Combobox-B2gvGDu0.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CViqF8Rs.js";import"./MultiSelect-CohJxBry.js";import"./RangeSlider-D_mnb0g4.js";import"./TimeRange-QD_IOVqX.js";import"./select-CowP5aZ9.js";import"./WorkloadPicker-ZfoIus6A.js";import"./NamespacePicker-JZuVXT-A.js";import"./index-Ba8kPy08.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DDL_dI2z.js";import"./TagList-BDsBMwl6.js";import"./Badge-Cx54087I.js";import"./HoverCard-jnz4TehU.js";import"./Properties-gNwlSA00.js";import"./IconButton-B9kFZJ2L.js";import"./DropdownMenu-D2g063jE.js";import"./DropdownMenuSubmenu-BYLlZJBu.js";import"./StatusDot-BaXWCm36.js";import"./Clicky-DADk5StK.js";import"./queryClient-0iKH4pMI.js";import"./suspense-BoA9F3Eq.js";import"./useQuery-Bl39qcsy.js";import"./FilterForm-4SBypqLY.js";import"./formMetadata-Ceu0tVcZ.js";import"./ErrorDetails-VyH8dDt9.js";import"./callout-tones-EFt49BYo.js";import"./Tree-Dj3zr1Vr.js";import"./TreeNode-Db4ZmAqC.js";import"./ObjectGraph-Oo362viK.js";import"./ExecutionTree-DUaq4nTJ.js";import"./CodeBlock-B51oKzRt.js";import"./CodeDiff-0j-Ub4yH.js";import"./SegmentedControl-Bv_vn1Rv.js";import"./HighlightedTokens-AVP7rVb3.js";import"./JsonView-xlYTqv5C.js";import"./RenderedStackTrace-CqCx7mcj.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DM3LBLV2.js";import"./FrameSourceWindow-o73XGAzV.js";import"./useDebugAction-CPxX4O72.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

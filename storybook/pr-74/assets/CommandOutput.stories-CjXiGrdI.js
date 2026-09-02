import{j as r}from"./iframe-D7GyV4pJ.js";import{C as e}from"./CommandOutput-Cre4E5FV.js";import{S as R}from"./rpc-story.fixtures-C3YsgXVH.js";import"./preload-helper-B_Vm21o9.js";import"./DataTable-JJOFbpPY.js";import"./SortableHeader-959B4lnm.js";import"./utils-DW-IJACk.js";import"./loading-l0OT6FT8.js";import"./router-BVhxUUUy.js";import"./Modal-DeNB64-i.js";import"./index-vBVdkF1K.js";import"./index-CBRh9JwW.js";import"./Icon-CjYo4K-K.js";import"./button-DGCXgUzH.js";import"./index-CPURVhFy.js";import"./modalStack-j79ynlPx.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-M7hkXB8v.js";import"./floating-ui.react-0HlP6Bgn.js";import"./FilterPill-BWoIl1NP.js";import"./Combobox-C64Z6EDs.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-Bn9BjCAe.js";import"./MultiSelect-DkyPso9n.js";import"./RangeSlider-D7XowFPM.js";import"./TimeRange-CNngFNbj.js";import"./select-D_lEekK7.js";import"./WorkloadPicker-BMqXJ_A5.js";import"./NamespacePicker-D0FCM0FR.js";import"./index-y8FDIv-9.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-CpGwC8MO.js";import"./TagList-D8G382Fk.js";import"./Badge-PT16GLtd.js";import"./HoverCard-D4LSpSfM.js";import"./Properties-DpeNCHMK.js";import"./IconButton-CZUZzE64.js";import"./DropdownMenu-CbjgQkAk.js";import"./DropdownMenuSubmenu-B7tV7pQZ.js";import"./StatusDot-DPQCXgnL.js";import"./Clicky-DkOBE05g.js";import"./queryClient-D28N7CIZ.js";import"./suspense-CcPLgE_a.js";import"./useQuery-O9Jt8Szl.js";import"./FilterForm-CW2OQQJr.js";import"./formMetadata-C9HXT4sA.js";import"./ErrorDetails-CY_ZeiEL.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-Dfy7ZMf8.js";import"./TreeNode-DDIhgZh5.js";import"./ObjectGraph-DS_6k7de.js";import"./ExecutionTree-CHj58XuO.js";import"./CodeBlock-dzbHc6Ak.js";import"./CodeDiff-D9kzF7_t.js";import"./SegmentedControl-C-FDjv1C.js";import"./HighlightedTokens-BQznFNiM.js";import"./JsonView-C02c1Msy.js";import"./RenderedStackTrace-rC3JyqGi.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-iIDMFRYV.js";import"./FrameSourceWindow-BpKHQ3Zn.js";import"./useDebugAction-DADq_Per.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

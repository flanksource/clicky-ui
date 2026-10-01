import{j as r}from"./iframe-DuizKdUp.js";import{C as e}from"./CommandOutput-BXi7sCVd.js";import{S as R}from"./rpc-story.fixtures-DznQfhiG.js";import"./preload-helper-DmsBQNJi.js";import"./DataTable-TGDZ1XFb.js";import"./SortableHeader-rlVzJjzX.js";import"./utils-DW-IJACk.js";import"./loading-C8ciqA58.js";import"./router-DNKcLdyR.js";import"./Modal-DntpEIq8.js";import"./index-CWqaA8lc.js";import"./index-I9h17460.js";import"./Icon-B5qN7-mW.js";import"./button-EYN6PCXm.js";import"./index-CPURVhFy.js";import"./modalStack-CICKsGRF.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Dq8bM008.js";import"./floating-ui.react-BJgrq0bL.js";import"./FilterPill-zpYFv9g6.js";import"./Combobox-B_sNXcFv.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Dk93s1OM.js";import"./MultiSelect-CNmQbm4f.js";import"./RangeSlider-90JJ9Ykc.js";import"./TimeRange-CW0wp00K.js";import"./select-ZjgKcU-R.js";import"./WorkloadPicker-VWRr1sA4.js";import"./NamespacePicker-BHcTPBss.js";import"./index-D7c_i4BZ.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-CGvQMUfa.js";import"./TagList-BQ5YVmwg.js";import"./Badge-CahpJAg3.js";import"./HoverCard-C3A1tRJ0.js";import"./Properties-BzSgKCLH.js";import"./IconButton-52triCwN.js";import"./DropdownMenu-B204fkhG.js";import"./DropdownMenuSubmenu-BpKij5uD.js";import"./StatusDot-DzvLmox8.js";import"./Clicky-BpmhXL5K.js";import"./queryClient-H33qPlL2.js";import"./suspense-DD_FByqE.js";import"./useQuery-DDx2G0cE.js";import"./FilterForm-DR151zEV.js";import"./formMetadata-BaMULHcu.js";import"./ErrorDetails-TKa1ks1v.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-B9okr9re.js";import"./TreeNode-CKkPOh9J.js";import"./ObjectGraph-CNDkQl2X.js";import"./ExecutionTree-FKekiUjw.js";import"./CodeBlock-DqVnhkGz.js";import"./CodeDiff-Cm6WB7Oq.js";import"./SegmentedControl-7RGGGxjd.js";import"./HighlightedTokens-DhTsa_oz.js";import"./JsonView-DH4kfpVK.js";import"./RenderedStackTrace-R_r6A2q1.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-cFKA78mJ.js";import"./FrameSourceWindow-QbPuEwQi.js";import"./useDebugAction-BALEkDEH.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Mr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Xr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Xr as __namedExportsOrder,Mr as default};

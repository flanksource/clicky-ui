import{j as r}from"./iframe-Ds09J1dT.js";import{C as e}from"./CommandOutput-DT0MUS23.js";import{S as R}from"./rpc-story.fixtures-BeJE64ai.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-BoKkTd-e.js";import"./SortableHeader-gS-w5Rr5.js";import"./utils-DW-IJACk.js";import"./loading-qMao84VB.js";import"./router-CZJ4EQKa.js";import"./Modal-CAEMgpU8.js";import"./index-FPTpXdcx.js";import"./index-CF4fvYH8.js";import"./Icon-CjZb5Sv7.js";import"./button-BqYgRAWV.js";import"./index-CPURVhFy.js";import"./modalStack-CthqJ_T7.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BcZetDVh.js";import"./floating-ui.react-CgcPjn0G.js";import"./FilterPill-DgRXGxvV.js";import"./Combobox-Duu-Ek4U.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-B390JZZP.js";import"./MultiSelect-Dx1CrEXI.js";import"./RangeSlider-C0wNxNRM.js";import"./TimeRange-CRrUHGK5.js";import"./select-jpD87SnG.js";import"./WorkloadPicker-cf1urnzI.js";import"./NamespacePicker-EeYAegtK.js";import"./index-Ds33FuJz.js";import"./data-table-filter-values-B85q5-NK.js";import"./Timestamp-BLjVGSz9.js";import"./TagList-C3w8be63.js";import"./Badge-fcSLrmh7.js";import"./HoverCard-trfKQKGq.js";import"./Properties-D-Z2zNfa.js";import"./IconButton-D6jNoLlm.js";import"./DropdownMenu-BzWciQ6u.js";import"./DropdownMenuSubmenu-3ngMhyLq.js";import"./StatusDot-Bu0eKata.js";import"./Clicky-D2W-Y5y8.js";import"./queryClient-D0XdAngT.js";import"./suspense-CBChakp4.js";import"./useQuery-CPVsDo1k.js";import"./FilterForm-CSSjieuG.js";import"./formMetadata-77x7zV4u.js";import"./ErrorDetails-Cp81BVyB.js";import"./callout-tones-EFt49BYo.js";import"./Tree-CfXYPUwg.js";import"./TreeNode-DllXDjN3.js";import"./ObjectGraph-drS5gC4n.js";import"./ExecutionTree-BkCmksa9.js";import"./CodeBlock-V_xRb2SR.js";import"./CodeDiff-D-JoSWgL.js";import"./SegmentedControl-DeGdd1Jg.js";import"./HighlightedTokens-qyGyaI1E.js";import"./JsonView-CU07Cie5.js";import"./RenderedStackTrace-Df0B2t_G.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-CKr5dXsm.js";import"./FrameSourceWindow-BSE4-w0u.js";import"./useDebugAction-CJj4GJRm.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},kr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Lr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Lr as __namedExportsOrder,kr as default};

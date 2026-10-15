import{j as r}from"./iframe-DNj_zNZU.js";import{C as t}from"./CommandOutput-BILhYYpT.js";import{S as R}from"./rpc-story.fixtures-Cbdl3KLv.js";import"./preload-helper-LCYGeQwd.js";import"./DataTable-B1u4gJrS.js";import"./SortableHeader-53lGSQ-u.js";import"./utils-DW-IJACk.js";import"./loading-CmRQFweU.js";import"./router-Dxczcvdc.js";import"./Modal-BTkFnERZ.js";import"./index-C78OGtU2.js";import"./index-BaPlC8a_.js";import"./Icon-D173D1Xm.js";import"./button-l9qmO7rt.js";import"./index-CPURVhFy.js";import"./modalStack-qck1gI8h.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Cqk7Uv4P.js";import"./floating-ui.react-CUsd8blK.js";import"./FilterPill-BCljltSy.js";import"./filter-bar-multi-wUCtNmvd.js";import"./Combobox-BpxNrIrE.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Xu3Kqtaq.js";import"./MultiSelect-mGO55RQY.js";import"./RangeSlider-BSWUgAY4.js";import"./TimeRange-CjsLXTSh.js";import"./select-C4MKv3sD.js";import"./WorkloadPicker-BnsVO9gp.js";import"./NamespacePicker-aUlbk4RW.js";import"./index-BC4x0cR9.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-COUnG2EZ.js";import"./TagList-Cfi0XIt5.js";import"./Badge-DCK8B5Qr.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-BY9qgMmL.js";import"./Properties-BT4JKovI.js";import"./IconButton-CofRhqoZ.js";import"./DropdownMenu-BZOVBMap.js";import"./DropdownMenuSubmenu-CexcY20v.js";import"./format-2niohfpq.js";import"./JsonView-ABwU1Fjr.js";import"./AccordionList-CQ6MA2Gi.js";import"./collections-CoHfwOze.js";import"./StatusDot-a8NYo4z9.js";import"./Clicky-DaEnIyQe.js";import"./queryClient-BlK4N60K.js";import"./suspense-SFgT3Gx8.js";import"./useQuery-B3TknHuT.js";import"./FilterForm-BnDgi7e7.js";import"./formMetadata-SG0pCc5F.js";import"./operationErrorDiagnostics-RtmCMx3T.js";import"./ErrorDetails-BVWhACLW.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-XmGojDQe.js";import"./TreeNode-DFpQ6EqE.js";import"./ObjectGraph-BCOxsUGH.js";import"./ExecutionTree-DAdf5rTM.js";import"./CodeBlock-CjM_p02j.js";import"./CodeDiff-V1O_nplA.js";import"./SegmentedControl-YJAMHeYo.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-ChvifZ1Q.js";import"./HighlightedTokens-BTcRsF_2.js";import"./RenderedStackTrace-Yr5vggVP.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-HAy7IAKC.js";import"./FrameSourceWindow-CCLLQig6.js";import"./useDebugAction-B2Op707_.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},zr={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(p=e.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    response: TEXT_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var u,x,g;m.parameters={...m.parameters,docs:{...(u=m.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    response: ERROR_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(g=(x=m.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;a.parameters={...a.parameters,docs:{...(E=a.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=a.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Br=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,a as Loading,e as Table,s as Text,Br as __namedExportsOrder,zr as default};

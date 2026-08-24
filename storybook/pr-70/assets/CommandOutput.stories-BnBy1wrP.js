import{j as r}from"./iframe-BOpLb2SL.js";import{C as e}from"./CommandOutput-BVvzzkTe.js";import{S as R}from"./rpc-story.fixtures-kM0p9uWL.js";import"./preload-helper-C9Uksf5K.js";import"./DataTable-MtvzUzY0.js";import"./SortableHeader-CpktrSrp.js";import"./utils-DW-IJACk.js";import"./loading-B_5rDg5X.js";import"./Modal-C-aDu4m3.js";import"./index-2QoJ5Ixm.js";import"./index-DJ8M53Md.js";import"./Icon-JZhp7A68.js";import"./button-B63egKN7.js";import"./index-CPURVhFy.js";import"./modalStack-DTgESsZL.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CTITlHUD.js";import"./floating-ui.react-CEIFBjso.js";import"./FilterPill-DypisSu-.js";import"./Combobox-WFb9_XG1.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DfjU_MJ1.js";import"./MultiSelect-C45QveeV.js";import"./RangeSlider-DePijQRX.js";import"./TimeRange-QbneOTb6.js";import"./select-CZmFcWWM.js";import"./WorkloadPicker-D31cF_LD.js";import"./NamespacePicker-Bosw-rjb.js";import"./index-AYjp6We2.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-BDfdhHi6.js";import"./TagList-CkYry3Ru.js";import"./Badge-DNZTdoDu.js";import"./HoverCard-C0h73uzS.js";import"./Properties-COplhxwd.js";import"./IconButton-Dq1NaIUa.js";import"./DropdownMenu-BJvu-6t7.js";import"./DropdownMenuSubmenu-C84QBl0l.js";import"./StatusDot-m5V9NnFn.js";import"./Clicky-DxQolIhL.js";import"./queryClient-D1KqxkWp.js";import"./suspense-B7ManpSc.js";import"./useQuery-p7b_bHRX.js";import"./FilterForm-DAZg2Scm.js";import"./formMetadata-DR5GY7B_.js";import"./ErrorDetails-B_AuO4VI.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-wwC-0JFo.js";import"./TreeNode-CXf9MK3K.js";import"./ObjectGraph-BZVqYGXe.js";import"./ExecutionTree-Cby9Pj0q.js";import"./CodeBlock-CIqzpqVm.js";import"./CodeDiff-Dx5V1no1.js";import"./SegmentedControl-CyuD0sFo.js";import"./HighlightedTokens-DPDrj1_u.js";import"./JsonView-BzK4UBe9.js";import"./RenderedStackTrace-D2P4l25u.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BQ4gMxaY.js";import"./FrameSourceWindow-CzJ34UaQ.js";import"./useDebugAction-CHcwaYeR.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

import{j as r}from"./iframe-3q0eS6ZH.js";import{C as e}from"./CommandOutput-C1_nbw3o.js";import{S as R}from"./rpc-story.fixtures-Dx5fUbe9.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-ZMYAnqkx.js";import"./SortableHeader-19v44Dxc.js";import"./utils-DW-IJACk.js";import"./loading-gEVgRnUM.js";import"./router-CPwMIJY7.js";import"./Modal-COLLltVY.js";import"./index-Egog0RqP.js";import"./index-CiPsLEp7.js";import"./Icon-CT7GZEqx.js";import"./button-DHxo9U3A.js";import"./index-CPURVhFy.js";import"./modalStack-CW-tpCu1.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-r2C4EPnh.js";import"./floating-ui.react-CG8cv30D.js";import"./FilterPill-Buz30ZM7.js";import"./Combobox-Drlj6fxl.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CBjgGBDE.js";import"./MultiSelect-BFnXCmPi.js";import"./RangeSlider-jgvL7cG5.js";import"./TimeRange-BlYgpnwQ.js";import"./select-FPmIGvxj.js";import"./WorkloadPicker-j1YhB5_z.js";import"./NamespacePicker-DNi2hhrW.js";import"./index-21HwTrJv.js";import"./data-table-filter-values-CSqhQ9CN.js";import"./Timestamp-CpCqRpzB.js";import"./TagList-DK0qDIo1.js";import"./Badge-85OJYi09.js";import"./HoverCard-D1K6Mo-k.js";import"./Properties-m66d-gjd.js";import"./IconButton-BToFVWxm.js";import"./DropdownMenu-BNbBQXTz.js";import"./DropdownMenuSubmenu-CixrY1Rf.js";import"./StatusDot-CpXdSCdY.js";import"./Clicky-D-M5O2Xm.js";import"./queryClient-V_iBFRyl.js";import"./suspense-CZp-v64C.js";import"./useQuery-DEgDy4BK.js";import"./FilterForm-bDi7oZpi.js";import"./formMetadata-SHp1Fk98.js";import"./ErrorDetails-DNybEi2O.js";import"./callout-tones-EFt49BYo.js";import"./Tree-BFrjzZYb.js";import"./TreeNode-CduPTIl4.js";import"./ObjectGraph-v2h5Y_8e.js";import"./ExecutionTree-B_-kAd7z.js";import"./CodeBlock-BoBZ9fk7.js";import"./CodeDiff-Ck1vMpg0.js";import"./SegmentedControl-DNqVRP3z.js";import"./HighlightedTokens-CV0T2ZUG.js";import"./JsonView-BR2t-zou.js";import"./RenderedStackTrace-C4pc-mPB.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-bspqFU_s.js";import"./FrameSourceWindow-n36h_Vx5.js";import"./useDebugAction-DI4ntWO6.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

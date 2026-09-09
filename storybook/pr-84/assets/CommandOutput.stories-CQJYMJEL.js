import{j as r}from"./iframe-DFIXOaVS.js";import{C as e}from"./CommandOutput-DHDLuqJ4.js";import{S as R}from"./rpc-story.fixtures-CvyU3VDY.js";import"./preload-helper-BDLXYeas.js";import"./DataTable-Bw8f5oKm.js";import"./SortableHeader-DZ18GQw3.js";import"./utils-DW-IJACk.js";import"./loading-CZSR_umZ.js";import"./router-Dhkxi_FA.js";import"./Modal-7Bguwvl8.js";import"./index-CMlS72mc.js";import"./index-CdL49atw.js";import"./Icon-hb4cd-6v.js";import"./button-yXFyyoCV.js";import"./index-CPURVhFy.js";import"./modalStack-Cozz4jw4.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CQ72F2_i.js";import"./floating-ui.react-BezqsR5e.js";import"./FilterPill-CyAoVXgo.js";import"./Combobox-D8F_flpq.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CaC5t6jx.js";import"./MultiSelect-BI4QkDuZ.js";import"./RangeSlider-BWoCzn8_.js";import"./TimeRange-YmId265z.js";import"./select-DSLU9Vew.js";import"./WorkloadPicker-C7XV5c6-.js";import"./NamespacePicker-Tjb0oIj1.js";import"./index-DQyeb5uK.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-3x4WzMEQ.js";import"./TagList-C6h5Xafi.js";import"./Badge-O6dyEcpn.js";import"./HoverCard-DxWmZ8ds.js";import"./Properties-CGvN7b2k.js";import"./IconButton-DgfDWcdE.js";import"./DropdownMenu-DAPEMyBH.js";import"./DropdownMenuSubmenu-q_knwM8l.js";import"./StatusDot-t7GUloVh.js";import"./Clicky-C1zyxlc9.js";import"./queryClient-BWZRFzTE.js";import"./suspense-CkEPdda3.js";import"./useQuery-BItkcSDe.js";import"./FilterForm-B-_5dPXl.js";import"./formMetadata-Byb6obBU.js";import"./ErrorDetails-CunXh4Gj.js";import"./callout-tones-EFt49BYo.js";import"./Tree-BhjglWE5.js";import"./TreeNode-d28evm8T.js";import"./ObjectGraph-CDC8YYhY.js";import"./ExecutionTree-BEVo8PN5.js";import"./CodeBlock-DZkDKY5L.js";import"./CodeDiff-BIi2VwnF.js";import"./SegmentedControl-D6HJ0JLN.js";import"./HighlightedTokens-B3f0PYmL.js";import"./JsonView-CeIsKIBx.js";import"./RenderedStackTrace-CpxcdIu3.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DxUb_RpN.js";import"./FrameSourceWindow-BPEqVwxD.js";import"./useDebugAction-BeJN_syI.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

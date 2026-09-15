import{j as r}from"./iframe-v660Eh3J.js";import{C as e}from"./CommandOutput-BU3WQhRs.js";import{S as R}from"./rpc-story.fixtures-B0ncXtxp.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-vQnbzWOY.js";import"./SortableHeader-CKQSl3Ff.js";import"./utils-DW-IJACk.js";import"./loading-CqVpLPQc.js";import"./router-DUxvZve0.js";import"./Modal-WyKeqA_t.js";import"./index-BTij907j.js";import"./index-De58Dh1Z.js";import"./Icon-pN7oW891.js";import"./button-DaO-3A-f.js";import"./index-CPURVhFy.js";import"./modalStack-SZlRUvIz.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Duc5RSNU.js";import"./floating-ui.react-BcxH6J4B.js";import"./FilterPill-CUDEkpMK.js";import"./Combobox-BgwtTUVx.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BRXVyUZU.js";import"./MultiSelect-Cc2T2Q1u.js";import"./RangeSlider-Bs_sDnk3.js";import"./TimeRange-C3YD_HrU.js";import"./select-wT9TD80T.js";import"./WorkloadPicker-C7BiXjIm.js";import"./NamespacePicker-BJLFjBZT.js";import"./index-Db5hPqrJ.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-CiPAxqC2.js";import"./TagList-BpoUMu_t.js";import"./Badge-B3waKE4p.js";import"./HoverCard-CcTwKp93.js";import"./Properties-DLeySl2o.js";import"./IconButton-fv4G9gOe.js";import"./DropdownMenu-Dz35ZXNZ.js";import"./DropdownMenuSubmenu-BteaieKF.js";import"./StatusDot-B0yd09Nr.js";import"./Clicky-C2MZGFA3.js";import"./queryClient-qUEEPLDD.js";import"./suspense-DrdLZRhw.js";import"./useQuery-BQZrvx0C.js";import"./FilterForm-D6_u-1kl.js";import"./formMetadata-8-DYvVK1.js";import"./ErrorDetails-BU1sKtCU.js";import"./callout-tones-EFt49BYo.js";import"./Tree-DaKsVOci.js";import"./TreeNode-B-l1kSGR.js";import"./ObjectGraph-Dyd2shm6.js";import"./ExecutionTree-BX0mdH6e.js";import"./CodeBlock-PAr_fJTK.js";import"./CodeDiff-BN-IqNGY.js";import"./SegmentedControl-DvkOonxf.js";import"./HighlightedTokens-Cu2gk4yr.js";import"./JsonView-3s3g6ujc.js";import"./RenderedStackTrace-Y_rdbMZk.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-CyHzLsny.js";import"./FrameSourceWindow-Bj3uiFt5.js";import"./useDebugAction-C6fNOU9f.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

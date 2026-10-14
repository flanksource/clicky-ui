import{j as r}from"./iframe-4S_rqkhx.js";import{C as t}from"./CommandOutput-Czxouw62.js";import{S as R}from"./rpc-story.fixtures-DkBPajDb.js";import"./preload-helper-BZq7nIkI.js";import"./DataTable-5ziinbLW.js";import"./SortableHeader-DcKCVZpp.js";import"./utils-DW-IJACk.js";import"./loading-1HgYxxJ4.js";import"./router-COrMSiXX.js";import"./Modal-D6s3gqO4.js";import"./index-Cvd_Abow.js";import"./index-BMI4_Cei.js";import"./Icon-D5QCb7Dz.js";import"./button-BpUyE0O_.js";import"./index-CPURVhFy.js";import"./modalStack-C75NiPFe.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Dp77h1kI.js";import"./floating-ui.react-OaSgb022.js";import"./FilterPill-DIfiwld4.js";import"./filter-bar-multi-5qNdCbbr.js";import"./Combobox-B0ZmjhD8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DN47MwkR.js";import"./MultiSelect-49R8ZV-3.js";import"./RangeSlider-DlTQImZt.js";import"./TimeRange-m0Eg84ef.js";import"./select-D1G4I_RS.js";import"./WorkloadPicker-BLB9-4rF.js";import"./NamespacePicker-DxTH5Z-F.js";import"./index-CbBMnxt9.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DlSYHCht.js";import"./TagList-36ZLgV9Y.js";import"./Badge-D9TRIDLv.js";import"./HoverCard-CZLnR6uk.js";import"./Properties-CYkb1cQz.js";import"./IconButton-4hlHCpTR.js";import"./DropdownMenu-uwjLYJFW.js";import"./DropdownMenuSubmenu-1Z9V4LyC.js";import"./format-2niohfpq.js";import"./JsonView-DSVWInHq.js";import"./AccordionList-DmoCt6PE.js";import"./collections-CoHfwOze.js";import"./StatusDot-BLfk0qn0.js";import"./Clicky-3T1sv90V.js";import"./queryClient-Cfutf4sP.js";import"./suspense-BZhIoav8.js";import"./useQuery-trViol_f.js";import"./FilterForm-DdAE_kcR.js";import"./formMetadata-DafXBGkO.js";import"./operationErrorDiagnostics-BZFqCBBh.js";import"./ErrorDetails-BcUy30u3.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-6e4PruJA.js";import"./TreeNode-CQh0qeFF.js";import"./ObjectGraph-BA20C3bI.js";import"./ExecutionTree-Pbhd5kYA.js";import"./CodeBlock-BpNlfi-N.js";import"./CodeDiff-DNi4VGZD.js";import"./SegmentedControl-DocL_txn.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-BkGLTY6_.js";import"./RenderedStackTrace-gHx0QS-0.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-CyG5RiMP.js";import"./FrameSourceWindow-DwmrCfJ1.js";import"./useDebugAction-BPZil_yl.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},qr={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=a.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const zr=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,a as Loading,e as Table,s as Text,zr as __namedExportsOrder,qr as default};

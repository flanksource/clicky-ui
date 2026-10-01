import{j as r}from"./iframe-DfHdXEmJ.js";import{C as e}from"./CommandOutput-B6-bfMMA.js";import{S as R}from"./rpc-story.fixtures-CuqPkN-M.js";import"./preload-helper-CGPPAlEp.js";import"./DataTable-CuIlGJba.js";import"./SortableHeader-CS9L9X15.js";import"./utils-DW-IJACk.js";import"./loading-tTKTeWsM.js";import"./router-BRcWEDh1.js";import"./Modal-DNcElLvB.js";import"./index-E_kflO6L.js";import"./index-BA0XQxfj.js";import"./Icon-B-z_boLM.js";import"./button-C-BhJjDF.js";import"./index-CPURVhFy.js";import"./modalStack-D7AkghjI.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DOD-6frZ.js";import"./floating-ui.react-2Kyn_0pS.js";import"./FilterPill-DXILgODl.js";import"./Combobox-BmWRDzCm.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BmufCekC.js";import"./MultiSelect-DtOt2ra3.js";import"./RangeSlider-BpUSUXyK.js";import"./TimeRange-d7kWq6Sx.js";import"./select-B03fjWLK.js";import"./WorkloadPicker-C4qsN9Rw.js";import"./NamespacePicker-CjIX1Vm-.js";import"./index-OZHjcUKL.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BCK6SDNi.js";import"./TagList-CyCgW8w6.js";import"./Badge-DnRkYqSO.js";import"./HoverCard-fbYchBHc.js";import"./Properties-hsS23AQC.js";import"./IconButton-z0qUntbJ.js";import"./DropdownMenu-BvDvkP9V.js";import"./DropdownMenuSubmenu-DV6WMXuO.js";import"./StatusDot-CFggm0dq.js";import"./Clicky-DhJtCof1.js";import"./queryClient-yociQLVn.js";import"./suspense-6Rof5HGQ.js";import"./useQuery-DKNhdFnK.js";import"./FilterForm-5O2IM910.js";import"./formMetadata-BaBKXxWN.js";import"./ErrorDetails-DaIooIKz.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-CHm5rM1y.js";import"./TreeNode-CUxYj0FD.js";import"./ObjectGraph-4IFK17Ma.js";import"./ExecutionTree-DLn6WHK9.js";import"./CodeBlock-TWTbgwri.js";import"./CodeDiff-VG1WirI8.js";import"./SegmentedControl-D_5S0mj5.js";import"./HighlightedTokens-COXT88ay.js";import"./JsonView-DVoZPTSY.js";import"./RenderedStackTrace-DJ-Kiohi.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-5RBgXJyF.js";import"./FrameSourceWindow-Dl_J8XEm.js";import"./useDebugAction-BkUTMPUV.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

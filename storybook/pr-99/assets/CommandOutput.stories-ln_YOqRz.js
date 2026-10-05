import{j as r}from"./iframe-DzQtIbNE.js";import{C as t}from"./CommandOutput-Bg9Dm08O.js";import{S as R}from"./rpc-story.fixtures-BmzMn7JR.js";import"./preload-helper-BCNcasCO.js";import"./DataTable-p3NpsIhf.js";import"./SortableHeader-B-f9dioh.js";import"./utils-DW-IJACk.js";import"./loading-CMaS212t.js";import"./router-M1U0dsjS.js";import"./Modal-BvPI2Llq.js";import"./index-BqViEYwi.js";import"./index-CxOWF1GZ.js";import"./Icon-D3avtD1A.js";import"./button-BtjJwS_P.js";import"./index-CPURVhFy.js";import"./modalStack-CV8pkEDx.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Bz0gxTiA.js";import"./floating-ui.react-BiyoKmlr.js";import"./FilterPill-OKDi7TqT.js";import"./Combobox-DnmK8yIe.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-B0B7J2o-.js";import"./MultiSelect-ERMV7t7Y.js";import"./RangeSlider-BZ-7aHri.js";import"./TimeRange-De2mzwCs.js";import"./select-CKipRPgT.js";import"./WorkloadPicker-BNqXsBgH.js";import"./NamespacePicker-B-EVUmLL.js";import"./index-JHlX3ULY.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-A23tUInk.js";import"./TagList-DarfaYoB.js";import"./Badge-Caehxr5C.js";import"./HoverCard-BmMl7y5E.js";import"./Properties-zxUp5x1P.js";import"./IconButton-B4LzdWGk.js";import"./DropdownMenu-EvEmNcHK.js";import"./DropdownMenuSubmenu-zqd_Qfyb.js";import"./StatusDot-Bd5IVlVP.js";import"./Clicky-B4-QJN46.js";import"./queryClient-DkhuAh8I.js";import"./suspense-ZzCCY4xd.js";import"./useQuery-DC_XHA8r.js";import"./FilterForm-Ck1bcaRn.js";import"./formMetadata-zB71tr1l.js";import"./ErrorDetails-DUxasOLJ.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-BDpW0HwT.js";import"./TreeNode-DR60XQDj.js";import"./ObjectGraph-C1Za_38Q.js";import"./ExecutionTree-BqTO1Zoy.js";import"./CodeBlock-BhTC3ydu.js";import"./CodeDiff-MdlLWqCc.js";import"./SegmentedControl-DqjzCbFU.js";import"./HighlightedTokens-BJPpGutf.js";import"./JsonView-a3SUPwE1.js";import"./AccordionList-MuFF2Dlu.js";import"./collections-CoHfwOze.js";import"./RenderedStackTrace-BuWl4GRB.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DVxo4hHE.js";import"./FrameSourceWindow-CrWwaKf3.js";import"./useDebugAction-CInkIZV5.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Ar={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Dr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,e as Table,s as Text,Dr as __namedExportsOrder,Ar as default};

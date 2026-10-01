import{j as r}from"./iframe-Cz62D_iz.js";import{C as e}from"./CommandOutput-BIf4TJ4A.js";import{S as R}from"./rpc-story.fixtures-CUQGBY7B.js";import"./preload-helper-DxStcPpW.js";import"./DataTable-Bjsccwki.js";import"./SortableHeader-CIg0qIUM.js";import"./utils-DW-IJACk.js";import"./loading-CpNJyOux.js";import"./router-Cm-7MQaD.js";import"./Modal-CvxqKJ19.js";import"./index-CwDukIsd.js";import"./index-D1QWHGI5.js";import"./Icon-DkXLnjJN.js";import"./button-Da_C00l5.js";import"./index-CPURVhFy.js";import"./modalStack-BS9FGIbV.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BJBcUXNF.js";import"./floating-ui.react-B3VArII0.js";import"./FilterPill-DTfRv4Z5.js";import"./Combobox-CNDOvUSy.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CJvLUyFc.js";import"./MultiSelect-_rtunsUy.js";import"./RangeSlider-DF4hVvns.js";import"./TimeRange-CGuDKaJP.js";import"./select-DPiAaw2i.js";import"./WorkloadPicker-CgNs2DKV.js";import"./NamespacePicker-Dx4Gm306.js";import"./index-BrLPCfc1.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Wx6JWqOb.js";import"./TagList-AURxrRV4.js";import"./Badge--9k5yrUM.js";import"./HoverCard-BugDtYi2.js";import"./Properties-B1Ulbj5-.js";import"./IconButton-BRduhpjC.js";import"./DropdownMenu-CSiL2JEe.js";import"./DropdownMenuSubmenu-DbLMIeXR.js";import"./StatusDot-DCohhb17.js";import"./Clicky-BugAfBNO.js";import"./queryClient-DuIxcAyy.js";import"./suspense-DSV9zh4R.js";import"./useQuery-BVcFtrTB.js";import"./FilterForm-Jethot9Q.js";import"./formMetadata-Bj1JecMP.js";import"./ErrorDetails-C1YEmHt4.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-Bay9xJbM.js";import"./TreeNode-BYnedoGr.js";import"./ObjectGraph-Nlap5dbV.js";import"./ExecutionTree-BRA0pjQ6.js";import"./CodeBlock-IdrdyxjQ.js";import"./CodeDiff-CWL3DUpA.js";import"./SegmentedControl-1VLDNc0s.js";import"./HighlightedTokens-DQPWohiH.js";import"./JsonView-MYgqOyIx.js";import"./RenderedStackTrace-CvOmL_HU.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DNxiecQM.js";import"./FrameSourceWindow-Cpj_XO1H.js";import"./useDebugAction-DmaVSXt6.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

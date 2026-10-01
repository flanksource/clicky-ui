import{j as r}from"./iframe-CNJi-CEN.js";import{C as e}from"./CommandOutput-svlM25NM.js";import{S as R}from"./rpc-story.fixtures-DLu1xk-C.js";import"./preload-helper-DmsBQNJi.js";import"./DataTable-Dl1abIKG.js";import"./SortableHeader-CWi1YU8b.js";import"./utils-DW-IJACk.js";import"./loading-CMRhZ8P1.js";import"./router-CdwHWAAE.js";import"./Modal-D0weZIS9.js";import"./index-C5jqvT-L.js";import"./index-BXovTO2l.js";import"./Icon-Bv4kfyO8.js";import"./button-DO1UR7aw.js";import"./index-CPURVhFy.js";import"./modalStack-CMRaiiqk.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Cz5ZKs0h.js";import"./floating-ui.react-Bzi9C0oq.js";import"./FilterPill-CAbk9lWN.js";import"./Combobox-QDnxkUXx.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BesfIaOc.js";import"./MultiSelect-CRmFg68w.js";import"./RangeSlider-O3RumkcL.js";import"./TimeRange-Dx90ONOZ.js";import"./select-C6D2hC6T.js";import"./WorkloadPicker-4hu0dNEp.js";import"./NamespacePicker-CCjeQklL.js";import"./index-fGcEWGBL.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DE1ig2c6.js";import"./TagList-CUtdBx_p.js";import"./Badge-DVOjqw7_.js";import"./HoverCard-CIION0R9.js";import"./Properties-DAsa40E7.js";import"./IconButton-DVSTCvmg.js";import"./DropdownMenu-DHFuy7UT.js";import"./DropdownMenuSubmenu-Q6cAR_ds.js";import"./StatusDot-DBX2OLtJ.js";import"./Clicky-C5ER3EHE.js";import"./queryClient-CHiZW0I3.js";import"./suspense-ojdhTGrQ.js";import"./useQuery-BWvPSOBc.js";import"./FilterForm-DxDgA4_X.js";import"./formMetadata-BtisHEtV.js";import"./ErrorDetails-Cp1Lwctr.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-b7EhbV3g.js";import"./TreeNode-Iuf_GdNs.js";import"./ObjectGraph-CFbtUXKP.js";import"./ExecutionTree-BgrwzpA3.js";import"./CodeBlock-CkUrwbis.js";import"./CodeDiff-xdcZSl7O.js";import"./SegmentedControl-DGLHJbk9.js";import"./HighlightedTokens-ChkAIihG.js";import"./JsonView-DhDkWXlE.js";import"./RenderedStackTrace-qnOcDfEw.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-D--9Z4EL.js";import"./FrameSourceWindow-qxIQhpxM.js";import"./useDebugAction-6-O7ewEy.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

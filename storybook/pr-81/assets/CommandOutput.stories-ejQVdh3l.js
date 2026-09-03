import{j as r}from"./iframe-Bh7XXvys.js";import{C as e}from"./CommandOutput-CpK_p4ZF.js";import{S as R}from"./rpc-story.fixtures-Cv0kVsHd.js";import"./preload-helper-DzyrSNK7.js";import"./DataTable-BIP9nJJv.js";import"./SortableHeader-Bh8Wg6pF.js";import"./utils-DW-IJACk.js";import"./loading-BeWAmKFr.js";import"./router-CqvDHrw3.js";import"./Modal-VGGZ0I7U.js";import"./index-C-nyn1b0.js";import"./index-C0HwEZFo.js";import"./Icon-HQuVCsfR.js";import"./button-1zr2H7Tt.js";import"./index-CPURVhFy.js";import"./modalStack-DDawoPWy.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-3lMFXQQv.js";import"./floating-ui.react-Xu8Hg7vD.js";import"./FilterPill-CIiFdzIb.js";import"./Combobox-Dqy4m-io.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BJMa9STX.js";import"./MultiSelect-BqC7o387.js";import"./RangeSlider-C28wew7s.js";import"./TimeRange-C2Z1N2l8.js";import"./select-hUFPpv4L.js";import"./WorkloadPicker-Cj6P2Klu.js";import"./NamespacePicker-DYx6ydHc.js";import"./index-B4y0mzWG.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-B5Ay2Kut.js";import"./TagList-ZCmsVu1I.js";import"./Badge-CLQjTA0o.js";import"./HoverCard-iVElIAfc.js";import"./Properties-CBdyQzsD.js";import"./IconButton-CWexuY7n.js";import"./DropdownMenu-ZUX5bVZ1.js";import"./DropdownMenuSubmenu-DuIW7Os6.js";import"./StatusDot-DV_kzQQx.js";import"./Clicky-CZNR-zGN.js";import"./queryClient-CRgoK6JI.js";import"./suspense-tWEA6GW6.js";import"./useQuery-pBlclIxx.js";import"./FilterForm-C-qHvORC.js";import"./formMetadata-D7cj57KT.js";import"./ErrorDetails-jXcWkkO9.js";import"./callout-tones-EFt49BYo.js";import"./Tree-jk53cIXr.js";import"./TreeNode-CifxFeDm.js";import"./ObjectGraph-OzmAezAS.js";import"./ExecutionTree-Bd-jroo0.js";import"./CodeBlock-CNdaE9kq.js";import"./CodeDiff-h0y6egaP.js";import"./SegmentedControl-MRt2Qwr_.js";import"./HighlightedTokens-DT3JqQgF.js";import"./JsonView-BMDAgC3Z.js";import"./RenderedStackTrace-B0v7gtl8.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-xDlzCTkH.js";import"./FrameSourceWindow-DAUdE3z2.js";import"./useDebugAction-ByzDJs7S.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

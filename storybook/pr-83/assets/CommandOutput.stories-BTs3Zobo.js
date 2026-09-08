import{j as r}from"./iframe-D7AEzmiZ.js";import{C as e}from"./CommandOutput-Dme8I0YF.js";import{S as R}from"./rpc-story.fixtures-DZtK2kfL.js";import"./preload-helper-hq9vNfsk.js";import"./DataTable-CUula4VP.js";import"./SortableHeader-CBKuT30E.js";import"./utils-DW-IJACk.js";import"./loading-Cul39Clz.js";import"./router-Cg59AhKP.js";import"./Modal-D4dCfCM0.js";import"./index-DOqUsOzE.js";import"./index-ChecR3Pf.js";import"./Icon-BHlfVGs3.js";import"./button-qcdX8b7r.js";import"./index-CPURVhFy.js";import"./modalStack-BBzzK_XK.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-D6eH6yZ-.js";import"./floating-ui.react-r1UfLjHW.js";import"./FilterPill-D4gg9Vsw.js";import"./Combobox-D00TCDOF.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DDhBpBxg.js";import"./MultiSelect-BqAvyQ3l.js";import"./RangeSlider-BpPWQdDn.js";import"./TimeRange-5vV1xcid.js";import"./select-DzFjSwKH.js";import"./WorkloadPicker-BQqkWkl4.js";import"./NamespacePicker-DsgYgv7u.js";import"./index-BfV7-unC.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-YArT_EBX.js";import"./TagList-Bj3QlKqM.js";import"./Badge-Bdn1ojcv.js";import"./HoverCard-D6mUI4fG.js";import"./Properties-DNVUS-57.js";import"./IconButton-CETqdsAT.js";import"./DropdownMenu-Bs5Osu-C.js";import"./DropdownMenuSubmenu-znATrmj7.js";import"./StatusDot-BjW7HHIe.js";import"./Clicky-xaq7DJ3k.js";import"./queryClient-DHEN_YvS.js";import"./suspense-TEhGRCRW.js";import"./useQuery-CuCo4T3y.js";import"./FilterForm-C4WRgxqX.js";import"./formMetadata-BFtDF-bn.js";import"./ErrorDetails-CJDLhFq0.js";import"./callout-tones-EFt49BYo.js";import"./Tree-B-7Aw9OS.js";import"./TreeNode-CSZW85Dj.js";import"./ObjectGraph-Dms9JXue.js";import"./ExecutionTree-D-VvXZbv.js";import"./CodeBlock-B58cdzam.js";import"./CodeDiff-CanoRRN2.js";import"./SegmentedControl-BOXrsTFe.js";import"./HighlightedTokens-CqqQi_AL.js";import"./JsonView-DUzBdQDr.js";import"./RenderedStackTrace-DhwyuUxf.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-CyotqTci.js";import"./FrameSourceWindow-T1c2e93T.js";import"./useDebugAction-2qMpc3lt.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

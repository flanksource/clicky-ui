import{j as r}from"./iframe-k78te_Hj.js";import{C as e}from"./CommandOutput-EJsasdtY.js";import{S as R}from"./rpc-story.fixtures-C4OUboFs.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-DA76umNm.js";import"./SortableHeader-DjlfW0-T.js";import"./utils-DW-IJACk.js";import"./loading-J2lUy0bP.js";import"./router-C2jIN_T6.js";import"./Modal-C9UBUNoB.js";import"./index-BT2sJ_Ky.js";import"./index-BYV-uwhj.js";import"./Icon-BxFpjwAC.js";import"./button-DOHlwBT1.js";import"./index-CPURVhFy.js";import"./modalStack-gX0DzNXp.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-X4FVmHKq.js";import"./floating-ui.react-CBq0PPGN.js";import"./FilterPill-Bm-1wg7m.js";import"./Combobox-81j1jr0e.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-EQnd0KSf.js";import"./MultiSelect-BgJflaJt.js";import"./RangeSlider-Cc0mKcGR.js";import"./TimeRange-CMd5DcgS.js";import"./select-Dhvd8eXB.js";import"./WorkloadPicker-CgkPF1a_.js";import"./NamespacePicker-SNF8kyXp.js";import"./index-D1FPM4Jg.js";import"./data-table-filter-values-CSqhQ9CN.js";import"./Timestamp-zJlNCp2A.js";import"./TagList-CRmkvovd.js";import"./Badge-BFnEZb7M.js";import"./HoverCard-BBWMBTKn.js";import"./Properties-Cd89NYZQ.js";import"./IconButton-E1lHpWwS.js";import"./DropdownMenu-BAtbfmxv.js";import"./DropdownMenuSubmenu-Bs7Mqmth.js";import"./StatusDot-LQY2ZPAq.js";import"./Clicky-L6WIoiqw.js";import"./queryClient-tVbUJ5BZ.js";import"./suspense-DskWbggu.js";import"./useQuery-ypyrQXqE.js";import"./FilterForm-ggLpxfrb.js";import"./formMetadata-D3Fy5TC6.js";import"./ErrorDetails-BT9TQFB4.js";import"./callout-tones-EFt49BYo.js";import"./Tree-bapT1jHo.js";import"./TreeNode-CFijCCa0.js";import"./ObjectGraph-xIuHiulq.js";import"./ExecutionTree-C9MsVIcD.js";import"./CodeBlock-CUyjypF7.js";import"./CodeDiff-DRhurKgi.js";import"./SegmentedControl-C2zkwnpb.js";import"./HighlightedTokens-DWLn5OT3.js";import"./JsonView-DnkIY1t2.js";import"./RenderedStackTrace-CbeO4X40.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-CVY9d84_.js";import"./FrameSourceWindow-FtyeWwit.js";import"./useDebugAction-CUnZobJa.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

import{j as r}from"./iframe-DAGeDdmW.js";import{C as e}from"./CommandOutput-67GAwRF9.js";import{S as R}from"./rpc-story.fixtures-C-a5U51p.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-Cc5LSKP0.js";import"./SortableHeader-DZZ3Z5vv.js";import"./utils-DW-IJACk.js";import"./loading-bJuzykOR.js";import"./router-CBmx4Jzs.js";import"./Modal-D6taPS5_.js";import"./index-DLrg9pPu.js";import"./index-DIhTiILn.js";import"./Icon-IzT7REGK.js";import"./button-B7rSq3cQ.js";import"./index-CPURVhFy.js";import"./modalStack-Cb0rES9i.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-6Q0dYKcM.js";import"./floating-ui.react-BkCnCGeJ.js";import"./FilterPill-DV-iQbbS.js";import"./Combobox-HGgQ0fO7.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Bwg-aphn.js";import"./MultiSelect-BlqhYQ5i.js";import"./RangeSlider-BgtPntN_.js";import"./TimeRange-DDd7oDN_.js";import"./select-Bi98GQIF.js";import"./WorkloadPicker-DDYK6JQf.js";import"./NamespacePicker-DRk60EPo.js";import"./index-WFHNvFaJ.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-Do3doFXk.js";import"./TagList-uFsLomSl.js";import"./Badge-W8TfuLL4.js";import"./HoverCard-BVfeNivj.js";import"./Properties-DcW2ye_v.js";import"./IconButton-Cr79YAU0.js";import"./DropdownMenu-JxGWd7zY.js";import"./DropdownMenuSubmenu-YmOPmNs-.js";import"./StatusDot-CAKBy3jR.js";import"./Clicky-ysMp2Mfh.js";import"./queryClient-NtwOMX7T.js";import"./suspense-BgUQddI1.js";import"./useQuery-DPrJDEgq.js";import"./FilterForm-POe5elQQ.js";import"./formMetadata-BOWeUsV9.js";import"./ErrorDetails-BIZExQRA.js";import"./callout-tones-EFt49BYo.js";import"./Tree-Bl2ptou_.js";import"./TreeNode-BRKxvKVJ.js";import"./ObjectGraph-Iw2RANwN.js";import"./ExecutionTree-BmXIDCZF.js";import"./CodeBlock-B6Z1SYpv.js";import"./CodeDiff-DIxTmBMR.js";import"./SegmentedControl-Cbj_nPje.js";import"./HighlightedTokens-CQRR7KfC.js";import"./JsonView-CndWyCj7.js";import"./RenderedStackTrace-IZFwGdsh.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BaQ1VhnK.js";import"./FrameSourceWindow-DF77MPxh.js";import"./useDebugAction-DVRIKlrE.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

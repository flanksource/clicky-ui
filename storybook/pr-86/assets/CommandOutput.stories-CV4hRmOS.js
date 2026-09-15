import{j as r}from"./iframe-DXjk5r-a.js";import{C as e}from"./CommandOutput-CyBWh5Vk.js";import{S as R}from"./rpc-story.fixtures-CGdfi072.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-QSp3LAwe.js";import"./SortableHeader-CDwznuTv.js";import"./utils-DW-IJACk.js";import"./loading-BGtnCp6V.js";import"./router-DXs6ftMD.js";import"./Modal-Bq-6F7LO.js";import"./index-BXQtcMly.js";import"./index-DcGoyOOZ.js";import"./Icon-DC7PbjMy.js";import"./button-BoSQcAdS.js";import"./index-CPURVhFy.js";import"./modalStack-tAQFSeFw.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DxL2iI-z.js";import"./floating-ui.react-DFDYvl7a.js";import"./FilterPill-C1-hwJnr.js";import"./Combobox-DTKDJYLQ.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CTflUDHL.js";import"./MultiSelect-DMD8O2sG.js";import"./RangeSlider-Ctwoo3Lf.js";import"./TimeRange-Bna3ZH0Q.js";import"./select-UzLT567R.js";import"./WorkloadPicker-C4vKrULT.js";import"./NamespacePicker-D99LKdld.js";import"./index-D-rj_gHz.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-r26xL-q6.js";import"./TagList-BuzzaUpd.js";import"./Badge-qnkM4cgH.js";import"./HoverCard-Cz1NFyc2.js";import"./Properties-CEZabCUC.js";import"./IconButton-B59a0ru2.js";import"./DropdownMenu-BFy8-TKA.js";import"./DropdownMenuSubmenu-Bghn0JQN.js";import"./StatusDot-D9b_2rby.js";import"./Clicky-BO-GfAY-.js";import"./queryClient-DL-kTQun.js";import"./suspense-BJOBIgJY.js";import"./useQuery-B3ePGiUv.js";import"./FilterForm-D8cM8yOi.js";import"./formMetadata-BZ5IZa7B.js";import"./ErrorDetails-ZuV5GQYO.js";import"./callout-tones-EFt49BYo.js";import"./Tree-3SWyyCR3.js";import"./TreeNode-BOQeque-.js";import"./ObjectGraph-BmK2ljx9.js";import"./ExecutionTree-D5SBYhGi.js";import"./CodeBlock-8h7eJ8il.js";import"./CodeDiff-Bf4QUU4a.js";import"./SegmentedControl-Ch-FYi_O.js";import"./HighlightedTokens-BBAz76nG.js";import"./JsonView-DH-PlnAk.js";import"./RenderedStackTrace--2oWGmuF.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-C91KNGhP.js";import"./FrameSourceWindow-DcXfGkJ6.js";import"./useDebugAction-CW6jQJuk.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

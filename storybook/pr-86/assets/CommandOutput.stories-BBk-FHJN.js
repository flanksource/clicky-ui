import{j as r}from"./iframe-CFT3PPR7.js";import{C as e}from"./CommandOutput-K_dvub--.js";import{S as R}from"./rpc-story.fixtures-W5MCeKfG.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-jg-aZ-G_.js";import"./SortableHeader-C15D8izr.js";import"./utils-DW-IJACk.js";import"./loading-CZrrBIDI.js";import"./router-bgDXBgyR.js";import"./Modal-q-Oedu08.js";import"./index-2WZ1FKdz.js";import"./index-Cuo_DFmu.js";import"./Icon-BtbnjFB3.js";import"./button-DVB_uS1L.js";import"./index-CPURVhFy.js";import"./modalStack-CgLVCW7W.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CW1EPL40.js";import"./floating-ui.react-BIMNxrra.js";import"./FilterPill-aZ9lMIbE.js";import"./Combobox-JcCkqfEl.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BvZoFhZz.js";import"./MultiSelect-BA9DLaOZ.js";import"./RangeSlider-BAKm_4gN.js";import"./TimeRange-B1lx3b3C.js";import"./select-fgB8vsMD.js";import"./WorkloadPicker-4yZgarkk.js";import"./NamespacePicker-BHwStTgj.js";import"./index-U8fu4Fjz.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-BXOQhDRg.js";import"./TagList-DpuLQomw.js";import"./Badge-_cJrrU_8.js";import"./HoverCard-emUxSVBc.js";import"./Properties-C4f_yUo4.js";import"./IconButton-nSFQuYkv.js";import"./DropdownMenu-BWzAonWM.js";import"./DropdownMenuSubmenu-CqV515YL.js";import"./StatusDot-DcVv8O7y.js";import"./Clicky-DNlDINvU.js";import"./queryClient-B3Ufww9f.js";import"./suspense-CMYBzrC5.js";import"./useQuery-DW63Njhy.js";import"./FilterForm-DWYWKSPO.js";import"./formMetadata-i8BfuHGp.js";import"./ErrorDetails-BfX8wafn.js";import"./callout-tones-EFt49BYo.js";import"./Tree-BG8yCHo2.js";import"./TreeNode-CaLChSXB.js";import"./ObjectGraph-D0CYt2t7.js";import"./ExecutionTree-J6LI2SBp.js";import"./CodeBlock-DxvH5hIX.js";import"./CodeDiff-CbE20wkz.js";import"./SegmentedControl-DhvSlB-L.js";import"./HighlightedTokens-C9CWsjZW.js";import"./JsonView-mYXqMmJi.js";import"./RenderedStackTrace-B53LGH8s.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-D7Heza9G.js";import"./FrameSourceWindow-14DjSDQX.js";import"./useDebugAction-cCtPh4SS.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

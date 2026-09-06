import{j as r}from"./iframe-psk4-kN7.js";import{C as e}from"./CommandOutput-yJpLrLXK.js";import{S as R}from"./rpc-story.fixtures-Dt58kDRs.js";import"./preload-helper-DUVrmzNZ.js";import"./DataTable-B7zEHXp0.js";import"./SortableHeader-ByibVpHJ.js";import"./utils-DW-IJACk.js";import"./loading-D0L0VhvC.js";import"./router-DFu62v1B.js";import"./Modal-DAN5RH3G.js";import"./index-DdkbI2pk.js";import"./index-Q2ctqHt2.js";import"./Icon-CGpuyfCp.js";import"./button-CPGxxxwO.js";import"./index-CPURVhFy.js";import"./modalStack-BlX58fkl.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DNhgPy1r.js";import"./floating-ui.react-BIHz11iz.js";import"./FilterPill-VYWKOgBB.js";import"./Combobox-CcosoLNL.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Bjum2p3t.js";import"./MultiSelect-DS9XvU5V.js";import"./RangeSlider-DovUWp52.js";import"./TimeRange-B8QBymtq.js";import"./select-CycYSFvd.js";import"./WorkloadPicker-D8qZOb9h.js";import"./NamespacePicker-BUiSk4Ph.js";import"./index-DPRIgtOH.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-EYlf3_se.js";import"./TagList-u2zFfgZ8.js";import"./Badge-C2sQY84x.js";import"./HoverCard-BWPHO9Mj.js";import"./Properties-CtGSsFHi.js";import"./IconButton-D4hqm9l7.js";import"./DropdownMenu-BV9KNdAW.js";import"./DropdownMenuSubmenu-CB5wmKqJ.js";import"./StatusDot-B77E0gAV.js";import"./Clicky-BmSeayDd.js";import"./queryClient-BRem-Spp.js";import"./suspense-CTQZLh5T.js";import"./useQuery-DZQopt6K.js";import"./FilterForm-sz-aFGM5.js";import"./formMetadata-iJKzMo8W.js";import"./ErrorDetails-vhhDEZdb.js";import"./callout-tones-EFt49BYo.js";import"./Tree-DCzr_VP2.js";import"./TreeNode-DLTYW6H6.js";import"./ObjectGraph-DXQfuTA5.js";import"./ExecutionTree---uazz0a.js";import"./CodeBlock-ahqySRwc.js";import"./CodeDiff-HhQN2est.js";import"./SegmentedControl-CdMMoXut.js";import"./HighlightedTokens-aqA6-bm6.js";import"./JsonView-Dd4DfbVp.js";import"./RenderedStackTrace-BeRN9zOx.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-9f1EdnID.js";import"./FrameSourceWindow-OgiPdBSK.js";import"./useDebugAction-tz3Xm25P.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

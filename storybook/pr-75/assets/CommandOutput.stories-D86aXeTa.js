import{j as r}from"./iframe-RmXz6z0S.js";import{C as e}from"./CommandOutput-CnNlf54A.js";import{S as R}from"./rpc-story.fixtures-m8IsWbES.js";import"./preload-helper-CoNDIDFR.js";import"./DataTable-SQX1Gi-o.js";import"./SortableHeader-t15JkYge.js";import"./utils-DW-IJACk.js";import"./loading-BitfFYjk.js";import"./router-CFy29cvu.js";import"./Modal-BFAiABMN.js";import"./index-Dcplh2pp.js";import"./index-B9HoHPg8.js";import"./Icon-C5PBASJ5.js";import"./button-CGTHhixy.js";import"./index-CPURVhFy.js";import"./modalStack-BrOZVbb2.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Kw-e-6Qi.js";import"./floating-ui.react-CS_5YbfH.js";import"./FilterPill-Ck-4zSqW.js";import"./Combobox-BiiHI8Uh.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BhiY2EDa.js";import"./MultiSelect-DFvo3-rs.js";import"./RangeSlider-DSuzfLyY.js";import"./TimeRange-DHR2eMeN.js";import"./select-Cy4bIbtK.js";import"./WorkloadPicker-CivJOvty.js";import"./NamespacePicker-DOFzT_QR.js";import"./index-WgtKURfM.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DQEzJFbR.js";import"./TagList-2sd8TuOM.js";import"./Badge-CdYIPEjV.js";import"./HoverCard-DfO4Rl00.js";import"./Properties-Ccz0EXY_.js";import"./IconButton-DzDBcChJ.js";import"./DropdownMenu-CnJq5_O0.js";import"./DropdownMenuSubmenu-_lJsyYNk.js";import"./StatusDot-BlXXi_VZ.js";import"./Clicky-DskDj99m.js";import"./queryClient-CgiikRyB.js";import"./suspense-BrXEkBH0.js";import"./useQuery-CyBPWMcD.js";import"./FilterForm-CIuA_8pT.js";import"./formMetadata-DDk4bXH3.js";import"./ErrorDetails-c6O7ZY0f.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-BrpWJiDj.js";import"./TreeNode-DmCY8hO2.js";import"./ObjectGraph-BZIGhG3e.js";import"./ExecutionTree-Dcvy7l3s.js";import"./CodeBlock-CoJJ2mS1.js";import"./CodeDiff-7vCxYKi_.js";import"./SegmentedControl-BZ9aJu3d.js";import"./HighlightedTokens-COG8Yyzj.js";import"./JsonView-oLDEacYi.js";import"./RenderedStackTrace-CRfd62lo.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DeJC8Gst.js";import"./FrameSourceWindow-CUvjA4a_.js";import"./useDebugAction-Cdzr6FAR.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

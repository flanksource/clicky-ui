import{j as r}from"./iframe-CrD5m2_8.js";import{C as e}from"./CommandOutput-Bdezrx7A.js";import{S as R}from"./rpc-story.fixtures-DyyUfK--.js";import"./preload-helper-C9Uksf5K.js";import"./DataTable-B8o1S3iW.js";import"./SortableHeader-CimHLGMi.js";import"./utils-DW-IJACk.js";import"./loading-Czeqb770.js";import"./Modal-H6VyPbTT.js";import"./index-oGxvMW6m.js";import"./index-BJrxtn44.js";import"./Icon-BTfkw-8h.js";import"./button-KKR3itPP.js";import"./index-CPURVhFy.js";import"./modalStack-DuaGAyy0.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-ColiWGHi.js";import"./floating-ui.react-CP7HTaTu.js";import"./FilterPill-B9M6udAn.js";import"./Combobox-kceivp8R.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CLtlKQIR.js";import"./MultiSelect-CS-_mmVi.js";import"./RangeSlider-DmYc5Dvi.js";import"./TimeRange-llyFu8Yj.js";import"./select-uQCbSidz.js";import"./WorkloadPicker-BpYXZ4B8.js";import"./NamespacePicker-BqHZ_WXk.js";import"./index-DsV-XxBU.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-Bl8mDqMl.js";import"./TagList-C78p_-U5.js";import"./Badge-6O7NPDyz.js";import"./HoverCard-CaFs7vh3.js";import"./Properties-CMwdn48z.js";import"./IconButton-s9Ye4kh3.js";import"./DropdownMenu-O6TM5ArU.js";import"./DropdownMenuSubmenu-BtYF0q-O.js";import"./StatusDot-BzW9rWld.js";import"./Clicky-BGvsh995.js";import"./queryClient-6cI7ofQB.js";import"./suspense-4rh80laa.js";import"./useQuery-DVuYFBhL.js";import"./FilterForm-B8jz4ubH.js";import"./formMetadata-CW70M6H2.js";import"./ErrorDetails-BIUDX8JD.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-MaVHVy7U.js";import"./TreeNode-r2emkaoE.js";import"./ObjectGraph-Cyvhr2CN.js";import"./ExecutionTree-DNhsU-Y3.js";import"./CodeBlock-CTLlgyHX.js";import"./CodeDiff-fmI1Ggr0.js";import"./SegmentedControl-DP3H7NPi.js";import"./HighlightedTokens-QgaQpfaO.js";import"./JsonView-DEJsAVUp.js";import"./RenderedStackTrace-BcmhKclb.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BDP0J5xJ.js";import"./FrameSourceWindow-CK7fv0vZ.js";import"./useDebugAction-C106VQfk.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

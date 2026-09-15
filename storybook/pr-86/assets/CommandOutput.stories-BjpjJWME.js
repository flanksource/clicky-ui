import{j as r}from"./iframe-DjmuE4jL.js";import{C as e}from"./CommandOutput-3UqyoE8Q.js";import{S as R}from"./rpc-story.fixtures-Cpnm3tY_.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-C6R08AKo.js";import"./SortableHeader-M0QqTLRx.js";import"./utils-DW-IJACk.js";import"./loading-CIXZB-Vg.js";import"./router-BIBQ48gO.js";import"./Modal-DPVG7uwk.js";import"./index-DZmA724K.js";import"./index-Bf_L3Tie.js";import"./Icon-C3mJVtxE.js";import"./button-CwDkfInQ.js";import"./index-CPURVhFy.js";import"./modalStack-gNmWCtk4.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-ChNFoE52.js";import"./floating-ui.react-zKcHaoGq.js";import"./FilterPill-CDqCSexL.js";import"./Combobox-DRIkcNZT.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-bL30AuWP.js";import"./MultiSelect-h7Bnf5jm.js";import"./RangeSlider-Wl4HWB35.js";import"./TimeRange-BZQfu9em.js";import"./select-B4Xau9Ne.js";import"./WorkloadPicker-Drz_yXZ8.js";import"./NamespacePicker-B-63LWhI.js";import"./index-Ity8I7Gl.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DwDG_0Xi.js";import"./TagList-BHO663R9.js";import"./Badge-_r0umWW7.js";import"./HoverCard-CCoesVvM.js";import"./Properties-CLacWsQP.js";import"./IconButton-CJNKOjat.js";import"./DropdownMenu-CgWHxY8D.js";import"./DropdownMenuSubmenu-nj4uXUjm.js";import"./StatusDot-rW4eehJ-.js";import"./Clicky-xDHxe1Ex.js";import"./queryClient-CT8tLKEt.js";import"./suspense-TU5RWD39.js";import"./useQuery-D8ri18i3.js";import"./FilterForm-BE6In58g.js";import"./formMetadata-DHBDnzZ7.js";import"./ErrorDetails-DpmTUZ90.js";import"./callout-tones-EFt49BYo.js";import"./Tree-CQDzfY0D.js";import"./TreeNode-BJNMFR3B.js";import"./ObjectGraph-C3wN3-xH.js";import"./ExecutionTree-BfGoXW2R.js";import"./CodeBlock-_1YuNjJd.js";import"./CodeDiff-C1quLkfP.js";import"./SegmentedControl-DVl7a-nW.js";import"./HighlightedTokens-Y7Ki5_Ub.js";import"./JsonView-B0Mwcaam.js";import"./RenderedStackTrace-Dii8eWom.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-c-cgGx-w.js";import"./FrameSourceWindow-B1nL0dmN.js";import"./useDebugAction-8YBazPCz.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

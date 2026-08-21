import{j as r}from"./iframe-DiVtfPK2.js";import{C as e}from"./CommandOutput-B6muzX-v.js";import{S as R}from"./rpc-story.fixtures-DqET-aaz.js";import"./preload-helper-BHaa9cja.js";import"./DataTable-P0CFGomP.js";import"./SortableHeader-B4E7kRS2.js";import"./utils-DW-IJACk.js";import"./loading-DDAQP9UA.js";import"./Modal-DmCI3xWC.js";import"./index-S0SA--oV.js";import"./index-Cv07EZkj.js";import"./Icon-NtM811xi.js";import"./button-DQujlY7L.js";import"./index-CPURVhFy.js";import"./modalStack-bLrEb3vK.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DaCFwTUm.js";import"./floating-ui.react-sYWlUL6v.js";import"./FilterPill-CLZSJksL.js";import"./Combobox-DOKJeV5v.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-uV7vvtgQ.js";import"./MultiSelect-DU78DL7G.js";import"./RangeSlider-P_SAj0PA.js";import"./TimeRange-D85Kepw2.js";import"./select-BWijJE8K.js";import"./WorkloadPicker-Bs53dJgR.js";import"./NamespacePicker-Lm4uWUri.js";import"./index-5Kmmjtm5.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DJ-hsR0p.js";import"./TagList-DJ1l4JI_.js";import"./Badge-DV25O-zd.js";import"./HoverCard-D5ofP5CE.js";import"./Properties-zzr_I9sH.js";import"./IconButton-ByjbT3vg.js";import"./DropdownMenu-0Ee7Y1-C.js";import"./DropdownMenuSubmenu-D71dXQcu.js";import"./StatusDot-CDqlegVk.js";import"./Clicky-DgVs1-Xu.js";import"./queryClient-CZbVF_4o.js";import"./suspense-BLFyOtB0.js";import"./useQuery-DgxYXok0.js";import"./FilterForm-DGeOZarV.js";import"./formMetadata-DTAGMC8P.js";import"./types-BHfRQr8X.js";import"./ErrorDetails-CTVtgzdB.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-BGxX_Snm.js";import"./TreeNode-D1HS8Rus.js";import"./ObjectGraph-DnqVUebT.js";import"./ExecutionTree-BYgKDww4.js";import"./CodeBlock-CQpAP_t-.js";import"./CodeDiff-DWiu48Kp.js";import"./SegmentedControl-DexSLgxu.js";import"./code-highlight-D4J1xWXq.js";import"./JsonView-D_d0ZEjl.js";import"./RenderedStackTrace-_UHc68S8.js";import"./useQueryInfo-D2wcQc6q.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Pr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,n,p;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(p=(n=t.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const br=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,br as __namedExportsOrder,Pr as default};

import{j as r}from"./iframe-Cui5-lWu.js";import{C as e}from"./CommandOutput-Ce62Kbi6.js";import{S as R}from"./rpc-story.fixtures-B8ZybSi7.js";import"./preload-helper-C9Uksf5K.js";import"./DataTable-DrrP51Ey.js";import"./SortableHeader-B7v60GNz.js";import"./utils-DW-IJACk.js";import"./loading-Dsn8OLUr.js";import"./Modal-BDeNABtC.js";import"./index-EXwF3-1q.js";import"./index-Cd5L4RPL.js";import"./Icon-DK_SiWhj.js";import"./button-B1GBh7k-.js";import"./index-CPURVhFy.js";import"./modalStack-BWOZdhrQ.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-B9zEEoih.js";import"./floating-ui.react-CERrJHOI.js";import"./FilterPill-sfj4fjir.js";import"./Combobox-HV3zHzde.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DanjWDsK.js";import"./MultiSelect-Dca93yNo.js";import"./RangeSlider-cDlcNKHZ.js";import"./TimeRange-Qmqi_tJV.js";import"./select-Bnw_woz1.js";import"./WorkloadPicker-D-3ZTc-6.js";import"./NamespacePicker-BVusxqQC.js";import"./index-DqcnNpE3.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-CD2HJyjD.js";import"./TagList-DsqWc1C7.js";import"./Badge-Nh1zFh-t.js";import"./HoverCard-BsCmg4MU.js";import"./Properties-CdsrF0MW.js";import"./IconButton-C_A6gc3j.js";import"./DropdownMenu-1sKun-B3.js";import"./DropdownMenuSubmenu-BZtutcE9.js";import"./StatusDot-aYqbt3gq.js";import"./Clicky-CC3kI55N.js";import"./queryClient-Cksu0eHS.js";import"./suspense-s9sBhEqN.js";import"./useQuery-QE0EXqL3.js";import"./FilterForm-DwFV14wl.js";import"./formMetadata-B9GYL8Qy.js";import"./ErrorDetails-B2D7AcFY.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-CoOoAKFL.js";import"./TreeNode-kxqVwoRa.js";import"./ObjectGraph-DR1ipvnI.js";import"./ExecutionTree-DHL_RHdp.js";import"./CodeBlock-6jn2smJ_.js";import"./CodeDiff-6E7h9ssq.js";import"./SegmentedControl-DG1Kr2qQ.js";import"./HighlightedTokens-NgVqTPUb.js";import"./JsonView-BGz0sXjE.js";import"./RenderedStackTrace-mUxbP7wi.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-CBqqgZcl.js";import"./FrameSourceWindow-SGDm_o0Y.js";import"./useDebugAction-Pcjm1un5.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

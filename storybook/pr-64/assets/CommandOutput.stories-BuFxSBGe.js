import{j as r}from"./iframe-ByC1ls-M.js";import{C as e}from"./CommandOutput-1t8AmRnR.js";import{S as R}from"./rpc-story.fixtures-DOxfLC-G.js";import"./preload-helper-BAJsONWX.js";import"./DataTable-BhLyMJVI.js";import"./SortableHeader-DrDNFpjm.js";import"./utils-DW-IJACk.js";import"./loading-Qasy5AD_.js";import"./Modal-BThmpliZ.js";import"./index-D8ux8KM0.js";import"./index-DKBAnPzp.js";import"./Icon-BgvA8nny.js";import"./button-DiEVhEjn.js";import"./index-CPURVhFy.js";import"./modalStack-CsMy4aGM.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-edtqs6sk.js";import"./floating-ui.react-DzWLi3sO.js";import"./FilterPill-Cz9-D2Wu.js";import"./Combobox-_TjyhqvM.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CjpBAGbb.js";import"./MultiSelect-Bfve3y_7.js";import"./RangeSlider-DO0P1zzn.js";import"./TimeRange-0ZtdzrsU.js";import"./select-C9XnIfze.js";import"./WorkloadPicker-a2etsy5T.js";import"./NamespacePicker-C2wz1T83.js";import"./index-DzE-Kbk2.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-CbumJRyw.js";import"./TagList-HqItwwGM.js";import"./Badge-DaXIBDgi.js";import"./HoverCard-BlMNXGm6.js";import"./Properties-B3Q4iN18.js";import"./IconButton-ms6cZBmC.js";import"./DropdownMenu-D49-J0hi.js";import"./DropdownMenuSubmenu-90HEXavu.js";import"./StatusDot-DkrA9mrE.js";import"./Clicky-BIXdKci0.js";import"./queryClient-DkIYd0-k.js";import"./suspense-q6y3-W4x.js";import"./useQuery-BV5yeLpj.js";import"./FilterForm-DZkNv7Ex.js";import"./formMetadata-BDLO7_Sf.js";import"./types-BHfRQr8X.js";import"./ErrorDetails-z1in0B-8.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-T1CSnizY.js";import"./TreeNode-B44RffwJ.js";import"./ObjectGraph-0e2gF7kn.js";import"./ExecutionTree-IxrDUIJi.js";import"./CodeBlock-Pp0PuTxB.js";import"./CodeDiff-DD-qaw4Z.js";import"./SegmentedControl-BT3WfguV.js";import"./code-highlight-DknG25m0.js";import"./JsonView-BO7ZhKl5.js";import"./RenderedStackTrace-DqaTEOWN.js";import"./useQueryInfo-NsMZMyFs.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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

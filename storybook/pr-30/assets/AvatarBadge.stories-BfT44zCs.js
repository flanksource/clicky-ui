import{a as v}from"./AvatarBadge-D5zUFGCg.js";import{U as b}from"./UiWarningTriangle-4ijMoeWg.js";import{a as f}from"./UiCheck-BqyrKFDU.js";import"./iframe-DLWo_D3a.js";import"./preload-helper-D5l2DbWZ.js";import"./utils-BLSKlp9E.js";import"./Icon-DgfT7ULk.js";const U={title:"Data/AvatarBadge",component:v,tags:["autodocs"],parameters:{docs:{description:{component:"A pill that pairs an `Avatar` with a label and an optional trailing status `Icon`, with an optional multi-line comment beneath. Used for assignee/owner chips and review rows."}}},argTypes:{alt:{control:"text"},label:{control:"text"},initials:{control:"text"},avatarKind:{control:"inline-radio",options:["user","bot","service"]},avatarVariant:{control:"inline-radio",options:["duotone","filled","outline"]},size:{control:"inline-radio",options:["sm","md","lg","xl"]},comment:{control:"text"}},args:{alt:"Ada Lovelace",label:"Ada Lovelace",avatarKind:"user",size:"lg"}},e={},a={args:{statusIcon:f,statusTone:"emerald",statusTitle:"Approved"}},t={args:{statusIcon:b,statusTone:"amber",comment:"Requested changes on the migration step before this can merge."}},r={args:{alt:"Grace Hopper",label:"Grace Hopper",initials:"GH"}};var o,s,n;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:"{}",...(n=(s=e.parameters)==null?void 0:s.docs)==null?void 0:n.source}}};var i,c,l;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    statusIcon: UiCheckFilled,
    statusTone: "emerald",
    statusTitle: "Approved"
  }
}`,...(l=(c=a.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var m,p,d;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    statusIcon: UiWarningTriangle,
    statusTone: "amber",
    comment: "Requested changes on the migration step before this can merge."
  }
}`,...(d=(p=t.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var u,g,h;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    alt: "Grace Hopper",
    label: "Grace Hopper",
    initials: "GH"
  }
}`,...(h=(g=r.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};const W=["Default","WithStatus","WithComment","Initials"];export{e as Default,r as Initials,t as WithComment,a as WithStatus,W as __namedExportsOrder,U as default};

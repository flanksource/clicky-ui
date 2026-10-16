import{j as r}from"./iframe-BUpmsD4_.js";import{T as i,n as T}from"./TagList-DnAzIPxU.js";import"./preload-helper-PGaPgbNH.js";import"./Badge-CU99F48u.js";import"./utils-DW-IJACk.js";import"./badge-variants-BNgEarpT.js";import"./index-CPURVhFy.js";import"./Icon-DTAROQQs.js";import"./HoverCard-CJMlbbGv.js";import"./index-D9pyqf52.js";import"./index-CsPwRm8U.js";import"./modalStack-Gk9S97tn.js";import"./zIndex-BGbNBNA8.js";import"./Properties-CzvVSyin.js";import"./IconButton-CdsDTQWb.js";import"./DropdownMenu-LyJi-wEU.js";import"./floating-ui.react-Ct-n3Sdx.js";import"./button-C45Fp5VT.js";import"./loading-BVCwDMQn.js";import"./DropdownMenuSubmenu-06pkj9qc.js";import"./format-2niohfpq.js";import"./JsonView-B4Nw9Fl0.js";import"./AccordionList-BTEWzV6y.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";const b=T(["env=production","team=payments","region=us-east-1","tier=critical","owner=ada"]),K={title:"Data/Cells/TagList",component:i,tags:["autodocs"],parameters:{docs:{description:{component:"Renders normalized `key=value` tags as compact badges for table cells. By default it shows `maxVisible` inline and collapses the rest into a `+N` hover popover; `wrap` lays them out across lines instead. Hovering a badge reveals include/exclude/copy actions (wired via `TagActionsProvider`). Build the input with `normalizeTags`."}}},argTypes:{maxVisible:{control:{type:"number",min:1,max:6}},actions:{control:"inline-radio",options:["hover","inline"]},compact:{control:"boolean"},wrap:{control:"boolean"},tags:{control:!1}},args:{tags:b,maxVisible:3,actions:"hover",wrap:!1}},e={render:a=>r.jsx("div",{className:"w-80",children:r.jsx(i,{...a})})},s={args:{wrap:!0},render:a=>r.jsx("div",{className:"w-80",children:r.jsx(i,{...a})})},o={args:{compact:!0},render:a=>r.jsx("div",{className:"w-80",children:r.jsx(i,{...a})})},t={args:{tags:[]}};var n,m,p;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: args => <div className="w-80">
      <TagList {...args} />
    </div>
}`,...(p=(m=e.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var c,d,l;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    wrap: true
  },
  render: args => <div className="w-80">
      <TagList {...args} />
    </div>
}`,...(l=(d=s.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};var g,u,v;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    compact: true
  },
  render: args => <div className="w-80">
      <TagList {...args} />
    </div>
}`,...(v=(u=o.parameters)==null?void 0:u.docs)==null?void 0:v.source}}};var w,x,h;t.parameters={...t.parameters,docs:{...(w=t.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    tags: []
  }
}`,...(h=(x=t.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};const M=["Default","Wrapped","Compact","Empty"];export{o as Compact,e as Default,t as Empty,s as Wrapped,M as __namedExportsOrder,K as default};

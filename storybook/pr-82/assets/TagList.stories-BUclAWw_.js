import{j as r}from"./iframe-psk4-kN7.js";import{T as i,n as T}from"./TagList-u2zFfgZ8.js";import"./preload-helper-DUVrmzNZ.js";import"./Badge-C2sQY84x.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./Icon-CGpuyfCp.js";import"./HoverCard-BWPHO9Mj.js";import"./index-DdkbI2pk.js";import"./index-Q2ctqHt2.js";import"./modalStack-BlX58fkl.js";import"./zIndex-BGbNBNA8.js";import"./Properties-CtGSsFHi.js";import"./IconButton-D4hqm9l7.js";import"./DropdownMenu-BV9KNdAW.js";import"./floating-ui.react-BIHz11iz.js";import"./button-CPGxxxwO.js";import"./loading-D0L0VhvC.js";import"./DropdownMenuSubmenu-CB5wmKqJ.js";const b=T(["env=production","team=payments","region=us-east-1","tier=critical","owner=ada"]),O={title:"Data/Cells/TagList",component:i,tags:["autodocs"],parameters:{docs:{description:{component:"Renders normalized `key=value` tags as compact badges for table cells. By default it shows `maxVisible` inline and collapses the rest into a `+N` hover popover; `wrap` lays them out across lines instead. Hovering a badge reveals include/exclude/copy actions (wired via `TagActionsProvider`). Build the input with `normalizeTags`."}}},argTypes:{maxVisible:{control:{type:"number",min:1,max:6}},actions:{control:"inline-radio",options:["hover","inline"]},compact:{control:"boolean"},wrap:{control:"boolean"},tags:{control:!1}},args:{tags:b,maxVisible:3,actions:"hover",wrap:!1}},e={render:a=>r.jsx("div",{className:"w-80",children:r.jsx(i,{...a})})},s={args:{wrap:!0},render:a=>r.jsx("div",{className:"w-80",children:r.jsx(i,{...a})})},o={args:{compact:!0},render:a=>r.jsx("div",{className:"w-80",children:r.jsx(i,{...a})})},t={args:{tags:[]}};var n,c,m;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: args => <div className="w-80">
      <TagList {...args} />
    </div>
}`,...(m=(c=e.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var p,d,l;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(h=(x=t.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};const P=["Default","Wrapped","Compact","Empty"];export{o as Compact,e as Default,t as Empty,s as Wrapped,P as __namedExportsOrder,O as default};

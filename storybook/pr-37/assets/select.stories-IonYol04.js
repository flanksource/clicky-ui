import{j as e}from"./iframe-BZbOQtFx.js";import{S}from"./select-BnxjSEer.js";import"./preload-helper-B2wK-Kjy.js";import"./utils-BLSKlp9E.js";import"./Icon-rviauDIl.js";import"./UiChevronDown-H5W8lwGu.js";const v=[{value:"us-east-1",label:"US East (N. Virginia)"},{value:"us-west-2",label:"US West (Oregon)"},{value:"eu-west-1",label:"EU (Ireland)"},{value:"ap-southeast-2",label:"Asia Pacific (Sydney)",disabled:!0}],D={title:"Components/Select",component:S,tags:["autodocs"],parameters:{docs:{description:{component:"Thin wrapper over a native `<select>` with the shared control chrome and a chevron adornment. Pass `options` for the common case or `children` (`<option>`/`<optgroup>`) for full control. For a searchable popover use `Combobox`."}}},argTypes:{placeholder:{control:"text",description:"Disabled leading option shown when value is empty."},disabled:{control:"boolean"},options:{control:!1}},args:{options:v,placeholder:"Select a region",defaultValue:""}},o={},a={args:{defaultValue:"us-west-2"}},r={args:{disabled:!0,defaultValue:"us-east-1"}},s={args:{options:void 0,placeholder:void 0,defaultValue:"json"},render:f=>e.jsxs(S,{...f,children:[e.jsxs("optgroup",{label:"Structured",children:[e.jsx("option",{value:"json",children:"JSON"}),e.jsx("option",{value:"yaml",children:"YAML"})]}),e.jsx("optgroup",{label:"Tabular",children:e.jsx("option",{value:"csv",children:"CSV"})})]})};var t,n,l;o.parameters={...o.parameters,docs:{...(t=o.parameters)==null?void 0:t.docs,source:{originalSource:"{}",...(l=(n=o.parameters)==null?void 0:n.docs)==null?void 0:l.source}}};var c,p,i;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    defaultValue: "us-west-2"
  }
}`,...(i=(p=a.parameters)==null?void 0:p.docs)==null?void 0:i.source}}};var u,d,m;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: "us-east-1"
  }
}`,...(m=(d=r.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var g,h,b;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    options: undefined,
    placeholder: undefined,
    defaultValue: "json"
  },
  render: args => <Select {...args}>
      <optgroup label="Structured">
        <option value="json">JSON</option>
        <option value="yaml">YAML</option>
      </optgroup>
      <optgroup label="Tabular">
        <option value="csv">CSV</option>
      </optgroup>
    </Select>
}`,...(b=(h=s.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};const E=["Default","Preselected","Disabled","WithChildren"];export{o as Default,r as Disabled,a as Preselected,s as WithChildren,E as __namedExportsOrder,D as default};

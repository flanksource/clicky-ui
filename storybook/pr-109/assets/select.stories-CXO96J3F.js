import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./select-Dm3V5pY3.js";var i,a,o,s,c,l,u;function d(){return(d=e((()=>{n(),i=t(),a={title:`Components/Select`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:"Thin wrapper over a native `<select>` with the shared control chrome and a chevron adornment. Pass `options` for the common case or `children` (`<option>`/`<optgroup>`) for full control. For a searchable popover use `Combobox`."}}},argTypes:{placeholder:{control:`text`,description:`Disabled leading option shown when value is empty.`},disabled:{control:`boolean`},options:{control:!1}},args:{options:[{value:`us-east-1`,label:`US East (N. Virginia)`},{value:`us-west-2`,label:`US West (Oregon)`},{value:`eu-west-1`,label:`EU (Ireland)`},{value:`ap-southeast-2`,label:`Asia Pacific (Sydney)`,disabled:!0}],placeholder:`Select a region`,defaultValue:``}},o={},s={args:{defaultValue:`us-west-2`}},c={args:{disabled:!0,defaultValue:`us-east-1`}},l={args:{options:void 0,placeholder:void 0,defaultValue:`json`},render:e=>(0,i.jsxs)(r,{...e,children:[(0,i.jsxs)(`optgroup`,{label:`Structured`,children:[(0,i.jsx)(`option`,{value:`json`,children:`JSON`}),(0,i.jsx)(`option`,{value:`yaml`,children:`YAML`})]}),(0,i.jsx)(`optgroup`,{label:`Tabular`,children:(0,i.jsx)(`option`,{value:`csv`,children:`CSV`})})]})},u=[`Default`,`Preselected`,`Disabled`,`WithChildren`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: "us-west-2"
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: "us-east-1"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}}})))()}d();export{o as Default,c as Disabled,s as Preselected,l as WithChildren,u as __namedExportsOrder,a as default};
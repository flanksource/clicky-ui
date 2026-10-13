import{r as B,j as c}from"./iframe-DP177qYv.js";import{J as k}from"./JsonSchemaForm-D6m6mBh8.js";import"./preload-helper-BZq7nIkI.js";import"./utils-DW-IJACk.js";import"./Icon-CVZO3WAG.js";import"./DropdownMenu-DauniJQT.js";import"./floating-ui.react-BnsrA79A.js";import"./index-CbIba--f.js";import"./index-D5WrkPBq.js";import"./button-FbNKbbzk.js";import"./index-CPURVhFy.js";import"./loading-BGP2vbyq.js";import"./DropdownMenuSubmenu-pG2iVqTe.js";import"./modalStack-CD5aSVTc.js";import"./zIndex-BGbNBNA8.js";import"./Properties-DzT-zp1x.js";import"./IconButton-ByGG337J.js";import"./format-2niohfpq.js";import"./JsonView-euY554sO.js";import"./AccordionList-ae6JTwF6.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DkHitohI.js";import"./HoverCard-k2Xsc41N.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-BWAlqUsR.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-gw5c6cQc.js";import"./FilterPill-CB6e5lha.js";import"./DateField-Vz0SUsTh.js";import"./DatePicker-C9FXaiIe.js";import"./DateTimePicker-4Tx0xEVq.js";import"./SegmentedControl-CmQrpni4.js";import"./TreePickerField-BjPB4mTt.js";import"./Tree-Dkq9wKMp.js";import"./TreeNode-Qs-FBFgq.js";import"./InputField-DQb9Rhrw.js";import"./use-hotkey-iixTK3zz.js";import"./ListMenu-DaHgzerB.js";import"./Markdown-DQ6pSWFS.js";import"./Callout-CSQkENON.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CoYNYiBs.js";import"./CodeDiff-ew4pkH_9.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-F0uKqAH1.js";const{expect:t,userEvent:D,within:b}=__STORYBOOK_MODULE_TEST__;function R(e){return{type:"object",properties:{mode:{type:"string",title:"Mode",enum:["insert","update","skip"],default:"insert","x-enum-display":e,"x-enum-descriptions":{insert:"Insert a new activity.",update:"Update the existing activity.",skip:"Leave the activity untouched."}}}}}function E({display:e,initial:a}){const[i,o]=B.useState(a);return c.jsxs("div",{className:"max-w-2xl space-y-4 p-4",children:[c.jsx(k,{schema:R(e),value:i,onChange:o,applyDefaults:!1,showPreferencesMenu:!1}),c.jsx("pre",{className:"overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs",children:JSON.stringify(i,null,2)})]})}const Se={title:"JsonSchemaForm/Enum choices",component:E,args:{display:"radio",initial:{}},parameters:{docs:{description:{component:['Radio (`x-enum-display: "radio"`) and segmented enums show each option\'s',"`x-enum-descriptions` entry as a native tooltip and mark the schema `default` option","with a muted **default** suffix, which is also the option's accessible description.","","While the value is unset, the default option is drawn as the *implied* choice — a dashed","primary outline, distinct from the filled selection — and stays unchecked, because","nothing has been chosen yet. Choosing any option replaces the implied style with a real","selection; the default option keeps its marker."].join(`
`)}}}},n={play:async({canvasElement:e,step:a})=>{const i=b(e),o=i.getByRole("radio",{name:"insert"});await a("the default option is implied but not checked",async()=>{await t(o).not.toBeChecked(),await t(o.closest("label")).toHaveAttribute("data-implied","true"),await t(o.closest("label")).toHaveAttribute("title","Insert a new activity. (default)"),await t(o).toHaveAccessibleDescription("default")}),await a("choosing an option replaces the implied state",async()=>{await D.click(i.getByText("skip")),await t(i.getByRole("radio",{name:"skip"})).toBeChecked(),await t(e.querySelector("[data-implied]")).toBeNull()})}},s={args:{initial:{mode:"update"}},play:async({canvasElement:e})=>{const a=b(e);await t(a.getByRole("radio",{name:"update"})).toBeChecked(),await t(a.getByRole("radio",{name:"insert"})).toHaveAccessibleDescription("default"),await t(e.querySelector("[data-implied]")).toBeNull()}},r={args:{display:"segmented"}},p={args:{display:"segmented",initial:{mode:"update"}}};var m,l,d;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const insert = canvas.getByRole("radio", {
      name: "insert"
    });
    await step("the default option is implied but not checked", async () => {
      await expect(insert).not.toBeChecked();
      await expect(insert.closest("label")).toHaveAttribute("data-implied", "true");
      await expect(insert.closest("label")).toHaveAttribute("title", "Insert a new activity. (default)");
      await expect(insert).toHaveAccessibleDescription("default");
    });
    await step("choosing an option replaces the implied state", async () => {
      await userEvent.click(canvas.getByText("skip"));
      await expect(canvas.getByRole("radio", {
        name: "skip"
      })).toBeChecked();
      await expect(canvasElement.querySelector("[data-implied]")).toBeNull();
    });
  }
}`,...(d=(l=n.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var u,h,y;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    initial: {
      mode: "update"
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio", {
      name: "update"
    })).toBeChecked();
    await expect(canvas.getByRole("radio", {
      name: "insert"
    })).toHaveAccessibleDescription("default");
    await expect(canvasElement.querySelector("[data-implied]")).toBeNull();
  }
}`,...(y=(h=s.parameters)==null?void 0:h.docs)==null?void 0:y.source}}};var g,w,f;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    display: "segmented"
  }
}`,...(f=(w=r.parameters)==null?void 0:w.docs)==null?void 0:f.source}}};var v,x,S;p.parameters={...p.parameters,docs:{...(v=p.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    display: "segmented",
    initial: {
      mode: "update"
    }
  }
}`,...(S=(x=p.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};const be=["RadioDefaultUnset","RadioDefaultSet","SegmentedDefaultUnset","SegmentedDefaultSet"];export{s as RadioDefaultSet,n as RadioDefaultUnset,p as SegmentedDefaultSet,r as SegmentedDefaultUnset,be as __namedExportsOrder,Se as default};

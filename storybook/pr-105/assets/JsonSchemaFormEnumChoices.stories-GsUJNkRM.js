import{r as B,j as c}from"./iframe-DgmZMBKH.js";import{J as k}from"./JsonSchemaForm-r_Xg6gvB.js";import"./preload-helper-BBRSUrHX.js";import"./utils-DW-IJACk.js";import"./Icon-COMQMXZj.js";import"./DropdownMenu-gsWLznB7.js";import"./floating-ui.react-C3ET48Mi.js";import"./index-Cgx2wwAK.js";import"./index-DAaBVM8v.js";import"./button-D2u3DN_P.js";import"./index-CPURVhFy.js";import"./loading-DyPnp4V1.js";import"./DropdownMenuSubmenu-CBJxpw_g.js";import"./modalStack-DVmi-TW5.js";import"./zIndex-BGbNBNA8.js";import"./Properties-Bdq0MR4F.js";import"./IconButton-DuZ8w2HQ.js";import"./format-2niohfpq.js";import"./JsonView-PTiSkJw0.js";import"./AccordionList-CdfyVxaN.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DxXPlLVw.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-D9JAxC3e.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-CHXTJS63.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BPdyRRYK.js";import"./FilterPill-BT8q1R31.js";import"./DateField-D2_uPHGt.js";import"./DatePicker-S7XTKat3.js";import"./DateTimePicker-O9lN17EE.js";import"./SegmentedControl-5L49tJPa.js";import"./TreePickerField-CeQEAyFI.js";import"./Tree-C9PPpVHY.js";import"./TreeNode-D7--K_Ib.js";import"./InputField-BJbuDc6j.js";import"./use-hotkey-CpXOlTbi.js";import"./ListMenu-BmJbElel.js";import"./Markdown-wrI770uP.js";import"./Callout-ohERSZFi.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-C3Pf8vEa.js";import"./CodeDiff-BTioSQ_u.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-XtrfG8Yo.js";import"./HighlightedTokens-C-qCgi-g.js";const{expect:t,userEvent:D,within:b}=__STORYBOOK_MODULE_TEST__;function R(e){return{type:"object",properties:{mode:{type:"string",title:"Mode",enum:["insert","update","skip"],default:"insert","x-enum-display":e,"x-enum-descriptions":{insert:"Insert a new activity.",update:"Update the existing activity.",skip:"Leave the activity untouched."}}}}}function E({display:e,initial:a}){const[i,o]=B.useState(a);return c.jsxs("div",{className:"max-w-2xl space-y-4 p-4",children:[c.jsx(k,{schema:R(e),value:i,onChange:o,applyDefaults:!1,showPreferencesMenu:!1}),c.jsx("pre",{className:"overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs",children:JSON.stringify(i,null,2)})]})}const be={title:"JsonSchemaForm/Enum choices",component:E,args:{display:"radio",initial:{}},parameters:{docs:{description:{component:['Radio (`x-enum-display: "radio"`) and segmented enums show each option\'s',"`x-enum-descriptions` entry as a native tooltip and mark the schema `default` option","with a muted **default** suffix, which is also the option's accessible description.","","While the value is unset, the default option is drawn as the *implied* choice — a dashed","primary outline, distinct from the filled selection — and stays unchecked, because","nothing has been chosen yet. Choosing any option replaces the implied style with a real","selection; the default option keeps its marker."].join(`
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
}`,...(S=(x=p.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};const Be=["RadioDefaultUnset","RadioDefaultSet","SegmentedDefaultUnset","SegmentedDefaultSet"];export{s as RadioDefaultSet,n as RadioDefaultUnset,p as SegmentedDefaultSet,r as SegmentedDefaultUnset,Be as __namedExportsOrder,be as default};

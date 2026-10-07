import{r as B,j as p}from"./iframe-DrKsS3M_.js";import{J as k}from"./JsonSchemaForm-Brn5grkI.js";import"./preload-helper-CLP1olNy.js";import"./utils-DW-IJACk.js";import"./Icon-5YnqmjaE.js";import"./DropdownMenu-BPEvBj-S.js";import"./floating-ui.react-BaraekBC.js";import"./index-B7F1fGYx.js";import"./index-kSQoS_dD.js";import"./button-C3u2SMij.js";import"./index-CPURVhFy.js";import"./loading-Zh7pc3Pa.js";import"./DropdownMenuSubmenu-BmCuQSFk.js";import"./modalStack-BXNp3ooX.js";import"./zIndex-BGbNBNA8.js";import"./Properties-Dhxum7ig.js";import"./IconButton-B3W2TRe_.js";import"./HoverCard-cLbGEJn3.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-D-bTTK8j.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BOBKHCDA.js";import"./FilterPill-ffMsgFpu.js";import"./DateField-DR2K6-_w.js";import"./DatePicker-BIa4sVTT.js";import"./DateTimePicker-CAOmef3v.js";import"./SegmentedControl-DhvV8qek.js";import"./TreePickerField-vZS2TpXj.js";import"./Tree-AmYqt2D8.js";import"./TreeNode-BNOVU68K.js";import"./AccordionList-CZ88uwbr.js";import"./InputField-B-13abB5.js";import"./use-hotkey-CrSSlMlI.js";import"./ListMenu-DBqYd6Z7.js";import"./Markdown-CHhasVyB.js";import"./Callout-DEOSKmrU.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DuTAgM6o.js";import"./CodeDiff-DVg9mXJw.js";import"./HighlightedTokens-ud36EFY8.js";import"./JsonView-C_xZ2Wh2.js";import"./Badge-DTWOliSA.js";const{expect:t,userEvent:D,within:b}=__STORYBOOK_MODULE_TEST__;function R(e){return{type:"object",properties:{mode:{type:"string",title:"Mode",enum:["insert","update","skip"],default:"insert","x-enum-display":e,"x-enum-descriptions":{insert:"Insert a new activity.",update:"Update the existing activity.",skip:"Leave the activity untouched."}}}}}function E({display:e,initial:a}){const[i,n]=B.useState(a);return p.jsxs("div",{className:"max-w-2xl space-y-4 p-4",children:[p.jsx(k,{schema:R(e),value:i,onChange:n,applyDefaults:!1,showPreferencesMenu:!1}),p.jsx("pre",{className:"overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs",children:JSON.stringify(i,null,2)})]})}const fe={title:"JsonSchemaForm/Enum choices",component:E,args:{display:"radio",initial:{}},parameters:{docs:{description:{component:['Radio (`x-enum-display: "radio"`) and segmented enums show each option\'s',"`x-enum-descriptions` entry as a native tooltip and mark the schema `default` option","with a muted **default** suffix, which is also the option's accessible description.","","While the value is unset, the default option is drawn as the *implied* choice — a dashed","primary outline, distinct from the filled selection — and stays unchecked, because","nothing has been chosen yet. Choosing any option replaces the implied style with a real","selection; the default option keeps its marker."].join(`
`)}}}},o={play:async({canvasElement:e,step:a})=>{const i=b(e),n=i.getByRole("radio",{name:"insert"});await a("the default option is implied but not checked",async()=>{await t(n).not.toBeChecked(),await t(n.closest("label")).toHaveAttribute("data-implied","true"),await t(n.closest("label")).toHaveAttribute("title","Insert a new activity. (default)"),await t(n).toHaveAccessibleDescription("default")}),await a("choosing an option replaces the implied state",async()=>{await D.click(i.getByText("skip")),await t(i.getByRole("radio",{name:"skip"})).toBeChecked(),await t(e.querySelector("[data-implied]")).toBeNull()})}},s={args:{initial:{mode:"update"}},play:async({canvasElement:e})=>{const a=b(e);await t(a.getByRole("radio",{name:"update"})).toBeChecked(),await t(a.getByRole("radio",{name:"insert"})).toHaveAccessibleDescription("default"),await t(e.querySelector("[data-implied]")).toBeNull()}},r={args:{display:"segmented"}},c={args:{display:"segmented",initial:{mode:"update"}}};var m,l,d;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(d=(l=o.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var u,h,y;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(f=(w=r.parameters)==null?void 0:w.docs)==null?void 0:f.source}}};var v,x,S;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    display: "segmented",
    initial: {
      mode: "update"
    }
  }
}`,...(S=(x=c.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};const ve=["RadioDefaultUnset","RadioDefaultSet","SegmentedDefaultUnset","SegmentedDefaultSet"];export{s as RadioDefaultSet,o as RadioDefaultUnset,c as SegmentedDefaultSet,r as SegmentedDefaultUnset,ve as __namedExportsOrder,fe as default};

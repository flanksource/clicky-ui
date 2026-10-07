import{r as w,j as n}from"./iframe-DrKsS3M_.js";import{J as f}from"./JsonSchemaForm-Brn5grkI.js";import"./preload-helper-CLP1olNy.js";import"./utils-DW-IJACk.js";import"./Icon-5YnqmjaE.js";import"./DropdownMenu-BPEvBj-S.js";import"./floating-ui.react-BaraekBC.js";import"./index-B7F1fGYx.js";import"./index-kSQoS_dD.js";import"./button-C3u2SMij.js";import"./index-CPURVhFy.js";import"./loading-Zh7pc3Pa.js";import"./DropdownMenuSubmenu-BmCuQSFk.js";import"./modalStack-BXNp3ooX.js";import"./zIndex-BGbNBNA8.js";import"./Properties-Dhxum7ig.js";import"./IconButton-B3W2TRe_.js";import"./HoverCard-cLbGEJn3.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-D-bTTK8j.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BOBKHCDA.js";import"./FilterPill-ffMsgFpu.js";import"./DateField-DR2K6-_w.js";import"./DatePicker-BIa4sVTT.js";import"./DateTimePicker-CAOmef3v.js";import"./SegmentedControl-DhvV8qek.js";import"./TreePickerField-vZS2TpXj.js";import"./Tree-AmYqt2D8.js";import"./TreeNode-BNOVU68K.js";import"./AccordionList-CZ88uwbr.js";import"./InputField-B-13abB5.js";import"./use-hotkey-CrSSlMlI.js";import"./ListMenu-DBqYd6Z7.js";import"./Markdown-CHhasVyB.js";import"./Callout-DEOSKmrU.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DuTAgM6o.js";import"./CodeDiff-DVg9mXJw.js";import"./HighlightedTokens-ud36EFY8.js";import"./JsonView-C_xZ2Wh2.js";import"./Badge-DTWOliSA.js";const{expect:s,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,e=t=>({type:"string",title:t}),v={type:"object",properties:{Beneficiaries:{type:"array",title:"Beneficiaries",items:{type:"object",properties:{Name:e("Name"),Relationship:e("Relationship"),Share:{type:"number",title:"Share %"}}}},Reinsurers:{type:"array",title:"Reinsurers",items:{type:"object",properties:{Name:e("Reinsurer"),Treaty:e("Treaty"),Share:{type:"number",title:"Share %"},Retention:{type:"number",title:"Retention"},Currency:e("Currency"),Effective:{type:"string",format:"date",title:"Effective"},Notes:e("Notes")}}}}},g={Beneficiaries:[{Name:"Ada Example",Relationship:"Spouse",Share:60},{Name:"Ben Example",Relationship:"Child",Share:40}],Reinsurers:[{Name:"Acme Re",Treaty:"QS-01",Share:50,Retention:1e5,Currency:"USD",Effective:"2026-01-01"},{Name:"Example Re",Treaty:"XL-02",Share:25,Retention:25e4,Currency:"USD",Effective:"2026-01-01"}]};function x({layout:t}){const[r,a]=w.useState(g);return n.jsxs("div",{className:"max-w-4xl space-y-4 p-4",children:[n.jsx(f,{schema:v,value:r,onChange:a,layout:t,showPreferencesMenu:!1}),n.jsx("pre",{className:"overflow-auto rounded-md border bg-muted/30 p-3 text-xs",children:JSON.stringify(r,null,2)})]})}const le={title:"JsonSchemaForm/Object array views",component:x,args:{layout:{mode:"stacked"}},parameters:{docs:{description:{component:"Object arrays with no display hint open as a grid while their visible columns fit (`x-table-max-columns`, default 4) and as the inline item form beyond that. `x-layout: table` and `x-array-display: accordion` pick the opening view explicitly. The ⋮ menu switches views in place."}}}},i={play:async({canvasElement:t,step:r})=>{const a=p(t);await r("the 3-column array opens as a grid, the 7-column one as item rows",async()=>{await s(a.getAllByRole("table")).toHaveLength(1)}),await r("the view menu switches the grid to the stack form",async()=>{await m.click(a.getByRole("button",{name:"View options for Beneficiaries"})),await m.click(p(document.body).getByRole("menuitem",{name:"Stack form"})),await s(a.queryByRole("table")).toBeNull()})}},o={args:{layout:{mode:"inline"}}};var c,l,u;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("the 3-column array opens as a grid, the 7-column one as item rows", async () => {
      await expect(canvas.getAllByRole("table")).toHaveLength(1);
    });
    await step("the view menu switches the grid to the stack form", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "View options for Beneficiaries"
      }));
      await userEvent.click(within(document.body).getByRole("menuitem", {
        name: "Stack form"
      }));
      await expect(canvas.queryByRole("table")).toBeNull();
    });
  }
}`,...(u=(l=i.parameters)==null?void 0:l.docs)==null?void 0:u.source}}};var y,d,h;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    layout: {
      mode: "inline"
    }
  }
}`,...(h=(d=o.parameters)==null?void 0:d.docs)==null?void 0:h.source}}};const ue=["NarrowAndWide","InlineForm"];export{o as InlineForm,i as NarrowAndWide,ue as __namedExportsOrder,le as default};

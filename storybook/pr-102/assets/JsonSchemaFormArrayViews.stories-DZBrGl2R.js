import{r as w,j as n}from"./iframe-4S_rqkhx.js";import{J as f}from"./JsonSchemaForm-DmdeUQ_o.js";import"./preload-helper-BZq7nIkI.js";import"./utils-DW-IJACk.js";import"./Icon-D5QCb7Dz.js";import"./DropdownMenu-uwjLYJFW.js";import"./floating-ui.react-OaSgb022.js";import"./index-Cvd_Abow.js";import"./index-BMI4_Cei.js";import"./button-BpUyE0O_.js";import"./index-CPURVhFy.js";import"./loading-1HgYxxJ4.js";import"./DropdownMenuSubmenu-1Z9V4LyC.js";import"./modalStack-C75NiPFe.js";import"./zIndex-BGbNBNA8.js";import"./Properties-CYkb1cQz.js";import"./IconButton-4hlHCpTR.js";import"./format-2niohfpq.js";import"./JsonView-DSVWInHq.js";import"./AccordionList-DmoCt6PE.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-D9TRIDLv.js";import"./HoverCard-CZLnR6uk.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-D6s3gqO4.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-B0ZmjhD8.js";import"./FilterPill-DIfiwld4.js";import"./DateField-BvNkqxlq.js";import"./DatePicker-BbAa6mCn.js";import"./DateTimePicker-DN47MwkR.js";import"./SegmentedControl-DocL_txn.js";import"./TreePickerField-Zm--n607.js";import"./Tree-6e4PruJA.js";import"./TreeNode-CQh0qeFF.js";import"./InputField-BLPzKh9o.js";import"./use-hotkey-BIPwMSF7.js";import"./ListMenu-BUyM01vE.js";import"./Markdown-CvI16UAM.js";import"./Callout-CFBCbpqP.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BpNlfi-N.js";import"./CodeDiff-DNi4VGZD.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-BkGLTY6_.js";const{expect:s,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,e=t=>({type:"string",title:t}),v={type:"object",properties:{Beneficiaries:{type:"array",title:"Beneficiaries",items:{type:"object",properties:{Name:e("Name"),Relationship:e("Relationship"),Share:{type:"number",title:"Share %"}}}},Reinsurers:{type:"array",title:"Reinsurers",items:{type:"object",properties:{Name:e("Reinsurer"),Treaty:e("Treaty"),Share:{type:"number",title:"Share %"},Retention:{type:"number",title:"Retention"},Currency:e("Currency"),Effective:{type:"string",format:"date",title:"Effective"},Notes:e("Notes")}}}}},g={Beneficiaries:[{Name:"Ada Example",Relationship:"Spouse",Share:60},{Name:"Ben Example",Relationship:"Child",Share:40}],Reinsurers:[{Name:"Acme Re",Treaty:"QS-01",Share:50,Retention:1e5,Currency:"USD",Effective:"2026-01-01"},{Name:"Example Re",Treaty:"XL-02",Share:25,Retention:25e4,Currency:"USD",Effective:"2026-01-01"}]};function x({layout:t}){const[r,a]=w.useState(g);return n.jsxs("div",{className:"max-w-4xl space-y-4 p-4",children:[n.jsx(f,{schema:v,value:r,onChange:a,layout:t,showPreferencesMenu:!1}),n.jsx("pre",{className:"overflow-auto rounded-md border bg-muted/30 p-3 text-xs",children:JSON.stringify(r,null,2)})]})}const de={title:"JsonSchemaForm/Object array views",component:x,args:{layout:{mode:"stacked"}},parameters:{docs:{description:{component:"Object arrays with no display hint open as a grid while their visible columns fit (`x-table-max-columns`, default 4) and as the inline item form beyond that. `x-layout: table` and `x-array-display: accordion` pick the opening view explicitly. The ⋮ menu switches views in place."}}}},i={play:async({canvasElement:t,step:r})=>{const a=p(t);await r("the 3-column array opens as a grid, the 7-column one as item rows",async()=>{await s(a.getAllByRole("table")).toHaveLength(1)}),await r("the view menu switches the grid to the stack form",async()=>{await m.click(a.getByRole("button",{name:"View options for Beneficiaries"})),await m.click(p(document.body).getByRole("menuitem",{name:"Stack form"})),await s(a.queryByRole("table")).toBeNull()})}},o={args:{layout:{mode:"inline"}}};var c,l,u;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(h=(d=o.parameters)==null?void 0:d.docs)==null?void 0:h.source}}};const he=["NarrowAndWide","InlineForm"];export{o as InlineForm,i as NarrowAndWide,he as __namedExportsOrder,de as default};

import{r as w,j as n}from"./iframe-DNj_zNZU.js";import{J as f}from"./JsonSchemaForm-D6oRy3T9.js";import"./preload-helper-LCYGeQwd.js";import"./utils-DW-IJACk.js";import"./Icon-D173D1Xm.js";import"./DropdownMenu-BZOVBMap.js";import"./floating-ui.react-CUsd8blK.js";import"./index-C78OGtU2.js";import"./index-BaPlC8a_.js";import"./button-l9qmO7rt.js";import"./index-CPURVhFy.js";import"./loading-CmRQFweU.js";import"./DropdownMenuSubmenu-CexcY20v.js";import"./modalStack-qck1gI8h.js";import"./zIndex-BGbNBNA8.js";import"./Properties-BT4JKovI.js";import"./IconButton-CofRhqoZ.js";import"./format-2niohfpq.js";import"./JsonView-ABwU1Fjr.js";import"./AccordionList-CQ6MA2Gi.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DCK8B5Qr.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-BY9qgMmL.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-BTkFnERZ.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BpxNrIrE.js";import"./FilterPill-BCljltSy.js";import"./DateField-CdijMLjn.js";import"./DatePicker-CnzqPqqM.js";import"./DateTimePicker-Xu3Kqtaq.js";import"./SegmentedControl-YJAMHeYo.js";import"./TreePickerField-CSeWXf42.js";import"./Tree-XmGojDQe.js";import"./TreeNode-DFpQ6EqE.js";import"./InputField-CCxG1Wg3.js";import"./use-hotkey-CH50nEFR.js";import"./ListMenu-H251SE9F.js";import"./Markdown-DH53cVwk.js";import"./Callout-Utyt5kOR.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CjM_p02j.js";import"./CodeDiff-V1O_nplA.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-ChvifZ1Q.js";import"./HighlightedTokens-BTcRsF_2.js";const{expect:s,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,e=t=>({type:"string",title:t}),v={type:"object",properties:{Beneficiaries:{type:"array",title:"Beneficiaries",items:{type:"object",properties:{Name:e("Name"),Relationship:e("Relationship"),Share:{type:"number",title:"Share %"}}}},Reinsurers:{type:"array",title:"Reinsurers",items:{type:"object",properties:{Name:e("Reinsurer"),Treaty:e("Treaty"),Share:{type:"number",title:"Share %"},Retention:{type:"number",title:"Retention"},Currency:e("Currency"),Effective:{type:"string",format:"date",title:"Effective"},Notes:e("Notes")}}}}},g={Beneficiaries:[{Name:"Ada Example",Relationship:"Spouse",Share:60},{Name:"Ben Example",Relationship:"Child",Share:40}],Reinsurers:[{Name:"Acme Re",Treaty:"QS-01",Share:50,Retention:1e5,Currency:"USD",Effective:"2026-01-01"},{Name:"Example Re",Treaty:"XL-02",Share:25,Retention:25e4,Currency:"USD",Effective:"2026-01-01"}]};function x({layout:t}){const[r,i]=w.useState(g);return n.jsxs("div",{className:"max-w-4xl space-y-4 p-4",children:[n.jsx(f,{schema:v,value:r,onChange:i,layout:t,showPreferencesMenu:!1}),n.jsx("pre",{className:"overflow-auto rounded-md border bg-muted/30 p-3 text-xs",children:JSON.stringify(r,null,2)})]})}const he={title:"JsonSchemaForm/Object array views",component:x,args:{layout:{mode:"stacked"}},parameters:{docs:{description:{component:"Object arrays with no display hint open as a grid while their visible columns fit (`x-table-max-columns`, default 4) and as the inline item form beyond that. `x-layout: table` and `x-array-display: accordion` pick the opening view explicitly. The ⋮ menu switches views in place."}}}},a={play:async({canvasElement:t,step:r})=>{const i=p(t);await r("the 3-column array opens as a grid, the 7-column one as item rows",async()=>{await s(i.getAllByRole("table")).toHaveLength(1)}),await r("the view menu switches the grid to the stack form",async()=>{await m.click(i.getByRole("button",{name:"View options for Beneficiaries"})),await m.click(p(document.body).getByRole("menuitem",{name:"Stack form"})),await s(i.queryByRole("table")).toBeNull()})}},o={args:{layout:{mode:"inline"}}};var c,l,u;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(u=(l=a.parameters)==null?void 0:l.docs)==null?void 0:u.source}}};var y,d,h;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    layout: {
      mode: "inline"
    }
  }
}`,...(h=(d=o.parameters)==null?void 0:d.docs)==null?void 0:h.source}}};const we=["NarrowAndWide","InlineForm"];export{o as InlineForm,a as NarrowAndWide,we as __namedExportsOrder,he as default};

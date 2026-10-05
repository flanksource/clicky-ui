import{r as w,j as n}from"./iframe-DPCKfhUU.js";import{J as f}from"./JsonSchemaForm-DepF6Q53.js";import"./preload-helper-BCNcasCO.js";import"./utils-DW-IJACk.js";import"./Icon-DSGt7Mo2.js";import"./DropdownMenu-CY5RY703.js";import"./floating-ui.react-BEtJE_L2.js";import"./index-B3Aoa8ie.js";import"./index-C7L_BM3M.js";import"./button-BRy1qK7g.js";import"./index-CPURVhFy.js";import"./loading-BG9apmJx.js";import"./DropdownMenuSubmenu-Dg2RBf62.js";import"./modalStack-CXC147LT.js";import"./zIndex-BGbNBNA8.js";import"./Properties-BGWYJaCD.js";import"./IconButton-BV5YYNFo.js";import"./HoverCard-ByQQA9lk.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-C2yzBEFr.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-CnZ1Ars5.js";import"./FilterPill-BH7sqdYv.js";import"./DateField-COtR49Il.js";import"./DatePicker-jP0SuiJ-.js";import"./DateTimePicker-C8b6LJoe.js";import"./SegmentedControl-B33AJU3E.js";import"./TreePickerField-CPx_YxG7.js";import"./Tree-DStVmgew.js";import"./TreeNode-B5lgtrlv.js";import"./AccordionList-08Q1Y_BZ.js";import"./InputField-CkR22wq6.js";import"./use-hotkey-C02Y-0dM.js";import"./ListMenu-Dbtts1ex.js";import"./Markdown-Bv7FSKYb.js";import"./Callout-NASN2YdZ.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-BtQodoMG.js";import"./CodeDiff-hsr2OoIp.js";import"./HighlightedTokens-BUwvGOgD.js";import"./JsonView-B1k9i-kj.js";import"./Badge-C9IzEfrw.js";const{expect:s,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,e=t=>({type:"string",title:t}),v={type:"object",properties:{Beneficiaries:{type:"array",title:"Beneficiaries",items:{type:"object",properties:{Name:e("Name"),Relationship:e("Relationship"),Share:{type:"number",title:"Share %"}}}},Reinsurers:{type:"array",title:"Reinsurers",items:{type:"object",properties:{Name:e("Reinsurer"),Treaty:e("Treaty"),Share:{type:"number",title:"Share %"},Retention:{type:"number",title:"Retention"},Currency:e("Currency"),Effective:{type:"string",format:"date",title:"Effective"},Notes:e("Notes")}}}}},g={Beneficiaries:[{Name:"Ada Example",Relationship:"Spouse",Share:60},{Name:"Ben Example",Relationship:"Child",Share:40}],Reinsurers:[{Name:"Acme Re",Treaty:"QS-01",Share:50,Retention:1e5,Currency:"USD",Effective:"2026-01-01"},{Name:"Example Re",Treaty:"XL-02",Share:25,Retention:25e4,Currency:"USD",Effective:"2026-01-01"}]};function x({layout:t}){const[r,a]=w.useState(g);return n.jsxs("div",{className:"max-w-4xl space-y-4 p-4",children:[n.jsx(f,{schema:v,value:r,onChange:a,layout:t,showPreferencesMenu:!1}),n.jsx("pre",{className:"overflow-auto rounded-md border bg-muted/30 p-3 text-xs",children:JSON.stringify(r,null,2)})]})}const le={title:"JsonSchemaForm/Object array views",component:x,args:{layout:{mode:"stacked"}},parameters:{docs:{description:{component:"Object arrays with no display hint open as a grid while their visible columns fit (`x-table-max-columns`, default 4) and as the inline item form beyond that. `x-layout: table` and `x-array-display: accordion` pick the opening view explicitly. The ⋮ menu switches views in place."}}}},i={play:async({canvasElement:t,step:r})=>{const a=p(t);await r("the 3-column array opens as a grid, the 7-column one as item rows",async()=>{await s(a.getAllByRole("table")).toHaveLength(1)}),await r("the view menu switches the grid to the stack form",async()=>{await m.click(a.getByRole("button",{name:"View options for Beneficiaries"})),await m.click(p(document.body).getByRole("menuitem",{name:"Stack form"})),await s(a.queryByRole("table")).toBeNull()})}},o={args:{layout:{mode:"inline"}}};var c,l,u;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
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

import{S as k}from"./SplitButton-_Ed7SZVa.js";import"./iframe-BiJjU2HO.js";import"./preload-helper-2oGg8WnX.js";import"./utils-BLSKlp9E.js";import"./button-Bq6OtZ5-.js";import"./index-1evVQkiP.js";import"./loading-ZWjVqhnr.js";import"./Icon-DO6qyvlM.js";import"./DropdownMenu-BUWOgj0c.js";import"./floating-ui.react-BtBEW8Wo.js";import"./index-Ct7BkFIG.js";import"./index-oISezv9l.js";import"./modalStack-CpXAXQz5.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-e2uFe16b.js";import"./UiChevronUp-DV520mvX.js";const{expect:l,fn:e,userEvent:s,within:C}=__STORYBOOK_MODULE_TEST__,V={title:"Components/SplitButton",component:k,tags:["autodocs"],parameters:{docs:{description:{component:"A primary action button joined to a chevron trigger that opens a dropdown of secondary actions. Composes `Button` and `DropdownMenu`."}}},argTypes:{variant:{description:"Visual treatment forwarded to both halves.",control:"select",options:["default","destructive","outline","secondary","ghost","link"]},size:{description:"Size preset forwarded to both halves.",control:"select",options:["default","sm","lg"]},loading:{description:"Spinner on the primary half.",control:"boolean"},disabled:{description:"Disable both halves.",control:"boolean"}},args:{label:"Save",onClick:e(),items:[{label:"Save and close",onSelect:e()},{label:"Save as draft",onSelect:e()},{label:"Discard",onSelect:e()}]}},a={},t={args:{variant:"outline"}},n={args:{loading:!0}},o={play:async({args:i,canvasElement:B,step:c})=>{const r=C(B);await c("primary click fires the primary handler",async()=>{await s.click(r.getByRole("button",{name:"Save"})),await l(i.onClick).toHaveBeenCalledTimes(1)}),await c("chevron opens the menu and selection fires the item handler",async()=>{await s.click(r.getByRole("button",{name:"Open menu"})),await s.click(r.getByRole("menuitem",{name:"Save and close"})),await l(i.items[0].onSelect).toHaveBeenCalledTimes(1)})}};var m,p,d;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:"{}",...(d=(p=a.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var u,v,g;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  }
}`,...(g=(v=t.parameters)==null?void 0:v.docs)==null?void 0:g.source}}};var h,y,S;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...(S=(y=n.parameters)==null?void 0:y.docs)==null?void 0:S.source}}};var w,b,f;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("primary click fires the primary handler", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Save"
      }));
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
    await step("chevron opens the menu and selection fires the item handler", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Open menu"
      }));
      await userEvent.click(canvas.getByRole("menuitem", {
        name: "Save and close"
      }));
      await expect(args.items[0].onSelect).toHaveBeenCalledTimes(1);
    });
  }
}`,...(f=(b=o.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};const Y=["Default","Outline","Loading","MenuInteraction"];export{a as Default,n as Loading,o as MenuInteraction,t as Outline,Y as __namedExportsOrder,V as default};

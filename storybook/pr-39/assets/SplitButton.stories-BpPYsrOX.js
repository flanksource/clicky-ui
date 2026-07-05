import{S as k}from"./SplitButton-Bi9Hu93I.js";import"./iframe-C96xZIdp.js";import"./preload-helper-Bg6xcDEu.js";import"./utils-CR52uffu.js";import"./button-CQ2Ni0n1.js";import"./index-0zBpNI7D.js";import"./loading-2G2O_q61.js";import"./Icon-DVJMtl2F.js";import"./DropdownMenu-BBC-3QeD.js";import"./floating-ui.react-CKpawvp6.js";import"./index-Dpw8D6A4.js";import"./index-DiVyEuZt.js";import"./modalStack-DCQR24ar.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-C4iQdycK.js";import"./UiChevronUp-BsAu1rdW.js";const{expect:l,fn:e,userEvent:s,within:E}=__STORYBOOK_MODULE_TEST__,P={title:"Components/SplitButton",component:k,tags:["autodocs"],parameters:{docs:{description:{component:"A primary action button joined to a chevron trigger that opens a dropdown of secondary actions. Composes `Button` and `DropdownMenu`."}}},argTypes:{variant:{description:"Visual treatment forwarded to both halves.",control:"select",options:["default","destructive","outline","secondary","ghost","link"]},size:{description:"Size preset forwarded to both halves.",control:"select",options:["default","sm","lg"]},loading:{description:"Spinner on the primary half.",control:"boolean"},disabled:{description:"Disable both halves.",control:"boolean"}},args:{label:"Save",onClick:e(),items:[{label:"Save and close",onSelect:e()},{label:"Save as draft",onSelect:e()},{label:"Discard",onSelect:e()}]}},t={},a={args:{variant:"outline"}},n={args:{loading:!0}},o={play:async({args:i,canvasElement:B,step:c})=>{const r=E(B.ownerDocument.body);await c("primary click fires the primary handler",async()=>{await s.click(r.getByRole("button",{name:"Save"})),await l(i.onClick).toHaveBeenCalledTimes(1)}),await c("chevron opens the menu and selection fires the item handler",async()=>{await s.click(r.getByRole("button",{name:"Open menu"})),await s.click(r.getByRole("menuitem",{name:"Save and close"})),await l(i.items[0].onSelect).toHaveBeenCalledTimes(1)})}};var m,p,d;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:"{}",...(d=(p=t.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var u,v,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  }
}`,...(g=(v=a.parameters)==null?void 0:v.docs)==null?void 0:g.source}}};var h,y,w;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...(w=(y=n.parameters)==null?void 0:y.docs)==null?void 0:w.source}}};var S,b,f;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    // Query the whole document, not just the story canvas: the menu renders in a
    // FloatingPortal at document.body, outside canvasElement.
    const canvas = within(canvasElement.ownerDocument.body);
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
}`,...(f=(b=o.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};const Q=["Default","Outline","Loading","MenuInteraction"];export{t as Default,n as Loading,o as MenuInteraction,a as Outline,Q as __namedExportsOrder,P as default};

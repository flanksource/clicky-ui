import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{Nr as t,Zs as n,n as r}from"./icons-Cehhfh-i.js";import{n as i,t as a}from"./StatStrip-BxvBQFOQ.js";var o,s,c,l,u,d,f;function p(){return(p=e((()=>{i(),r(),{expect:o,within:s}=__STORYBOOK_MODULE_TEST__,c={title:`Data/StatStrip`,component:a,tags:[`autodocs`],parameters:{docs:{description:{component:"A row of headline figures for the top of a list or detail page. Purely presentational — the caller supplies already-formatted values. Cell separators come from a 1px grid gap over the container background, so they stay correct however the grid wraps; below `md` the strip falls back to two columns."}}},args:{items:[{label:`Open requests`,value:`7`,sub:`Awaiting a decision`},{label:`Ready`,value:`5`,sub:`All pre-flight checks clear`,tone:`success`},{label:`Held`,value:`2`,sub:`Blocked or needs review`,tone:`warning`},{label:`Value awaiting`,value:`2,412,905`,sub:`ZAR · excludes chart changes`}]}},l={},u={args:{items:[{label:`Oldest request`,value:`9d`,sub:`za-itr14-tax-position`,icon:t,tone:`danger`},{label:`Blocked`,value:`1`,sub:`Missing tax rate`,icon:n,tone:`warning`}]}},d={args:{items:[{label:`Open requests`,value:`7`,sub:`Awaiting a decision`,href:`#open`},{label:`Rejected`,value:`1`,sub:`Last 30 days`,href:`#rejected`}]},play:async({canvasElement:e})=>{let t=s(e);await o(t.getByRole(`link`,{name:/Open requests/})).toHaveAttribute(`href`,`#open`)}},f=[`Default`,`WithIcons`,`Actionable`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      label: "Oldest request",
      value: "9d",
      sub: "za-itr14-tax-position",
      icon: UiClock,
      tone: "danger"
    }, {
      label: "Blocked",
      value: "1",
      sub: "Missing tax rate",
      icon: UiWarningTriangle,
      tone: "warning"
    }]
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      label: "Open requests",
      value: "7",
      sub: "Awaiting a decision",
      href: "#open"
    }, {
      label: "Rejected",
      value: "1",
      sub: "Last 30 days",
      href: "#rejected"
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", {
      name: /Open requests/
    })).toHaveAttribute("href", "#open");
  }
}`,...d.parameters?.docs?.source}}}})))()}p();export{d as Actionable,l as Default,u as WithIcons,f as __namedExportsOrder,c as default};
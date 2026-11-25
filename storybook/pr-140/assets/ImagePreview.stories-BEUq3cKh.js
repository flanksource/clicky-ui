import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./jsx-runtime-DKU1u6-r.js";import{n,t as r}from"./ImagePreview-hfuaCCNH.js";var i,a,o,s,c,l,u,d;function f(){return(f=e((()=>{n(),i=t(),{expect:a,within:o}=__STORYBOOK_MODULE_TEST__,s=`data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22320%22%20height%3D%22180%22%3E%3Ccircle%20cx%3D%2290%22%20cy%3D%2290%22%20r%3D%2270%22%20fill%3D%22%232563eb%22%20fill-opacity%3D%22.8%22%2F%3E%3Ccircle%20cx%3D%22170%22%20cy%3D%2290%22%20r%3D%2270%22%20fill%3D%22%23dc2626%22%20fill-opacity%3D%22.6%22%2F%3E%3C%2Fsvg%3E`,c={title:`Data/ImagePreview`,component:r,parameters:{docs:{description:{component:`An image centered on a checkerboard so transparency shows, scaled to fit its pane. Click the image to toggle its actual size. A URL that fails to load shows an alert naming the image instead of a broken icon.`}}},decorators:[e=>(0,i.jsx)(`div`,{style:{height:320},children:(0,i.jsx)(e,{})})]},l={args:{src:s,alt:`Overlapping circles`},play:async({canvasElement:e})=>{await a(o(e).getByRole(`img`,{name:`Overlapping circles`})).toBeVisible()}},u={args:{src:`/missing/diagram.png`,alt:`diagram.png`},tags:[`browser`],play:async({canvasElement:e})=>{await a(await o(e).findByRole(`alert`)).toHaveTextContent(`Could not load diagram.png`)}},d=[`Transparent`,`LoadError`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    src: TRANSPARENT_SVG,
    alt: "Overlapping circles"
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole("img", {
      name: "Overlapping circles"
    })).toBeVisible();
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    src: "/missing/diagram.png",
    alt: "diagram.png"
  },
  // jsdom never loads images, so the img \`error\` event only fires in a real browser. ImagePreview.test.tsx covers the jsdom path.
  tags: ["browser"],
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByRole("alert")).toHaveTextContent("Could not load diagram.png");
  }
}`,...u.parameters?.docs?.source}}}})))()}f();export{u as LoadError,l as Transparent,d as __namedExportsOrder,c as default};
import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Gl as r,Yl as i,n as a,ql as o}from"./icons-N6BqLuiz.js";import{n as s,t as c}from"./icon-menu-picker-QImnve5i.js";function l(e){let[t,n]=(0,d.useState)(`system`);return(0,f.jsx)(c,{value:t,onChange:n,options:_,ariaLabel:`Theme`,...e})}function u(e){return{render:()=>(0,f.jsx)(`div`,{className:`fixed inset-0`,children:(0,f.jsx)(`div`,{className:`absolute ${e}`,children:(0,f.jsx)(l,{})})}),play:async({canvasElement:e})=>{let t=g(e),n=g(document.body);await m.click(t.getByRole(`button`,{name:`Theme`}));let r=(await n.findByRole(`menu`,{name:`Theme`})).getBoundingClientRect();await p(r.left).toBeGreaterThanOrEqual(-1),await p(r.top).toBeGreaterThanOrEqual(-1),await p(r.right).toBeLessThanOrEqual(window.innerWidth+1),await p(r.bottom).toBeLessThanOrEqual(window.innerHeight+1)}}}var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{d=t(),s(),a(),f=n(),{expect:p,userEvent:m,waitFor:h,within:g}=__STORYBOOK_MODULE_TEST__,_=[{value:`light`,icon:r,label:`light`},{value:`dark`,icon:o,label:`dark`},{value:`system`,icon:i,label:`system`}],v={title:`Components/IconMenuPicker`,component:c,tags:[`autodocs`],parameters:{docs:{description:{component:"An icon-triggered radio menu used by the theme and density switchers. The menu is rendered in a portal above all other content and uses Floating UI's `flip`/`shift` so it stays fully on-screen no matter where the trigger sits."}}}},y={render:()=>(0,f.jsx)(l,{})},b={render:()=>(0,f.jsx)(`div`,{className:`w-56`,children:(0,f.jsx)(l,{showLabel:!0,footer:(0,f.jsx)(`span`,{children:`resolves to dark`})})})},x={render:()=>(0,f.jsx)(l,{}),play:async({canvasElement:e,step:t})=>{let n=g(e),r=g(document.body);await t(`opens the menu in a portal, above the canvas`,async()=>{await m.click(n.getByRole(`button`,{name:`Theme`}));let t=await r.findByRole(`menu`,{name:`Theme`});await p(e.contains(t)).toBe(!1),await p(document.body.contains(t)).toBe(!0)}),await t(`selecting an option updates the trigger and closes`,async()=>{await m.click(r.getByRole(`menuitemradio`,{name:/light/})),await h(()=>p(r.queryByRole(`menu`)).toBeNull()),await p(n.getByRole(`button`,{name:`Theme`})).toHaveAttribute(`title`,`Theme: light`)})}},S={TopLeft:`top-1 left-1`,TopRight:`top-1 right-1`,BottomLeft:`bottom-1 left-1`,BottomRight:`bottom-1 right-1`,BottomCenter:`bottom-1 left-1/2 -translate-x-1/2`},C=u(S.TopLeft),w=u(S.TopRight),T=u(S.BottomLeft),E=u(S.BottomRight),D=u(S.BottomCenter),O={render:()=>(0,f.jsxs)(`div`,{className:`h-40 w-64 overflow-hidden rounded border border-border p-3`,children:[(0,f.jsx)(`p`,{className:`mb-2 text-sm text-muted-foreground`,children:`The picker lives in an overflow-hidden box; the menu still escapes it.`}),(0,f.jsx)(l,{})]}),play:async({canvasElement:e})=>{let t=g(e),n=g(document.body);await m.click(t.getByRole(`button`,{name:`Theme`}));let r=await n.findByRole(`menu`,{name:`Theme`});await p(document.body.contains(r)).toBe(!0),await p(e.contains(r)).toBe(!1)}},k=[`Default`,`WithLabel`,`Interaction`,`EdgeTopLeft`,`EdgeTopRight`,`EdgeBottomLeft`,`EdgeBottomRight`,`EdgeBottomCenter`,`InsideScrollContainer`],y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledPicker />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-56">
      <ControlledPicker showLabel footer={<span>resolves to dark</span>} />
    </div>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledPicker />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await step("opens the menu in a portal, above the canvas", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Theme"
      }));
      const menu = await body.findByRole("menu", {
        name: "Theme"
      });
      // The menu is portaled to document.body, not nested under the trigger.
      await expect(canvasElement.contains(menu)).toBe(false);
      await expect(document.body.contains(menu)).toBe(true);
    });
    await step("selecting an option updates the trigger and closes", async () => {
      await userEvent.click(body.getByRole("menuitemradio", {
        name: /light/
      }));
      await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
      await expect(canvas.getByRole("button", {
        name: "Theme"
      })).toHaveAttribute("title", "Theme: light");
    });
  }
}`,...x.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`makeEdgeStory(CORNERS.TopLeft)`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`makeEdgeStory(CORNERS.TopRight)`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`makeEdgeStory(CORNERS.BottomLeft)`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`makeEdgeStory(CORNERS.BottomRight)`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`makeEdgeStory(CORNERS.BottomCenter)`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-40 w-64 overflow-hidden rounded border border-border p-3">
      <p className="mb-2 text-sm text-muted-foreground">
        The picker lives in an overflow-hidden box; the menu still escapes it.
      </p>
      <ControlledPicker />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", {
      name: "Theme"
    }));
    const menu = await body.findByRole("menu", {
      name: "Theme"
    });
    // Portaled out of the clipping container, so it renders on document.body.
    await expect(document.body.contains(menu)).toBe(true);
    await expect(canvasElement.contains(menu)).toBe(false);
  }
}`,...O.parameters?.docs?.source}}}})))()}A();export{y as Default,D as EdgeBottomCenter,T as EdgeBottomLeft,E as EdgeBottomRight,C as EdgeTopLeft,w as EdgeTopRight,O as InsideScrollContainer,x as Interaction,b as WithLabel,k as __namedExportsOrder,v as default};
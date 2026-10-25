import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Qi as r,Xi as i,n as a}from"./icons-N6BqLuiz.js";import{n as o,r as s}from"./router-BBsnAkjj.js";import{i as c,n as l,r as u,t as d}from"./RouterProvider-DyQAugaH.js";function f(e){return e.split(`/`).slice(0,-1).join(`/`)}function p(e,t){let n=t.kind===`section`?``:t.key,r=e.split(`/`).at(-1)??e;return n?`${n}/${r}`:r}function m(){let[e,t]=(0,h.useState)(x),[n,a]=(0,h.useState)(`Drag a page onto a folder.`),o=e=>({key:e,label:e.split(`/`).at(-1)??e,to:`/${e}`,icon:r}),s={label:`Pages`,variant:`tree`,drag:{canDrag:e=>e.kind===`item`,canDrop:(e,t)=>t.kind!==`item`&&t.key!==e.key&&p(e.key,t)!==e.key,onDrop:(e,n)=>{let r=p(e.key,n);t(t=>t.map(t=>t===e.key?r:t)),a(`${e.key} → ${r}`)}},items:e.filter(e=>f(e)===``).map(o),groups:[...new Set(e.map(f))].filter(e=>e!==``).map(t=>({key:t,label:t,icon:i,items:e.filter(e=>f(e)===t).map(o)}))};return(0,g.jsx)(u,{brand:(0,g.jsx)(`span`,{className:`font-semibold`,children:`Docs`}),navSections:[s],children:(0,g.jsx)(`p`,{className:`p-density-4 text-sm text-muted-foreground`,children:n})})}var h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{h=t(),c(),l(),o(),a(),g=n(),{expect:_,fireEvent:v,within:y}=__STORYBOOK_MODULE_TEST__,b={title:`Layout/AppShell Nav Drag`,component:u,parameters:{layout:`fullscreen`,docs:{description:{component:"A nav section with `drag` lets the rail be rearranged in place: drag a row onto a folder row to move it there, or onto the section heading to move it to the root. The section owns what a move means — AppShell only reports which row was dropped on which. Folder rows and the section root highlight as you cross them; a drop the consumer refuses (`canDrop`) never lands, and never falls through to the row behind it."}}}},x=[`welcome`,`guides/install`,`guides/theming`,`drafts/rail-redesign`],S={render:()=>{let e=s(`/welcome`);return(0,g.jsx)(`div`,{className:`h-[420px]`,children:(0,g.jsx)(d,{adapter:e,children:(0,g.jsx)(m,{})})})},play:async({canvasElement:e})=>{let t=y(e),n=e=>t.getByRole(`link`,{name:e}).closest(`[data-nav-row]`),r=new DataTransfer,i=t.getByText(`drafts`).closest(`[data-nav-row]`);if(!(i instanceof HTMLElement))throw Error(`no drafts folder`);await v.dragStart(n(`welcome`),{dataTransfer:r}),await v.dragOver(i,{dataTransfer:r}),await _(i).toHaveAttribute(`data-nav-drop`,`over`),await v.drop(i,{dataTransfer:r}),await _(t.getByText(`welcome → drafts/welcome`)).toBeTruthy(),await _(i).not.toHaveAttribute(`data-nav-drop`)}},C=[`DragPagesBetweenFolders`],S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const router = useMemoryRouter("/welcome");
    return <div className="h-[420px]">
        <RouterProvider adapter={router}>
          <DraggableNavBody />
        </RouterProvider>
      </div>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const row = (name: string) => canvas.getByRole("link", {
      name
    }).closest("[data-nav-row]") as HTMLElement;

    // \`userEvent\` cannot express a native HTML5 drag, so the play test drives
    // the same DragEvents the browser would, with a real DataTransfer.
    const transfer = new DataTransfer();
    const drafts = canvas.getByText("drafts").closest("[data-nav-row]");
    if (!(drafts instanceof HTMLElement)) throw new Error("no drafts folder");
    await fireEvent.dragStart(row("welcome"), {
      dataTransfer: transfer
    });
    await fireEvent.dragOver(drafts, {
      dataTransfer: transfer
    });
    await expect(drafts).toHaveAttribute("data-nav-drop", "over");
    await fireEvent.drop(drafts, {
      dataTransfer: transfer
    });
    await expect(canvas.getByText("welcome → drafts/welcome")).toBeTruthy();
    await expect(drafts).not.toHaveAttribute("data-nav-drop");
  }
}`,...S.parameters?.docs?.source}}}})))()}w();export{S as DragPagesBetweenFolders,C as __namedExportsOrder,b as default};
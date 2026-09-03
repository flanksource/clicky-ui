import{j as i,r as v,b7 as E,a2 as D}from"./iframe-CiA63uuc.js";import{A as x,R as b}from"./RouterProvider-CFuNQjjg.js";import{u as k}from"./router-DdDvAp2k.js";import"./preload-helper-DqldIB3Q.js";import"./utils-DW-IJACk.js";import"./Icon-ChAy_Zq6.js";import"./modalStack-B1ctHZfJ.js";import"./zIndex-BGbNBNA8.js";import"./SplitPane-DDH1XhF2.js";import"./ContextMenu-B2c0IJLi.js";import"./floating-ui.react-BzcB7PEn.js";import"./index-BzPaU3HF.js";import"./index-CDCKIc0i.js";import"./DropdownMenuSubmenu-DGyluL-z.js";const{expect:l,fireEvent:m,within:B}=__STORYBOOK_MODULE_TEST__,K={title:"Layout/AppShell Nav Drag",component:x,parameters:{layout:"fullscreen",docs:{description:{component:"A nav section with `drag` lets the rail be rearranged in place: drag a row onto a folder row to move it there, or onto the section heading to move it to the root. The section owns what a move means — AppShell only reports which row was dropped on which. Folder rows and the section root highlight as you cross them; a drop the consumer refuses (`canDrop`) never lands, and never falls through to the row behind it."}}}},S=["welcome","guides/install","guides/theming","drafts/rail-redesign"];function p(t){return t.split("/").slice(0,-1).join("/")}function h(t,a){const s=a.kind==="section"?"":a.key,r=t.split("/").at(-1)??t;return s?`${s}/${r}`:r}function A(){const[t,a]=v.useState(S),[s,r]=v.useState("Drag a page onto a folder."),n=e=>({key:e,label:e.split("/").at(-1)??e,to:`/${e}`,icon:D}),c={label:"Pages",variant:"tree",drag:{canDrag:e=>e.kind==="item",canDrop:(e,o)=>o.kind!=="item"&&o.key!==e.key&&h(e.key,o)!==e.key,onDrop:(e,o)=>{const f=h(e.key,o);a(T=>T.map(w=>w===e.key?f:w)),r(`${e.key} → ${f}`)}},items:t.filter(e=>p(e)==="").map(n),groups:[...new Set(t.map(p))].filter(e=>e!=="").map(e=>({key:e,label:e,icon:E,items:t.filter(o=>p(o)===e).map(n)}))};return i.jsx(x,{brand:i.jsx("span",{className:"font-semibold",children:"Docs"}),navSections:[c],children:i.jsx("p",{className:"p-density-4 text-sm text-muted-foreground",children:s})})}const d={render:()=>{const t=k("/welcome");return i.jsx("div",{className:"h-[420px]",children:i.jsx(b,{adapter:t,children:i.jsx(A,{})})})},play:async({canvasElement:t})=>{const a=B(t),s=c=>a.getByRole("link",{name:c}).closest("[data-nav-row]"),r=new DataTransfer,n=a.getByText("drafts").closest("[data-nav-row]");if(!(n instanceof HTMLElement))throw new Error("no drafts folder");await m.dragStart(s("welcome"),{dataTransfer:r}),await m.dragOver(n,{dataTransfer:r}),await l(n).toHaveAttribute("data-nav-drop","over"),await m.drop(n,{dataTransfer:r}),await l(a.getByText("welcome → drafts/welcome")).toBeTruthy(),await l(n).not.toHaveAttribute("data-nav-drop")}};var u,g,y;d.parameters={...d.parameters,docs:{...(u=d.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(y=(g=d.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};const Y=["DragPagesBetweenFolders"];export{d as DragPagesBetweenFolders,Y as __namedExportsOrder,K as default};

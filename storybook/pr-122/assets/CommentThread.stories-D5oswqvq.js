import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{Et as r,Q as i,Wt as a,Xt as o,xt as s}from"./LexicalDragon.prod-EeNwAZ18.js";import{x as c}from"./comment-utils-BzBKm9RN.js";import{n as l,t as u}from"./CommentThread-ChEKKek7.js";import{a as d,c as f,i as p,n as m,r as h}from"./comment-fixtures-CWyc83Zd.js";function g(e){let{componentName:t,pageUrl:n,selector:r,source:i,html:a}=e,o=[];return t&&o.push(`**Component:** \`<${t}>\``),o.push(`**Page:** ${n}`),r&&o.push(`**Selector:** \`${r}\``),i&&o.push(``,"```",i,"```"),a&&o.push(``,`**HTML:**`,"```html",a,"```"),o.join(`
`)}function _(e){return`![${e.filename||`screenshot.png`}](${e.url})`}function v(e,t){let n=_(t),r=(e||``).trim();return r?`${r}\n\n## Attachments\n\n${n}`:n}function y(){return(y=e((()=>{})))()}function b(e){return e.split(`
`).map(e=>e.trim()).find(Boolean)??``}function x(e){let t=b(e.body);return t?t.length>T?`${t.slice(0,99)}…`:t:e.element?.componentName?e.element.componentName:e.anchor&&e.anchor!==`__document__`?`Comment on ${e.anchor}`:`Comment on this page`}function S(e){return e.trim().split(`
`).map(e=>e?`> ${e}`:`>`).join(`
`)}function C(e){return e.length===0?``:`## Replies\n\n${e.map(e=>`**${e.author?.name??`Unknown`}** · ${e.createdAt}\n${S(e.body)}`).join(`

`)}`}function w(e){let[t,...n]=e.thread;if(!t)throw Error(`Cannot create a todo: the thread has no root comment`);if(t.parentId)throw Error(`Cannot create a todo: the first comment of a thread must be its root, got reply ${t.id}`);let{element:r}=t,i=t.anchor&&t.anchor!==`__document__`?`**Anchor:** \`${t.anchor}\``:``,a=r?g({componentName:r.componentName??``,pageUrl:r.pageUrl??e.pageUrl,selector:``,source:r.source,html:r.html}):``,o=[t.body.trim(),[i,a].filter(Boolean).join(`
`),C(n)].filter(Boolean).join(`

`),s=r?.screenshot;return{title:x(t),body:s?.status===`captured`?v(o,{url:s.url,filename:s.filename}):s?.status===`unavailable`?`${o}\n\nScreenshot unavailable (${s.reason})`:o,sourceUrl:r?.pageUrl??e.pageUrl}}var T;function E(){return(E=e((()=>{c(),y(),T=100})))()}function D({autoFocusComposer:e=!1}){let{comments:t,callbacks:n}=f(p);return(0,M.jsx)(`div`,{className:`max-w-xl`,children:(0,M.jsx)(u,{comments:t,config:d,autoFocusComposer:e,...n})})}function O(){let{comments:e,callbacks:t}=f(h);return(0,M.jsx)(`div`,{className:`max-w-xl`,children:(0,M.jsx)(u,{comments:e,config:d,defaultExpanded:!0,...t})})}function k(){let{comments:e,callbacks:t}=f(p);return(0,M.jsx)(`div`,{className:`max-w-xl`,children:(0,M.jsx)(u,{comments:e,config:{...d,targets:[],defaultDelivery:{label:`claude-opus-5-5`,layer:`project`,description:`Delivered by the project's comment agent rule`}},defaultExpanded:!0,...t})})}function A(){let{comments:e,callbacks:t,setComments:n}=f(p),[r,i]=(0,j.useState)(),a=(e,t)=>n(n=>n.map(n=>n.id===e?{...n,body:t}:n));return(0,M.jsxs)(`div`,{className:`max-w-xl space-y-3`,children:[(0,M.jsx)(u,{comments:e,config:d,defaultExpanded:!0,...t,onEdit:a,onEditReply:(e,t,n)=>a(t,n),onDeleteReply:(e,t)=>n(e=>e.filter(e=>e.id!==t)),onCreateTodo:e=>i(w({thread:e,pageUrl:`https://app.example/dashboard`}))}),r&&(0,M.jsx)(`pre`,{"data-testid":`thread-todo`,className:`whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-2 text-[11px]`,children:`${r.title}\n\n${r.body}`})]})}var j,M,N,P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{j=t(),o(),l(),E(),m(),M=n(),{expect:N,userEvent:P,within:F}=__STORYBOOK_MODULE_TEST__,I={title:`Comments/CommentThread`,component:u,parameters:{layout:`padded`},tags:[`autodocs`]},L={render:()=>(0,M.jsx)(D,{})},R={render:()=>(0,M.jsx)(O,{}),play:async({canvasElement:e})=>{let t=F(e);await P.click(await t.findByRole(`button`,{name:`Apply`})),await N(await t.findByText(`Applied`)).toBeInTheDocument()}},z={render:()=>(0,M.jsx)(D,{autoFocusComposer:!0}),tags:[`browser`],play:async({canvasElement:e})=>{let t=await F(e).findByTestId(`comment-compose-input`);await P.click(t);let n=a(t);if(!n)throw Error(`comment-compose-input is not inside a Lexical editor`);n.update(()=>{let e=s(`Looks good @cl`);r().clear().append(i().append(e)),e.selectEnd()},{discrete:!0});let o=await F(document.body).findByRole(`listbox`,{name:`Vocabulary and mentions`});await N(o).toBeInTheDocument();let c=await F(o).findByRole(`option`,{name:/claude/});await P.click(c),await N(t).toHaveTextContent(`@claude`)}},B={render:()=>(0,M.jsx)(k,{}),play:async({canvasElement:e})=>{let t=F(e);await P.click(await t.findByRole(`button`,{name:`Add a comment…`}));let n=await t.findByTestId(`default-delivery`);await N(n).toHaveTextContent(`Comments without an @target go to claude-opus-5-5 (rule from project)`),await P.click((await t.findAllByRole(`button`,{name:`Reply`}))[0]),await N(await t.findByTestId(`reply-delivery`)).toHaveTextContent(`Replies are delivered only when they name an @target`),await N(t.getAllByTestId(`default-delivery`)).toHaveLength(1)}},V={render:()=>(0,M.jsx)(A,{}),play:async({canvasElement:e})=>{let t=F(e),n=(await t.findByText(/headline number/)).closest(`[data-testid='comment-card']`);await P.click(F(n).getByRole(`button`,{name:`Comment actions`})),await P.click(await F(document.body).findByRole(`menuitem`,{name:`Create todo`}));let r=await t.findByTestId(`thread-todo`);await N(r).toHaveTextContent(`Replies`),await N(r).toHaveTextContent("Verified: the variance is a `currency` conversion")}},H=[`Default`,`WithProposedPatch`,`WithMentionAutocomplete`,`WithDefaultDeliveryLine`,`WithThreadActions`],L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <Demo />
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <ProposalDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", {
      name: "Apply"
    }));
    await expect(await canvas.findByText("Applied")).toBeInTheDocument();
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <Demo autoFocusComposer />,
  // The Lexical composer needs a real DOM selection and layout.
  tags: ["browser"],
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByTestId("comment-compose-input");
    await userEvent.click(input);
    // The composer is a Lexical editor, which ignores user-event's synthetic
    // keystrokes, so the draft is typed through the editor's model.
    const editor = getNearestEditorFromDOMNode(input);
    if (!editor) throw new Error("comment-compose-input is not inside a Lexical editor");
    editor.update(() => {
      const text = $createTextNode("Looks good @cl");
      $getRoot().clear().append($createParagraphNode().append(text));
      text.selectEnd();
    }, {
      discrete: true
    });
    // The composer's mention list is portaled to document.body.
    const popover = await within(document.body).findByRole("listbox", {
      name: "Vocabulary and mentions"
    });
    await expect(popover).toBeInTheDocument();
    const option = await within(popover).findByRole("option", {
      name: /claude/
    });
    await userEvent.click(option);
    await expect(input).toHaveTextContent("@claude");
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <DefaultDeliveryDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", {
      name: "Add a comment…"
    }));
    const line = await canvas.findByTestId("default-delivery");
    await expect(line).toHaveTextContent("Comments without an @target go to claude-opus-5-5 (rule from project)");
    await userEvent.click((await canvas.findAllByRole("button", {
      name: "Reply"
    }))[0]!);
    await expect(await canvas.findByTestId("reply-delivery")).toHaveTextContent("Replies are delivered only when they name an @target");
    await expect(canvas.getAllByTestId("default-delivery")).toHaveLength(1);
  }
}`,...B.parameters?.docs?.source},description:{story:"The new-thread composer states where a comment without an `@target` goes, and which settings layer says so.\nA reply box does not: the comment agent rule applies to new threads only, so it says replies need an `@target`.",...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <ThreadActionsDemo />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const root = (await canvas.findByText(/headline number/)).closest<HTMLElement>("[data-testid='comment-card']")!;
    await userEvent.click(within(root).getByRole("button", {
      name: "Comment actions"
    }));
    await userEvent.click(await within(document.body).findByRole("menuitem", {
      name: "Create todo"
    }));
    const todo = await canvas.findByTestId("thread-todo");
    await expect(todo).toHaveTextContent("Replies");
    await expect(todo).toHaveTextContent("Verified: the variance is a \`currency\` conversion");
  }
}`,...V.parameters?.docs?.source},description:{story:`Edit, edit-reply, delete-reply and Create todo appear only because the host passed their callbacks.`,...V.parameters?.docs?.description}}}})))()}U();export{L as Default,B as WithDefaultDeliveryLine,z as WithMentionAutocomplete,R as WithProposedPatch,V as WithThreadActions,H as __namedExportsOrder,I as default};
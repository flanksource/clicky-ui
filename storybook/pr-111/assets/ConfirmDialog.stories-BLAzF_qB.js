import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./button-6-GcSFqM.js";import{n as a,t as o}from"./ConfirmDialog-CtYDY-S3.js";import{n as s,r as c,t as l}from"./useConfirm-ah8gNDY8.js";var u,d,f,p,m,h,g;function _(){return(_=e((()=>{u=t(),r(),a(),l(),d=n(),f=`storybook:run-against-staging`,p={title:`Overlay/ConfirmDialog`,component:o,args:{open:!0,title:`Run against staging?`,message:`Evaluates the expression once per sample (5 runs).`,warning:`Custom SQL functions may change data or consume a generated value.`,confirmLabel:`Run`,cancelLabel:`Cancel`,variant:`default`,remember:{key:f,label:`Remember my choice for staging`},onConfirm:()=>void 0,onCancel:()=>void 0},argTypes:{variant:{control:`inline-radio`,options:[`default`,`destructive`],table:{category:`Layout`,defaultValue:{summary:`default`}}},onConfirm:{control:!1,table:{category:`Events`}},onCancel:{control:!1,table:{category:`Events`}}},parameters:{docs:{description:{component:`A small \`Modal\` asking the user to confirm an action, with an optional warning banner and an optional **Remember my choice** checkbox.

**Behavior**
- Escape and the close button cancel.
- Only a confirmation is remembered (localStorage key \`clicky-ui:confirm:<remember.key>\`); a cancel never is.
- Where localStorage is unavailable the checkbox is hidden and the prompt always shows.

**Usage**
\`\`\`tsx
const { confirm, dialog } = useConfirm();
const { remembered, forget } = useConfirmMemory(key);
if (await confirm({ title: 'Run?', warning: '…', remember: { key } })) run();
return <>{remembered && <button onClick={forget}>Ask again</button>}{dialog}</>;
\`\`\``}}}},m={},h={parameters:{docs:{description:{story:"`useConfirm` returns a promise-based `confirm` and the dialog to render. Once the choice is remembered the promise resolves without a prompt, and `useConfirmMemory` drives the banner that offers to ask again."}}},render:()=>{let{confirm:e,dialog:t}=s(),{remembered:n,forget:r}=c(f),[a,o]=(0,u.useState)(0);return(0,d.jsxs)(`div`,{className:`space-y-3`,children:[n?(0,d.jsxs)(`p`,{className:`text-sm`,children:[`Runs skip confirmation.`,` `,(0,d.jsx)(`button`,{type:`button`,className:`underline`,onClick:r,children:`Ask again`})]}):null,(0,d.jsx)(i,{onClick:async()=>{await e({title:`Run against staging?`,warning:`Custom SQL functions may change data or consume a generated value.`,confirmLabel:`Run`,remember:{key:f,label:`Remember my choice for staging`}})&&o(e=>e+1)},children:`Run`}),(0,d.jsxs)(`p`,{className:`text-sm text-muted-foreground`,children:[`Runs: `,a]}),t]})}},g=[`Playground`,`PromiseHook`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "\`useConfirm\` returns a promise-based \`confirm\` and the dialog to render. Once the choice is remembered the promise resolves without a prompt, and \`useConfirmMemory\` drives the banner that offers to ask again."
      }
    }
  },
  render: () => {
    const {
      confirm,
      dialog
    } = useConfirm();
    const {
      remembered,
      forget
    } = useConfirmMemory(REMEMBER_KEY);
    const [runs, setRuns] = useState(0);
    return <div className="space-y-3">
        {remembered ? <p className="text-sm">
            Runs skip confirmation.{" "}
            <button type="button" className="underline" onClick={forget}>
              Ask again
            </button>
          </p> : null}
        <Button onClick={async () => {
        const confirmed = await confirm({
          title: "Run against staging?",
          warning: "Custom SQL functions may change data or consume a generated value.",
          confirmLabel: "Run",
          remember: {
            key: REMEMBER_KEY,
            label: "Remember my choice for staging"
          }
        });
        if (confirmed) setRuns(count => count + 1);
      }}>
          Run
        </Button>
        <p className="text-sm text-muted-foreground">Runs: {runs}</p>
        {dialog}
      </div>;
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{m as Playground,h as PromiseHook,g as __namedExportsOrder,p as default};
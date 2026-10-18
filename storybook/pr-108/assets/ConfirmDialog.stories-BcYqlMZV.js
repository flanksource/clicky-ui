import{r as y,j as e}from"./iframe-CKgGkAV6.js";import{B as h}from"./button-mYaiNNVw.js";import{C as R}from"./ConfirmDialog-jL-0yOpu.js";import{u as k,a as C}from"./useConfirm-CDW8g6Jy.js";import"./preload-helper-D6IOlyYr.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CVVM6inm.js";import"./Callout-CoJdVJX9.js";import"./callout-tones-EFt49BYo.js";import"./Modal-CyMxnyK7.js";import"./index-B8WCVke5.js";import"./index-B-AXG8c2.js";import"./Icon-zT9BHEU_.js";import"./modalStack-TnERC9Dk.js";import"./zIndex-BGbNBNA8.js";const r="storybook:run-against-staging",D={title:"Overlay/ConfirmDialog",component:R,args:{open:!0,title:"Run against staging?",message:"Evaluates the expression once per sample (5 runs).",warning:"Custom SQL functions may change data or consume a generated value.",confirmLabel:"Run",cancelLabel:"Cancel",variant:"default",remember:{key:r,label:"Remember my choice for staging"},onConfirm:()=>{},onCancel:()=>{}},argTypes:{variant:{control:"inline-radio",options:["default","destructive"],table:{category:"Layout",defaultValue:{summary:"default"}}},onConfirm:{control:!1,table:{category:"Events"}},onCancel:{control:!1,table:{category:"Events"}}},parameters:{docs:{description:{component:["A small `Modal` asking the user to confirm an action, with an optional warning banner and an optional **Remember my choice** checkbox.","","**Behavior**","- Escape and the close button cancel.","- Only a confirmation is remembered (localStorage key `clicky-ui:confirm:<remember.key>`); a cancel never is.","- Where localStorage is unavailable the checkbox is hidden and the prompt always shows.","","**Usage**","```tsx","const { confirm, dialog } = useConfirm();","const { remembered, forget } = useConfirmMemory(key);","if (await confirm({ title: 'Run?', warning: '…', remember: { key } })) run();","return <>{remembered && <button onClick={forget}>Ask again</button>}{dialog}</>;","```"].join(`
`)}}}},n={},o={parameters:{docs:{description:{story:"`useConfirm` returns a promise-based `confirm` and the dialog to render. Once the choice is remembered the promise resolves without a prompt, and `useConfirmMemory` drives the banner that offers to ask again."}}},render:()=>{const{confirm:u,dialog:l}=k(),{remembered:d,forget:p}=C(r),[f,g]=y.useState(0);return e.jsxs("div",{className:"space-y-3",children:[d?e.jsxs("p",{className:"text-sm",children:["Runs skip confirmation."," ",e.jsx("button",{type:"button",className:"underline",onClick:p,children:"Ask again"})]}):null,e.jsx(h,{onClick:async()=>{await u({title:"Run against staging?",warning:"Custom SQL functions may change data or consume a generated value.",confirmLabel:"Run",remember:{key:r,label:"Remember my choice for staging"}})&&g(b=>b+1)},children:"Run"}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Runs: ",f]}),l]})}};var t,a,s;n.parameters={...n.parameters,docs:{...(t=n.parameters)==null?void 0:t.docs,source:{originalSource:"{}",...(s=(a=n.parameters)==null?void 0:a.docs)==null?void 0:s.source}}};var i,m,c;o.parameters={...o.parameters,docs:{...(i=o.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(c=(m=o.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};const H=["Playground","PromiseHook"];export{n as Playground,o as PromiseHook,H as __namedExportsOrder,D as default};

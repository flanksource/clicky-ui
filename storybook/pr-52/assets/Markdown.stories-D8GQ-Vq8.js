import{M as h}from"./Markdown-BNPBXcAZ.js";import"./preload-helper-BQQafFCE.js";import"./iframe-Dfw8bSNS.js";import"./utils-CR52uffu.js";import"./CodeBlock-DDIY_OAl.js";import"./Icon-LnpkfR7o.js";import"./CodeDiff-iv3x786i.js";import"./SegmentedControl-d9EOhKCs.js";import"./code-highlight-BRZJmHgt.js";import"./JsonView-DwyJaB-0.js";const{expect:e,within:w}=__STORYBOOK_MODULE_TEST__,v={title:"Data/Markdown",component:h,args:{text:"### Status\\n\\nService is **healthy**."},parameters:{docs:{description:{component:"Markdown renderer for comments, generated docs, and Clicky text blocks. It lazy-loads `streamdown` and renders fenced code blocks with the theme-aware `CodeBlock` component."}}}},o={args:{text:`# Heading

This is a **bold** statement and a [link](https://example.com).

- item one
- item two
- item three

\`\`\`js
const x = 42;
\`\`\`

> A thoughtful quote.

| Service | Status   | Restarts |
| ------- | -------- | -------- |
| api     | healthy  | 0        |
| worker  | degraded | 3        |`}},c={args:{text:"Set the request `timeout` in the config below.\n\n```yaml\nservice:\n  name: api\n  timeout: 300\n```"},play:async({canvasElement:n,step:a})=>{const t=w(n);await a("fenced block renders via the library CodeBlock",async()=>{await e(await t.findByText("yaml")).toBeInTheDocument(),e(n.querySelector('[data-streamdown="code-block"]')).toBeNull(),e(n.querySelector(".not-prose")).not.toBeNull()}),await a("code body carries the fenced content",async()=>{await e(n.textContent).toContain("timeout: 300")}),await a("header exposes copy, download, and per-block theme controls",async()=>{await e(await t.findByLabelText("Copy code")).toBeInTheDocument(),e(t.getByLabelText("Download code")).toBeInTheDocument(),e(t.getByLabelText(/Switch to (dark|light) theme/)).toBeInTheDocument()}),await a("inline code stays inline",async()=>{const p=await t.findByText("timeout",{selector:"code"});e(p.closest('[data-streamdown="code-block"]')).toBeNull()})}};var s,r,i;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    text: \`# Heading

This is a **bold** statement and a [link](https://example.com).

- item one
- item two
- item three

\\\`\\\`\\\`js
const x = 42;
\\\`\\\`\\\`

> A thoughtful quote.

| Service | Status   | Restarts |
| ------- | -------- | -------- |
| api     | healthy  | 0        |
| worker  | degraded | 3        |\`
  }
}`,...(i=(r=o.parameters)==null?void 0:r.docs)==null?void 0:i.source}}};var d,l,m;c.parameters={...c.parameters,docs:{...(d=c.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    text: \`Set the request \\\`timeout\\\` in the config below.

\\\`\\\`\\\`yaml
service:
  name: api
  timeout: 300
\\\`\\\`\\\`\`
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("fenced block renders via the library CodeBlock", async () => {
      // CodeBlock stamps a language header; Streamdown's own block is replaced.
      await expect(await canvas.findByText("yaml")).toBeInTheDocument();
      expect(canvasElement.querySelector('[data-streamdown="code-block"]')).toBeNull();
      expect(canvasElement.querySelector(".not-prose")).not.toBeNull();
    });
    await step("code body carries the fenced content", async () => {
      await expect(canvasElement.textContent).toContain("timeout: 300");
    });
    await step("header exposes copy, download, and per-block theme controls", async () => {
      await expect(await canvas.findByLabelText("Copy code")).toBeInTheDocument();
      expect(canvas.getByLabelText("Download code")).toBeInTheDocument();
      expect(canvas.getByLabelText(/Switch to (dark|light) theme/)).toBeInTheDocument();
    });
    await step("inline code stays inline", async () => {
      const inline = await canvas.findByText("timeout", {
        selector: "code"
      });
      expect(inline.closest('[data-streamdown="code-block"]')).toBeNull();
    });
  }
}`,...(m=(l=c.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};const C=["Rich","CodeBlocks"];export{c as CodeBlocks,o as Rich,C as __namedExportsOrder,v as default};

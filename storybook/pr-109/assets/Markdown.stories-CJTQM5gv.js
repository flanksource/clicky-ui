import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{r as t,t as n}from"./Markdown-tmSfcuT9.js";import{n as r,r as i,t as a}from"./markdown-syntax-Cpc2zW40.js";function o(e){let t=r.find(t=>t.id===e);if(!t)throw Error(`markdown-syntax.md has no section "${e}"`);return{name:t.title,args:{text:t.markdown}}}var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{t(),i(),{expect:s,waitFor:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`Data/Markdown`,component:n,args:{text:`### Status

Service is **healthy**.`},parameters:{docs:{description:{component:"Markdown renderer for comments, generated docs, and Clicky text blocks. It lazy-loads `streamdown`, renders fenced code blocks with the theme-aware `CodeBlock` component, and styles lists and tables itself so they do not depend on classes shipped inside `streamdown`'s dist. The stories below walk the complete supported syntax, one construct per story; `AllSyntax` renders them as a single document."}}}},d={name:`All syntax`,args:{text:a}},f=o(`headings`),p=o(`paragraphs-and-line-breaks`),m=o(`emphasis-and-inline-styles`),h=o(`escapes-and-entities`),g={...o(`lists`),play:async({canvasElement:e,step:t})=>{await t(`nested lists indent one level at a time`,async()=>{await c(()=>s(e.querySelectorAll(`ul ul, ol ol`).length).toBeGreaterThan(0));for(let t of e.querySelectorAll(`ul, ol`)){let e=getComputedStyle(t);s(e.paddingLeft).not.toBe(`0px`),s(e.listStyleType).not.toBe(`none`)}})}},_={...o(`task-lists`),play:async({canvasElement:e,step:t})=>{await t(`checkboxes render read-only in the source order`,async()=>{let t=await c(()=>{let t=e.querySelectorAll(`input[type="checkbox"]`);return s(t).toHaveLength(3),[...t]});s(t.map(e=>e.checked)).toEqual([!0,!1,!1]),s(t.every(e=>e.disabled)).toBe(!0)}),await t(`the checkbox replaces the bullet, so the row is flush`,async()=>{let t=e.querySelector(`ul`);s(t&&getComputedStyle(t).listStyleType).toBe(`none`),s(t&&getComputedStyle(t).paddingLeft).toBe(`0px`)})}},v=o(`links`),y=o(`images`),b=o(`blockquotes`),x={...o(`code`),play:async({canvasElement:e,step:t})=>{let n=l(e);await t(`fenced blocks render via the library CodeBlock`,async()=>{await s(await n.findByText(`ts`)).toBeInTheDocument(),s(e.querySelector(`[data-streamdown="code-block"]`)).toBeNull(),s(e.querySelectorAll(`.not-prose`)).toHaveLength(3)}),await t(`header exposes copy, download, and per-block theme controls`,async()=>{s((await n.findAllByLabelText(`Copy code`)).length).toBe(3),s(n.getAllByLabelText(`Download code`).length).toBe(3),s(n.getAllByLabelText(/Switch to (dark|light) theme/).length).toBe(3)}),await t(`inline code stays inline`,async()=>{let e=await n.findByText(`CodeBlock`,{selector:`code`});s(e.closest(`.not-prose`)).toBeNull()})}},S={...o(`tables`),play:async({canvasElement:e,step:t})=>{let n=await c(()=>{let t=e.querySelectorAll(`table`);return s(t).toHaveLength(2),[...t]});await t(`each table scrolls inside its own bordered container`,async()=>{for(let e of n){let t=e.parentElement;s(getComputedStyle(t).overflowX).toBe(`auto`),s(getComputedStyle(t).borderBottomWidth).not.toBe(`0px`)}s(e.scrollWidth).toBeLessThanOrEqual(e.clientWidth)}),await t(`the header is shaded and rows are separated`,async()=>{let t=e.querySelector(`thead`);s(getComputedStyle(t).backgroundColor).not.toBe(`rgba(0, 0, 0, 0)`),s(getComputedStyle(t).borderBottomWidth).not.toBe(`0px`),s(n.flatMap(e=>[...e.querySelectorAll(`tbody tr:not(:last-child)`)]).every(e=>getComputedStyle(e).borderBottomWidth!==`0px`)).toBe(!0)}),await t(`the delimiter row still drives column alignment`,async()=>{let t=[...e.querySelectorAll(`thead th`)];s(t.map(e=>getComputedStyle(e).textAlign)).toEqual([`left`,`center`,`right`,`left`,`left`])})}},C=o(`footnotes`),w=o(`thematic-breaks`),T=o(`inline-html`),E={...o(`sanitized-html`),play:async({canvasElement:e,step:t})=>{let n=l(e);await t(`unlisted tags are unwrapped to their text`,async()=>{await n.findByText(/mark/),s(e.querySelector(`mark`)).toBeNull(),s(e.querySelector(`abbr`)).toBeNull()}),await t(`script tags and comments never reach the DOM`,async()=>{s(e.querySelector(`script`)).toBeNull(),s(e.textContent).not.toContain(`alert`),s(e.innerHTML).not.toContain(`this comment is not rendered`)})}},D=o(`unsupported-syntax`),O=[`AllSyntax`,`Headings`,`ParagraphsAndLineBreaks`,`EmphasisAndInlineStyles`,`EscapesAndEntities`,`Lists`,`TaskLists`,`Links`,`Images`,`Blockquotes`,`Code`,`Tables`,`Footnotes`,`ThematicBreaks`,`InlineHtml`,`SanitizedHtml`,`UnsupportedSyntax`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "All syntax",
  args: {
    text: MARKDOWN_SYNTAX_DOCUMENT
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`section("headings")`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`section("paragraphs-and-line-breaks")`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`section("emphasis-and-inline-styles")`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`section("escapes-and-entities")`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  ...section("lists"),
  play: async ({
    canvasElement,
    step
  }) => {
    // Streamdown loads lazily, so wait for the nested markup before measuring.
    await step("nested lists indent one level at a time", async () => {
      await waitFor(() => expect(canvasElement.querySelectorAll("ul ul, ol ol").length).toBeGreaterThan(0));
      for (const list of canvasElement.querySelectorAll("ul, ol")) {
        // Streamdown styles lists with classes that only compile if the consumer's
        // Tailwind scans its dist; Markdown owns the marker and the indent so both
        // ship with the library.
        const style = getComputedStyle(list);
        expect(style.paddingLeft).not.toBe("0px");
        expect(style.listStyleType).not.toBe("none");
      }
    });
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  ...section("task-lists"),
  play: async ({
    canvasElement,
    step
  }) => {
    await step("checkboxes render read-only in the source order", async () => {
      const boxes = await waitFor(() => {
        const found = canvasElement.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
        expect(found).toHaveLength(3);
        return [...found];
      });
      expect(boxes.map(box => box.checked)).toEqual([true, false, false]);
      expect(boxes.every(box => box.disabled)).toBe(true);
    });
    await step("the checkbox replaces the bullet, so the row is flush", async () => {
      const list = canvasElement.querySelector("ul");
      expect(list && getComputedStyle(list).listStyleType).toBe("none");
      expect(list && getComputedStyle(list).paddingLeft).toBe("0px");
    });
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`section("links")`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`section("images")`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`section("blockquotes")`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  ...section("code"),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("fenced blocks render via the library CodeBlock", async () => {
      // CodeBlock stamps a language header; Streamdown's own block is replaced.
      await expect(await canvas.findByText("ts")).toBeInTheDocument();
      expect(canvasElement.querySelector('[data-streamdown="code-block"]')).toBeNull();
      expect(canvasElement.querySelectorAll(".not-prose")).toHaveLength(3);
    });
    await step("header exposes copy, download, and per-block theme controls", async () => {
      expect((await canvas.findAllByLabelText("Copy code")).length).toBe(3);
      expect(canvas.getAllByLabelText("Download code").length).toBe(3);
      expect(canvas.getAllByLabelText(/Switch to (dark|light) theme/).length).toBe(3);
    });
    await step("inline code stays inline", async () => {
      const inline = await canvas.findByText("CodeBlock", {
        selector: "code"
      });
      expect(inline.closest(".not-prose")).toBeNull();
    });
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  ...section("tables"),
  play: async ({
    canvasElement,
    step
  }) => {
    const tables = await waitFor(() => {
      const found = canvasElement.querySelectorAll("table");
      expect(found).toHaveLength(2);
      return [...found];
    });
    await step("each table scrolls inside its own bordered container", async () => {
      for (const table of tables) {
        const scroller = table.parentElement as HTMLElement;
        expect(getComputedStyle(scroller).overflowX).toBe("auto");
        expect(getComputedStyle(scroller).borderBottomWidth).not.toBe("0px");
      }
      expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
    });
    await step("the header is shaded and rows are separated", async () => {
      // Streamdown shades the header with \`bg-muted/80\` and separates rows with
      // classes from its own dist, none of which a consumer's Tailwind compiles;
      // computed styles are the only way to catch that.
      const head = canvasElement.querySelector("thead") as HTMLElement;
      expect(getComputedStyle(head).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
      expect(getComputedStyle(head).borderBottomWidth).not.toBe("0px");
      expect(tables.flatMap(table => [...table.querySelectorAll<HTMLElement>("tbody tr:not(:last-child)")]).every(row => getComputedStyle(row).borderBottomWidth !== "0px")).toBe(true);
    });
    await step("the delimiter row still drives column alignment", async () => {
      const heads = [...canvasElement.querySelectorAll<HTMLElement>("thead th")];
      expect(heads.map(cell => getComputedStyle(cell).textAlign)).toEqual(["left", "center", "right", "left", "left"]);
    });
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`section("footnotes")`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`section("thematic-breaks")`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`section("inline-html")`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  ...section("sanitized-html"),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("unlisted tags are unwrapped to their text", async () => {
      // Anchors the negative assertions below: without it they pass on an
      // empty canvas while Streamdown is still loading.
      await canvas.findByText(/mark/);
      expect(canvasElement.querySelector("mark")).toBeNull();
      expect(canvasElement.querySelector("abbr")).toBeNull();
    });
    await step("script tags and comments never reach the DOM", async () => {
      expect(canvasElement.querySelector("script")).toBeNull();
      expect(canvasElement.textContent).not.toContain("alert");
      expect(canvasElement.innerHTML).not.toContain("this comment is not rendered");
    });
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`section("unsupported-syntax")`,...D.parameters?.docs?.source}}}})))()}k();export{d as AllSyntax,b as Blockquotes,x as Code,m as EmphasisAndInlineStyles,h as EscapesAndEntities,C as Footnotes,f as Headings,y as Images,T as InlineHtml,v as Links,g as Lists,p as ParagraphsAndLineBreaks,E as SanitizedHtml,S as Tables,_ as TaskLists,w as ThematicBreaks,D as UnsupportedSyntax,O as __namedExportsOrder,u as default};
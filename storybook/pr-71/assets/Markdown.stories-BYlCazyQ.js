import{Markdown as ke}from"./Markdown-CFdQSKra.js";import{M as Te,a as ve}from"./markdown-syntax-CgpwdbQ3.js";import"./preload-helper-CrzHa85r.js";import"./iframe-CmyXO54k.js";import"./utils-DW-IJACk.js";import"./Callout-ZLEeQDPN.js";import"./callout-tones-DN7X2Ehz.js";import"./CodeBlock-GGT34NA8.js";import"./Icon-Cn5Qjct9.js";import"./CodeDiff-FPsEM8TE.js";import"./SegmentedControl-D4w90S4E.js";import"./HighlightedTokens-RUXfQsDG.js";import"./JsonView-CeZOxYv_.js";const{expect:e,waitFor:T,within:fe}=__STORYBOOK_MODULE_TEST__,ze={title:"Data/Markdown",component:ke,args:{text:`### Status

Service is **healthy**.`},parameters:{docs:{description:{component:"Markdown renderer for comments, generated docs, and Clicky text blocks. It lazy-loads `streamdown`, renders fenced code blocks with the theme-aware `CodeBlock` component, and styles lists and tables itself so they do not depend on classes shipped inside `streamdown`'s dist. The stories below walk the complete supported syntax, one construct per story; `AllSyntax` renders them as a single document."}}}};function n(t){const s=ve.find(a=>a.id===t);if(!s)throw new Error(`markdown-syntax.md has no section "${t}"`);return{name:s.title,args:{text:s.markdown}}}const c={name:"All syntax",args:{text:Te}},l=n("headings"),i=n("paragraphs-and-line-breaks"),d=n("emphasis-and-inline-styles"),p=n("escapes-and-entities"),m={...n("lists"),play:async({canvasElement:t,step:s})=>{await s("nested lists indent one level at a time",async()=>{await T(()=>e(t.querySelectorAll("ul ul, ol ol").length).toBeGreaterThan(0));for(const a of t.querySelectorAll("ul, ol")){const o=getComputedStyle(a);e(o.paddingLeft).not.toBe("0px"),e(o.listStyleType).not.toBe("none")}})}},u={...n("task-lists"),play:async({canvasElement:t,step:s})=>{await s("checkboxes render read-only in the source order",async()=>{const a=await T(()=>{const o=t.querySelectorAll('input[type="checkbox"]');return e(o).toHaveLength(3),[...o]});e(a.map(o=>o.checked)).toEqual([!0,!1,!1]),e(a.every(o=>o.disabled)).toBe(!0)}),await s("the checkbox replaces the bullet, so the row is flush",async()=>{const a=t.querySelector("ul");e(a&&getComputedStyle(a).listStyleType).toBe("none"),e(a&&getComputedStyle(a).paddingLeft).toBe("0px")})}},y=n("links"),h=n("images"),w=n("blockquotes"),g={...n("code"),play:async({canvasElement:t,step:s})=>{const a=fe(t);await s("fenced blocks render via the library CodeBlock",async()=>{await e(await a.findByText("ts")).toBeInTheDocument(),e(t.querySelector('[data-streamdown="code-block"]')).toBeNull(),e(t.querySelectorAll(".not-prose")).toHaveLength(3)}),await s("header exposes copy, download, and per-block theme controls",async()=>{e((await a.findAllByLabelText("Copy code")).length).toBe(3),e(a.getAllByLabelText("Download code").length).toBe(3),e(a.getAllByLabelText(/Switch to (dark|light) theme/).length).toBe(3)}),await s("inline code stays inline",async()=>{const o=await a.findByText("CodeBlock",{selector:"code"});e(o.closest(".not-prose")).toBeNull()})}},x={...n("tables"),play:async({canvasElement:t,step:s})=>{const a=await T(()=>{const o=t.querySelectorAll("table");return e(o).toHaveLength(2),[...o]});await s("each table scrolls inside its own bordered container",async()=>{for(const o of a){const r=o.parentElement;e(getComputedStyle(r).overflowX).toBe("auto"),e(getComputedStyle(r).borderBottomWidth).not.toBe("0px")}e(t.scrollWidth).toBeLessThanOrEqual(t.clientWidth)}),await s("the header is shaded and rows are separated",async()=>{const o=t.querySelector("thead");e(getComputedStyle(o).backgroundColor).not.toBe("rgba(0, 0, 0, 0)"),e(getComputedStyle(o).borderBottomWidth).not.toBe("0px"),e(a.flatMap(r=>[...r.querySelectorAll("tbody tr:not(:last-child)")]).every(r=>getComputedStyle(r).borderBottomWidth!=="0px")).toBe(!0)}),await s("the delimiter row still drives column alignment",async()=>{const o=[...t.querySelectorAll("thead th")];e(o.map(r=>getComputedStyle(r).textAlign)).toEqual(["left","center","right","left","left"])})}},S=n("footnotes"),b=n("thematic-breaks"),B=n("inline-html"),f={...n("sanitized-html"),play:async({canvasElement:t,step:s})=>{const a=fe(t);await s("unlisted tags are unwrapped to their text",async()=>{await a.findByText(/mark/),e(t.querySelector("mark")).toBeNull(),e(t.querySelector("abbr")).toBeNull()}),await s("script tags and comments never reach the DOM",async()=>{e(t.querySelector("script")).toBeNull(),e(t.textContent).not.toContain("alert"),e(t.innerHTML).not.toContain("this comment is not rendered")})}},k=n("unsupported-syntax");var v,A,C;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: "All syntax",
  args: {
    text: MARKDOWN_SYNTAX_DOCUMENT
  }
}`,...(C=(A=c.parameters)==null?void 0:A.docs)==null?void 0:C.source}}};var q,E,L;l.parameters={...l.parameters,docs:{...(q=l.parameters)==null?void 0:q.docs,source:{originalSource:'section("headings")',...(L=(E=l.parameters)==null?void 0:E.docs)==null?void 0:L.source}}};var M,H,N;i.parameters={...i.parameters,docs:{...(M=i.parameters)==null?void 0:M.docs,source:{originalSource:'section("paragraphs-and-line-breaks")',...(N=(H=i.parameters)==null?void 0:H.docs)==null?void 0:N.source}}};var O,_,D;d.parameters={...d.parameters,docs:{...(O=d.parameters)==null?void 0:O.docs,source:{originalSource:'section("emphasis-and-inline-styles")',...(D=(_=d.parameters)==null?void 0:_.docs)==null?void 0:D.source}}};var W,I,z;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:'section("escapes-and-entities")',...(z=(I=p.parameters)==null?void 0:I.docs)==null?void 0:z.source}}};var F,U,X;m.parameters={...m.parameters,docs:{...(F=m.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(X=(U=m.parameters)==null?void 0:U.docs)==null?void 0:X.source}}};var K,R,Y;u.parameters={...u.parameters,docs:{...(K=u.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
}`,...(Y=(R=u.parameters)==null?void 0:R.docs)==null?void 0:Y.source}}};var G,P,$;y.parameters={...y.parameters,docs:{...(G=y.parameters)==null?void 0:G.docs,source:{originalSource:'section("links")',...($=(P=y.parameters)==null?void 0:P.docs)==null?void 0:$.source}}};var j,J,Q;h.parameters={...h.parameters,docs:{...(j=h.parameters)==null?void 0:j.docs,source:{originalSource:'section("images")',...(Q=(J=h.parameters)==null?void 0:J.docs)==null?void 0:Q.source}}};var V,Z,ee;w.parameters={...w.parameters,docs:{...(V=w.parameters)==null?void 0:V.docs,source:{originalSource:'section("blockquotes")',...(ee=(Z=w.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};var te,ae,oe;g.parameters={...g.parameters,docs:{...(te=g.parameters)==null?void 0:te.docs,source:{originalSource:`{
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
}`,...(oe=(ae=g.parameters)==null?void 0:ae.docs)==null?void 0:oe.source}}};var se,ne,re;x.parameters={...x.parameters,docs:{...(se=x.parameters)==null?void 0:se.docs,source:{originalSource:`{
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
}`,...(re=(ne=x.parameters)==null?void 0:ne.docs)==null?void 0:re.source}}};var ce,le,ie;S.parameters={...S.parameters,docs:{...(ce=S.parameters)==null?void 0:ce.docs,source:{originalSource:'section("footnotes")',...(ie=(le=S.parameters)==null?void 0:le.docs)==null?void 0:ie.source}}};var de,pe,me;b.parameters={...b.parameters,docs:{...(de=b.parameters)==null?void 0:de.docs,source:{originalSource:'section("thematic-breaks")',...(me=(pe=b.parameters)==null?void 0:pe.docs)==null?void 0:me.source}}};var ue,ye,he;B.parameters={...B.parameters,docs:{...(ue=B.parameters)==null?void 0:ue.docs,source:{originalSource:'section("inline-html")',...(he=(ye=B.parameters)==null?void 0:ye.docs)==null?void 0:he.source}}};var we,ge,xe;f.parameters={...f.parameters,docs:{...(we=f.parameters)==null?void 0:we.docs,source:{originalSource:`{
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
}`,...(xe=(ge=f.parameters)==null?void 0:ge.docs)==null?void 0:xe.source}}};var Se,be,Be;k.parameters={...k.parameters,docs:{...(Se=k.parameters)==null?void 0:Se.docs,source:{originalSource:'section("unsupported-syntax")',...(Be=(be=k.parameters)==null?void 0:be.docs)==null?void 0:Be.source}}};const Fe=["AllSyntax","Headings","ParagraphsAndLineBreaks","EmphasisAndInlineStyles","EscapesAndEntities","Lists","TaskLists","Links","Images","Blockquotes","Code","Tables","Footnotes","ThematicBreaks","InlineHtml","SanitizedHtml","UnsupportedSyntax"];export{c as AllSyntax,w as Blockquotes,g as Code,d as EmphasisAndInlineStyles,p as EscapesAndEntities,S as Footnotes,l as Headings,h as Images,B as InlineHtml,y as Links,m as Lists,i as ParagraphsAndLineBreaks,f as SanitizedHtml,x as Tables,u as TaskLists,b as ThematicBreaks,k as UnsupportedSyntax,Fe as __namedExportsOrder,ze as default};

export function sanitizeHtml(raw: string): string {
  if (!raw) return "";

  if (typeof DOMParser === "undefined") {
    return raw
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "");
  }

  const doc = new DOMParser().parseFromString(raw, "text/html");

  doc.querySelectorAll("script,iframe,object,embed,form").forEach((element) => element.remove());

  doc.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();

      if (name.startsWith("on") || name === "srcdoc") {
        element.removeAttribute(attribute.name);
      }

      if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return doc.body.innerHTML;
}

export function isBlockHtml(html: string): boolean {
  return /<(div|p|pre|table|ul|ol|li|details|blockquote|h[1-6])/i.test(html);
}

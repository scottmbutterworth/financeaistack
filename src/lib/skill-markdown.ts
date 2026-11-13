function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(value: string) {
  let text = escapeHtml(value);
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g,
    '<a href="$2" rel="noreferrer">$1</a>',
  );
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return text;
}

function isTableRow(line: string) {
  return line.trim().startsWith("|");
}

function isDivider(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function tableHtml(rows: string[]) {
  const parsed = rows
    .filter((row) => !isDivider(row))
    .map((row) =>
      row
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim()),
    );
  if (parsed.length === 0) return "";
  const [head, ...body] = parsed;
  const headHtml = head.map((cell) => `<th>${inline(cell)}</th>`).join("");
  const bodyHtml = body
    .map((cells) => `<tr>${cells.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}

export function renderSkillMarkdown(source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let index = 0;
  let inCode = false;
  const code: string[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  function flushParagraph() {
    if (paragraph.length === 0) return;
    html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!list) return;
    const tag = list.type;
    html.push(`<${tag}>${list.items.map((item) => `<li>${inline(item)}</li>`).join("")}</${tag}>`);
    list = null;
  }

  while (index < lines.length) {
    const line = lines[index];
    if (line.startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code.length = 0;
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      index += 1;
      continue;
    }
    if (inCode) {
      code.push(line);
      index += 1;
      continue;
    }
    if (line.trim() === "") {
      flushParagraph();
      flushList();
      index += 1;
      continue;
    }
    if (isTableRow(line)) {
      flushParagraph();
      flushList();
      const rows: string[] = [];
      while (index < lines.length && isTableRow(lines[index])) {
        rows.push(lines[index]);
        index += 1;
      }
      html.push(tableHtml(rows));
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      flushParagraph();
      flushList();
      html.push("<hr />");
      index += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith("> ")) {
        quote.push(lines[index].slice(2));
        index += 1;
      }
      html.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
      continue;
    }
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      flushParagraph();
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((bullet || numbered)![1]);
      index += 1;
      continue;
    }
    flushList();
    paragraph.push(line.trim());
    index += 1;
  }
  flushParagraph();
  flushList();
  if (inCode) html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  return html.join("\n");
}

export function stripFrontmatter(source: string) {
  if (!source.startsWith("---\n")) return source;
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) return source;
  return source.slice(end + 5);
}

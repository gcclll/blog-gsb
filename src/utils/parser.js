export const findHeaders = html =>
  ["h1", "h2", "h3", "h4"].map(hd => {
    const r = new RegExp(`<${hd}>[^<]+</${hd}>`, "g")
    return html.match(r)
  })

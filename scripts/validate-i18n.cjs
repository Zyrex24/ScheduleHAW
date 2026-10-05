const en = require("../messages/en.json"),
  de = require("../messages/de.json");
const a = Object.keys(en).sort(),
  b = Object.keys(de).sort();
if (JSON.stringify(a) !== JSON.stringify(b))
  throw new Error("Translation keys differ");
for (const k of a) {
  if (
    !en[k].trim() ||
    !de[k].trim() ||
    JSON.stringify(en[k].match(/\{\w+\}/g) || []) !==
      JSON.stringify(de[k].match(/\{\w+\}/g) || [])
  )
    throw new Error("Invalid translation: " + k);
}
console.log(`Validated ${a.length} bilingual messages.`);

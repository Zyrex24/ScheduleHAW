import en from "../messages/en.json";
import de from "../messages/de.json";
const a = Object.keys(en).sort(),
  b = Object.keys(de).sort();
if (JSON.stringify(a) !== JSON.stringify(b))
  throw new Error("Translation keys differ");
for (const k of a) {
  const enText = en[k as keyof typeof en],
    deText = de[k as keyof typeof de];
  if (
    !enText.trim() ||
    !deText.trim() ||
    JSON.stringify(enText.match(/\{\w+\}/g) || []) !==
      JSON.stringify(deText.match(/\{\w+\}/g) || [])
  )
    throw new Error("Invalid translation:" + k);
}
console.log(`Validated ${a.length} bilingual messages.`);

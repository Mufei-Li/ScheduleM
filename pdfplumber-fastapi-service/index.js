async function uploadAndParsePdf(file, endpoint = "http://127.0.0.1:3001/api/parse-pdf") {
  const form = new FormData();
  form.append("file", file, file.name);
  const resp = await fetch(endpoint, { method: "POST", body: form });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`后端错误: ${resp.status} ${text}`);
  }
  return await resp.json();
}
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("pdfInput");
  const btn = document.getElementById("uploadBtn");
  const output = document.getElementById("output");
  if (btn && input) {
    btn.addEventListener("click", async () => {
      const f = input.files && input.files[0];
      if (!f) {
        alert("请先选择 PDF 文件");
        return;
      }
      try {
        const result = await uploadAndParsePdf(f);
        output.textContent = JSON.stringify(result, null, 2);
      } catch (e) {
        output.textContent = `错误: ${e.message}`;
      }
    });
  }
});

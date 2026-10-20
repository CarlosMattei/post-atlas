const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const assert = (ok, msg) => {
  if (!ok) throw new Error("FALHOU: " + msg);
  console.log("ok - " + msg);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const imgOne = path.join(__dirname, ".tmp-img-one.png");
const imgTwo = path.join(__dirname, ".tmp-img-two.png");
const txt = path.join(__dirname, ".tmp-file.txt");
fs.writeFileSync(imgOne, png);
fs.writeFileSync(imgTwo, png);
fs.writeFileSync(txt, "not an image");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: path.join(
      process.env.LOCALAPPDATA,
      "Google/Chrome/Application/chrome.exe",
    ),
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  const errors = [];
  const dialogs = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:3000/posts/post-04", {
    waitUntil: "networkidle0",
  });
  await sleep(400);

  const text = async () => page.$eval("body", (el) => el.innerText);
  const inputValue = async (selector) =>
    page.$eval(selector, (el) => el.value);
  const replaceInput = async (selector, value) => {
    await page.focus(selector);
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.type(value);
  };
  const publishPanel = async () =>
    page.evaluateHandle(() => {
      const panels = Array.from(document.querySelectorAll("section"));
      return panels.find((panel) =>
        panel.querySelector("h2")?.textContent?.trim() === "Publicação",
      );
    });
  const panelButton = async (label) =>
    (await publishPanel()).evaluateHandle((panel, label) => {
      return Array.from(panel.querySelectorAll("button")).find(
        (button) => button.textContent.trim() === label,
      );
    }, label);
  const clickPanelButton = async (label) => {
    const handle = await panelButton(label);
    const element = handle.asElement();
    if (!element) throw new Error("Botão do painel não encontrado: " + label);
    await element.click();
    await sleep(250);
  };
  const primaryLabel = async () =>
    page.evaluate(() => {
      const panels = Array.from(document.querySelectorAll("section"));
      const panel = panels.find(
        (item) => item.querySelector("h2")?.textContent?.trim() === "Publicação",
      );
      const primary = panel?.querySelector("button.bg-ds-brand");
      return primary?.textContent?.trim() ?? null;
    });
  const statusCount = async (label) =>
    page.evaluate((label) => {
      const matches = document.body.innerText.match(new RegExp(label, "g"));
      return matches?.length ?? 0;
    }, label);
  const clickMenuAction = async (label) => {
    await page.click('[aria-label="Mais ações do post"]');
    await sleep(250);
    const clicked = await page.evaluate((label) => {
      const item = Array.from(
        document.querySelectorAll('[role="menuitem"]'),
      ).find((element) => element.textContent.includes(label));
      if (!item) return false;
      item.click();
      return true;
    }, label);
    if (!clicked) throw new Error("Item de menu não encontrado: " + label);
    await sleep(300);
  };

  let body = await text();
  assert(body.includes("Uma semana usando IA para revisar textos"), "post carregado");
  assert((await statusCount("RASCUNHO")) === 1, "badge de status aparece uma única vez");
  assert(body.includes("Pré-visualização"), "prévia visível");
  assert((await primaryLabel()) === "Aprovar e enfileirar", "ação primária inicial é aprovar e enfileirar");
  assert(!body.includes("Data e hora\n"), "campo de data oculto na estratégia de fila");
  assert(!body.includes("Executar agora"), "execução não concorre como ação primária");

  const panelPrimaryCount = await page.evaluate(() => {
    const panels = Array.from(document.querySelectorAll("section"));
    const panel = panels.find(
      (item) => item.querySelector("h2")?.textContent?.trim() === "Publicação",
    );
    return panel.querySelectorAll("button.bg-ds-brand").length;
  });
  assert(panelPrimaryCount === 1, "painel tem apenas uma ação primária");

  // prévia sticky durante a rolagem
  await page.evaluate(() => window.scrollTo(0, 600));
  await sleep(350);
  const stickyTop = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("section"));
    const preview = cards.find(
      (card) => card.querySelector("h2")?.textContent?.trim() === "Pré-visualização",
    );
    return preview?.getBoundingClientRect().top ?? -999;
  });
  assert(stickyTop >= 8 && stickyTop <= 24, `prévia permanece fixa ao rolar (top ${Math.round(stickyTop)}px)`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(200);

  // edição, dirty state e save
  await replaceInput("#post-title", "Título revisado no editor");
  await sleep(200);
  body = await text();
  assert(body.includes("Alterações não salvas"), "indicador de alterações não salvas");
  const saveEnabledWhileDirty = await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (item) => item.textContent.includes("Salvar alterações"),
    );
    return Boolean(button) && !button.disabled;
  });
  assert(saveEnabledWhileDirty, "botão salvar habilitado com alterações");

  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (item) => item.textContent.includes("Salvar alterações"),
    );
    button.click();
  });
  await sleep(300);
  body = await text();
  assert(body.includes("Salvo às"), "indicador muda para salvo após salvar");
  assert(body.includes("Alterações salvas"), "feedback de salvamento exibido");

  await sleep(4300);
  assert(!(await text()).includes("Alterações salvas"), "feedback de sucesso desaparece automaticamente");

  // aprovar
  await clickPanelButton("Aprovar e enfileirar");
  body = await text();
  assert((await statusCount("APROVADO")) === 1, "status aprovado aplicado e badge único");
  assert((await primaryLabel()) === "Enviar para a fila", "próxima ação primária é enviar para a fila");

  // estratégia fixa e agendamento
  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (item) => item.textContent.trim() === "Data e hora fixas",
    );
    button.click();
  });
  await sleep(300);
  const dateField = await page.$("#publish-at");
  assert(Boolean(dateField), "campo de data aparece com estratégia fixa");
  assert((await dateField.evaluate((el) => el.disabled)) === false, "campo de data nunca fica desabilitado");
  assert((await primaryLabel()) === "Agendar", "ação primária vira agendar");

  await page.$eval("#publish-at", (el) => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set;
    setter.call(el, "2026-10-25T09:00");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await sleep(250);
  await clickPanelButton("Agendar");
  body = await text();
  assert((await statusCount("AGENDADO")) === 1, "status agendado aplicado");
  assert((await primaryLabel()) === "Cancelar agendamento", "ação primária vira cancelar agendamento");

  await clickPanelButton("Cancelar agendamento");
  body = await text();
  assert((await statusCount("APROVADO")) === 1, "cancelar agendamento volta para aprovado");

  // teclado no segmented control
  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (item) => item.textContent.trim() === "Entrar na fila",
    );
    button.focus();
  });
  await page.keyboard.press("ArrowRight");
  await sleep(300);
  assert(Boolean(await page.$("#publish-at")), "setas do segmented control mudam para data fixa");

  // voltar para fila
  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (item) => item.textContent.trim() === "Entrar na fila",
    );
    button.click();
  });
  await sleep(250);

  // reprovar pelo painel
  await clickPanelButton("Reprovar");
  body = await text();
  assert((await statusCount("REPROVADO")) === 1, "status reprovado aplicado");
  assert((await primaryLabel()) === "Aprovar e enfileirar", "ação primária volta a aprovar");

  // arquivar e restaurar pelo menu
  await clickMenuAction("Arquivar post");
  body = await text();
  assert((await statusCount("ARQUIVADO")) === 1, "status arquivado aplicado");
  assert(
    (await primaryLabel()) === "Restaure o post para continuar",
    "ação primária bloqueada enquanto arquivado",
  );
  assert(body.includes("Restaure o post"), "alerta contextual de arquivado visível");

  await clickMenuAction("Restaurar post");
  body = await text();
  assert((await statusCount("RASCUNHO")) === 1, "restaurar volta para rascunho");

  // descartar com confirmação
  await replaceInput("#post-title", "Mudança que será descartada");
  await sleep(200);
  await clickMenuAction("Descartar alterações");
  assert(Boolean(await page.$("dialog[open]")), "diálogo de confirmação abre");
  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll("dialog button")).find(
      (item) => item.textContent.trim() === "Cancelar",
    );
    button.click();
  });
  await sleep(250);
  assert((await inputValue("#post-title")) === "Mudança que será descartada", "cancelar mantém as alterações");
  assert(!(await page.$("dialog[open]")), "diálogo fecha ao cancelar");

  await clickMenuAction("Descartar alterações");
  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll("dialog button")).find(
      (item) => item.textContent.trim() === "Descartar",
    );
    button.click();
  });
  await sleep(300);
  assert(
    (await inputValue("#post-title")) === "Título revisado no editor",
    "confirmar descarte volta ao último estado salvo",
  );
  assert((await text()).includes("Alterações descartadas"), "feedback de descarte exibido");

  // mídia: upload, capa, alt, carrossel e remoção
  const mediaInput = await page.$('input[type="file"]');
  await mediaInput.uploadFile(imgOne);
  await sleep(300);
  await mediaInput.uploadFile(imgTwo);
  await sleep(300);
  body = await text();
  assert(body.toLowerCase().includes("2 imagens"), "faixa de mídia mostra contagem do carrossel");
  assert(body.includes("Imagem 1 de 2") || body.includes("Imagem 2 de 2") || body.includes("1/2"), "prévia do carrossel ativa");

  await page.evaluate(() => {
    const thumb = document.querySelector('button[aria-label="Imagem 2"]');
    thumb.click();
  });
  await sleep(250);
  assert(Boolean(await page.$('[id^="post-image-alt-"]')), "editor de alt aparece ao selecionar miniatura");
  const altSelector = await page.$eval('[id^="post-image-alt-"]', (el) => el.id);
  if (altSelector) {
    await page.type(`#${altSelector}`, " segunda imagem");
  }

  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (item) => item.textContent.trim() === "Capa",
    );
    if (button) button.click();
  });
  await sleep(250);
  assert(
    (await page.$$eval('button[aria-label="Imagem 1 (capa)"]', (els) => els.length)) === 1,
    "imagem selecionada vira capa",
  );

  await page.evaluate(() => {
    const button = document.querySelector('button[aria-label="Remover imagem"]');
    button.click();
  });
  await sleep(300);
  assert((await text()).toLowerCase().includes("1 imagem"), "remover imagem atualiza o carrossel");

  // texto longo e ver mais
  await page.$eval("#post-body", (el) => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    ).set;
    setter.call(el, "linha de teste ".repeat(40));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await sleep(300);
  assert((await text()).includes("Ver mais"), "texto longo oferece ver mais");
  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (item) => item.textContent.trim() === "Ver mais",
    );
    button.click();
  });
  await sleep(200);
  assert((await text()).includes("Ver menos"), "ver mais alterna para ver menos");

  // feedback de erro permanece
  await mediaInput.uploadFile(txt);
  await sleep(300);
  assert((await text()).includes("Arquivo não suportado"), "feedback de arquivo inválido exibido");
  await sleep(4300);
  assert((await text()).includes("Arquivo não suportado"), "feedback de erro permanece após 4s");

  // guarda de navegação com alterações não salvas
  await replaceInput("#post-title", "Alteração pendente");
  await sleep(250);
  await page.click('header a[href="/posts"]');
  await sleep(400);
  assert(dialogs.some((message) => message.includes("alterações não salvas")), "link interno pede confirmação");
  assert(page.url().endsWith("/posts/post-04"), "cancelar a confirmação mantém na página");

  // layout mobile sem overflow
  await page.setViewport({ width: 390, height: 844 });
  await sleep(400);
  const mobileOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
  assert(!mobileOverflow, "sem overflow horizontal em 390px");

  // desktop sem overflow
  await page.setViewport({ width: 1440, height: 900 });
  await sleep(300);
  const desktopOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
  assert(!desktopOverflow, "sem overflow horizontal em 1440px");

  assert(errors.length === 0, "sem erros de console: " + errors.join(" | "));

  await browser.close();
  fs.unlinkSync(imgOne);
  fs.unlinkSync(imgTwo);
  fs.unlinkSync(txt);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

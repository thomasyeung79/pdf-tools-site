/**
 * PDF 工具站 · 前端交互
 */

// ── Toast 通知 ──────────────────────────────────────────────

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-leaving");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ── 文件大小格式化 ──────────────────────────────────────────

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── 暗色模式 ────────────────────────────────────────────────

function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);

  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

// ── 分类筛选 ────────────────────────────────────────────────

function initFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".card");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        if (filter === "all" || card.dataset.category === filter) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

// ── 导出路径加载 ────────────────────────────────────────────

async function loadOutputDir() {
  const target = document.querySelector("#outputDir");
  if (!target) return;

  try {
    const response = await fetch("/api/config");
    if (!response.ok) throw new Error("config failed");
    const data = await response.json();
    target.textContent = data.output_dir || "未设置";
  } catch {
    target.textContent = "读取失败";
  }
}

// ── 文件列表显示（多文件上传）─────────────────────────────

function updateFileList(input, container) {
  if (!container) return;
  const files = input.files;
  if (!files || files.length === 0) {
    container.innerHTML = "";
    return;
  }
  const items = Array.from(files)
    .map((f) => `<span>${escapeHtml(f.name)} (${formatSize(f.size)})</span>`)
    .join("");
  container.innerHTML = items;
}

// ── 拖拽上传 ────────────────────────────────────────────────

function initDragDrop() {
  document.querySelectorAll(".drop-zone").forEach((zone) => {
    const fileInput = zone.querySelector('input[type="file"]');
    if (!fileInput) return;

    // 点击区域触发文件选择
    zone.addEventListener("click", (e) => {
      if (e.target === fileInput) return;
      fileInput.click();
    });

    // 拖拽事件
    ["dragenter", "dragover"].forEach((ev) => {
      zone.addEventListener(ev, (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((ev) => {
      zone.addEventListener(ev, (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove("drag-over");
      });
    });

    zone.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      if (!dt || !dt.files.length) return;

      // 如果是多文件输入
      if (fileInput.multiple) {
        fileInput.files = dt.files;
      } else {
        fileInput.files = dt.files;
      }

      // 触发 change 事件
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // 选择文件后更新显示
    fileInput.addEventListener("change", () => {
      const fileListContainer = zone.parentElement?.querySelector(".file-list");
      if (fileListContainer) {
        updateFileList(fileInput, fileListContainer);
      }

      // 显示文件名占位
      const placeholder = zone.querySelector(".drop-placeholder span:last-child");
      if (placeholder && fileInput.files.length === 1) {
        placeholder.textContent = `📄 ${fileInput.files[0].name}`;
      } else if (placeholder && fileInput.files.length > 1) {
        placeholder.textContent = `📄 ${fileInput.files.length} 个文件已选择`;
      }

      // 更新卡片描述以显示文件大小
      const sizeDisplay = document.createElement("div");
      sizeDisplay.className = "file-size-display";
      sizeDisplay.style.cssText = "font-size:12px;color:var(--ink-muted);margin-top:4px;";

      // 移除旧的
      const old = zone.querySelector(".file-size-display");
      if (old) old.remove();

      if (fileInput.files.length === 1) {
        sizeDisplay.textContent = formatSize(fileInput.files[0].size);
        zone.appendChild(sizeDisplay);
      }
    });
  });
}

// ── 带进度的上传 ────────────────────────────────────────────

function submitWithProgress(form, button, statusEl, url, formData) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 进度条
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-bar";
    const progressFill = document.createElement("div");
    progressFill.className = "progress-bar-fill";
    progressContainer.appendChild(progressFill);
    statusEl.parentElement?.insertBefore(progressContainer, statusEl.nextSibling);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        progressFill.style.width = `${pct}%`;
        statusEl.textContent = `上传中… ${pct}%`;
      }
    });

    xhr.addEventListener("loadstart", () => {
      statusEl.textContent = "正在上传…";
      statusEl.className = "form-status";
    });

    xhr.addEventListener("load", () => {
      progressContainer.remove();

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr);
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new Error(data.detail || `请求失败 (${xhr.status})`));
        } catch {
          reject(new Error(xhr.responseText || `请求失败 (${xhr.status})`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      progressContainer.remove();
      reject(new Error("网络错误，请检查连接"));
    });

    xhr.addEventListener("abort", () => {
      progressContainer.remove();
      reject(new Error("上传已取消"));
    });

    xhr.open("POST", url);
    xhr.send(formData);
  });
}

// ── 获取下载文件名 ──────────────────────────────────────────

function getDownloadName(response) {
  const disposition = response.getResponseHeader("content-disposition") || "";
  const utf8Match = disposition.match(/filename\*=utf-8''([^;]+)/i);
  if (utf8Match) return decodeURIComponent(utf8Match[1]);

  const asciiMatch = disposition.match(/filename="?([^"]+)"?/i);
  if (asciiMatch) return asciiMatch[1];

  return "";
}

function getFilenameFromPath(path) {
  if (!path) return "download";
  return path.split(/[/\\]/).pop() || "download";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── PDF 信息弹窗 ────────────────────────────────────────────

function showPdfInfo(data) {
  const dialog = document.getElementById("infoDialog");
  const body = document.getElementById("infoBody");
  if (!dialog || !body) return;

  const metaRows = Object.entries(data.metadata || {})
    .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`)
    .join("");

  // 页面表格
  const pageRows = (data.pages || [])
    .slice(0, 50)
    .map(
      (p) =>
        `<tr><td style="text-align:center">${p.number}</td><td>${p.width} × ${p.height}</td></tr>`
    )
    .join("");

  body.innerHTML = `
    <table>
      <tr><td>文件名</td><td>${escapeHtml(data.filename || "")}</td></tr>
      <tr><td>页数</td><td>${data.page_count ?? "?"}</td></tr>
      <tr><td>文件大小</td><td>${data.file_size_display || ""}</td></tr>
      <tr><td>PDF 版本</td><td>${escapeHtml(data.pdf_version || "")}</td></tr>
      ${metaRows}
    </table>
    <h4 style="margin:16px 0 8px">页面详情（前 50 页）</h4>
    <table>
      <tr><th style="text-align:center;padding:4px">页码</th><th style="text-align:left;padding:4px">尺寸</th></tr>
      ${pageRows || "<tr><td colspan='2'>无数据</td></tr>"}
    </table>
  `;

  dialog.showModal();
}

// ── 表单提交 ────────────────────────────────────────────────

function initForms() {
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = form.querySelector("button");
      const status = form.querySelector(".form-status");
      if (!button || !status) return;

      const originalText = button.textContent;
      button.textContent = "⏳ 处理中…";
      button.disabled = true;
      status.textContent = "正在上传并处理…";
      status.className = "form-status";

      // 移除旧的进度条
      const oldBar = form.querySelector(".progress-bar");
      if (oldBar) oldBar.remove();

      try {
        const formData = new FormData(form);
        const url = form.action;

        // 特殊处理：pdf-info 返回 JSON
        if (url.includes("/api/pdf-info")) {
          const response = await fetch(url, { method: "POST", body: formData });
          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || response.statusText);
          }
          const data = await response.json();
          showPdfInfo(data);
          status.textContent = "✅ 已读取 PDF 信息";
          status.classList.add("success");
          showToast("PDF 信息已读取", "success");
          return;
        }

        // 使用 XHR 带进度上传
        const xhr = await submitWithProgress(form, button, status, url, formData);

        // 处理响应
        const blob = xhr.response instanceof Blob ? xhr.response : new Blob([xhr.response]);

        // 检查是否是 JSON 响应（某些接口可能会返回 JSON）
        const contentType = xhr.getResponseHeader("content-type") || "";
        if (contentType.includes("application/json")) {
          const text = await blob.text();
          const data = JSON.parse(text);
          status.textContent = data.detail || "处理完成";
          status.classList.add("success");
          showToast("处理完成", "success");
          return;
        }

        const filename =
          getDownloadName(xhr) || getFilenameFromPath(xhr.getResponseHeader("x-output-path") || "");
        const outputPath = xhr.getResponseHeader("x-output-path") || "";

        downloadBlob(blob, filename);

        const msg = outputPath
          ? `✅ 已生成：${filename}`
          : `✅ 已生成：${filename}`;
        status.textContent = msg;
        status.classList.add("success");
        showToast(`✅ ${filename} 已下载`, "success");
      } catch (error) {
        status.textContent = error.message || "处理失败，请重试。";
        status.classList.add("error");
        showToast(error.message || "处理失败", "error");
      } finally {
        button.textContent = originalText;
        button.disabled = false;
      }
    });
  });
}

// ── 启动 ────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initFilter();
  loadOutputDir();
  initDragDrop();
  initForms();
});

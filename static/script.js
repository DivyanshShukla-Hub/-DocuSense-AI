const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");
const dropZone = document.getElementById("dropZone");
const fileName = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const resultText = document.getElementById("resultText");
const statusBox = document.getElementById("statusBox");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const previewBox = document.getElementById("previewBox");
const themeToggle = document.getElementById("themeToggle");
const speakBtn = document.getElementById("speakBtn");
const stopSpeakBtn = document.getElementById("stopSpeakBtn");
const endpointInput = document.getElementById("endpointInput");
const keyInput = document.getElementById("keyInput");
const showKeyBtn = document.getElementById("showKeyBtn");

if (browseBtn && dropZone && fileInput) {
    browseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            updateFileDetails(file);
            previewFile(file);
        }
    });

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            const file = files[0];
            updateFileDetails(file);
            previewFile(file);
        }
    });

    function updateFileDetails(file) {
        fileName.textContent = file ? file.name : "No file selected";
    }

    function previewFile(file) {
        const fileType = file.type;
        const fileURL = URL.createObjectURL(file);

        if (fileType.startsWith("image/")) {
            previewBox.innerHTML = `<img src="${fileURL}" alt="Preview">`;
        } else if (fileType === "application/pdf") {
            previewBox.innerHTML = `<iframe src="${fileURL}"></iframe>`;
        } else {
            previewBox.innerHTML = `<div class="preview-placeholder">Preview not supported for this file type.</div>`;
        }
    }

    if (showKeyBtn && keyInput) {
        showKeyBtn.addEventListener("click", () => {
            if (keyInput.type === "password") {
                keyInput.type = "text";
                showKeyBtn.textContent = "Hide Key";
            } else {
                keyInput.type = "password";
                showKeyBtn.textContent = "Show Key";
            }
        });
    }

    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", async () => {
            const file = fileInput.files[0];
            const endpoint = endpointInput.value.trim();
            const key = keyInput.value.trim();

            if (!endpoint) {
                alert("Please enter Azure endpoint.");
                return;
            }

            if (!key) {
                alert("Please enter Azure key.");
                return;
            }

            if (!file) {
                alert("Please select a file first.");
                return;
            }

            const formData = new FormData();
            formData.append("endpoint", endpoint);
            formData.append("key", key);
            formData.append("file", file);

            statusBox.classList.remove("hidden");
            statusBox.textContent = "Processing document...";
            resultText.textContent = "Please wait while text is being extracted...";
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = "Analyzing...";
            analyzeBtn.classList.add("loading");
            triggerAnalyzeOverlay();

            try {
                const response = await fetch("/analyze", {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();

                if (data.error) {
                    resultText.textContent = "Error: " + data.error;
                    statusBox.textContent = "Something went wrong.";
                } else {
                    resultText.textContent = data.text;
                    statusBox.textContent = "Document processed successfully.";
                }
            } catch (error) {
                resultText.textContent = "Error: Unable to connect to server.";
                statusBox.textContent = "Server connection failed.";
            } finally {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = "Analyze Document";
                analyzeBtn.classList.remove("loading");
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            fileInput.value = "";
            fileName.textContent = "No file selected";
            resultText.textContent = "Your extracted text will appear here...";
            previewBox.innerHTML = `<div class="preview-placeholder">Preview will appear here</div>`;
            statusBox.classList.add("hidden");
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
            const text = resultText.textContent.trim();
            if (!text || text === "Your extracted text will appear here...") {
                alert("No extracted text to copy.");
                return;
            }

            await navigator.clipboard.writeText(text);
            copyBtn.textContent = "Copied";
            setTimeout(() => {
                copyBtn.textContent = "Copy";
            }, 1200);
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const text = resultText.textContent.trim();
            if (!text || text === "Your extracted text will appear here...") {
                alert("No extracted text to download.");
                return;
            }

            const blob = new Blob([text], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "extracted_text.txt";
            a.click();

            URL.revokeObjectURL(url);
        });
    }

    if (speakBtn) {
        speakBtn.addEventListener("click", () => {
            const text = resultText.textContent.trim();
            if (!text || text === "Your extracted text will appear here...") {
                alert("No extracted text to speak.");
                return;
            }

            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            speechSynthesis.speak(utterance);
        });
    }

    if (stopSpeakBtn) {
        stopSpeakBtn.addEventListener("click", () => {
            speechSynthesis.cancel();
        });
    }
}

function triggerAnalyzeOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "analyze-overlay";
    document.body.appendChild(overlay);
    overlay.addEventListener("animationend", () => overlay.remove());
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light");
        const sun = "\u2600"; // sun symbol
        const moon = "\u{1F319}"; // crescent moon
        themeToggle.textContent = document.body.classList.contains("light") ? sun : moon;
    });
}

/* ===== PREMIUM INTERACTION PACK ===== */

/* spotlight cursor tracking */
document.addEventListener("mousemove", (e) => {
    const x = `${e.clientX}px`;
    const y = `${e.clientY}px`;
    document.documentElement.style.setProperty("--mx", x);
    document.documentElement.style.setProperty("--my", y);
});

/* 3D tilt on cards */
document.querySelectorAll(".card, .hero-left").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    });
});

/* magnetic buttons */
document.querySelectorAll(".primary-btn, .secondary-btn, .ghost-btn, .theme-btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });

    btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0px, 0px)";
    });
});

/* smooth reveal on scroll */
const revealItems = document.querySelectorAll(".card, .hero-left");

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform += " translateY(0px)";
        }
    });
}, { threshold: 0.15 });

revealItems.forEach((item) => {
    revealObserver.observe(item);
});

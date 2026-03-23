import os

from flask import Flask, render_template, request, jsonify
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/developer")
def developer():
    return render_template("developer.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        endpoint = request.form.get("endpoint", "").strip()
        key = request.form.get("key", "").strip()
        file = request.files.get("file")

        if not endpoint:
            return jsonify({"error": "Azure endpoint is required."}), 400

        if not key:
            return jsonify({"error": "Azure key is required."}), 400

        if not file:
            return jsonify({"error": "No file uploaded."}), 400

        if file.filename == "":
            return jsonify({"error": "No file selected."}), 400

        client = DocumentIntelligenceClient(
            endpoint=endpoint,
            credential=AzureKeyCredential(key)
        )

        file_bytes = file.read()

        poller = client.begin_analyze_document(
            "prebuilt-read",
            body=file_bytes
        )
        result = poller.result()

        extracted_text = result.content if result.content else "No text found."

        return jsonify({
            "text": extracted_text,
            "filename": file.filename
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run()

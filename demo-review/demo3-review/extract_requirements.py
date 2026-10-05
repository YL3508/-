from pathlib import Path
from hashlib import sha256
from pypdf import PdfReader

download = Path.home() / "Downloads"
matches = list(download.glob("*臺中市英語教育資源中心網站建置委託資訊服務案系統建置需求.pdf"))
if len(matches) != 1:
    raise SystemExit(f"Expected one PDF, found {len(matches)}")
source = matches[0]
reader = PdfReader(source)
out = Path(__file__).parent / "requirements-extracted.txt"
out.write_text(
    "\n\n".join(
        f"===== PDF PAGE {index + 1} =====\n{page.extract_text() or ''}"
        for index, page in enumerate(reader.pages)
    ),
    encoding="utf-8",
)
print(f"source={source}")
print(f"pages={len(reader.pages)} sha256={sha256(source.read_bytes()).hexdigest()}")
for index, page in enumerate(reader.pages):
    print(f"page={index + 1} chars={len(page.extract_text() or '')}")
print(f"extracted={out}")

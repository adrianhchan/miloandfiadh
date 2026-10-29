"""Static preview with the existing GitHub Pages/Jekyll exclusions and URL aliases."""
import argparse
import io
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {line.strip()[2:] for line in (ROOT / "_config.yml").read_text().splitlines() if line.strip().startswith("- ")}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        parts = Path(unquote(urlsplit(self.path).path)).parts
        if any(part.startswith((".", "_")) or part in EXCLUDED for part in parts if part != "/"):
            return self.not_found()
        path = Path(self.translate_path(self.path))
        if path.is_dir() and not (path / "index.html").is_file():
            return self.not_found()
        if not path.exists() and not path.suffix and path.with_suffix(".html").is_file():
            data = path.with_suffix(".html").read_bytes()
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            return io.BytesIO(data)
        return super().send_head()

    def not_found(self):
        data = (ROOT / "404.html").read_bytes()
        self.send_response(404)
        self.send_header("Content-type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        return io.BytesIO(data)

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            stream = self.not_found()
            if self.command != "HEAD":
                self.copyfile(stream, self.wfile)
        else:
            super().send_error(code, message, explain)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    print(f"Local preview: http://127.0.0.1:{args.port}", flush=True)
    try:
        ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()
    except KeyboardInterrupt:
        pass

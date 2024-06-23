const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

// build user game
function buildGame() {
  const template = fs.readFileSync("template.html", "utf-8");
  let code = "";

  code += `<script src="/dist/helper.js"></script>\n`;
  code += `<script src="/dist/game.js"></script>\n`;

  try {
    // build user code
    esbuild.buildSync({
      bundle: true,
      sourcemap: true,
      target: "es6",
      keepNames: true,
      logLevel: "silent",
      entryPoints: ["code/main.js"],
      outfile: "public/dist/game.js",
    });

    esbuild.buildSync({
      bundle: true,
      sourcemap: true,
      target: "es6",
      keepNames: true,
      entryPoints: ["helper.ts"],
      outfile: "public/dist/helper.js",
    });
  } catch (e) {
    const loc = e.errors[0].location;
    err = {
      msg: e.errors[0].text,
      stack: [
        {
          line: loc.line,
          col: loc.column,
          file: loc.file,
        },
      ],
    };
    let msg = "";
    msg += "<pre>";
    msg += `ERROR: ${err.msg}\n`;
    if (err.stack) {
      err.stack.forEach((trace) => {
        msg += `    -> ${trace.file}:${trace.line}:${trace.col}\n`;
      });
    }
    msg += "</pre>";
    fs.writeFileSync("public/index.html", msg);
    return;
  }

  fs.writeFileSync("public/index.html", template.replace("{{kaboom}}", code));
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

buildGame();
copyDir("sprites", "public/sprites");
copyDir("sounds", "public/sounds");

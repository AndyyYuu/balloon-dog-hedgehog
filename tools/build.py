"""Build the standalone game from editable source files. No dependencies."""
from pathlib import Path

root=Path(__file__).resolve().parent.parent
src=root/'src'
shell=(src/'shell.html').read_text(encoding='utf-8')
shell=shell.replace('/* __LEVELS__ */\n',(src/'levels.js').read_text(encoding='utf-8')+(src/'memo-levels.js').read_text(encoding='utf-8')+(src/'practice-levels.js').read_text(encoding='utf-8'))
shell=shell.replace('/* __EXPERIENCE_CSS__ */',(src/'experience.css').read_text(encoding='utf-8'))
chunks=['audio.js','solo-controls.js','physics.js','mechanics.js','memo.js','spike-collision.js','actors.js','memo-render.js','experience.js','art.js','prop-art.js','render.js']
result=shell+''.join((src/name).read_text(encoding='utf-8') for name in chunks)
(root/'index.html').write_text(result,encoding='utf-8')
print(f'Built index.html: {len(result.encode("utf-8")):,} bytes')

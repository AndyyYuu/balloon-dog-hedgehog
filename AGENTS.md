# Preserve the game’s accumulated designs

- Never delete or replace an existing level. Append new rooms in a separate chapter. Keep archived editions playable and linked from the archive gallery.
- The original eight adventure level definitions in `src/levels.js` are retained exactly. New design-memo rooms are appended from `src/memo-levels.js`.
- F is the hedgehog’s action key; Slash (/) is the balloon dog’s action key. Arrow keys move the hedgehog; A/D move the dog. Do not share one context key between characters or introduce role switching.
- The memo chapter has finite air shared between the two characters. Temperature changes volume, not stored air. Pumps/bubbles add air; venting and popping lose air.
- Preserve the original cactus rule in classic rooms. Memo thumbtack floors only hurt the dog; do not silently reinterpret classic hazards.
- Build with `python tools/build.py`. Verify classic routes with `node tools/verify.cjs`, new routes and rules with `node tools/verify-memo.cjs`, and retention with `python tools/verify-retention.py`.

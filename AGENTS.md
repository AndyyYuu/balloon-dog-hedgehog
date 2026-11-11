# Preserve the game’s accumulated designs

- Never delete or replace an existing level. Append new rooms in a separate chapter. Keep archived editions playable and linked from the archive gallery.
- The original eight adventure level definitions in `src/levels.js` are retained exactly. New design-memo rooms are appended from `src/memo-levels.js`.
- Single-player: the hedgehog is the protagonist. A/D move the hedgehog, Space jumps, Shift rolls, F interacts. W gives air to the dog; S returns the dog’s air to the hedgehog. Down Arrow is disabled as a game control. S must never vent air or give air in the other direction. Slash commands dog tasks; the dog follows, boards and climbs automatically. Optional Left/Right/Up Arrow keys only adjust the dog. Never introduce role switching. Physical keys are adapted to the established simulation action names in solo-controls.js.
- The memo chapter has finite air shared between the two characters. Temperature changes volume, not stored air. Pumps/bubbles add air; popping and the automatic safety valve can lose air. W/S transfer between the two actors; S conserves the shared air.
- Preserve the original cactus rule in classic rooms. Memo thumbtack floors only hurt the dog; do not silently reinterpret classic hazards.
- Build with `python tools/build.py`. Verify classic routes with `node tools/verify.cjs`, new routes and rules with `node tools/verify-memo.cjs`, and retention with `python tools/verify-retention.py`.

- W exclusively transfers air to/revives the dog. F never aliases W. A small dog automatically boards an apple seat when approaching; do not require Slash to board. Slash dismounts; preserve automatic boarding before the first ride.
- Keep all sixteen adventure rooms and append the three safe practice rooms. Generated transparent sprites in assets/props must ship alongside index.html. Preserve their alpha; retain directional/state feedback drawn by the game.

- All current rooms use easier variants from src/easy-levels.js. Do not edit retained original definitions to tune difficulty. The previous 19-room edition is archived in archive/solo-before-easy.html. Validate the current campaign with three full runs of node tools/verify-easy.cjs 1/2/3; old verify scripts cover the archived original difficulty.

- W/S are the only manual air keys. S also replaces all former Down-Arrow transfer actions. Classic rooms retain returned air in hog.storedAir, including amounts beyond the maximum visible body size; W draws that reserve first. Keep compact rolling routes passable when S makes the hedgehog large. Verify with node tools/verify-air-controls.cjs and all three current campaign runs.

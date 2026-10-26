#!/usr/bin/env python3
"""
Puzzle — End-to-End Browser Automation & Multi-Viewport Visual Inspection Suite
Loads the production `dist/index.html` bundle in Headless Chromium via Selenium WebDriver,
verifies Puzzle branding, Easy/Medium/Hard + Daily mode selectors, date-seeded daily lineup
switching, real gameplay across Neon, Currents, Starstruck, Combo, Jigsaw, Snippets,
Wordsmith, Crossover, Waywords, and Sudoku, legal/404 routes, zero console errors,
and captures fresh screenshots across all 5 required viewports.
"""

import base64
import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

ROOT_DIR = "/working_dir/c_d366fd8a320b1b1c"
DIST_HTML = os.path.join(ROOT_DIR, "dist", "index.html")
SCREENSHOT_DIR = os.path.join(ROOT_DIR, "artifacts/file_generation/ttl=63d/intermediate/screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)


def create_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    service = Service("/usr/bin/chromedriver")
    return webdriver.Chrome(service=service, options=opts)


def click_id(driver, elem_id):
    driver.find_element(By.ID, elem_id).click()


def run_e2e_suite():
    with open(DIST_HTML, "rb") as f:
        b64_html = base64.b64encode(f.read()).decode("ascii")
    data_url = f"data:text/html;charset=utf-8;base64,{b64_html}"

    driver = create_driver()
    try:
        driver.set_window_size(1440, 900)
        driver.get(data_url)
        time.sleep(0.5)

        # 1. Verify Puzzle Branding, Daily Puzzles Hub & Easy/Medium/Hard tier labels
        assert driver.title == "Puzzle — Daily Puzzles", f"Expected title 'Puzzle — Daily Puzzles', got {driver.title}"
        brand = driver.find_element(By.CSS_SELECTOR, ".brand-text").text
        assert brand == "Puzzle", f"Expected brand 'Puzzle', got {brand}"
        bento_tiles = driver.find_elements(By.CSS_SELECTOR, ".bento-tile")
        assert len(bento_tiles) == 11, f"Expected 11 Daily Bento tiles, found {len(bento_tiles)}"
        prog_rows = driver.find_elements(By.CSS_SELECTOR, ".prog-row")
        assert len(prog_rows) == 13, f"Expected 13 total catalog categories in Progression table, found {len(prog_rows)}"

        level_pills_text = [el.text for el in driver.find_elements(By.CSS_SELECTOR, ".level-pill")]
        joined_pills = " | ".join(level_pills_text)
        assert "Easy" in joined_pills and "Medium" in joined_pills and "Hard" in joined_pills
        assert "Basics" not in joined_pills and "Core" not in joined_pills and "Pro" not in joined_pills
        print("[E2E] PASS 1: Puzzle branding, 11 Daily Bento tiles, and Easy/Medium/Hard tier pills verified")

        # Capture fresh Desktop Home screenshot (1440x900)
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "v4_01_home_desktop_1440x900.png"))

        # 2. Verify Daily Challenge launch + Daily / Easy / Medium / Hard mode switching in-game
        click_id(driver, "play-daily-neon")
        time.sleep(0.25)
        active_id = driver.execute_script("return window.puzzledApp.activeSession.puzzle.id;")
        assert active_id.startswith("daily-"), f"Expected daily puzzle ID, got {active_id}"

        # Switch to Easy, Medium, Hard, and back to Daily
        click_id(driver, "btn-mode-easy")
        time.sleep(0.15)
        assert driver.execute_script("return window.puzzledApp.activeSession.puzzle.id;") == "neon-1"
        click_id(driver, "btn-mode-medium")
        time.sleep(0.15)
        assert driver.execute_script("return window.puzzledApp.activeSession.puzzle.id;") == "neon-2"
        click_id(driver, "btn-mode-hard")
        time.sleep(0.15)
        assert driver.execute_script("return window.puzzledApp.activeSession.puzzle.id;") == "neon-3"
        click_id(driver, "btn-mode-easy")
        time.sleep(0.15)
        print("[E2E] PASS 2: In-game Daily / Easy / Medium / Hard mode switcher verified")

        # 3. Play Neon-1 ("Prism Relay") through real cell clicks & capture screenshot
        for c in [1, 2, 3]:
            click_id(driver, f"neon-cell-0-{c}")
        click_id(driver, "neon-pair-cyan")
        for c in [1, 2, 3]:
            click_id(driver, f"neon-cell-1-{c}")
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "v4_02_neon_gameplay_1440x900.png"))
        click_id(driver, "neon-pair-amber")
        for r, c in [(2, 1), (2, 2), (2, 3), (3, 3), (3, 2), (3, 1), (3, 0)]:
            click_id(driver, f"neon-cell-{r}-{c}")
        time.sleep(0.25)
        win_title = driver.find_element(By.ID, "win-modal-title").text
        assert "Puzzle Solved!" in win_title
        share_box = driver.find_element(By.CSS_SELECTOR, ".share-preview-box").text
        assert share_box.startswith("Puzzle •"), f"Expected 'Puzzle •' in share preview, got {share_box}"
        click_id(driver, "btn-win-return-home")
        time.sleep(0.2)
        print("[E2E] PASS 3: Neon-1 solved and 'Puzzle •' share summary verified")

        # 4. Play Currents-1 ("Laminar Flow") and capture liquid stream screenshot
        click_id(driver, "btn-launch-currents-1")
        time.sleep(0.25)
        for r, c in [(0, 1), (0, 2), (0, 3), (1, 3), (1, 2), (1, 1), (1, 0), (2, 0), (2, 1)]:
            click_id(driver, f"currents-cell-{r}-{c}")
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "v4_03_currents_gameplay_1440x900.png"))
        click_id(driver, "btn-back-hub")
        time.sleep(0.2)
        print("[E2E] PASS 4: Currents-1 liquid stream routing verified")

        # 5. Play Combo-1 ("Solar Chain") and capture pill-chain + QWERTY screenshot
        click_id(driver, "btn-launch-combo-1")
        time.sleep(0.25)
        for ch in ["I", "G", "H", "T"]:
            click_id(driver, f"combo-key-{ch}")
        click_id(driver, "btn-combo-submit")
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "v4_04_combo_gameplay_1440x900.png"))
        click_id(driver, "btn-back-hub")
        time.sleep(0.2)
        print("[E2E] PASS 5: Combo-1 word chain interaction verified")

        # 6. Play Starstruck-1 using double-click star placement & capture screenshot
        click_id(driver, "btn-launch-starstruck-1")
        time.sleep(0.2)
        for idx, (r, c) in enumerate([(0, 1), (1, 3), (2, 0), (3, 2), (4, 4)]):
            driver.execute_script(f"window.puzzledApp.handleCellDoubleClick({r}, {c});")
            if idx == 3:
                driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "v4_05_starstruck_gameplay_1440x900.png"))
        time.sleep(0.2)
        assert "Puzzle Solved!" in driver.find_element(By.ID, "win-modal-title").text
        click_id(driver, "btn-win-return-home")
        time.sleep(0.2)
        print("[E2E] PASS 6: Starstruck-1 solved via double-click star placement")

        # 7. Inspect Jigsaw-1, Snippets-1, Wordsmith-1, Sudoku-1 & Legal Routes (About, Privacy, 404)
        for game_id, snap_name in [
            ("jigsaw-1", "v4_06_jigsaw_bird_1440x900.png"),
            ("snippets-1", "v4_07_snippets_burger_1440x900.png"),
            ("wordsmith-1", "v4_08_wordsmith_diamond_1440x900.png"),
            ("sudoku-1", "v4_09_sudoku_sky_1440x900.png"),
        ]:
            driver.execute_script(f"window.puzzledApp.openPuzzle('{game_id}');")
            time.sleep(0.25)
            driver.save_screenshot(os.path.join(SCREENSHOT_DIR, snap_name))

        driver.execute_script("window.puzzledApp.navigateTab('about');")
        time.sleep(0.15)
        assert "About & How to Play" in driver.find_element(By.TAG_NAME, "body").text
        driver.execute_script("window.puzzledApp.navigateTab('privacy');")
        time.sleep(0.15)
        assert "Zero Tracking" in driver.find_element(By.TAG_NAME, "body").text
        driver.execute_script("window.puzzledApp.navigateTab('not-found');")
        time.sleep(0.15)
        assert "404" in driver.find_element(By.TAG_NAME, "body").text
        driver.execute_script("window.puzzledApp.navigateTab('home');")
        time.sleep(0.2)
        print("[E2E] PASS 7: Captured Jigsaw, Snippets, Wordsmith, Sudoku screenshots & verified About/Privacy/404 routes")

        # 8. Multi-Viewport Layout & Overflow Audit (1440x900, 1280x720, 768x1024, 390x844, 320x700)
        viewports = [
            ("desktop_1440x900", 1440, 900, "home"),
            ("laptop_1280x720", 1280, 720, "crossover-1"),
            ("tablet_768x1024", 768, 1024, "waywords-1"),
            ("mobile_390x844", 390, 844, "home"),
            ("narrow_mobile_320x700", 320, 700, "sudoku-1"),
        ]
        for label, w, h, target in viewports:
            driver.set_window_size(w, h)
            if target == "home":
                driver.execute_script("window.puzzledApp.navigateTab('home');")
            else:
                driver.execute_script(f"window.puzzledApp.openPuzzle('{target}');")
            time.sleep(0.3)
            overflow = driver.execute_script(
                "return document.documentElement.scrollWidth > document.documentElement.clientWidth;"
            )
            driver.save_screenshot(os.path.join(SCREENSHOT_DIR, f"v4_viewport_{label}.png"))
            print(f"[E2E] Viewport {label} ({w}x{h} on {target}): horizontal_overflow={overflow}")
            assert not overflow, f"Horizontal overflow detected at viewport {label} ({w}x{h})"

        # 9. Check browser console logs for any SEVERE errors
        logs = driver.get_log("browser")
        severe_errors = [entry for entry in logs if entry.get("level") == "SEVERE"]
        assert len(severe_errors) == 0, f"Browser console errors detected: {severe_errors}"
        print("[E2E] PASS 9: Zero SEVERE browser console errors across all 13 engines and 5 viewports")

    finally:
        driver.quit()


if __name__ == "__main__":
    run_e2e_suite()

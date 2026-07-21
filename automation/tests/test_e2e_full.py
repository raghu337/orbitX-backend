import os
import time

import pytest
from pages.dashboard_page import DashboardPage
from pages.launch_hub_page import LaunchHubPage
from pages.login_page import LoginPage
from pages.navigation_page import NavigationPage
from pages.satellite_radar_page import SatelliteRadarPage
from pages.settings_page import SettingsPage
from pages.space_chat_page import SpaceChatPage
from pages.space_notes_page import SpaceNotesPage
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


@pytest.mark.e2e
class TestOrbitXFullE2E:
    """Production-grade End-to-End E2E test suite for OrbitX Dashboard Suite."""

    @property
    def credentials(self):
        username = os.environ.get("ORBITX_USERNAME") or "astronaut@orbitx.com"
        password = os.environ.get("ORBITX_PASSWORD") or "password123"
        return username, password

    @property
    def expected_profile(self):
        return os.environ.get("ORBITX_PROFILE_NAME") or "Reddy RaghuVardhan"

    def test_01_login_validation_errors(self, driver):
        """Verify form validation error highlights on empty inputs."""
        login_page = LoginPage(driver)
        login_page.navigate_to("login.html")

        # Click login without typing credentials
        login_page.click(login_page.LOGIN_BUTTON)

        assert login_page.is_username_error_visible(), "Username error message was not displayed."
        assert login_page.is_password_error_visible(), "Password error message was not displayed."
        assert login_page.get_username_error_text() == "Username is required."
        assert login_page.get_password_error_text() == "Password is required."

    def test_02_login_invalid_credentials(self, driver):
        """Verify authentication failure messages on wrong credentials."""
        login_page = LoginPage(driver)
        login_page.navigate_to("login.html")

        login_page.login("wrong@orbitx.com", "wrongpass")

        assert login_page.is_general_error_visible(), "Credential error message did not display."
        assert login_page.get_general_error_text() == "Invalid email or password."

    def test_03_login_and_logout_cycle(self, driver):
        """Verify login redirection, user profile displays, and logout URL routing."""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)

        login_page.navigate_to("login.html")
        username, password = self.credentials
        login_page.login(username, password)

        assert "dashboard.html" in driver.current_url, "Landing URL was not updated to dashboard.html."
        assert dashboard_page.get_profile_name() == self.expected_profile, "Displayed username mismatch."

        dashboard_page.click_logout()

        # Wait for redirect
        WebDriverWait(driver, 5).until(EC.title_contains("Login"))
        assert "login.html" in driver.current_url, "User was not routed back to login.html."

    def test_04_sidebar_navigation(self, driver):
        """Verify clicking sidebar tabs changes active class and routes panels correctly."""
        login_page = LoginPage(driver)
        nav_page = NavigationPage(driver)

        login_page.navigate_to("login.html")
        username, password = self.credentials
        login_page.login(username, password)

        # Select Satellite Radar
        nav_page.click_satellite_radar()
        assert nav_page.is_tab_active(nav_page.NAV_SATELLITE_RADAR), "Radar tab was not active."

        # Select Planet Explorer
        nav_page.click_planet_explorer()
        assert nav_page.is_tab_active(nav_page.NAV_PLANET_EXPLORER), "Planet Explorer tab was not active."

        # Select Space Notes AI
        nav_page.click_space_notes()
        assert nav_page.is_tab_active(nav_page.NAV_SPACE_NOTES), "Space Notes tab was not active."

    def test_05_space_notes_ai_synthesis(self, driver):
        """Verify notes query execution, tab content switching, and study flashcards interaction."""
        login_page = LoginPage(driver)
        notes_page = SpaceNotesPage(driver)

        login_page.navigate_to("login.html")
        username, password = self.credentials
        login_page.login(username, password)

        notes_page.search_topic("Jupiter")

        # Wait for search output
        assert notes_page.is_visible(notes_page.TOPIC_TITLE), "Notes result title block did not show up."
        assert "Jupiter" in notes_page.get_topic_title()

        # Verify stats and bullets
        stats = notes_page.get_stats()
        assert "AI CONFIDENCE" in stats
        assert stats["AI CONFIDENCE"] == "99.8%"

        bullets = notes_page.get_highlights()
        assert len(bullets) > 0, "No synthesized bullets were parsed."
        assert "Jupiter is the largest planet" in bullets[0]

        # Test sub tabs
        notes_page.select_detailed_analysis_tab()
        assert notes_page.is_visible(notes_page.DETAILED_TITLE), "Detailed analysis panel did not load."

        notes_page.select_pdf_summary_tab()
        assert notes_page.is_pdf_header_visible(), "PDF academic header was not visible."
        assert "ORB-JUP" in notes_page.get_pdf_ref_id(), "PDF Document Reference ID was incorrect."

        notes_page.select_study_flashcards_tab()
        assert notes_page.is_visible(notes_page.FLASHCARD_CONTAINER)
        assert notes_page.get_card_index_text() == "CARD 1 OF 3"
        assert "atmospheric composition" in notes_page.get_flashcard_question()

        # Flip card to show answer
        notes_page.flip_flashcard()
        assert notes_page.is_visible(notes_page.FLASHCARD_VERIFIED_ANSWER)

        # Go to next card
        notes_page.click_next_card()
        time.sleep(0.2) # Allow state change
        assert notes_page.get_card_index_text() == "CARD 2 OF 3"

    def test_06_space_chat_assistant(self, driver):
        """Verify chat presets selection, user message bubbles, and automated responses."""
        login_page = LoginPage(driver)
        chat_page = SpaceChatPage(driver)

        login_page.navigate_to("login.html")
        username, password = self.credentials
        login_page.login(username, password)

        # Switch tab to Space Chat AI
        driver.find_element(By.ID, "nav-space-chat").click()

        # Check presets
        presets = chat_page.get_suggested_prompts_texts()
        assert len(presets) > 0, "Suggested prompt buttons were not found."

        # Click first preset
        chat_page.select_suggested_prompt_by_index(0)

        # Check user message bubble is displayed immediately
        user_msgs = chat_page.get_user_messages()
        assert len(user_msgs) > 0, "User question was not posted to chat logs."
        assert "Keplerian orbits" in user_msgs[0]

        # Wait for AI response (up to 3 seconds for mock timeout)
        WebDriverWait(driver, 5).until_not(
            EC.visibility_of_element_located(chat_page.TYPING_INDICATOR)
        )

        # Verify AI bubble contains answered text
        ai_msgs = chat_page.get_ai_messages()
        assert len(ai_msgs) > 1, "AI reply message bubble was not generated."
        assert "Kepler's three laws" in ai_msgs[1]

    def test_07_system_settings_control(self, driver):
        """Verify settings toggles, range inputs sliding, and diagnostics console output."""
        login_page = LoginPage(driver)
        settings_page = SettingsPage(driver)

        login_page.navigate_to("login.html")
        username, password = self.credentials
        login_page.login(username, password)

        # Switch to settings
        driver.find_element(By.ID, "nav-settings").click()

        # Toggle Telemetry
        assert settings_page.is_telemetry_active(), "Telemetry should default to Active."
        settings_page.toggle_telemetry()
        assert not settings_page.is_telemetry_active(), "Telemetry was not toggled off."

        # Set Latency Threshold slider
        settings_page.set_latency_threshold("500")
        assert settings_page.get_latency_value_text() == "500ms", "Latency display was not updated."

        # Select cognitive model Hybrid-AI
        settings_page.select_model_hybrid()
        assert "active" in settings_page.get_selected_model_class(settings_page.COGNITIVE_MODEL_HYBRID), "Hybrid-AI was not highlighted active."

        # Adjust confidence filter range
        settings_page.set_confidence_filter("90")
        assert settings_page.get_confidence_value_text() == "90%", "Confidence display did not match slider."

        # Verify diagnostics logs
        logs = settings_page.get_diagnostics_logs()
        assert len(logs) > 0, "Diagnostics console terminal log is empty."
        assert any("[OK] Navigation Bridge" in line for line in logs), "Bridge active status log missing."

    def test_08_launch_hub_schedule(self, driver):
        """Verify SpaceX and NASA mission card parameters and countdown timers."""
        login_page = LoginPage(driver)
        launch_page = LaunchHubPage(driver)

        login_page.navigate_to("login.html")
        username, password = self.credentials
        login_page.login(username, password)

        driver.find_element(By.ID, "nav-launch-hub").click()

        # Verify cards
        assert launch_page.get_mission_count() >= 2, "Insufficient scheduled mission cards."

        names = launch_page.get_mission_names()
        assert "Starlink Group 7-19" in names
        assert "Artemis III Crewed Landing" in names

        agencies = launch_page.get_agency_tags()
        assert "SPACEX" in agencies
        assert "NASA" in agencies

        # Verify countdown values for SpaceX mission
        spacex_countdown = launch_page.get_countdown_timer_data(0)
        assert "DAYS" in spacex_countdown
        assert spacex_countdown["DAYS"] == "02"
        assert "HRS" in spacex_countdown
        assert spacex_countdown["HRS"] == "04"

        # Verify Watch stream hrefs
        urls = launch_page.get_stream_urls()
        assert any("spacex.com" in url for url in urls)
        assert any("nasa.gov" in url for url in urls)

    def test_09_satellite_radar_telemetry(self, driver):
        """Verify radar mute toggles, range sliders, and active vessel selection changes."""
        login_page = LoginPage(driver)
        radar_page = SatelliteRadarPage(driver)

        login_page.navigate_to("login.html")
        username, password = self.credentials
        login_page.login(username, password)

        driver.find_element(By.ID, "nav-satellite-radar").click()

        # Check latency HUD
        assert "Latency:" in radar_page.get_latency_text()

        # Toggle mute
        assert radar_page.is_muted(), "Radar should default to muted."
        radar_page.toggle_mute()
        assert not radar_page.is_muted(), "Radar was not unmuted."

        # Adjust density slider
        radar_page.set_constellation_density("120")
        assert radar_page.get_constellation_density_text() == "120 Nodes", "Density label mismatch."

        # Adjust altitude slider
        radar_page.set_orbital_altitude("1500")
        assert radar_page.get_orbital_altitude_text() == "1500 km", "Altitude label mismatch."

        # Select row 1 (Starlink)
        assert radar_page.get_fleet_rows_count() == 3
        radar_page.click_fleet_row(1)

        # Verify active vessel stats card updates
        assert radar_page.get_norad_ident_text() == "SAT-1001"
        assert "28,120 km/h" in radar_page.get_velocity_vector_text()

    def test_10_unauthorized_direct_access_redirect(self, driver):
        """Verify accessing dashboard directly without session credentials redirects to login."""
        login_page = LoginPage(driver)

        # Direct navigation attempt
        login_page.navigate_to("dashboard.html")

        # Verify redirect
        WebDriverWait(driver, 5).until(EC.title_contains("Login"))
        assert "login.html" in driver.current_url, "Direct access bypass redirect failed."
        assert login_page.is_login_page_loaded(), "Login card was not visible after redirection."

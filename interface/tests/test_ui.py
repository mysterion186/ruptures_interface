from django.test import TestCase
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

class TestUi(TestCase):

    def setUp(self):
        self.chrome = webdriver.Remote(
            command_executor='http://selenium_hub:4444/wd/hub',
            desired_capabilities=DesiredCapabilities.CHROME
        )
    
    def test_visit_site_with_chrome(self):
        self.chrome.get('http://web:8000')
        js = """
            var identifier = document.querySelector(".log");
            identifier.innerHTML = "modif js !";
        """
        self.chrome.execute_script(js)
        self.assertIn(self.chrome.title, 'Ruptures Interface')
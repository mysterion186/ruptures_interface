from django.test import TestCase, tag
from ruptures_interface import settings
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup # pour scrapper la page et s'assurer que tous marche bien au niveau de l'affichage
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time, os
class TestUi(TestCase):

    @tag("selenium")
    def setUp(self):
        self.chrome = webdriver.Remote(
            command_executor='http://selenium_hub:4444/wd/hub',
            desired_capabilities=DesiredCapabilities.CHROME
        )

        # click on the upload file zone and send data
        self.chrome.get('http://web:8000')
        time.sleep(5)
        try : 
            file_input = self.chrome.find_element(By.CLASS_NAME,"file-input")
            file_input.send_keys("/src/train/1.csv")
            file_input.send_keys("/src/train/2.csv")
            file_input.send_keys("/src/train/3.csv")
            file_input.send_keys("/src/train/1.json")
            file_input.send_keys("/src/train/2.json")
            file_input.send_keys("/src/train/3.json")
            time.sleep(5)
            # get the session value to delete the folder after the test 
            all_subdirs =os.listdir(settings.MEDIA_ROOT)
            print(all_subdirs)
            self.folder_val = max(all_subdirs, key=os.path.getmtime) 
            print(self.folder_val)
        except Exception as e : 
            print(e)
            self.tearDown()
        
    @tag("selenium")
    def tearDown(self) -> None:
        self.chrome.quit()
        return super().tearDown()
    
    @tag("selenium")
    def checklist(self, list1, list2):
        """
            function that check if 2 lists are equals
        """
        for k in range(len(list1)):
            self.assertTrue(list1[k]==list2[k])

    @tag("selenium")
    def test_check_uploaded_file(self):
        """
            Test to get to the home page
            Dans le setUp, on va déjà envoyer des fichiers, on s'assure qu'ils se trouvent dans la zone adéquate
        """
        uploaded_file = ['3.json', '2.json', '1.json', '3.csv', '2.csv', '1.csv'] # uploaded file list
        found_file = []
        soup = BeautifulSoup(self.chrome.page_source,'html.parser') # page html source code
        li = soup.find_all("span",{"class":"name"})
        for elt in li : 
            found_file.append(elt.get_text())
        self.checklist(found_file,uploaded_file) # check if the uploaded file are displayed 
    
    @tag("selenium")
    def test_label_delete(self):
        """
            Test to delete labels
            Click on a label to display the cross and then click on the cross to delete the label
            Labels deletion will be in a random way
        """
        # clique sur le bouton pour aller à la page label

    @tag("selenium")
    def test_label_hover(self):
        """
            Test to check if a label becomes blue when we hover it
            use bs4 to check the colour value in html tag
        """

    @tag("selenium")
    def test_label_add(self):
        """
            Test to add label by clicking 
            (Test le plus dur, essayer de le faire sinon on laisse tomber)
        """
    
    @tag("selenium")
    def test_label_move(self):
        """
            Test to see if moving a label, updates the value 
        """
    
    @tag("selenium")
    def test_prediction(self):
        """
            
        """

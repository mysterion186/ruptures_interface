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

        # on clique sur la zone pour uploader un fichier
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
            # détermine la valeur de la session (pour la supprimer à la fin de chaque test)
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
            fonction qui renvoie une erreur si les 2 listes sont différentes
        """
        for k in range(len(list1)):
            self.assertTrue(list1[k]==list2[k])

    @tag("selenium")
    def test_check_uploaded_file(self):
        """
            Test pour aller sur la page d'accueil
            Dans le setUp, on va déjà envoyer des fichiers, on s'assure qu'ils se trouvent dans la zone adéquate
        """
        uploaded_file = ['3.json', '2.json', '1.json', '3.csv', '2.csv', '1.csv'] # liste des fichiers qu'on a uploadé
        found_file = []
        soup = BeautifulSoup(self.chrome.page_source,'html.parser') # code html de la page
        li = soup.find_all("span",{"class":"name"})
        for elt in li : 
            found_file.append(elt.get_text())
        self.checklist(found_file,uploaded_file)
    
    @tag("selenium")
    def test_label_delete(self):
        """
            Test pour supprimer les labels 
            Les fichiers json seront déjà là, on appuye sur un label pour afficher la croix, puis on clique dessus pour la supprimer
            La suppression des labels se fera de manière aléatoire
        """
        # clique sur le bouton pour aller à la page label

    @tag("selenium")
    def test_label_hover(self):
        """
            Test pour voir si lorsqu'on passe sur une zone le label devient bel et bien bleu
            utiliser bs4 pour check la couleur inscrit dans le tag
        """

    @tag("selenium")
    def test_label_add(self):
        """
            Test pour ajouter un label en cliquant sur la figure
            (Test le plus dur, essayer de le faire sinon on laisse tomber)
        """
    
    @tag("selenium")
    def test_label_move(self):
        """
            Test pour voir si on bouge un trait, est ce que le label se met à jour (à faire que si j'arrive à faire le test précédent)
        """
    
    @tag("selenium")
    def test_prediction(self):
        """
            
        """

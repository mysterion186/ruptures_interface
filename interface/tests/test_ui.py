from django.test import TestCase, tag
from selenium import webdriver
from bs4 import BeautifulSoup # pour scrapper la page et s'assurer que tous marche bien au niveau de l'affichage
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

class TestUi(TestCase):

    def setUp(self):
        self.chrome = webdriver.Remote(
            command_executor='http://selenium_hub:4444/wd/hub',
            desired_capabilities=DesiredCapabilities.CHROME
        )
    
    def test_init(self):
        """
            Test pour aller sur la page d'accueil
            On envoie des fichiers au backend (en cliquant) et on s'assure que chaque fichier se trouve bien dans la liste des fichiers uploadé
        """
        self.chrome.get('http://web:8000')
        js = """
            var identifier = document.querySelector(".log");
            identifier.innerHTML = "modif js !";
        """
        self.chrome.execute_script(js)
        self.assertIn(self.chrome.title, 'Ruptures Interface')
    
    def test_label_delete(self):
        """
            Test pour supprimer les labels 
            Les fichiers json seront déjà là, on appuye sur un label pour afficher la croix, puis on clique dessus pour la supprimer
            La suppression des labels se fera de manière aléatoire
        """
    
    def test_label_hover(self):
        """
            Test pour voir si lorsqu'on passe sur une zone le label devient bel et bien bleu
            utiliser bs4 pour check la couleur inscrit dans le tag
        """

    def test_label_add(self):
        """
            Test pour ajouter un label en cliquant sur la figure
            (Test le plus dur, essayer de le faire sinon on laisse tomber)
        """
    
    def test_label_move(self):
        """
            Test pour voir si on bouge un trait, est ce que le label se met à jour (à faire que si j'arrive à faire le test précédent)
        """
    

    def test_prediction(self):
        """
            
        """

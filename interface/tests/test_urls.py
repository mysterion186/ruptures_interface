from django.test import TestCase, Client
from django.urls import reverse,resolve
from ruptures_interface.settings import BASE_DIR,MEDIA_ROOT
import os, shutil


from interface import views

class TestUrls(TestCase):

    def setUp(self) -> None:
        self.client = Client()
        return super().setUp()
    
    def delete_folder(self,folder_val="30"):
        shutil.rmtree(str(MEDIA_ROOT)+"/"+str(folder_val))
    
    def send_data(self,file_path,url=''):
        """
            Fonction pour envoyer un fichier 
        """
        with open(file_path,'r') as f :
            self.client.post(url,{"myfile":f})

    def test_index_route(self):
        """
            Test pour s'assurer qu'on fait bien appel à la fonction pour aller vers la page index
        """
        url = reverse("interface:index")
        self.assertEquals(resolve(url).func,views.index)
    
    def test_label_route(self):
        """
            Test pour s'assurer qu'on fait bien appel à la fonction pour aller vers la page label
        """
        url = reverse("interface:label")
        self.assertEquals(resolve(url).func,views.label)
    
    def test_prediction_route(self):
        """
            Test pour s'assurer qu'on fait bien appel à la fonctin pour aller vers la page prédiction
        """

        url = reverse("interface:prediction")
        self.assertEquals(resolve(url).func,views.prediction)
    
    def test_redirect_from_label_to_index(self):
        """
            Test pour s'assurer qu'on est redirigé vers la page index s'il n'y pas de "folder_val" dans la session
        """
        url = reverse("interface:label")
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # code différent de 200 parce qu'il y a eu une redirection
        self.assertRedirects(response,"/") # indique qu'on est bien sur la page d'accueil
    
    def test_label_with_folder_val_train_empty(self):
        """
            Test pour s'assurer qu'on reste bien sur la page index dans le cas où il y a la clé "folder_val" dans la session mais le dossier train n'existe pas (pas de fichier uploadé)
        """
        # ajout de la valeur "folder_val" dans la session
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:label")
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # code différent de 200 parce qu'il y a eu une redirection
        self.assertRedirects(response,"/") # indique qu'on est bien sur la page d'accueil

    def test_label_with_folder_val_train_not_empty(self):
        """
            Test pour vérifier qu'on va bien sur la page label si la clé "folder_val" existe + le dossier train n'est pas vide
        """
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:label")
        # envoie de fichier pour s'assurer que le dossier train existe
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_no_header_1D.csv",'')

        response = self.client.get(url)
        self.assertEqual(response.status_code, 200) # code égale à 200 parce qu'il n'y a pas de redirection
        self.assertTemplateUsed(response,"interface/label.html") # indique qu'on a bien utilisé le template label donc qu'on est sur la page label 
        self.delete_folder()


    def test_redirect_from_prediction_to_index(self):
        """
            Test pour s'assurer qu'on est bien redirigé vers la page index s'il n'y a pas de "folder_val" dans la session
        """
        url = reverse("interface:prediction")
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # code différent de 200 parce qu'il y a eu une redirection
        self.assertRedirects(response,"/") # indique qu'on est bien sur la page d'accueil

    def test_redirect_from_prediction_to_label_only_csv(self):
        """
            Test pour s'assurer qu'on retourne bien sur la page label si tous les fichiers csv présent dans le dossier train n'ont pas de fichier json qui contient les labels
        """
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:prediction")
        # envoie de fichier (les fichiers en soit ne sont pas important)
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_no_header_1D.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_header_1D.csv",'')
        
        # on a envoyé les fichiers (le dossier train existe) + folder_val existe. si on va sur prediction on doit retourner sur label
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # code différent de 200 parce qu'il y a eu une redirection
        self.assertRedirects(response,"/label") # indique qu'on est bien sur la page label
        self.delete_folder()

    def test_redirect_from_prediction_to_accueil_not_csv(self): 
        """
            Test pour s'assurer qu'on retourne bien sur la page d'accueil s'il y a 0 fichiers csv dans le dossier train
        """
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:prediction")
        # envoie de fichier (les fichiers en soit ne sont pas important)
        self.send_data(str(BASE_DIR)+"/interface/tests/files/label/csv_no_header_1D.json",'')
        
        # on a envoyé les fichiers (le dossier train existe) + folder_val existe. si on va sur prediction on doit retourner sur label
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # code différent de 200 parce qu'il y a eu une redirection
        self.assertRedirects(response,"/") # indique qu'on est bien sur la page accueil
        self.delete_folder()

    def test_redirect_from_prediction_to_label_csv_json_num_not_equal(self):
        """
            Test pour s'assurer qu'on retourne sur la page label si les fichiers csv n'ont pas leurs fichiers json
        """
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:prediction")

        # on envoie des csv + json pour prédire sur les signaux à 1 dimension (il manque le json pour le fichier 3.csv)
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/1.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/1.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/2.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/2.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/3.csv",'')
        print("depuis test fichiers envoyé ")
        # on a envoyé les fichiers (le dossier train existe) + folder_val existe. si on va sur prediction on doit retourner sur label
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # code différent de 200 parce qu'il y a eu une redirection
        self.assertRedirects(response,"/label") # indique qu'on est bien sur la page label       
        self.delete_folder()
    
    def test_redirect_from_prediction_to_prediction_csv_json_num_equal(self):
        """
            Test pour s'assurer qu'on reste sur la page prediction car les fichiers csv ont les fichiers json qui les correspondent
        """
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:prediction")

        # on envoie des csv + json pour prédire sur les signaux à 1 dimension (il manque le json pour le fichier 3.csv)
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/1.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/1.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/2.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/2.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/3.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/3.json",'')

        # on a envoyé les fichiers (le dossier train existe) + folder_val existe. si on va sur prediction on doit retourner sur label
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200) # code égale à 200 car on doit pas avoir de redirection là
        self.assertTemplateUsed(response,"interface/prediction.html") # indique qu'on a bien utilisé le template label donc qu'on est sur la page label 
        self.delete_folder()
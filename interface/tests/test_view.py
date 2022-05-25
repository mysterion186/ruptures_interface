from django.test import TestCase, Client
from ruptures_interface.settings import BASE_DIR,MEDIA_ROOT
import os
import shutil
from interface import tools
from pathlib import Path


class TestView(TestCase):

    def setUp(self) -> None:
        self.client = Client()
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        folder_val = s.get('folder_val')
        self.file_path = str(MEDIA_ROOT)+"/"+folder_val
        return super().setUp()
    
    def tearDown(self):
        shutil.rmtree(self.file_path)
        pass

    # envoie de fichier csv,json au backend /Users/kowsikan/ESIEE/E4/stage/ENS/projet/ruptures_interface/interface/tests/files/1.csv
    def test_upload_file_accueil(self):
        print("test upload")
        with open(str(BASE_DIR)+"/interface/tests/files/csv_no_header_1D.csv","r") as f:
            self.client.post('',{"myfile":f})
        
        with open(str(BASE_DIR)+"/interface/tests/files/csv_header_1D.csv","r") as f:
            self.client.post('',{"myfile":f})
        
        with open(str(BASE_DIR)+"/interface/tests/files/csv_header_2D.csv","r") as f:
            self.client.post('',{"myfile":f})
        
        with open(str(BASE_DIR)+"/interface/tests/files/csv_no_header_2D.csv","r") as f:
            self.client.post('',{"myfile":f})
        
        self.assertTrue(os.path.exists(self.file_path+'/train/csv_no_header_1D.csv'))
        self.assertTrue(os.path.exists(self.file_path+'/train/csv_header_1D.csv'))
        self.assertTrue(os.path.exists(self.file_path+'/train/csv_header_2D.csv'))
        self.assertTrue(os.path.exists(self.file_path+'/train/csv_no_header_2D.csv'))


    # test pour voir si les fichiers json sont bien "standardisé" 
    def test_check_json_standard(self):
        print("check json")
        # envoie des fichiers csv
        with open(str(BASE_DIR)+"/interface/tests/files/csv_no_header_1D.csv","r") as f:
            self.client.post('',{"myfile":f})
        with open(str(BASE_DIR)+"/interface/tests/files/csv_header_1D.csv","r") as f:
            self.client.post('',{"myfile":f})
        
        # envoie des fichiers json un avec le dernier indice et l'autre sans
        with open(str(BASE_DIR)+"/interface/tests/files/csv_no_header_1D.json","r") as f: # contient la valeur du dernier indices
            self.client.post('',{"myfile":f})
        with open(str(BASE_DIR)+"/interface/tests/files/csv_header_1D.json","r") as f:
            self.client.post('',{"myfile":f})
        
        # liste contenant les valeurs qu'on est censé obtenir dans les fichiers json 
        label_json_1 = [120, 248, 375, 500]
        label_json_2 = [253, 492, 752,1000]


        # liste qu'on retrouve dans les json après avoir fait appel à label
        test_json_1 = tools.load_json(Path(self.file_path+"/train/csv_no_header_1D.json"))
        test_json_2 = tools.load_json(Path(self.file_path+"/train/csv_header_1D.json"))
        
        # l'utilisateur va sur la page label
        tools.standardize_json((self.file_path+"/train/csv_no_header_1D.csv"),test_json_1)
        tools.standardize_json((self.file_path+"/train/csv_header_1D.csv"),test_json_2)
        
        test_json_1 = tools.load_json(Path(self.file_path+"/train/csv_no_header_1D.json"))
        test_json_2 = tools.load_json(Path(self.file_path+"/train/csv_header_1D.json"))
        
        print(test_json_1,test_json_2)
        # on s'assure que les 2 listes aient la même taille
        self.assertTrue(len(label_json_1)==len(test_json_1))
        self.assertTrue(len(label_json_2)==len(test_json_2))

        # l'erreur peut seulement venir des derniers éléments ??? 
        self.assertTrue(label_json_1[-1]==test_json_1[-1])
        self.assertTrue(label_json_2[-1]==test_json_2[-1])

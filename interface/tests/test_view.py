from django.test import TestCase, Client
from ruptures_interface.settings import BASE_DIR,MEDIA_ROOT
import os
import shutil
from interface import tools
from pathlib import Path
import json

class TestView(TestCase):

    def setUp(self) -> None:
        self.client = Client()
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        self.folder_val = s.get('folder_val')
        self.file_path = str(MEDIA_ROOT)+"/"+self.folder_val
        return super().setUp()
    
    def tearDown(self):
        shutil.rmtree(self.file_path)
        pass

    def send_data(self,file_path,url=''):
        """
            Function to send file
        """
        with open(file_path,'r') as f :
            self.client.post(url,{"myfile":f})

    
    def checklist(self, list1, list2):
        """
            Function to check if 2 lists are equals
        """
        for k in range(len(list1)):
            self.assertTrue(list1[k]==list2[k])
        
    def test_upload_file_accueil(self):
        """
            Test to check that all uploaded files are in the folder media/30 (cf setUp)
            Case where we send 1d file with no header -> check that there is a header + file exists
            Case where we send a 1d file with header -> check that there is a header + file exists
            Case where we send a 2d file with header -> check that there is a header + file exists
            Case where we send a 2d file with no header -> check that there is a header + file exists
        """

        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_no_header_1D.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_header_1D.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_header_2D.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_no_header_2D.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/aide.html",'') # file that shouldn't be uploaded because we only process csv and json file
        
        self.assertTrue(os.path.exists(self.file_path+'/train/csv_no_header_1D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/train/csv_no_header_1D.csv')))

        self.assertTrue(os.path.exists(self.file_path+'/train/csv_header_1D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/train/csv_header_1D.csv')))

        self.assertTrue(os.path.exists(self.file_path+'/train/csv_header_2D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/train/csv_header_2D.csv')))

        self.assertTrue(os.path.exists(self.file_path+'/train/csv_no_header_2D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/train/csv_no_header_2D.csv')))
        self.assertFalse(os.path.exists(self.file_path+'/train/aide.html'))


    def test_upload_multiple_files_home(self):
        """
            Test function to check if we can send multiple files at once
        """
        # files opening
        f1 = open(str(BASE_DIR)+"/interface/tests/files/header/csv_no_header_1D.csv",'r')
        f2 = open(str(BASE_DIR)+"/interface/tests/files/header/csv_header_1D.csv","r")
        f3 = open(str(BASE_DIR)+"/interface/tests/files/header/csv_header_2D.csv","r")
        f4 = open(str(BASE_DIR)+"/interface/tests/files/aide.html","r") # this file shouldn"t be in the media folder

        # sending data with 1 post request
        self.client.post('',{"myfile":[f1,f2,f3,f4]})

        # checking if files are here + if they have the good format 
        self.assertTrue(os.path.exists(self.file_path+'/train/csv_no_header_1D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/train/csv_no_header_1D.csv')))

        self.assertTrue(os.path.exists(self.file_path+'/train/csv_header_1D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/train/csv_header_1D.csv')))

        self.assertTrue(os.path.exists(self.file_path+'/train/csv_header_2D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/train/csv_header_2D.csv')))
        self.assertFalse(os.path.exists(self.file_path+'/train/aide.html')) # this file shouldn't exist


    # test pour voir si les fichiers json sont bien "standardisé" 
    def test_check_json_standard_train(self):
        """
            Test to check that the last value of the json file is the signal length
            Case where the labels last value is not the signal length -> check if lats value is there
            Case where the labels are greater than the signal length -> check if that no values is greater than the signal length
        """
        
        # send csv file
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_no_header_1D.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_header_1D.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_header_2D.csv",'')

        # send json file (with and without last value)
        self.send_data(str(BASE_DIR)+"/interface/tests/files/label/csv_no_header_1D.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/label/csv_header_1D.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/label/csv_header_2D.json",'')
        
        # json expected output
        label_json_1 = [120, 248, 375, 500]
        label_json_2 = [253, 492, 752,1000]
        label_json_3 = [82, 173, 259, 350]


        # labels that were uploaded
        test_json_1 = tools.load_json(Path(self.file_path+"/train/csv_no_header_1D.json")) # [120, 248, 375, 499]
        test_json_2 = tools.load_json(Path(self.file_path+"/train/csv_header_1D.json")) # [253, 492, 752]
        test_json_3 = tools.load_json(Path(self.file_path+"/train/csv_header_2D.json")) # [82, 173, 259, 350,750,858]
        
        # mimic user going to the prediction page, call the function to standardize json file
        tools.standardize_json((self.file_path+"/train/csv_no_header_1D.csv"),test_json_1)
        tools.standardize_json((self.file_path+"/train/csv_header_1D.csv"),test_json_2)
        tools.standardize_json((self.file_path+"/train/csv_header_2D.csv"),test_json_3)
        
        test_json_1 = tools.load_json(Path(self.file_path+"/train/csv_no_header_1D.json"))
        test_json_2 = tools.load_json(Path(self.file_path+"/train/csv_header_1D.json"))
        test_json_3 = tools.load_json(Path(self.file_path+"/train/csv_header_2D.json"))
        

        # check that json file have the same length
        self.assertTrue(len(label_json_1)==len(test_json_1), f"label_json = {label_json_1}, test_json = {test_json_1}" )
        self.assertTrue(len(label_json_2)==len(test_json_2), f"label_json = {label_json_2}, test_json = {test_json_2}")
        self.assertTrue(len(label_json_3)==len(test_json_3), f"label_json = {label_json_3}, test_json = {test_json_3}")

        # check that both json files are equals
        self.checklist(test_json_1,label_json_1)
        self.checklist(test_json_2,label_json_2)
        self.checklist(test_json_3,label_json_3)
        

    def test_train_pen_1D(self):
        """
            Test to see if the pen opt correspond to what we expect for 1D signals
        """
        # send signal and label to train ruptures
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/1.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/1.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/2.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/2.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/3.csv",'')
        post_dict = {"filename":f"media/{self.folder_val}/train/3.csv","labels":["102", "209", "312", "434", "559", "673", "787", "893", "1000"]} # mimic the post request when the user put label when he didn't provide json file
        self.client.post('/add',json.dumps(post_dict),content_type="application/json")

        # folder_path to where write the json output
        folder_path = self.file_path+"/train/"
        json_path = self.file_path+"/pen_opt.json"
        # call the learn function
        tools.alpin_learn(Path(folder_path),Path(json_path))

        pen_opt_dict = tools.load_json(filename=json_path)
        pen_opt = pen_opt_dict["pen_opt"]
        self.assertTrue(pen_opt==2.01)

    def test_train_pen_2D(self):
        """
            Test to see if the pen opt correspond to what we expect for 2D signals
        """
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train2D/1.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train2D/1.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train2D/2.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train2D/2.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train2D/3.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train2D/3.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train2D/4.csv",'')
        post_dict = {"filename":f"media/{self.folder_val}/train/4.csv","labels":["98", "200"]} # mimic the post request when the user put label when he didn't provide json file
        self.client.post('/add',json.dumps(post_dict),content_type="application/json")

        # folder_path to where write the json output
        folder_path = self.file_path+"/train/"
        json_path = self.file_path+"/pen_opt.json"
        # call the learn function
        tools.alpin_learn(Path(folder_path),Path(json_path))

        pen_opt_dict = tools.load_json(filename=json_path)
        pen_opt = pen_opt_dict["pen_opt"]
        self.assertTrue(pen_opt==2.01)
    
    def test_train_pen_6(self):
        """
            Test to see if the pen opt correspond to what we expect for 6D signals
        """
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train6D/1.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train6D/1.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train6D/2.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train6D/2.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train6D/3.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train6D/3.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train6D/4.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train6D/4.json",'')

        # folder_path to where write the json output
        folder_path = self.file_path+"/train/"
        json_path = self.file_path+"/pen_opt.json"
        # call the learn function
        tools.alpin_learn(Path(folder_path),Path(json_path))

        pen_opt_dict = tools.load_json(filename=json_path)
        pen_opt = pen_opt_dict["pen_opt"]
        self.assertTrue(pen_opt==3.099832420283748)

    def test_check_json_standard_predict(self):
        """
           Test to check that the last value of the json file is the signal length in the prediction page
            Case where the labels last value is not the signal length -> check if lats value is there
            Case where the labels are greater than the signal length -> check if that no values is greater than the signal length
        """
        
        # send csv file
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_no_header_1D.csv",'/prediction/signal')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_header_1D.csv",'/prediction/signal')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_header_2D.csv",'/prediction/signal')

        # send json file (with and without last value)
        self.send_data(str(BASE_DIR)+"/interface/tests/files/label/csv_no_header_1D.json",'/prediction/signal')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/label/csv_header_1D.json",'/prediction/signal')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/label/csv_header_2D.json",'/prediction/signal')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/aide.html",'') # fichier qui ne devrait pas apparaître dans le dossier car ne respecte pas l'ext csv ou json

        self.assertFalse(os.path.exists(self.file_path+'/train/aide.html')) # check that the file doesn't exist
        
        # json expected output
        label_json_1 = [120, 248, 375, 500]
        label_json_2 = [253, 492, 752,1000]
        label_json_3 = [82, 173, 259, 350]


        # labels that were uploaded
        test_json_1 = tools.load_json(Path(self.file_path+"/test/csv_no_header_1D.json")) # [120, 248, 375, 499]
        test_json_2 = tools.load_json(Path(self.file_path+"/test/csv_header_1D.json")) # [253, 492, 752]
        test_json_3 = tools.load_json(Path(self.file_path+"/test/csv_header_2D.json")) # [82, 173, 259, 350,750,858]
        
        # mimic user going to the prediction page, call the function to standardize json file
        tools.standardize_json((self.file_path+"/test/csv_no_header_1D.csv"),test_json_1)
        tools.standardize_json((self.file_path+"/test/csv_header_1D.csv"),test_json_2)
        tools.standardize_json((self.file_path+"/test/csv_header_2D.csv"),test_json_3)
        
        test_json_1 = tools.load_json(Path(self.file_path+"/test/csv_no_header_1D.json"))
        test_json_2 = tools.load_json(Path(self.file_path+"/test/csv_header_1D.json"))
        test_json_3 = tools.load_json(Path(self.file_path+"/test/csv_header_2D.json"))
        

        # check that json file have the same length
        self.assertTrue(len(label_json_1)==len(test_json_1), f"label_json = {label_json_1}, test_json = {test_json_1}" )
        self.assertTrue(len(label_json_2)==len(test_json_2), f"label_json = {label_json_2}, test_json = {test_json_2}")
        self.assertTrue(len(label_json_3)==len(test_json_3), f"label_json = {label_json_3}, test_json = {test_json_3}")

        # check that both json files are equals
        self.checklist(test_json_1,label_json_1)
        self.checklist(test_json_2,label_json_2)
        self.checklist(test_json_3,label_json_3)



    def test_upload_file_prediction(self):
        """
            Test to check that file uploaded one by one are in the test folder + are well formated
            case where we send 1d file without header -> check that the file exists and there is a header
            case where we send 1d file with header -> check that there is no double header + the file exists
            case where we send 2d file with header -> check that there is no double header + the file exists
            case where we send 12 file without header -> check that the file exists and there is a header
        """

        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_no_header_1D.csv",'/prediction/signal')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_header_1D.csv",'/prediction/signal')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_header_2D.csv",'/prediction/signal')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_no_header_2D.csv",'/prediction/signal')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/aide.html",'/prediction/signal') # this file shouldn't be found because it is not a csv or json file
        
        self.assertTrue(os.path.exists(self.file_path+'/test/csv_no_header_1D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/test/csv_no_header_1D.csv')))

        self.assertTrue(os.path.exists(self.file_path+'/test/csv_header_1D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/test/csv_header_1D.csv')))

        self.assertTrue(os.path.exists(self.file_path+'/test/csv_header_2D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/test/csv_header_2D.csv')))

        self.assertTrue(os.path.exists(self.file_path+'/test/csv_no_header_2D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/test/csv_no_header_2D.csv')))
        self.assertFalse(os.path.exists(self.file_path+'/test/aide.html'))


    def test_upload_multiple_files_home(self):
        """
            Test function to check if we can send multiple files at once + check format (cf previous test cas)
        """
        # files opening
        f1 = open(str(BASE_DIR)+"/interface/tests/files/header/csv_no_header_1D.csv",'r')
        f2 = open(str(BASE_DIR)+"/interface/tests/files/header/csv_header_1D.csv","r")
        f3 = open(str(BASE_DIR)+"/interface/tests/files/header/csv_header_2D.csv","r")
        f4 = open(str(BASE_DIR)+"/interface/tests/files/aide.html","r") # this file shouldn"t be in the media folder

        # sending data 
        self.client.post('/prediction/signal',{"myfile":[f1,f2,f3,f4]})

        # checking if files are here + if they have the good format 
        self.assertTrue(os.path.exists(self.file_path+'/test/csv_no_header_1D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/test/csv_no_header_1D.csv')))

        self.assertTrue(os.path.exists(self.file_path+'/test/csv_header_1D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/test/csv_header_1D.csv')))

        self.assertTrue(os.path.exists(self.file_path+'/test/csv_header_2D.csv'))
        self.assertTrue(tools.is_header(Path(self.file_path+'/test/csv_header_2D.csv')))
        self.assertFalse(os.path.exists(self.file_path+'/test/aide.html')) # this file shouldn't exist
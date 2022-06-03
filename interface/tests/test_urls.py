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
            Function to send data
        """
        with open(file_path,'r') as f :
            self.client.post(url,{"myfile":f})

    def test_index_route(self):
        """
            Test to check if we call the proper function to get to the home page
        """
        url = reverse("interface:index")
        self.assertEquals(resolve(url).func,views.index)
    
    def test_label_route(self):
        """
            Test to check if we call the proper function to get to the label page
        """
        url = reverse("interface:label")
        self.assertEquals(resolve(url).func,views.label)
    
    def test_prediction_route(self):
        """
            Test to check if we call the proper function to get to the prediction page
        """

        url = reverse("interface:prediction")
        self.assertEquals(resolve(url).func,views.prediction)
    
    def test_redirect_from_label_to_index(self):
        """
            Test to check that we are redircted to the home page if there is no folder_val in the session
        """
        url = reverse("interface:label")
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # http code different from 200, because there was a redirection
        self.assertRedirects(response,"/") # show that we are now in home page
    
    def test_label_with_folder_val_train_empty(self):
        """
            Test to check that we are in home page in the case where folder_val exists but the train folder doesn't exist (no file uploaded)
        """
        # add folder_val to the session
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:label")
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # http code different from 200, because there was a redirection
        self.assertRedirects(response,"/") # show that we are now in home page

    def test_label_with_folder_val_train_not_empty(self):
        """
            Test to check that we are in label page if the key folder_val exists + train folder is not empty 
        """
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:label")
        # send files to be sure that the train folder exists
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_no_header_1D.csv",'')

        response = self.client.get(url)
        self.assertEqual(response.status_code, 200) # http code equals to 200, means that we got the right page, no redirection
        self.assertTemplateUsed(response,"interface/label.html") # show that we use the label html template
        self.delete_folder()


    def test_redirect_from_prediction_to_index(self):
        """
            Test to be sure that we're redirect to the home page if there is no "folder_val" in the session
        """
        url = reverse("interface:prediction")
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # http code different from 200, because there was a redirection
        self.assertRedirects(response,"/") # show that we are now in home page
    
    def test_redirect_from_prediction_to_index_empty_folder(self):
        """
            Test to be sure that we are redirected to the home page if there is "folder_val" in the session but the train folder is empty
        """
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:prediction")
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # http code different from 200, because there was a redirection
        self.assertRedirects(response,"/") # show that we are now in home page

    def test_redirect_from_prediction_to_label_only_csv(self):
        """
            Test to be sure that we are redirected to the label page, if all csv files don't have their json file that contains labels
        """
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:prediction")
        # send files
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_no_header_1D.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/header/csv_header_1D.csv",'')
        
        # sent file (train folder exists) + folder_val exists => should be redirected to label (missing json)
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # http code different from 200, because there was a redirection
        self.assertRedirects(response,"/label") # show that we are now in label page
        self.delete_folder()

    def test_redirect_from_prediction_to_accueil_not_csv(self): 
        """
            Test to be sur that we redirected to home page if folder_val exists but there is no csv file in le train folder
        """
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:prediction")
        # send file
        self.send_data(str(BASE_DIR)+"/interface/tests/files/label/csv_no_header_1D.json",'')
        
        # sent file (train folder exists) + folder_val exists. If we go the prediction we should be redirected to lable page
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # http code different from 200, because there was a redirection
        self.assertRedirects(response,"/") # show that we are now in home page
        self.delete_folder()

    def test_redirect_from_prediction_to_label_csv_json_num_not_equal(self):
        """
            Test to be sure that we go back to label page if they don't have their json file
        """
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:prediction")

        # send csv + json file to predict 1d signal (missing json for 3.csv)
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/1.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/1.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/2.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/2.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/3.csv",'')

        # send file (dossier train exists) + folder_val exists. If we go to prediction we should be redirected to label
        response = self.client.get(url)
        self.assertNotEqual(response.status_code, 200) # http code different from 200, because there was a redirection
        self.assertRedirects(response,"/label") # show that we are now in home page
        self.delete_folder()
    
    def test_redirect_from_prediction_to_prediction_csv_json_num_equal(self):
        """
            Test to check that we stay in prediction page if all csv files have their json files
        """
        s = self.client.session
        s.update({"folder_val":str(30)})
        s.save()
        url = reverse("interface:prediction")

        # send file 
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/1.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/1.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/2.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/2.json",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/3.csv",'')
        self.send_data(str(BASE_DIR)+"/interface/tests/files/train/3.json",'')

        # sent files (train folder exists) + folder_val exists. If we go to prediction we should stay here
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200) # http code equals to 200, means that we got the right page, no redirection
        self.assertTemplateUsed(response,"interface/prediction.html") # show that we use the label html template
        self.delete_folder()
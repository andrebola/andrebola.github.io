import numpy as np
import pandas as pd
from sklearn import linear_model, cross_validation, metrics, svm
from sklearn.metrics import confusion_matrix, precision_recall_fscore_support, accuracy_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import sys
import random
import json
from time import sleep
import time
import datetime
from urllib2 import Request, urlopen, URLError

def main():
    with open('data.txt', 'r') as f:
        #print f.read()
        #di = json.loads(f.read())
        data_2007 = pd.read_json(f.read())
        cols = ['tmp', 'thunder', 'press', 'hum', 'date', 'rain']
        train_y = data_2007['sales'] 
        train_x = data_2007[cols]
            
        print train_x.shape
        clf_lr = RandomForestClassifier(n_estimators=50, n_jobs=-1)
        clf_lr.fit(train_x, train_y)
        with open('data2.txt', 'r') as f2:
            data_2008 = pd.read_json(f2.read())
        pr = clf_lr.predict(data_2008[['tmp', 'thunder', 'press', 'hum', 'date', 'rain']])
        print pr
        with open('data2.txt', 'r') as f:
            elems = json.loads(f.read())
                
            m=0
            for i in pr:
                elems[m]["sales"]= i
                m+=1
        
        l = [[int(time.mktime(datetime.datetime.strptime(i["date"], "%Y%m%d").timetuple()))*1000,i["sales"]] for i in elems]
        #y = [i["sales"] for i in elems]
        print l
        #print y
        
def other():
    with open('data.txt', 'r') as f:
        #print f.read()
        #di = json.loads(f.read())
        elems = json.loads(f.read())
        l = [[int(time.mktime(datetime.datetime.strptime(i["date"], "%Y%m%d").timetuple()))*1000,i["sales"]] for i in elems]
        #y = [i["sales"] for i in elems]
        print l
        #for i in elems:
        #    print "%s,%s" %(i["sales"], i["hum"])
        #        l.append(i["sales"])
        #    if i["tmp"] not in l:
        #        l.append(i["tmp"])
        #        l.append(i["sales"])
        #import matplotlib.pyplot as plt
        #plt.plot(y,l, 'ro')

        #plt.show()
            
        
def populate():
    resp=[]
    date="201405"
    for i in range(1,15):
        request2 = Request('http://api.wunderground.com/api/2906d63b14b7be9c/history_'+("%s%02d" % (date,i))+'/q/MEX.json')
        response2 = urlopen(request2, timeout=500)
        kittens2 = response2.read()
        a2 =json.loads(kittens2)["history"]["dailysummary"][0]
        sleep(6)
        resp.append({"date":("%s%02d" % (date,i)),"thunder":a2["thunder"],"tmp":a2["meantempm"],"press":a2["meanpressurem"],"hum":a2["humidity"], "rain":a2["rain"]})
    with open('data2.txt', 'w') as outfile:
        json.dump(resp, outfile)

        
if __name__ == "__main__":
    #opts, args = getopt.getopt(sys.argv[1:], "h", ["help"])
    #main(lat="25.685", long_str="-100.315", airport="MTY")
    main()
    
    '''
     #print f.read()
        #di = json.loads(f.read())
        data_2007 = pd.read_json(f.read())
        print data_2007
        cols = ['tmp', 'thunder', 'press', 'hum', 'date']
        train_y = data_2007['sales'] 
        
        categ = [cols.index(x) for x in 'tmp', 'thunder', 'press', 'hum', 'date']
        enc = OneHotEncoder(categorical_features = categ)
        df = data_2007.drop('sales', axis=1)
        
        train_x = enc.fit_transform(df)
            
        clf_rf = RandomForestClassifier(n_estimators=50, n_jobs=-1)
        clf_rf.fit(train_x.toarray(), train_y)
        pr = clf_rf.predict({"date":"20140431", "tmp":20, "thunder":0, "press":1000 ,"hum":70})
        print pr
    '''
from urllib2 import Request, urlopen, URLError
import json
from time import sleep
from datetime import date
def main(lat="19.430", long_str="-99.135", airport="MEX"):
        
    
    try:
        with open('data.all.txt', 'r') as f:
            elems = json.loads(f.read())
        resp = []
        
        aux(resp,long_str,lat,airport, "20131101","20131115",elems)
        aux(resp,long_str,lat,airport, "20131116","20131201",elems)
        aux(resp,long_str,lat,airport, "20131202","20131215",elems)
        aux(resp,long_str,lat,airport, "20131216","20131224",elems)
        aux(resp,long_str,lat,airport, "20131225","20140101",elems)
        aux(resp,long_str,lat,airport, "20140102","20140115",elems)
        aux(resp,long_str,lat,airport, "20140116","20140201",elems)
        aux(resp,long_str,lat,airport, "20140202","20140301",elems)
        aux(resp,long_str,lat,airport, "20140302","20140401",elems)
        aux(resp,long_str,lat,airport, "20140402","20140430",elems)
        with open('data.txt', 'w') as outfile:
            json.dump(resp, outfile)
    except URLError, e:
        print 'No kittez. Got an error code:', e
    
def aux(resp,long_str,lat,airport, df,dt,elems):
    print df
    print dt
    request = Request('https://apis.bbvabancomer.com/datathon/tiles/'+lat+'/'+long_str+'/payment_distribution?date_min='+df+'&date_max='+dt+'&group_by=day&category=mx_barsandrestaurants',
                    headers={"Authorization":"Basic YXBwLmJidmEucHJlZGljdDo0NDNlYmMzNzhjNGM0MDFiYzlkMTMwMWY3OGIwZjlmM2FhMjk4MTc1"
    })
    response = urlopen(request)
    kittens = response.read()
    
    for a in json.loads(kittens)["data"]["stats"]:
        for i in elems:
            if i["date"] == a["date"]:
                
                date = a["date"]
                tot = 0
                if "histogram" in a:
                    for cat in a["histogram"]:
                        tot+=cat["num_payments"]
        
                resp.append({"date":date,"sales":tot,"thunder":i["thunder"],"tmp":i["tmp"],"press":i["press"],"hum":i["hum"], "rain":i["rain"]})

if __name__ == "__main__":
    #opts, args = getopt.getopt(sys.argv[1:], "h", ["help"])
    #main(lat="25.685", long_str="-100.315", airport="MTY")
    main(lat="19.430", long_str="-99.135", airport="MEX")
    
    
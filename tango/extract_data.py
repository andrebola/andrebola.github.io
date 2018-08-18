import os.path
from collections import defaultdict
from todotango_cleaner.clean_dates import get_years
import json 

a = json.load(open('data/clean/artists.json'))
l = json.load(open('data/clean/lyrics.json'))
w = json.load(open('data/clean/works.json'))

relations = []
all_artists = []
artists = []

songs = []
songs_relations = []
artist_song_map = defaultdict(list)
songs_years = get_years()
artists_relations_added = defaultdict(list)

for j in w:                                                                  
    if str(j["id"]) in l.keys():                        
        image = None
        current_artists = [c for c in j['lyricists'] + j['composers']]                                                  
        for k in range(len(current_artists)):
            artist_song_map[current_artists[k]].append(j['id'])
            for x in range(k+1,len(current_artists)):         
                if current_artists[x] not in artists_relations_added[current_artists[k]] and current_artists[x] != current_artists[k] :
                    relations.append({'from': current_artists[k], 'to': current_artists[x]})
                    artists_relations_added[current_artists[k]].append(current_artists[x])
        if len(current_artists) >1:
            all_artists += current_artists
             
            for i in set(current_artists):                                                   
                if os.path.isfile('data/clean/artist_img/%d.png'%i):
                    image =  '%d.png' % i
        year = None
        if j['id'] in songs_years:
            year = songs_years[j['id']]
        songs.append({'id': j['id'], 'label': j['title'], 'image': image, 'year': year, 'genre': j['type'], 'lyricists': j['lyricists'], 'composers': j['composers'],
                      'link':j['external_id']['todotango']})
   
songs_relations_added = defaultdict(list)
for j in w:                                                                  
    if str(j["id"]) in l.keys():
        rels = []
        for c in j['lyricists'] + j['composers']:
            rels += artist_song_map[c]
        for r in set(rels):
            if j['id'] != r and j['id'] not in songs_relations_added[r]:
                songs_relations.append({'from': j['id'], 'to': r})
                songs_relations_added[j['id']].append(r)
            
json.dump(songs, open('network-demo/network-songs.json', 'w'))

json.dump(songs_relations, open('network-demo/network-songs-relations.json', 'w'))

json.dump(artist_song_map, open('network-demo/artist_song_map.json', 'w'))

for i in set(all_artists):                                                   
    if os.path.isfile('data/clean/artist_img/%d.png'%i):
        artists.append({'id': i,  'shape': 'circularImage', 'image': '%d.png'%i, 'label':a[i]['name']})
    else:
        artists.append({'id': i,  'shape': 'circularImage', 'label':a[i]['name']})

json.dump(relations, open('network-demo/network-relations-lyrics.json', 'w'))

json.dump(artists, open('network-demo/network-artists-lyrics.json', 'w'))


folder = 'tango_activations_4k'                                                                                                         
activations = []                                                          
work_ids = []                                                            
for filename in os.listdir(folder):                                    
    f = open(folder+'/'+filename)                                      
    work_ids.append(filename.replace('.json', ''))                  
    activations.append(json.load(f))
from sklearn.metrics.pairwise import cosine_similarity
similarity_matrix = cosine_similarity(activations)

similar = {}                                           
for i, w in enumerate(work_ids):                                                                                                                                   
    w_similar = similarity_matrix[i].argsort()[::-1][:30]                                                                                                          
    similar[str(w)] = [work_ids[r] for r in w_similar if int(work_ids[r])!= int(w)]
json.dump(similar, open('data/similar_songs.json','w'))

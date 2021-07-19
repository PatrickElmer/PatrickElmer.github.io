import os
import json

path = f"{os.getcwd()}"
files_in_dir = sorted(os.listdir(f"{path}/pages"))

if os.path.exists(f"{path}/static/dir.json"):
    with open(f"{path}/static/dir.json", "r") as f:
        try:
            data = json.load(f)
        except:
            data = dict()
        if 'pages' in data:
            files_in_json = data['pages']
            for file in files_in_json:
                if file not in files_in_dir:
                    files_in_json.remove(file)
        else:
            files_in_json = list()

else:
    files_in_json = list()

for file in files_in_dir:
    if file not in files_in_json:
        files_in_json.append(file)

files = dict()
files['pages'] = files_in_json

with open(f"{path}/static/dir.json", "w") as f:
    json.dump(files, f)

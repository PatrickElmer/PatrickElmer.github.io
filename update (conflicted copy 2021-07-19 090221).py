import os
import json

path = f"{os.getcwd()}"
files_in_dir = sorted(os.listdir(f"{path}/pages"))

files = dict()
files['pages'] = files_in_dir

print()
print("files_in_dir:")
print(files_in_dir)
print()

if os.path.exists(f"{path}/static/dir.json"):
    with open(f"{path}/static/dir.json", "r") as f:
        data = json.load(f)
    print("data:")
    print(data)
    print()

#

with open(f"{path}/static/dir.json", "w") as f:
    json.dump(files_in_dir, f)

import sys
import os
import xml.etree.ElementTree as ET
from json import dumps
from xmljson import yahoo

if len(sys.argv) < 2:
  sys.exit("Please enter filename.")
  
filename = sys.argv[1]

if os.path.isfile(filename) == False:
  print("File isn't exists")
else:
  # Read XML
  tree = ET.parse(filename)
  root = tree.getroot()
  data = dumps(yahoo.data(root)["current"], indent=4) # Convert to json
  # Write file
  filename = filename.rsplit(".", maxsplit = 1)[0] + ".json"
  file = open(filename, "w")
  file.write(data)
  file.close()
  print(filename)
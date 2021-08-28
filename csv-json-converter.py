# Maintaining huge JSON files kinda sucks, it's easier to keep a list in Google Sheets,
# export it as CSV and convert that to JSON, formatted just the way I need it.

import csv

csv_list = []
with open("input.csv") as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        csv_list.append(row)

file = open("output.json", "w")
file.write("{\n")
file.write("\t\"inGameItems\": [\n")
for item in csv_list:
    file.write("\t\t{\n")
    file.write("\t\t\t\"id\": {},\n".format(item["id"]))
    file.write("\t\t\t\"name\": \"{}\",\n".format(item["name"]))
    file.write("\t\t\t\"displayName\": \"{}\",\n".format(item["displayName"]))
    file.write("\t\t\t\"craftingStation\": \"{}\",\n".format(item["craftingStation"]))
    # This is kind of messy, and the reason why this program exists
    # Convert "blade-of-grass 1,lights-bane 1" to "[[1, 1],[16, 1]]" for example
    ingredient_list_1 = item["ingredients"].split(",")
    ingredient_list_2 = []
    for raw_ingredient in ingredient_list_1:
        ingredient_list_2.append(raw_ingredient.split(" "))
    ingredient_list_3 = []
    for raw_ingredient in ingredient_list_2:
        for each_ingredient in csv_list:
            if each_ingredient["name"] == raw_ingredient[0]:
                ingredient_list_3.append("[{}, {}]".format(each_ingredient["id"], raw_ingredient[1]))
    file.write("\t\t\t\"ingredients\": [{}],\n".format(",".join(ingredient_list_3)))
    file.write("\t\t\t\"quantityMade\": {},\n".format(item["quantity"]))
    file.write("\t\t\t\"acquisition\": \"{}\",\n".format(item["acquisition"]))
    file.write("\t\t\t\"wikiLink\": \"{}\"\n".format(item["wikiLink"]))
    if item == csv_list[-1]:
        file.write("\t\t}\n")
    else:
        file.write("\t\t},\n")
file.write("\t]\n")
file.write("}\n")
file.close()

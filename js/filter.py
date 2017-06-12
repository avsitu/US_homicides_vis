import pandas as pd

data = pd.read_csv('database.csv',nrows=100)
# print data.dtypes
# for c in ['Agency Code', 'Record ID', 'Agency Name', 'City', 'State', 'Month', '']
data = pd.DataFrame(data['Month']).join(data['Year']).join(data['State']).join(data['Crime Type']).join(data['Victim Sex']).join(data['Victim Age']).join(data['Victim Race']).join(data['Perpetrator Sex']).join(data['Perpetrator Age']).join(data['Perpetrator Race']).join(data['Relationship']).join(data['Weapon'])
data.to_csv(path_or_buf='pc.csv',index=False)

import requests

r = requests.get('https://www.ah.nl')
print(r.cookies)
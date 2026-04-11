import requests
from urllib.parse import urlencode

public_key = "https://disk.yandex.ru/d/QS3bPFwyse4LoA"
api = "https://cloud-api.yandex.net/v1/disk/public/resources/download?"
url = api + urlencode({"public_key": public_key})

data = requests.get(url).json()
print(data["href"])  # это прямая ссылка на скачивание
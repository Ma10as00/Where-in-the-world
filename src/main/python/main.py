from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Path to the Microsoft Edge WebDriver executable
driver_path = "C:\msedgedriver.exe"

# Create a new instance of the Edge WebDriver
driver = webdriver.Edge(executable_path=driver_path)

# Open https://geojson.io/
driver.get('https://geojson.io/')

# Wait for the page to load completely
wait = WebDriverWait(driver, 10)
wait.until(EC.frame_to_be_available_and_switch_to_it((By.TAG_NAME, 'iframe')))

# Find the textarea using CSS selector
# textarea = driver.find_element(By.XPATH, '//*[@id="map"]/div[6]/div[2]/div[1]/input')
textarea = driver.find_element(By.CSS_SELECTOR, '#map > div.mapboxgl-control-container > div.mapboxgl-ctrl-top-right > div.mapboxgl-ctrl-geocoder.mapboxgl-ctrl > input')


# Replace this string with your own GeoJSON string
geojson_string = '''
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [125.6, 10.1]
      },
      "properties": {
        "name": "Dinagat Islands"
      }
    }
  ]
}
'''
# Clear the existing content of the textarea
textarea.clear()

# Send the GeoJSON string character by character to simulate typing
for char in geojson_string:
    textarea.send_keys(char)

# Press Enter to update the map
textarea.send_keys(Keys.RETURN)

# Optionally, you can pause the program to allow time for the map to update
# This can be useful if you want to take screenshots or interact further with the map
# You can adjust the sleep duration as needed
import time
time.sleep(5000)

# Close the browser
driver.quit()







import './style.scss'

const currentCity = document.querySelector('[data-city]')
const currentDescription = document.querySelector('[data-description]')
const currentTemperature = document.querySelector('[data-temperature]')
const currentWindSpeed = document.querySelector('[data-wind-speed]')
const currentHumidity = document.querySelector('[data-humidity]')

const searchForm = document.getElementsByTagName('form')[0]
const searchBar = document.querySelector('[data-search-bar]')
const toggleUnit = document.querySelector('[data-toggle-unit]')

const appID = '651dc446b420d45adb42aea9be445339'

async function getCoords() {
    const city = searchBar.value || 'Wellington'
    const url = new URL('http://api.openweathermap.org/geo/1.0/direct')
    const params = { 'q':city, 'appid':appID }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    const response = await fetch(url)
    const data = await response.json()
    return data
}

async function getWeatherData() {
    const url = new URL('https://api.openweathermap.org/data/2.5/onecall')
    const cityData = await getCoords()
    const params = {
        'lat':cityData[0].lat,
        'lon': cityData[0].lon,
        'units': toggleUnit.checked ? 'imperial' : 'metric',
        'appid': appID
    }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    const response = await fetch(url)
    const data = await response.json()

    currentCity.innerText = `${cityData[0].name}, ${cityData[0].country}`
    currentDescription.innerText = data.current.weather[0].description.split(' ').map(word => capitalise(word)).join(' ')
    currentTemperature.innerText = `${data.current.temp}° ${toggleUnit.checked ? 'Fahrenheit' : 'Celcius'}`
    currentWindSpeed.innerText = `${data.current['wind_speed']} ${params.units === 'imperial' ? 'm/ph' : 'm/s'}`
    currentHumidity.innerText = `Humidity: ${data.current.humidity}%`
    searchBar.value = ''
}

getWeatherData()

searchForm.addEventListener('submit', e => {
    e.preventDefault()
    getWeatherData()
})

toggleUnit.addEventListener('input', async () => {
    await getWeatherData()
})

function capitalise(word) { return word.toUpperCase()[0] + word.slice(1) }
import './style.scss'
import thunderstormIcon from './icons/thunderstorm.svg'
import drizzleIcon from './icons/rain.svg'
import rainIcon from './icons/rain.svg'
import snowIcon from './icons/snow.svg'
import atmosphereIcon from './icons/atmosphere.svg'
import clearIcon from './icons/clear.svg'
import cloudIcon from './icons/clouds.svg'
import thermostat from './icons/temp.svg'
import wind from './icons/wind.svg'
import humidity from './icons/humidity.svg'

let symbols = {
    'Thunderstorm': thunderstormIcon,
    'Drizzle': drizzleIcon,
    'Rain': rainIcon,
    'Snow': snowIcon,
    'Atmosphere': atmosphereIcon,
    'Clear': clearIcon,
    'Clouds': cloudIcon,
    'Thermostat': thermostat,
    'Wind': wind,
    'Humidity': humidity
}

const forecastContainer = document.querySelector('.forecast-container')
const currentCity = document.querySelector('[data-city]')
const currentDescription = document.querySelector('[data-description]')
const currentTemperature = document.querySelector('[data-temperature]')
const currentWindSpeed = document.querySelector('[data-wind-speed]')
const currentHumidity = document.querySelector('[data-humidity]')

const searchForm = document.getElementsByTagName('form')[0]
const searchBar = document.querySelector('[data-search-bar]')
const toggleUnit = document.querySelector('[data-toggle-unit]')

const appID = '651dc446b420d45adb42aea9be445339'

async function getCoords(searchCity = null) {
    const city = searchBar.value || searchCity || 'Wellington'
    const url = new URL('http://api.openweathermap.org/geo/1.0/direct')
    const params = { 'q':city, 'appid':appID }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    const response = await fetch(url)
    const data = await response.json()
    return data
}

async function getCityName(lat, lon) {
    const url = new URL('http://api.openweathermap.org/geo/1.0/reverse')
    const params = { 'lat':lat, 'lon':lon, 'appid': appID }
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
        'exclude': 'hourly,minutely',
        'appid': appID
    }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    const response = await fetch(url)
    const data = await response.json()

    const forecast = getForcast(data)
    renderForecast(forecast)

    currentCity.innerText = `${cityData[0].name}, ${cityData[0].country}`
    updateCurrentWeatherDescription(currentDescription, data)
    updateCurrentTemperature(currentTemperature, data)
    updateCurrentWind(currentWindSpeed, data, params)
    updateCurrentHumidity(currentHumidity, data)
}

function updateCurrentWeatherDescription(element, data) {
    removeElements(element)
    const symbol = data.current.weather[0].main.split(' ').map(word => capitalise(word)).join(' ')
    const description = data.current.weather[0].description.split(' ').map(word => capitalise(word)).join(' ')
    
    const img = new Image(100, 100)
    const symbolText = document.createElement('h3')
    img.src = symbols[symbol]
    symbolText.innerText = description

    element.appendChild(img)
    element.appendChild(symbolText)


}

function updateCurrentTemperature(element, data) {
    removeElements(element)

    const temperatureValue = `${data.current.temp}°`
    const unitType = `${toggleUnit.checked ? 'Fahrenheit' : 'Celcius'}`

    const temperature = document.createElement('h3')
    const unit = document.createElement('h4')
    temperature.innerText = temperatureValue
    unit.innerText = unitType
    const img = new Image(100, 100)
    img.src = symbols['Thermostat']

    const temperatureAndUnit = document.createElement('div')
    temperatureAndUnit.classList.add('reading')
    temperatureAndUnit.appendChild(temperature)
    temperatureAndUnit.appendChild(unit)

    element.appendChild(temperatureAndUnit)
    element.appendChild(img)
    
}

function updateCurrentWind(element, data, params) {
    removeElements(element)

    const windSpeed = `${data.current['wind_speed']} ${params.units === 'imperial' ? 'm/ph' : 'm/s'}`
    const wind = document.createElement('h3')
    const img = new Image(100, 100)
    wind.innerText = windSpeed
    img.src = symbols['Wind']

    element.appendChild(img)
    element.appendChild(wind)
}

function updateCurrentHumidity(element, data) {
    removeElements(element)

    const humidityReading = `Humidity: ${data.current['humidity']}%`
    const humidity = document.createElement('h3')
    const img = new Image(100, 100)
    humidity.innerText = humidityReading
    img.src = symbols['Humidity']

    element.appendChild(img)
    element.appendChild(humidity)
}

getWeatherData()
// getByGeoLocation()

searchForm.addEventListener('submit', e => {
    e.preventDefault()
    getWeatherData()
})

toggleUnit.addEventListener('input', async () => {
    await getWeatherData()
})

function capitalise(word) { return word.toUpperCase()[0] + word.slice(1) }

function removeElements(element) {
    if (!element.firstChild) return
    while (element.lastChild) {
        element.removeChild(element.lastChild)
    }
}

function getDay(data) {
    return new Date(data.dt * 1000).toLocaleString('en-US', { weekday: 'long' })
}
function getSymbolText(data) {
    return data.weather[0].main
}

function getForcast(data) {
    const forecastData = []
    const next4Days = data.daily.slice(1, 5)
    next4Days.forEach(day => {
        forecastData.push({ 'day': getDay(day), 'symbol': getSymbolText(day) })
    })
    return forecastData
}

function renderForecast(data) {
    const children = forecastContainer.children
    for (let i=0; i < children.length; i++) {
        const child = children[i]
        removeElements(child)
        const img = new Image(50, 50)
        img.src = symbols[`${data[i].symbol}`]
        const symbolText = document.createElement('h3')
        symbolText.innerText = `${data[i].day}`
        child.appendChild(img)
        child.appendChild(symbolText)
    }
}

function getByGeoLocation() {
    if (navigator.geolocation) {
        const options = { 'enableHighAccuracy': false, 'timeout': 3000}
        navigator.geolocation.getCurrentPosition(async (position, error, options) => {
            const { latitude, longitude } = position.coords
            const data = await getCityName(latitude, longitude)
            const cityName = await getCoords(data[0].name)
            await getWeatherData(cityName)
        })
    }
}
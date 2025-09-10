const { chromium } = require('playwright')

class BrowserService {
  constructor() {
    this.browser = null
    this.context = null
    this.page = null
    this.isRunning = false
  }

  async initialize() {
    try {
      console.log('🔄 Browser wordt gestart...')
      
      // Start browser in headed mode (zichtbaar)
      try {
        // Probeer eerst met systeem Chrome
        this.browser = await chromium.launch({
          headless: false,
          slowMo: 500,
          channel: 'chrome',
          args: [
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        })
      } catch (error) {
        console.log('Systeem Chrome niet beschikbaar, gebruik Playwright Chromium')
        // Fallback naar Playwright Chromium
        this.browser = await chromium.launch({
          headless: false,
          slowMo: 500,
          args: [
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        })
      }

      // Maak nieuwe context aan
      this.context = await this.browser.newContext({
        viewport: null, // Gebruik volledige schermgrootte
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      })

      // Maak nieuwe pagina aan
      this.page = await this.context.newPage()
      
      // Start met een lege pagina of Google
      await this.page.goto('https://www.google.com')
      
      this.isRunning = true
      console.log('✅ Browser succesvol gestart!')
      
      return true
    } catch (error) {
      console.error('❌ Fout bij starten browser:', error)
      throw error
    }
  }

  async close() {
    try {
      if (this.browser) {
        await this.browser.close()
        this.browser = null
        this.context = null
        this.page = null
        this.isRunning = false
        console.log('✅ Browser gesloten')
      }
    } catch (error) {
      console.error('❌ Fout bij sluiten browser:', error)
      throw error
    }
  }

  async navigateTo(url) {
    if (!this.page) {
      throw new Error('Browser is niet geïnitialiseerd')
    }
    
    try {
      console.log(`🔄 Navigeren naar: ${url}`)
      await this.page.goto(url)
      await this.page.waitForLoadState('networkidle')
      console.log('✅ Pagina geladen')
      return true
    } catch (error) {
      console.error('❌ Fout bij navigeren:', error)
      throw error
    }
  }

  async clickElement(selector) {
    if (!this.page) {
      throw new Error('Browser is niet geïnitialiseerd')
    }

    try {
      console.log(`🔄 Klikken op: ${selector}`)
      await this.page.click(selector)
      console.log('✅ Element aangeklikt')
      return true
    } catch (error) {
      console.error('❌ Fout bij klikken:', error)
      throw error
    }
  }

  async typeText(selector, text) {
    if (!this.page) {
      throw new Error('Browser is niet geïnitialiseerd')
    }

    try {
      console.log(`🔄 Typen in ${selector}: "${text}"`)
      await this.page.fill(selector, text)
      console.log('✅ Tekst ingetypt')
      return true
    } catch (error) {
      console.error('❌ Fout bij typen:', error)
      throw error
    }
  }

  async scrollPage(direction = 'down', amount = 3) {
    if (!this.page) {
      throw new Error('Browser is niet geïnitialiseerd')
    }

    try {
      console.log(`🔄 Scrollen ${direction}`)
      const scrollDistance = direction === 'down' ? amount * 300 : -amount * 300
      await this.page.evaluate((distance) => {
        window.scrollBy(0, distance)
      }, scrollDistance)
      console.log('✅ Gescrolld')
      return true
    } catch (error) {
      console.error('❌ Fout bij scrollen:', error)
      throw error
    }
  }

  async waitForElement(selector, timeout = 5000) {
    if (!this.page) {
      throw new Error('Browser is niet geïnitialiseerd')
    }

    try {
      console.log(`🔄 Wachten op element: ${selector}`)
      await this.page.waitForSelector(selector, { timeout })
      console.log('✅ Element gevonden')
      return true
    } catch (error) {
      console.error('❌ Element niet gevonden:', error)
      throw error
    }
  }

  async getPageTitle() {
    if (!this.page) {
      throw new Error('Browser is niet geïnitialiseerd')
    }

    try {
      const title = await this.page.title()
      console.log(`📄 Pagina titel: ${title}`)
      return title
    } catch (error) {
      console.error('❌ Fout bij ophalen titel:', error)
      throw error
    }
  }

  async getPageUrl() {
    if (!this.page) {
      throw new Error('Browser is niet geïnitialiseerd')
    }

    try {
      const url = this.page.url()
      console.log(`🔗 Huidige URL: ${url}`)
      return url
    } catch (error) {
      console.error('❌ Fout bij ophalen URL:', error)
      throw error
    }
  }

  async takeScreenshot(path = null) {
    if (!this.page) {
      throw new Error('Browser is niet geïnitialiseerd')
    }

    try {
      console.log('🔄 Screenshot maken...')
      const screenshot = await this.page.screenshot({
        fullPage: true,
        path: path || undefined
      })
      console.log('✅ Screenshot gemaakt')
      return screenshot
    } catch (error) {
      console.error('❌ Fout bij screenshot:', error)
      throw error
    }
  }

  async search(query) {
    if (!this.page) {
      throw new Error('Browser is niet geïnitialiseerd')
    }

    try {
      console.log(`🔍 Zoeken naar: "${query}"`)
      
      // Ga naar Google als we er nog niet zijn
      const currentUrl = this.page.url()
      if (!currentUrl.includes('google.com')) {
        await this.navigateTo('https://www.google.com')
      }
      
      // Zoek naar het zoekformulier
      const searchBox = 'input[name="q"], textarea[name="q"]'
      await this.page.waitForSelector(searchBox, { timeout: 5000 })
      
      // Type de zoekopdracht
      await this.page.fill(searchBox, query)
      await this.page.press(searchBox, 'Enter')
      
      // Wacht tot resultaten geladen zijn
      await this.page.waitForLoadState('networkidle')
      
      console.log('✅ Zoekopdracht uitgevoerd')
      return true
    } catch (error) {
      console.error('❌ Fout bij zoeken:', error)
      throw error
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      hasBrowser: !!this.browser,
      hasPage: !!this.page,
      currentUrl: this.page ? this.page.url() : null
    }
  }
}

module.exports = BrowserService
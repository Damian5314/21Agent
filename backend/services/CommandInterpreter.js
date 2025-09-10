const { GoogleGenerativeAI } = require('@google/generative-ai')

class CommandInterpreter {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  async interpretCommand(userInput, currentContext = null) {
    const prompt = this.buildPrompt(userInput, currentContext)
    
    try {
      console.log(`🤖 Interpreteren commando: "${userInput}"`)
      
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      console.log('🔍 AI Response:', text)
      
      // Parse de JSON response
      const parsedCommand = this.parseAIResponse(text)
      console.log('✅ Commando geïnterpreteerd:', parsedCommand)
      
      return parsedCommand
    } catch (error) {
      console.error('❌ Fout bij interpreteren commando:', error)
      
      // Fallback: probeer basis commando's te herkennen
      return this.fallbackInterpretation(userInput)
    }
  }

  buildPrompt(userInput, currentContext) {
    const basePrompt = `
Je bent een AI assistent die natuurlijke taal commando's omzet naar browser acties.
Analyseer het volgende commando en geef een JSON response terug met de uit te voeren acties.

Beschikbare acties:
- navigate: ga naar een URL
- search: zoek op Google
- click: klik op een element (CSS selector)
- type: typ tekst in een input veld (CSS selector + tekst)  
- scroll: scroll de pagina (direction: 'up'/'down', amount: aantal)
- wait: wacht op een element (CSS selector)
- screenshot: maak een screenshot
- getTitle: krijg pagina titel
- getUrl: krijg huidige URL

Gebruiker commando: "${userInput}"
${currentContext ? `Huidige context: ${JSON.stringify(currentContext)}` : ''}

Geef ALLEEN een JSON response terug in dit formaat:
{
  "actions": [
    {
      "type": "actie_type",
      "parameters": {
        // parameters voor de actie
      },
      "description": "Wat deze actie doet"
    }
  ],
  "explanation": "Korte uitleg van wat er gebeurt"
}

Voorbeelden:
- "ga naar google.com" → {"actions": [{"type": "navigate", "parameters": {"url": "https://www.google.com"}, "description": "Navigeren naar Google"}], "explanation": "Ga naar Google homepage"}
- "zoek naar katten" → {"actions": [{"type": "search", "parameters": {"query": "katten"}, "description": "Zoeken naar katten"}], "explanation": "Zoek naar katten op Google"}
- "klik op de eerste link" → {"actions": [{"type": "click", "parameters": {"selector": "h3 a, .g a"}, "description": "Klik op eerste zoekresultaat"}], "explanation": "Klik op het eerste zoekresultaat"}
- "typ hallo in het zoekveld" → {"actions": [{"type": "type", "parameters": {"selector": "input[name='q']", "text": "hallo"}, "description": "Typ 'hallo' in zoekveld"}], "explanation": "Typ tekst in het zoekveld"}

Geef ALLEEN de JSON terug, geen andere tekst.
`

    return basePrompt
  }

  parseAIResponse(text) {
    try {
      // Probeer JSON uit de response te halen
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // Fallback als er geen JSON gevonden wordt
      throw new Error('Geen geldige JSON gevonden in AI response')
    } catch (error) {
      console.error('❌ Fout bij parsen AI response:', error)
      throw error
    }
  }

  fallbackInterpretation(userInput) {
    const input = userInput.toLowerCase()
    
    // Basis URL detectie
    if (input.includes('ga naar') || input.includes('open')) {
      const urlMatch = input.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
      if (urlMatch) {
        let url = urlMatch[1]
        if (!url.startsWith('http')) {
          url = 'https://' + url
        }
        return {
          actions: [{
            type: 'navigate',
            parameters: { url },
            description: `Navigeren naar ${url}`
          }],
          explanation: `Ga naar ${url}`
        }
      }
    }
    
    // Basis zoek detectie
    if (input.includes('zoek') || input.includes('search')) {
      const query = input.replace(/zoek\s*(naar)?\s*/, '').replace(/search\s*(for)?\s*/, '').trim()
      if (query) {
        return {
          actions: [{
            type: 'search',
            parameters: { query },
            description: `Zoeken naar: ${query}`
          }],
          explanation: `Zoek naar "${query}"`
        }
      }
    }
    
    // Basis scroll detectie
    if (input.includes('scroll') || input.includes('omhoog') || input.includes('omlaag')) {
      const direction = input.includes('omhoog') || input.includes('up') ? 'up' : 'down'
      return {
        actions: [{
          type: 'scroll',
          parameters: { direction, amount: 3 },
          description: `Scroll ${direction}`
        }],
        explanation: `Scroll ${direction === 'up' ? 'omhoog' : 'omlaag'}`
      }
    }
    
    // Screenshot
    if (input.includes('screenshot') || input.includes('schermafbeelding')) {
      return {
        actions: [{
          type: 'screenshot',
          parameters: {},
          description: 'Maak screenshot'
        }],
        explanation: 'Screenshot maken van huidige pagina'
      }
    }
    
    // Default: probeer te zoeken
    return {
      actions: [{
        type: 'search',
        parameters: { query: userInput },
        description: `Zoeken naar: ${userInput}`
      }],
      explanation: `Zoek naar "${userInput}"`
    }
  }

  // Helper methode om veelgebruikte selectors te identificeren
  getCommonSelectors() {
    return {
      searchBox: ['input[name="q"]', 'textarea[name="q"]', '#search', '.search-input'],
      firstLink: ['h3 a', '.g a', '.result a', 'a[href]'],
      nextPage: ['a[aria-label="Next"]', '#pnnext', '.next'],
      previousPage: ['a[aria-label="Previous"]', '#pnprev', '.prev'],
      submitButton: ['input[type="submit"]', 'button[type="submit"]', '.submit'],
      closeButton: ['.close', '.modal-close', '[aria-label="Close"]']
    }
  }
}

module.exports = CommandInterpreter
# frozen_string_literal: true

require 'http'
require 'nokogiri'
require 'json'

module Translation
  extend ActiveSupport::Concern

  def translate(text, lang_to)
    if ENV['TRANSLATE_SERVICE'] == 'azure'
      return azureTranslate(text, lang_to)
    else ENV['TRANSLATE_SERVICE'] == 'google'
      return googleTranslate(text, lang_to)
    end
  end

  private

  def azureTranslate(text, lang_to)
    res = HTTP.headers('Ocp-Apim-Subscription-Key': ENV['AZURE_TRANSLATE_SUBSUCRIBE_KEY'])
      .get("https://api.microsofttranslator.com/V2/Http.svc/Translate", params: {text: text, to: lang_to})
    return "[Translated] " + Nokogiri::XML.parse(res.to_s).text
  end

  def googleTranslate(text, lang_to)
    res = HTTP.get(
      "https://www.googleapis.com/language/translate/v2",
      params: {key: ENV['GOOGLE_TRANSLATE_API_KEY'] , q: text, target: lang_to})
    json = JSON.parse(res)
    translated = json.dig('data', 'translations', 0, 'translatedText')
    translate_decoded = Nokogiri::HTML.parse(translated).text
    lang = json.dig('data', 'translations', 0, 'detectedSourceLanguage')
    return "[Translated from #{lang}] #{translate_decoded}"
  end
end
